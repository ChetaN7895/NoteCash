import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import NoteCard from "@/components/NoteCard";
import NoteCardSkeleton from "@/components/skeletons/NoteCardSkeleton";

interface FeaturedNote {
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

interface FeaturedNotesProps {
  notes: FeaturedNote[];
  isLoading: boolean;
}

const FeaturedNotes = ({ notes, isLoading }: FeaturedNotesProps) => {
  if (!isLoading && notes.length === 0) {
    return null; // Don't render section if no featured notes
  }

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      <motion.div
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3] 
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-10 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.4, 0.2] 
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-10 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
      />

      <div className="container mx-auto px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4"
        >
          <div>
            <Badge variant="secondary" className="mb-4 px-3 py-1.5">
              <Sparkles className="w-3 h-3 mr-1.5 text-highlight fill-highlight" />
              Handpicked by Experts
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">
              Featured Notes
            </h2>
            <p className="text-muted-foreground">
              Premium quality notes curated by our team for exceptional learning.
            </p>
          </div>
          <Link to="/browse?featured=true">
            <Button variant="outline">
              View All Featured
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            <>
              <NoteCardSkeleton />
              <NoteCardSkeleton />
              <NoteCardSkeleton />
              <NoteCardSkeleton />
            </>
          ) : (
            notes.slice(0, 4).map((note, index) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <div className="relative">
                  {/* Featured badge overlay */}
                  <div className="absolute -top-2 -right-2 z-10">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-8 h-8 rounded-full bg-highlight flex items-center justify-center shadow-lg shadow-highlight/30"
                    >
                      <Sparkles className="w-4 h-4 text-highlight-foreground" />
                    </motion.div>
                  </div>
                  <NoteCard {...note} />
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default FeaturedNotes;
