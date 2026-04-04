import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, Download, Star, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

interface RelatedNote {
  id: string;
  title: string;
  subject: string;
  class_level: string;
  views_count: number;
  downloads_count: number;
  rating_avg: number;
  thumbnail_url: string | null;
  uploader?: {
    full_name: string | null;
    is_verified: boolean | null;
  } | null;
}

interface RelatedNotesProps {
  currentNoteId: string;
  subject: string;
  classLevel: string;
}

const RelatedNotes = ({ currentNoteId, subject, classLevel }: RelatedNotesProps) => {
  const [notes, setNotes] = useState<RelatedNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedNotes = async () => {
      setIsLoading(true);

      // Fetch notes with same subject or class level, excluding current note
      const { data, error } = await supabase
        .from("notes")
        .select(`
          id,
          title,
          subject,
          class_level,
          views_count,
          downloads_count,
          rating_avg,
          thumbnail_url,
          user_id
        `)
        .eq("status", "approved")
        .neq("id", currentNoteId)
        .or(`subject.eq.${subject},class_level.eq.${classLevel}`)
        .order("downloads_count", { ascending: false })
        .limit(4);

      if (error) {
        console.error("Error fetching related notes:", error);
        setNotes([]);
        setIsLoading(false);
        return;
      }

      // Fetch uploader profiles separately
      const notesData = data || [];
      const userIds = [...new Set(notesData.map((n) => n.user_id))];

      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, is_verified")
          .in("id", userIds);

        const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

        const notesWithUploaders: RelatedNote[] = notesData.map((note) => {
          const profile = profileMap.get(note.user_id);
          return {
            ...note,
            uploader: profile
              ? { full_name: profile.full_name, is_verified: profile.is_verified }
              : null,
          };
        });

        setNotes(notesWithUploaders);
      } else {
        setNotes(notesData.map((note) => ({ ...note, uploader: null })));
      }

      setIsLoading(false);
    };

    if (currentNoteId && subject && classLevel) {
      fetchRelatedNotes();
    }
  }, [currentNoteId, subject, classLevel]);

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-card rounded-xl border p-4">
            <Skeleton className="aspect-video w-full rounded-lg mb-3" />
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8">
        No related notes found.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {notes.map((note, index) => (
        <motion.div
          key={note.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="group bg-card rounded-xl border shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden"
        >
          {/* Preview Image */}
          <div className="aspect-video bg-secondary relative overflow-hidden">
            {note.thumbnail_url ? (
              <img
                src={note.thumbnail_url}
                alt={note.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
                <BookOpen className="w-8 h-8 text-primary/30" />
              </div>
            )}

            {/* Rating Badge */}
            <div className="absolute top-2 right-2">
              <Badge variant="secondary" className="glass flex items-center gap-1 text-xs">
                <Star className="w-3 h-3 fill-highlight text-highlight" />
                {note.rating_avg.toFixed(1)}
              </Badge>
            </div>
          </div>

          {/* Content */}
          <div className="p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Badge variant="outline" className="text-xs px-1.5 py-0">
                {note.class_level}
              </Badge>
              <Badge variant="secondary" className="text-xs px-1.5 py-0">
                {note.subject}
              </Badge>
            </div>

            <h4 className="font-medium text-sm text-foreground mb-1.5 line-clamp-2 group-hover:text-primary transition-colors">
              {note.title}
            </h4>

            <p className="text-xs text-muted-foreground mb-2">
              by {note.uploader?.full_name || "Anonymous"}
            </p>

            {/* Stats */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {formatNumber(note.views_count)}
              </div>
              <div className="flex items-center gap-1">
                <Download className="w-3 h-3" />
                {formatNumber(note.downloads_count)}
              </div>
            </div>

            {/* Action */}
            <Link to={`/notes/${note.id}`}>
              <Button
                variant="secondary"
                size="sm"
                className="w-full text-xs group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
              >
                View Notes
              </Button>
            </Link>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default RelatedNotes;
