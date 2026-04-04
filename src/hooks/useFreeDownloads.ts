import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';

const FREE_DOWNLOAD_LIMIT = 2;

interface UseFreeDownloadsReturn {
  freeDownloadsUsed: number;
  freeDownloadsRemaining: number;
  canDownloadFree: boolean;
  isLoading: boolean;
  recordDownload: (noteId: string) => Promise<boolean>;
  hasDownloaded: (noteId: string) => Promise<boolean>;
  refetch: () => Promise<void>;
}

export const useFreeDownloads = (): UseFreeDownloadsReturn => {
  const { session } = useAuthStore();
  const [freeDownloadsUsed, setFreeDownloadsUsed] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDownloadCount = async () => {
    if (!session?.user?.id) {
      setFreeDownloadsUsed(0);
      setIsLoading(false);
      return;
    }

    try {
      const { count, error } = await supabase
        .from('downloads')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.user.id);

      if (error) throw error;
      setFreeDownloadsUsed(count || 0);
    } catch (error) {
      console.error('Failed to fetch download count:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDownloadCount();
  }, [session?.user?.id]);

  const hasDownloaded = async (noteId: string): Promise<boolean> => {
    if (!session?.user?.id) return false;

    try {
      const { data, error } = await supabase
        .from('downloads')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('note_id', noteId)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    } catch (error) {
      console.error('Failed to check download status:', error);
      return false;
    }
  };

  const recordDownload = async (noteId: string): Promise<boolean> => {
    if (!session?.user?.id) return false;

    try {
      // Check if already downloaded
      const alreadyDownloaded = await hasDownloaded(noteId);
      if (alreadyDownloaded) {
        return true; // Already downloaded, allow re-download
      }

      // Check if user has remaining free downloads
      if (freeDownloadsUsed >= FREE_DOWNLOAD_LIMIT) {
        return false;
      }

      // Record the download
      const { error } = await supabase
        .from('downloads')
        .insert({
          user_id: session.user.id,
          note_id: noteId,
        });

      if (error) throw error;

      // Update local count
      setFreeDownloadsUsed(prev => prev + 1);

      // Also increment the note's download count
      const { data: note } = await supabase
        .from('notes')
        .select('downloads_count')
        .eq('id', noteId)
        .single();

      if (note) {
        await supabase
          .from('notes')
          .update({ downloads_count: (note.downloads_count || 0) + 1 })
          .eq('id', noteId);
      }

      return true;
    } catch (error) {
      console.error('Failed to record download:', error);
      return false;
    }
  };

  const freeDownloadsRemaining = Math.max(0, FREE_DOWNLOAD_LIMIT - freeDownloadsUsed);
  const canDownloadFree = freeDownloadsRemaining > 0;

  return {
    freeDownloadsUsed,
    freeDownloadsRemaining,
    canDownloadFree,
    isLoading,
    recordDownload,
    hasDownloaded,
    refetch: fetchDownloadCount,
  };
};

export const FREE_DOWNLOAD_LIMIT_CONST = FREE_DOWNLOAD_LIMIT;
