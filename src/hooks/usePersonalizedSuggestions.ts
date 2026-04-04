import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { Note } from '@/stores/notesStore';

interface UserInterests {
  subjects: string[];
  classLevels: string[];
}

export const usePersonalizedSuggestions = () => {
  const { user } = useAuthStore();
  const [suggestions, setSuggestions] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userInterests, setUserInterests] = useState<UserInterests | null>(null);

  // Track a note view
  const trackNoteView = async (noteId: string) => {
    if (!user?.id) return;

    try {
      await supabase
        .from('user_note_views')
        .upsert(
          { user_id: user.id, note_id: noteId, viewed_at: new Date().toISOString() },
          { onConflict: 'user_id,note_id' }
        );
    } catch (error) {
      console.error('Error tracking note view:', error);
    }
  };

  // Get user's interests based on their download and view history
  const getUserInterests = async (): Promise<UserInterests> => {
    if (!user?.id) {
      return { subjects: [], classLevels: [] };
    }

    try {
      // Get subjects and class levels from downloads
      const { data: downloads } = await supabase
        .from('downloads')
        .select('note_id')
        .eq('user_id', user.id)
        .limit(50);

      // Get subjects and class levels from views
      const { data: views } = await supabase
        .from('user_note_views')
        .select('note_id')
        .eq('user_id', user.id)
        .order('viewed_at', { ascending: false })
        .limit(50);

      const noteIds = [
        ...(downloads?.map(d => d.note_id) || []),
        ...(views?.map(v => v.note_id) || [])
      ].filter((id, index, self) => self.indexOf(id) === index);

      if (noteIds.length === 0) {
        return { subjects: [], classLevels: [] };
      }

      // Get the subjects and class levels from these notes
      const { data: notes } = await supabase
        .from('notes')
        .select('subject, class_level')
        .in('id', noteIds);

      if (!notes) {
        return { subjects: [], classLevels: [] };
      }

      // Count occurrences to find preferences
      const subjectCount: Record<string, number> = {};
      const classLevelCount: Record<string, number> = {};

      notes.forEach(note => {
        subjectCount[note.subject] = (subjectCount[note.subject] || 0) + 1;
        classLevelCount[note.class_level] = (classLevelCount[note.class_level] || 0) + 1;
      });

      // Sort by count and get top interests
      const subjects = Object.entries(subjectCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([subject]) => subject);

      const classLevels = Object.entries(classLevelCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([classLevel]) => classLevel);

      return { subjects, classLevels };
    } catch (error) {
      console.error('Error getting user interests:', error);
      return { subjects: [], classLevels: [] };
    }
  };

  // Fetch personalized suggestions
  const fetchSuggestions = async () => {
    setIsLoading(true);
    
    try {
      const interests = await getUserInterests();
      setUserInterests(interests);

      // Get notes with profile info separately
      let notesQuery = supabase
        .from('notes')
        .select('*')
        .eq('status', 'approved')
        .order('views_count', { ascending: false })
        .limit(12);

      // If user has interests, filter by them
      if (interests.subjects.length > 0) {
        notesQuery = supabase
          .from('notes')
          .select('*')
          .eq('status', 'approved')
          .in('subject', interests.subjects)
          .order('rating_avg', { ascending: false })
          .limit(12);
      }

      // Exclude notes the user has already downloaded
      if (user?.id) {
        const { data: downloadedNotes } = await supabase
          .from('downloads')
          .select('note_id')
          .eq('user_id', user.id);

        const downloadedIds = downloadedNotes?.map(d => d.note_id) || [];
        
        if (downloadedIds.length > 0) {
          notesQuery = notesQuery.not('id', 'in', `(${downloadedIds.join(',')})`);
        }
      }

      const { data: notesData, error } = await notesQuery;

      if (error) throw error;

      // Fetch uploader profiles separately
      const userIds = [...new Set((notesData || []).map(n => n.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, is_verified')
        .in('id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      // Transform data to match Note type
      const transformedNotes: Note[] = (notesData || []).map(note => {
        const profile = profileMap.get(note.user_id);
        return {
          id: note.id,
          title: note.title,
          description: note.description,
          subject: note.subject,
          class_level: note.class_level,
          file_url: note.file_url,
          file_type: note.file_type,
          file_size: note.file_size,
          thumbnail_url: note.thumbnail_url,
          views_count: note.views_count || 0,
          downloads_count: note.downloads_count || 0,
          rating_avg: note.rating_avg || 0,
          rating_count: note.rating_count || 0,
          is_free: note.is_free ?? true,
          price: note.price || 0,
          status: note.status || 'pending',
          rejection_reason: note.rejection_reason,
          user_id: note.user_id,
          created_at: note.created_at || '',
          updated_at: note.updated_at || '',
          uploader: profile ? {
            full_name: profile.full_name,
            is_verified: profile.is_verified ?? false
          } : undefined
        };
      });

      setSuggestions(transformedNotes);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      // Fall back to popular notes
      try {
        const { data: fallbackData } = await supabase
          .from('notes')
          .select('*')
          .eq('status', 'approved')
          .order('downloads_count', { ascending: false })
          .limit(8);

        // Fetch profiles for fallback
        const userIds = [...new Set((fallbackData || []).map(n => n.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, is_verified')
          .in('id', userIds);

        const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

        const transformedNotes: Note[] = (fallbackData || []).map(note => {
          const profile = profileMap.get(note.user_id);
          return {
            id: note.id,
            title: note.title,
            description: note.description,
            subject: note.subject,
            class_level: note.class_level,
            file_url: note.file_url,
            file_type: note.file_type,
            file_size: note.file_size,
            thumbnail_url: note.thumbnail_url,
            views_count: note.views_count || 0,
            downloads_count: note.downloads_count || 0,
            rating_avg: note.rating_avg || 0,
            rating_count: note.rating_count || 0,
            is_free: note.is_free ?? true,
            price: note.price || 0,
            status: note.status || 'pending',
            rejection_reason: note.rejection_reason,
            user_id: note.user_id,
            created_at: note.created_at || '',
            updated_at: note.updated_at || '',
            uploader: profile ? {
              full_name: profile.full_name,
              is_verified: profile.is_verified ?? false
            } : undefined
          };
        });

        setSuggestions(transformedNotes);
      } catch {
        setSuggestions([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, [user?.id]);

  return {
    suggestions,
    isLoading,
    userInterests,
    trackNoteView,
    refreshSuggestions: fetchSuggestions
  };
};
