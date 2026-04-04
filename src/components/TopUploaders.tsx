import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Download, IndianRupee, Crown, Medal, Award, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TopUploader {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  is_verified: boolean;
  total_downloads: number;
  total_notes: number;
  estimated_earnings: number;
}

type TimePeriod = 'week' | 'month' | 'all';

const TopUploaders = () => {
  const [uploaders, setUploaders] = useState<TopUploader[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('month');

  const getStartDate = (period: TimePeriod): string | null => {
    const now = new Date();
    switch (period) {
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return weekAgo.toISOString();
      case 'month':
        return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      case 'all':
        return null;
    }
  };

  const processUploaders = async (notes: { user_id: string; downloads_count: number | null; views_count: number | null }[]) => {
    // Aggregate stats by user
    const userStats: Record<string, { downloads: number; views: number; notes: number }> = {};

    notes.forEach(note => {
      if (!userStats[note.user_id]) {
        userStats[note.user_id] = { downloads: 0, views: 0, notes: 0 };
      }
      userStats[note.user_id].downloads += note.downloads_count || 0;
      userStats[note.user_id].views += note.views_count || 0;
      userStats[note.user_id].notes += 1;
    });

    // Sort by downloads and get top 5
    const sortedUsers = Object.entries(userStats)
      .sort((a, b) => b[1].downloads - a[1].downloads)
      .slice(0, 5);

    if (sortedUsers.length === 0) {
      setUploaders([]);
      return;
    }

    // Fetch profiles for top users
    const userIds = sortedUsers.map(([id]) => id);
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, is_verified')
      .in('id', userIds);

    if (profilesError) throw profilesError;

    const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

    // Build leaderboard with earnings calculation
    // New earnings model: ₹50 at first 1000 views, then ₹10 per 1000 views + ₹25 per 100 downloads
    const leaderboard: TopUploader[] = sortedUsers.map(([userId, stats]) => {
      const profile = profileMap.get(userId);
      
      // Calculate view earnings
      let viewEarnings = 0;
      if (stats.views >= 1000) {
        viewEarnings = 50; // First milestone bonus
        const additionalThousands = Math.floor((stats.views - 1000) / 1000);
        viewEarnings += additionalThousands * 10;
      }
      
      // Calculate download earnings (₹25 per 100 downloads)
      const downloadEarnings = Math.floor(stats.downloads / 100) * 25;
      
      const earnings = viewEarnings + downloadEarnings;

      return {
        id: userId,
        full_name: profile?.full_name || null,
        avatar_url: profile?.avatar_url || null,
        is_verified: profile?.is_verified || false,
        total_downloads: stats.downloads,
        total_notes: stats.notes,
        estimated_earnings: Math.round(earnings)
      };
    });

    setUploaders(leaderboard);
  };

  useEffect(() => {
    const fetchTopUploaders = async () => {
      setIsLoading(true);
      try {
        const startDate = getStartDate(timePeriod);

        let query = supabase
          .from('notes')
          .select('user_id, downloads_count, views_count')
          .eq('status', 'approved');

        if (startDate) {
          query = query.gte('created_at', startDate);
        }

        const { data: notes, error: notesError } = await query;

        if (notesError) throw notesError;

        if (!notes || notes.length === 0) {
          // Fallback: get all-time top uploaders if no data for selected period
          if (timePeriod !== 'all') {
            const { data: allNotes, error: allError } = await supabase
              .from('notes')
              .select('user_id, downloads_count, views_count')
              .eq('status', 'approved');

            if (allError) throw allError;
            
            if (!allNotes || allNotes.length === 0) {
              setUploaders([]);
              setIsLoading(false);
              return;
            }

            await processUploaders(allNotes);
          } else {
            setUploaders([]);
          }
        } else {
          await processUploaders(notes);
        }
      } catch (error) {
        console.error('Error fetching top uploaders:', error);
        setUploaders([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopUploaders();
  }, [timePeriod]);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="w-5 h-5 text-highlight" />;
      case 1:
        return <Medal className="w-5 h-5 text-muted-foreground" />;
      case 2:
        return <Award className="w-5 h-5 text-accent" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-muted-foreground">{index + 1}</span>;
    }
  };

  const getRankBg = (index: number) => {
    switch (index) {
      case 0:
        return 'bg-highlight/10 border-highlight/30';
      case 1:
        return 'bg-muted/50 border-muted-foreground/20';
      case 2:
        return 'bg-accent/10 border-accent/30';
      default:
        return 'bg-background border-border';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl border shadow-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-highlight" />
          <h2 className="font-semibold">Top Uploaders</h2>
        </div>
        <div className="space-y-3">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (uploaders.length === 0) {
    return null;
  }

  const getPeriodLabel = () => {
    switch (timePeriod) {
      case 'week': return "This week's leaders";
      case 'month': return "This month's leaders";
      case 'all': return "All-time leaders";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl border shadow-card p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-highlight/10 flex items-center justify-center">
            <Trophy className="w-4 h-4 text-highlight" />
          </div>
          <div>
            <h2 className="font-semibold">Top Uploaders</h2>
            <p className="text-xs text-muted-foreground">{getPeriodLabel()}</p>
          </div>
        </div>

        <Tabs value={timePeriod} onValueChange={(v) => setTimePeriod(v as TimePeriod)}>
          <TabsList className="h-8">
            <TabsTrigger value="week" className="text-xs px-2 h-6">Week</TabsTrigger>
            <TabsTrigger value="month" className="text-xs px-2 h-6">Month</TabsTrigger>
            <TabsTrigger value="all" className="text-xs px-2 h-6">All</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={timePeriod}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="space-y-3"
        >
        {uploaders.map((uploader, index) => (
          <motion.div
            key={uploader.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${getRankBg(index)}`}
          >
            {/* Rank */}
            <div className="flex-shrink-0 w-8 flex justify-center">
              {getRankIcon(index)}
            </div>

            {/* Avatar */}
            <Avatar className="w-10 h-10 border-2 border-background">
              <AvatarImage src={uploader.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {uploader.full_name?.charAt(0)?.toUpperCase() || <User className="w-4 h-4" />}
              </AvatarFallback>
            </Avatar>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm truncate">
                  {uploader.full_name || 'Anonymous'}
                </span>
                {uploader.is_verified && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    Verified
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                <span>{uploader.total_notes} notes</span>
                <span className="flex items-center gap-1">
                  <Download className="w-3 h-3" />
                  {uploader.total_downloads.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Earnings */}
            <div className="flex-shrink-0 text-right">
              <div className="flex items-center gap-1 text-sm font-semibold text-accent">
                <IndianRupee className="w-3.5 h-3.5" />
                {uploader.estimated_earnings.toLocaleString()}
              </div>
              <p className="text-[10px] text-muted-foreground">earned</p>
            </div>
          </motion.div>
        ))}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default TopUploaders;
