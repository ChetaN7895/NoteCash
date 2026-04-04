import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Eye, Download, Star, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { Skeleton } from '@/components/ui/skeleton';

interface RecentNote {
  id: string;
  title: string;
  subject: string;
  class_level: string;
  thumbnail_url: string | null;
  views_count: number;
  downloads_count: number;
  rating_avg: number;
  viewed_at: string;
}

const RecentlyViewed = () => {
  const { user } = useAuthStore();
  const [recentNotes, setRecentNotes] = useState<RecentNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecentlyViewed = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        // Get recently viewed note IDs
        const { data: views, error: viewsError } = await supabase
          .from('user_note_views')
          .select('note_id, viewed_at')
          .eq('user_id', user.id)
          .order('viewed_at', { ascending: false })
          .limit(8);

        if (viewsError) throw viewsError;

        if (!views || views.length === 0) {
          setRecentNotes([]);
          setIsLoading(false);
          return;
        }

        const noteIds = views.map(v => v.note_id);
        const viewedAtMap = new Map(views.map(v => [v.note_id, v.viewed_at]));

        // Fetch note details
        const { data: notes, error: notesError } = await supabase
          .from('notes')
          .select('id, title, subject, class_level, thumbnail_url, views_count, downloads_count, rating_avg')
          .in('id', noteIds)
          .eq('status', 'approved');

        if (notesError) throw notesError;

        // Combine and sort by viewed_at
        const combined = (notes || []).map(note => ({
          ...note,
          views_count: note.views_count || 0,
          downloads_count: note.downloads_count || 0,
          rating_avg: note.rating_avg || 0,
          viewed_at: viewedAtMap.get(note.id) || ''
        })).sort((a, b) => 
          new Date(b.viewed_at).getTime() - new Date(a.viewed_at).getTime()
        );

        setRecentNotes(combined);
      } catch (error) {
        console.error('Error fetching recently viewed:', error);
        setRecentNotes([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentlyViewed();
  }, [user?.id]);

  if (!user) return null;

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl border shadow-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-primary" />
          <h2 className="font-semibold">Recently Viewed</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-[4/3] rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (recentNotes.length === 0) {
    return (
      <div className="bg-card rounded-xl border shadow-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-primary" />
          <h2 className="font-semibold">Recently Viewed</h2>
        </div>
        <div className="text-center py-8">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            No recently viewed notes yet. Start browsing to see your history here!
          </p>
          <Link 
            to="/browse" 
            className="text-sm text-primary hover:underline mt-2 inline-block"
          >
            Browse Notes →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl border shadow-card p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          <h2 className="font-semibold">Recently Viewed</h2>
        </div>
        <Link 
          to="/browse" 
          className="text-sm text-primary hover:underline"
        >
          Browse more →
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {recentNotes.slice(0, 4).map((note, index) => (
          <motion.div
            key={note.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link
              to={`/notes/${note.id}`}
              className="group block"
            >
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-secondary mb-2">
                {note.thumbnail_url ? (
                  <img
                    src={note.thumbnail_url}
                    alt={note.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                    <FileText className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              <h3 className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">
                {note.title}
              </h3>

              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                <span className="truncate">{note.subject}</span>
                <span>•</span>
                <span>{note.class_level}</span>
              </div>

              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {note.views_count}
                </span>
                <span className="flex items-center gap-1">
                  <Download className="w-3 h-3" />
                  {note.downloads_count}
                </span>
                {note.rating_avg > 0 && (
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-highlight text-highlight" />
                    {note.rating_avg.toFixed(1)}
                  </span>
                )}
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default RecentlyViewed;
