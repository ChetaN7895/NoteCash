import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Rating {
  id: string;
  user_id: string;
  note_id: string;
  rating: number;
  review: string | null;
  created_at: string;
  user?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

class RatingsService {
  private handleError(error: unknown, message: string) {
    console.error(message, error);
    toast({
      title: 'Error',
      description: message,
      variant: 'destructive',
    });
  }

  async getNoteRatings(noteId: string): Promise<Rating[]> {
    try {
      const { data: ratings, error } = await supabase
        .from('ratings')
        .select('*')
        .eq('note_id', noteId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!ratings || ratings.length === 0) return [];

      // Fetch user profiles for ratings
      const userIds = [...new Set(ratings.map(r => r.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      return ratings.map(rating => ({
        ...rating,
        user: profileMap.get(rating.user_id) ? {
          full_name: profileMap.get(rating.user_id)!.full_name,
          avatar_url: profileMap.get(rating.user_id)!.avatar_url,
        } : undefined
      }));
    } catch (error) {
      this.handleError(error, 'Failed to fetch ratings');
      return [];
    }
  }

  async getUserRating(noteId: string, userId: string): Promise<Rating | null> {
    try {
      const { data, error } = await supabase
        .from('ratings')
        .select('*')
        .eq('note_id', noteId)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to fetch user rating:', error);
      return null;
    }
  }

  async submitRating(noteId: string, userId: string, rating: number, review?: string): Promise<boolean> {
    try {
      // Verify user has downloaded the note before allowing rating
      const { data: downloadRecord, error: downloadError } = await supabase
        .from('downloads')
        .select('id')
        .eq('user_id', userId)
        .eq('note_id', noteId)
        .maybeSingle();

      if (downloadError) throw downloadError;

      if (!downloadRecord) {
        toast({
          title: 'Cannot submit review',
          description: 'You must download this note before leaving a review.',
          variant: 'destructive',
        });
        return false;
      }

      // Prevent note owners from reviewing their own notes
      const { data: noteData, error: noteError } = await supabase
        .from('notes')
        .select('user_id')
        .eq('id', noteId)
        .maybeSingle();

      if (noteError) throw noteError;

      if (noteData && noteData.user_id === userId) {
        toast({
          title: 'Cannot submit review',
          description: 'You cannot review your own notes.',
          variant: 'destructive',
        });
        return false;
      }

      // Check if user already rated
      const existing = await this.getUserRating(noteId, userId);

      if (existing) {
        // Update existing rating
        const { error } = await supabase
          .from('ratings')
          .update({ rating, review: review || null })
          .eq('id', existing.id);

        if (error) throw error;
        toast({ title: 'Success', description: 'Your review has been updated' });
      } else {
        // Create new rating
        const { error } = await supabase
          .from('ratings')
          .insert({ note_id: noteId, user_id: userId, rating, review: review || null });

        if (error) throw error;
        toast({ title: 'Success', description: 'Thank you for your review!' });
      }

      return true;
    } catch (error) {
      this.handleError(error, 'Failed to submit rating');
      return false;
    }
  }

  async deleteRating(ratingId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('ratings')
        .delete()
        .eq('id', ratingId);

      if (error) throw error;
      toast({ title: 'Success', description: 'Your review has been deleted' });
      return true;
    } catch (error) {
      this.handleError(error, 'Failed to delete rating');
      return false;
    }
  }
}

export const ratingsService = new RatingsService();
