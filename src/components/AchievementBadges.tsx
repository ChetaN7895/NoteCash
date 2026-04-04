import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { 
  Trophy, 
  Eye, 
  Download, 
  Star, 
  Flame, 
  Crown,
  Medal,
  Target,
  Zap,
  Award
} from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";

interface AchievementBadgesProps {
  totalViews: number;
  totalDownloads: number;
  totalNotes: number;
  isTopUploader?: boolean;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  unlocked: boolean;
  progress: number;
  target: number;
  color: string;
}

const STORAGE_KEY = "unlocked_achievements";

const getStoredAchievements = (): string[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const storeAchievements = (ids: string[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
};

const triggerConfetti = () => {
  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
    zIndex: 9999,
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
    colors: ['#4F46E5', '#22C55E', '#FACC15'],
  });
  fire(0.2, {
    spread: 60,
    colors: ['#4F46E5', '#22C55E', '#FACC15'],
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
    colors: ['#4F46E5', '#22C55E', '#FACC15'],
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
    colors: ['#4F46E5', '#22C55E', '#FACC15'],
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
    colors: ['#4F46E5', '#22C55E', '#FACC15'],
  });
};

const AchievementBadges = ({ 
  totalViews, 
  totalDownloads, 
  totalNotes,
  isTopUploader = false 
}: AchievementBadgesProps) => {
  const hasCheckedRef = useRef(false);
  
  const achievements: Achievement[] = [
    {
      id: "first_upload",
      name: "First Steps",
      description: "Upload your first note",
      icon: Target,
      unlocked: totalNotes >= 1,
      progress: Math.min(totalNotes, 1),
      target: 1,
      color: "text-blue-500 bg-blue-500/10 border-blue-500/20"
    },
    {
      id: "five_uploads",
      name: "Contributor",
      description: "Upload 5 notes",
      icon: Medal,
      unlocked: totalNotes >= 5,
      progress: Math.min(totalNotes, 5),
      target: 5,
      color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20"
    },
    {
      id: "ten_uploads",
      name: "Prolific Writer",
      description: "Upload 10 notes",
      icon: Award,
      unlocked: totalNotes >= 10,
      progress: Math.min(totalNotes, 10),
      target: 10,
      color: "text-purple-500 bg-purple-500/10 border-purple-500/20"
    },
    {
      id: "100_views",
      name: "Getting Noticed",
      description: "Reach 100 total views",
      icon: Eye,
      unlocked: totalViews >= 100,
      progress: Math.min(totalViews, 100),
      target: 100,
      color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20"
    },
    {
      id: "1000_views",
      name: "Popular",
      description: "Reach 1,000 total views",
      icon: Flame,
      unlocked: totalViews >= 1000,
      progress: Math.min(totalViews, 1000),
      target: 1000,
      color: "text-orange-500 bg-orange-500/10 border-orange-500/20"
    },
    {
      id: "10000_views",
      name: "Viral",
      description: "Reach 10,000 total views",
      icon: Zap,
      unlocked: totalViews >= 10000,
      progress: Math.min(totalViews, 10000),
      target: 10000,
      color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20"
    },
    {
      id: "100_downloads",
      name: "Helpful",
      description: "Reach 100 total downloads",
      icon: Download,
      unlocked: totalDownloads >= 100,
      progress: Math.min(totalDownloads, 100),
      target: 100,
      color: "text-green-500 bg-green-500/10 border-green-500/20"
    },
    {
      id: "500_downloads",
      name: "Essential",
      description: "Reach 500 total downloads",
      icon: Star,
      unlocked: totalDownloads >= 500,
      progress: Math.min(totalDownloads, 500),
      target: 500,
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
    },
    {
      id: "top_uploader",
      name: "Top Uploader",
      description: "Be in the top 3 uploaders",
      icon: Crown,
      unlocked: isTopUploader,
      progress: isTopUploader ? 1 : 0,
      target: 1,
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20"
    },
  ];

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const unlockedIds = achievements.filter(a => a.unlocked).map(a => a.id);

  // Check for newly unlocked achievements
  useEffect(() => {
    if (hasCheckedRef.current) return;
    if (totalNotes === 0 && totalViews === 0 && totalDownloads === 0) return;
    
    hasCheckedRef.current = true;
    const previouslyUnlocked = getStoredAchievements();
    const newlyUnlocked = unlockedIds.filter(id => !previouslyUnlocked.includes(id));

    if (newlyUnlocked.length > 0) {
      // Find the achievement details for the toast
      const newAchievements = achievements.filter(a => newlyUnlocked.includes(a.id));
      
      // Trigger confetti
      triggerConfetti();

      // Show toast for each new achievement
      newAchievements.forEach((achievement, index) => {
        setTimeout(() => {
          toast({
            title: "🏆 Achievement Unlocked!",
            description: `${achievement.name}: ${achievement.description}`,
          });
        }, index * 500);
      });

      // Store the updated list
      storeAchievements(unlockedIds);
    } else if (previouslyUnlocked.length === 0 && unlockedIds.length > 0) {
      // First time loading with achievements - just store them without confetti
      storeAchievements(unlockedIds);
    }
  }, [unlockedIds, achievements, totalNotes, totalViews, totalDownloads]);

  return (
    <div className="bg-card rounded-xl border shadow-card p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Trophy className="w-4 h-4 text-highlight" />
          Achievements
        </h3>
        <span className="text-sm text-muted-foreground">
          {unlockedCount}/{achievements.length} unlocked
        </span>
      </div>

      <TooltipProvider>
        <div className="grid grid-cols-3 gap-3">
          {achievements.map((achievement, index) => (
            <Tooltip key={achievement.id}>
              <TooltipTrigger asChild>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className={`relative flex flex-col items-center justify-center p-3 rounded-lg border transition-all cursor-pointer ${
                    achievement.unlocked 
                      ? achievement.color
                      : "bg-muted/30 text-muted-foreground border-border opacity-50"
                  }`}
                >
                  <achievement.icon className={`w-6 h-6 mb-1 ${achievement.unlocked ? "" : "text-muted-foreground"}`} />
                  <span className="text-[10px] font-medium text-center leading-tight">
                    {achievement.name}
                  </span>
                  
                  {!achievement.unlocked && (
                    <div className="absolute bottom-1 left-1 right-1">
                      <div className="h-1 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary/50 rounded-full transition-all"
                          style={{ width: `${(achievement.progress / achievement.target) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </motion.div>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[200px]">
                <p className="font-medium">{achievement.name}</p>
                <p className="text-xs text-muted-foreground">{achievement.description}</p>
                {!achievement.unlocked && (
                  <p className="text-xs text-primary mt-1">
                    Progress: {achievement.progress.toLocaleString()}/{achievement.target.toLocaleString()}
                  </p>
                )}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>
    </div>
  );
};

export default AchievementBadges;
