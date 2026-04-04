import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { playNotificationSound } from '@/utils/notificationSound';
import { useNotificationStore } from '@/stores/notificationStore';

interface TopNote {
  id: string;
  title: string;
  subject: string;
  class: string;
  views: number;
  downloads: number;
  rating: number;
  author: string;
  previewImage?: string;
  isVerified: boolean;
  isFree?: boolean;
  price?: number;
}

interface CategoryCount {
  name: string;
  count: number;
}

interface PlatformStats {
  totalNotes: number;
  totalEarningsPaid: number;
  activeStudents: number;
  totalDownloads: number;
}

export const useHomePageData = () => {
  const [topNotes, setTopNotes] = useState<TopNote[]>([]);
  const [featuredNotes, setFeaturedNotes] = useState<TopNote[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<CategoryCount[]>([]);
  const [stats, setStats] = useState<PlatformStats>({
    totalNotes: 0,
    totalEarningsPaid: 0,
    activeStudents: 0,
    totalDownloads: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const isInitialLoad = useRef(true);

  const fetchTopNotes = useCallback(async () => {
    try {
      const { data: notesData, error: notesError } = await supabase
        .from('notes')
        .select('id, title, subject, class_level, views_count, downloads_count, rating_avg, thumbnail_url, user_id, is_free, price')
        .eq('status', 'approved')
        .order('rating_avg', { ascending: false })
        .order('downloads_count', { ascending: false })
        .limit(4);

      if (notesError) throw notesError;

      if (notesData && notesData.length > 0) {
        const userIds = [...new Set(notesData.map(note => note.user_id))];
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name, is_verified')
          .in('id', userIds);

        const profileMap = new Map(profilesData?.map(p => [p.id, p]) || []);

        const formattedNotes: TopNote[] = notesData.map(note => {
          const profile = profileMap.get(note.user_id);
          return {
            id: note.id,
            title: note.title,
            subject: note.subject,
            class: note.class_level,
            views: note.views_count || 0,
            downloads: note.downloads_count || 0,
            rating: note.rating_avg || 0,
            author: profile?.full_name || 'Anonymous',
            previewImage: note.thumbnail_url || undefined,
            isVerified: profile?.is_verified || false,
            isFree: note.is_free ?? true,
            price: note.price ?? undefined,
          };
        });

        setTopNotes(formattedNotes);
      } else {
        setTopNotes([]);
      }
    } catch (error) {
      console.error('Error fetching top notes:', error);
    }
  }, []);

  const fetchFeaturedNotes = useCallback(async () => {
    try {
      const { data: notesData, error: notesError } = await supabase
        .from('notes')
        .select('id, title, subject, class_level, views_count, downloads_count, rating_avg, thumbnail_url, user_id, is_featured, featured_at, is_free, price')
        .eq('status', 'approved')
        .eq('is_featured', true)
        .order('featured_at', { ascending: false })
        .limit(4);

      if (notesError) throw notesError;

      if (notesData && notesData.length > 0) {
        const userIds = [...new Set(notesData.map(note => note.user_id))];
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name, is_verified')
          .in('id', userIds);

        const profileMap = new Map(profilesData?.map(p => [p.id, p]) || []);

        const formattedNotes: TopNote[] = notesData.map(note => {
          const profile = profileMap.get(note.user_id);
          return {
            id: note.id,
            title: note.title,
            subject: note.subject,
            class: note.class_level,
            views: note.views_count || 0,
            downloads: note.downloads_count || 0,
            rating: note.rating_avg || 0,
            author: profile?.full_name || 'Anonymous',
            previewImage: note.thumbnail_url || undefined,
            isVerified: profile?.is_verified || false,
            isFree: note.is_free ?? true,
            price: note.price ?? undefined,
          };
        });

        setFeaturedNotes(formattedNotes);
      } else {
        setFeaturedNotes([]);
      }
    } catch (error) {
      console.error('Error fetching featured notes:', error);
    }
  }, []);

  const fetchCategoryCounts = useCallback(async () => {
    try {
      const { data: allNotes } = await supabase
        .from('notes')
        .select('class_level')
        .eq('status', 'approved');

      if (allNotes) {
        const countMap = new Map<string, number>();
        allNotes.forEach(note => {
          const level = note.class_level;
          countMap.set(level, (countMap.get(level) || 0) + 1);
        });

        const counts: CategoryCount[] = Array.from(countMap.entries()).map(([name, count]) => ({
          name,
          count,
        }));
        setCategoryCounts(counts);
      }
    } catch (error) {
      console.error('Error fetching category counts:', error);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const { count: notesCount } = await supabase
        .from('notes')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved');

      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { data: downloadsData } = await supabase
        .from('notes')
        .select('downloads_count')
        .eq('status', 'approved');

      const totalDownloads = downloadsData?.reduce((sum, note) => sum + (note.downloads_count || 0), 0) || 0;

      const { data: earningsData } = await supabase
        .from('transactions')
        .select('amount')
        .eq('type', 'earning')
        .eq('status', 'completed');

      const totalEarnings = earningsData?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;

      setStats({
        totalNotes: notesCount || 0,
        totalEarningsPaid: totalEarnings,
        activeStudents: usersCount || 0,
        totalDownloads,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([fetchTopNotes(), fetchFeaturedNotes(), fetchCategoryCounts(), fetchStats()]);
    setIsLoading(false);
    isInitialLoad.current = false;
  }, [fetchTopNotes, fetchFeaturedNotes, fetchCategoryCounts, fetchStats]);

  useEffect(() => {
    fetchAllData();

    // Set up real-time subscriptions
    const notesChannel = supabase
      .channel('home-notes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notes',
        },
        async (payload) => {
          const { addNewNote } = useNotificationStore.getState();
          
          // Show toast for new approved notes (but not on initial load)
          if (!isInitialLoad.current && payload.eventType === 'INSERT') {
            const newNote = payload.new as { id?: string; title?: string; status?: string; subject?: string };
            if (newNote.status === 'approved' && newNote.id) {
              playNotificationSound();
              addNewNote({
                id: newNote.id,
                title: newNote.title || 'New note',
                subject: newNote.subject || 'General',
                createdAt: new Date(),
              });
              toast({
                title: "🎉 New notes just uploaded!",
                description: `"${newNote.title || 'New note'}" in ${newNote.subject || 'General'} is now available.`,
              });
            }
          }
          
          // Also show toast when a note gets approved (status changes to approved)
          if (!isInitialLoad.current && payload.eventType === 'UPDATE') {
            const oldNote = payload.old as { status?: string };
            const newNote = payload.new as { id?: string; title?: string; status?: string; subject?: string };
            if (oldNote.status !== 'approved' && newNote.status === 'approved' && newNote.id) {
              playNotificationSound();
              addNewNote({
                id: newNote.id,
                title: newNote.title || 'A note',
                subject: newNote.subject || 'General',
                createdAt: new Date(),
              });
              toast({
                title: "📚 Fresh content available!",
                description: `"${newNote.title || 'A note'}" in ${newNote.subject || 'General'} just went live.`,
              });
            }
          }

          // Refetch notes and stats when any note changes
          fetchTopNotes();
          fetchFeaturedNotes();
          fetchCategoryCounts();
          fetchStats();
        }
      )
      .subscribe();

    const profilesChannel = supabase
      .channel('home-profiles-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'profiles',
        },
        () => {
          // Refetch user count when new user signs up
          fetchStats();
        }
      )
      .subscribe();

    const transactionsChannel = supabase
      .channel('home-transactions-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transactions',
        },
        () => {
          // Refetch earnings when new transaction is added
          fetchStats();
        }
      )
      .subscribe();

    // Cleanup subscriptions on unmount
    return () => {
      supabase.removeChannel(notesChannel);
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(transactionsChannel);
    };
  }, [fetchAllData, fetchTopNotes, fetchFeaturedNotes, fetchCategoryCounts, fetchStats]);

  return {
    topNotes,
    featuredNotes,
    categoryCounts,
    stats,
    isLoading,
  };
};
