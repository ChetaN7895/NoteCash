import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Star, Eye, TrendingUp, User } from "lucide-react";
import { usePersonalizedSuggestions } from "@/hooks/usePersonalizedSuggestions";
import { useAuthStore } from "@/stores/authStore";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const PersonalizedSuggestions = () => {
  const { user } = useAuthStore();
  const { suggestions, isLoading, userInterests } = usePersonalizedSuggestions();

  if (isLoading) {
    return (
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="w-5 h-5 rounded" />
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-40 sm:w-48">
              <Skeleton className="aspect-[4/3] rounded-xl mb-2" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  const hasPersonalization = user && userInterests && (userInterests.subjects.length > 0 || userInterests.classLevels.length > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="mb-10"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {hasPersonalization ? (
            <User className="w-5 h-5 text-primary" />
          ) : (
            <TrendingUp className="w-5 h-5 text-primary" />
          )}
          <h2 className="text-xl font-semibold">
            {hasPersonalization ? "Recommended For You" : "Popular Notes"}
          </h2>
        </div>
        
        {hasPersonalization && userInterests && userInterests.subjects.length > 0 && (
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Based on:</span>
            {userInterests.subjects.slice(0, 2).map((subject) => (
              <Badge key={subject} variant="secondary" className="text-xs">
                {subject}
              </Badge>
            ))}
          </div>
        )}
      </div>
      
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {suggestions.map((note, index) => (
          <Link
            key={note.id}
            to={`/notes/${note.id}`}
            className="flex-shrink-0 group"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="w-40 sm:w-48"
            >
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-muted mb-2 border border-border/50 group-hover:border-primary/50 transition-all group-hover:shadow-lg">
                {note.thumbnail_url ? (
                  <img
                    src={note.thumbnail_url}
                    alt={note.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <span className="text-3xl font-bold text-primary/40">
                      {note.subject.charAt(0)}
                    </span>
                  </div>
                )}
                
                {/* Overlay with stats */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1 text-foreground/80">
                      <Eye className="w-3 h-3" />
                      {note.views_count || 0}
                    </span>
                    <span className="flex items-center gap-1 text-amber-500">
                      <Star className="w-3 h-3 fill-current" />
                      {(note.rating_avg || 0).toFixed(1)}
                    </span>
                  </div>
                </div>
                
                {/* Free/Paid Badge */}
                {note.is_free && (
                  <div className="absolute top-2 right-2 bg-emerald-500/90 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                    Free
                  </div>
                )}
                
                {/* Personalized Badge */}
                {hasPersonalization && userInterests?.subjects.includes(note.subject) && (
                  <div className="absolute top-2 left-2 bg-primary/90 text-primary-foreground text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    For You
                  </div>
                )}
              </div>
              
              <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                {note.title}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {note.subject} • {note.class_level}
              </p>
              {note.uploader?.full_name && (
                <p className="text-xs text-muted-foreground/70 mt-0.5 flex items-center gap-1">
                  by {note.uploader.full_name}
                  {note.uploader.is_verified && (
                    <span className="text-primary">✓</span>
                  )}
                </p>
              )}
            </motion.div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
};

export default PersonalizedSuggestions;
