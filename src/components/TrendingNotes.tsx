import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, Eye, Download, Star, FileText, Flame } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface TrendingNote {
  id: string;
  title: string;
  subject: string;
  class_level: string;
  thumbnail_url: string | null;
  views_count: number;
  downloads_count: number;
  rating_avg: number;
  created_at: string;
  uploader_name: string | null;
}

const TrendingNotes = () => {
  const [trendingNotes, setTrendingNotes] = useState<TrendingNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTrendingNotes = async () => {
      try {
        // Get notes from the last 24 hours with highest engagement
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

        // First try to get recent notes with high engagement
        let { data: recentNotes, error } = await supabase
          .from('notes')
          .select('id, title, subject, class_level, thumbnail_url, views_count, downloads_count, rating_avg, created_at, user_id')
          .eq('status', 'approved')
          .gte('created_at', twentyFourHoursAgo)
          .order('views_count', { ascending: false })
          .limit(6);

        // If not enough recent notes, get top performing notes overall
        if (!recentNotes || recentNotes.length < 4) {
          const { data: topNotes, error: topError } = await supabase
            .from('notes')
            .select('id, title, subject, class_level, thumbnail_url, views_count, downloads_count, rating_avg, created_at, user_id')
            .eq('status', 'approved')
            .order('downloads_count', { ascending: false })
            .order('views_count', { ascending: false })
            .limit(6);

          if (topError) throw topError;
          recentNotes = topNotes;
        }

        if (error) throw error;

        if (!recentNotes || recentNotes.length === 0) {
          setTrendingNotes([]);
          setIsLoading(false);
          return;
        }

        // Fetch uploader profiles
        const userIds = [...new Set(recentNotes.map(n => n.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', userIds);

        const profileMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);

        const combined: TrendingNote[] = recentNotes.map(note => ({
          id: note.id,
          title: note.title,
          subject: note.subject,
          class_level: note.class_level,
          thumbnail_url: note.thumbnail_url,
          views_count: note.views_count || 0,
          downloads_count: note.downloads_count || 0,
          rating_avg: note.rating_avg || 0,
          created_at: note.created_at || '',
          uploader_name: profileMap.get(note.user_id) || null
        }));

        setTrendingNotes(combined);
      } catch (error) {
        console.error('Error fetching trending notes:', error);
        setTrendingNotes([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrendingNotes();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl border shadow-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Flame className="w-5 h-5 text-destructive" />
          <h2 className="font-semibold">Trending Now</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="flex gap-3 p-3 rounded-lg border">
              <Skeleton className="w-16 h-16 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (trendingNotes.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl border shadow-card p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
            <Flame className="w-4 h-4 text-destructive" />
          </div>
          <div>
            <h2 className="font-semibold">Trending Now</h2>
            <p className="text-xs text-muted-foreground">Popular notes this period</p>
          </div>
        </div>
        <Link 
          to="/browse" 
          className="text-sm text-primary hover:underline"
        >
          See all →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {trendingNotes.slice(0, 6).map((note, index) => (
          <motion.div
            key={note.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link
              to={`/notes/${note.id}`}
              className="group flex gap-3 p-3 rounded-lg border bg-background hover:bg-secondary/50 transition-colors"
            >
              {/* Rank Badge */}
              <div className="relative">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                  {note.thumbnail_url ? (
                    <img
                      src={note.thumbnail_url}
                      alt={note.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                      <FileText className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
                {index < 3 && (
                  <Badge 
                    className={`absolute -top-1 -left-1 w-5 h-5 p-0 flex items-center justify-center text-[10px] font-bold ${
                      index === 0 
                        ? 'bg-highlight text-highlight-foreground' 
                        : index === 1 
                          ? 'bg-muted-foreground text-background' 
                          : 'bg-accent/80 text-accent-foreground'
                    }`}
                  >
                    {index + 1}
                  </Badge>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">
                  {note.title}
                </h3>

                <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                  <span className="truncate">{note.subject}</span>
                  <span>•</span>
                  <span>{note.class_level}</span>
                </div>

                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {note.views_count.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Download className="w-3 h-3" />
                    {note.downloads_count.toLocaleString()}
                  </span>
                  {note.rating_avg > 0 && (
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-highlight text-highlight" />
                      {note.rating_avg.toFixed(1)}
                    </span>
                  )}
                </div>

                {note.uploader_name && (
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    by {note.uploader_name}
                  </p>
                )}
              </div>

              {/* Trending indicator */}
              <div className="flex-shrink-0 self-center">
                <TrendingUp className="w-4 h-4 text-accent" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default TrendingNotes;
