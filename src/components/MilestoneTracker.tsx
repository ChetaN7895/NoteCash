import { motion } from 'framer-motion';
import { Eye, IndianRupee, Trophy, Sparkles } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface MilestoneTrackerProps {
  totalViews: number;
  isLoading?: boolean;
}

const MilestoneTracker = ({ totalViews, isLoading = false }: MilestoneTrackerProps) => {
  const MILESTONE = 1000;
  const BONUS = 50;
  const isCompleted = totalViews >= MILESTONE;
  const progress = Math.min((totalViews / MILESTONE) * 100, 100);
  const viewsRemaining = Math.max(MILESTONE - totalViews, 0);

  if (isLoading) {
    return (
      <div className="rounded-xl border bg-card p-4 animate-pulse">
        <div className="h-5 w-40 bg-muted rounded mb-3" />
        <div className="h-3 w-full bg-muted rounded-full mb-2" />
        <div className="h-4 w-28 bg-muted rounded" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className={`relative overflow-hidden rounded-xl border p-4 ${
          isCompleted
            ? 'bg-accent/10 border-accent/30'
            : 'bg-card'
        }`}
      >
        {/* Subtle shimmer on completed */}
        {isCompleted && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/5 to-transparent animate-pulse pointer-events-none" />
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {isCompleted ? (
              <div className="flex items-center justify-center w-7 h-7 rounded-full gradient-earnings">
                <Trophy className="w-4 h-4 text-accent-foreground" />
              </div>
            ) : (
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10">
                <Eye className="w-4 h-4 text-primary" />
              </div>
            )}
            <h3 className="text-sm font-semibold">
              {isCompleted ? 'Milestone Unlocked!' : 'First 1K Views'}
            </h3>
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant={isCompleted ? 'default' : 'secondary'}
                className={`text-xs gap-1 ${isCompleted ? 'gradient-earnings border-0' : ''}`}
              >
                <IndianRupee className="w-3 h-3" />
                {BONUS}
                {isCompleted && <Sparkles className="w-3 h-3" />}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {isCompleted
                  ? '₹50 bonus earned for reaching 1,000 views!'
                  : `Earn ₹50 bonus when your notes reach 1,000 total views`}
              </p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Progress bar */}
        <div className="relative mb-2">
          <Progress
            value={progress}
            className={`h-2.5 ${isCompleted ? '[&>div]:bg-accent' : ''}`}
          />
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {isCompleted ? (
              <span className="text-accent font-medium flex items-center gap-1">
                <Trophy className="w-3 h-3" />
                Completed — ₹50 earned
              </span>
            ) : (
              `${viewsRemaining.toLocaleString('en-IN')} views to go`
            )}
          </span>
          <span className="font-medium">
            {totalViews.toLocaleString('en-IN')} / {MILESTONE.toLocaleString('en-IN')}
          </span>
        </div>
      </motion.div>
    </TooltipProvider>
  );
};

export default MilestoneTracker;
