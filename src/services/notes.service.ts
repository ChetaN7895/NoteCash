import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Note {
  id: string;
  title: string;
  description: string | null;
  subject: string;
  class_level: string;
  file_url: string;
  file_type: string;
  file_size: number;
  thumbnail_url: string | null;
  views_count: number;
  downloads_count: number;
  rating_avg: number;
  rating_count: number;
  is_free: boolean;
  price: number;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
  uploader?: {
    full_name: string | null;
    is_verified: boolean;
  };
}

export interface CreateNoteData {
  title: string;
  description: string;
  subject: string;
  classLevel: string;
  file: File;
  isFree: boolean;
  price?: number;
}

export interface NotesQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  subject?: string;
  classLevel?: string;
  rating?: string;
  sortBy?: 'popular' | 'recent' | 'rating' | 'downloads';
  onlyVerified?: boolean;
  onlyFree?: boolean;
  onlyPaid?: boolean;
  status?: 'pending' | 'approved' | 'rejected';
  userId?: string;
}

class NotesService {
  private handleError(error: unknown, message: string) {
    console.error(message, error);
    toast({
      title: 'Error',
      description: message,
      variant: 'destructive',
    });
  }

  async getNotes(params: NotesQueryParams = {}): Promise<{ notes: Note[]; total: number }> {
    try {
      const {
        search,
        subject,
        classLevel,
        onlyFree,
        onlyPaid,
        sortBy = 'recent',
        page = 1,
        limit = 12,
        status,
        userId
      } = params;

      let query = supabase
        .from('notes')
        .select('*', { count: 'exact' });

      // Filter by status - default to approved for public browsing
      if (status) {
        query = query.eq('status', status);
      } else if (!userId) {
        query = query.eq('status', 'approved');
      }

      // Filter by user ID (for user's own notes)
      if (userId) {
        query = query.eq('user_id', userId);
      }

      // Search filter
      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,subject.ilike.%${search}%`);
      }

      // Subject filter
      if (subject && subject !== 'all') {
        query = query.eq('subject', subject);
      }

      // Class level filter
      if (classLevel && classLevel !== 'all') {
        query = query.eq('class_level', classLevel);
      }

      // Free only filter
      if (onlyFree) {
        query = query.eq('is_free', true);
      }

      // Paid only filter
      if (onlyPaid) {
        query = query.eq('is_free', false);
      }

      // Sorting
      switch (sortBy) {
        case 'popular':
          query = query.order('views_count', { ascending: false });
          break;
        case 'downloads':
          query = query.order('downloads_count', { ascending: false });
          break;
        case 'rating':
          query = query.order('rating_avg', { ascending: false });
          break;
        case 'recent':
        default:
          query = query.order('created_at', { ascending: false });
          break;
      }

      // Pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      // Fetch uploader profiles separately
      const notes: Note[] = data || [];
      
      // Get unique user IDs
      const userIds = [...new Set(notes.map(n => n.user_id))];
      
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, is_verified')
          .in('id', userIds);
        
        const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
        
        notes.forEach(note => {
          const profile = profileMap.get(note.user_id);
          if (profile) {
            note.uploader = {
              full_name: profile.full_name,
              is_verified: profile.is_verified || false
            };
          }
        });
      }

      return { notes, total: count || 0 };
    } catch (error) {
      this.handleError(error, 'Failed to fetch notes');
      return { notes: [], total: 0 };
    }
  }

  async getNoteById(id: string): Promise<Note | null> {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      // Fetch uploader profile
      let uploader: { full_name: string | null; is_verified: boolean } | undefined;
      if (data) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, is_verified')
          .eq('id', data.user_id)
          .single();
        
        if (profile) {
          uploader = {
            full_name: profile.full_name,
            is_verified: profile.is_verified || false
          };
        }
      }

      return data ? { ...data, uploader } as Note : null;
    } catch (error) {
      this.handleError(error, 'Failed to fetch note');
      return null;
    }
  }

  async getUserNotes(userId: string): Promise<Note[]> {
    try {
      const { notes } = await this.getNotes({ userId, limit: 100 });
      return notes;
    } catch (error) {
      this.handleError(error, 'Failed to fetch user notes');
      return [];
    }
  }

  async getPurchasedNotes(userId: string): Promise<Note[]> {
    try {
      const { data: downloads, error } = await supabase
        .from('downloads')
        .select('note_id')
        .eq('user_id', userId);

      if (error) throw error;

      if (!downloads || downloads.length === 0) return [];

      const noteIds = downloads.map(d => d.note_id);
      
      const { data: notes, error: notesError } = await supabase
        .from('notes')
        .select('*')
        .in('id', noteIds);

      if (notesError) throw notesError;

      return (notes || []) as Note[];
    } catch (error) {
      this.handleError(error, 'Failed to fetch purchased notes');
      return [];
    }
  }

  async getUserStats(userId: string): Promise<{
    totalNotes: number;
    totalViews: number;
    totalDownloads: number;
    totalEarnings: number;
  }> {
    try {
      // Get user's notes stats
      const { data: notes, error: notesError } = await supabase
        .from('notes')
        .select('views_count, downloads_count')
        .eq('user_id', userId);

      if (notesError) throw notesError;

      // Get earnings from transactions
      const { data: transactions, error: transError } = await supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', userId)
        .eq('type', 'earning');

      if (transError) throw transError;

      const totalViews = (notes || []).reduce((sum, n) => sum + (n.views_count || 0), 0);
      const totalDownloads = (notes || []).reduce((sum, n) => sum + (n.downloads_count || 0), 0);
      const totalEarnings = (transactions || []).reduce((sum, t) => sum + Number(t.amount), 0);

      return {
        totalNotes: notes?.length || 0,
        totalViews,
        totalDownloads,
        totalEarnings
      };
    } catch (error) {
      this.handleError(error, 'Failed to fetch user stats');
      return { totalNotes: 0, totalViews: 0, totalDownloads: 0, totalEarnings: 0 };
    }
  }

  async incrementViews(noteId: string): Promise<void> {
    try {
      const { data: note } = await supabase
        .from('notes')
        .select('views_count')
        .eq('id', noteId)
        .single();

      if (note) {
        await supabase
          .from('notes')
          .update({ views_count: (note.views_count || 0) + 1 })
          .eq('id', noteId);
      }
    } catch (error) {
      console.error('Failed to increment views:', error);
    }
  }

  async incrementDownloads(noteId: string, userId: string): Promise<void> {
    try {
      // Check if user already downloaded this note
      const { data: existing } = await supabase
        .from('downloads')
        .select('id')
        .eq('note_id', noteId)
        .eq('user_id', userId)
        .maybeSingle();

      if (!existing) {
        // Create download record (this triggers the download increment via trigger)
        await supabase
          .from('downloads')
          .insert({ note_id: noteId, user_id: userId });
      }
    } catch (error) {
      console.error('Failed to record download:', error);
    }
  }

  async getPendingNotes(): Promise<Note[]> {
    try {
      const { notes } = await this.getNotes({ status: 'pending', limit: 100 });
      return notes;
    } catch (error) {
      this.handleError(error, 'Failed to fetch pending notes');
      return [];
    }
  }

  async approveNote(noteId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notes')
        .update({ status: 'approved', rejection_reason: null })
        .eq('id', noteId);

      if (error) throw error;
      toast({ title: 'Success', description: 'Note approved successfully' });
      return true;
    } catch (error) {
      this.handleError(error, 'Failed to approve note');
      return false;
    }
  }

  async rejectNote(noteId: string, reason: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notes')
        .update({ status: 'rejected', rejection_reason: reason })
        .eq('id', noteId);

      if (error) throw error;
      toast({ title: 'Note rejected', description: 'The note has been rejected' });
      return true;
    } catch (error) {
      this.handleError(error, 'Failed to reject note');
      return false;
    }
  }

  async deleteNote(noteId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;
      toast({ title: 'Success', description: 'Note deleted successfully' });
      return true;
    } catch (error) {
      this.handleError(error, 'Failed to delete note');
      return false;
    }
  }
}

export const notesService = new NotesService();
