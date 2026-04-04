import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Eye, Download, Star, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface NoteCardProps {
  id: string;
  title: string;
  subject: string;
  class: string;
  views: number;
  downloads: number;
  rating: number;
  author: string;
  previewImage?: string;
  isVerified?: boolean;
  isFree?: boolean;
  price?: number;
}

const NoteCard = ({
  id,
  title,
  subject,
  class: classLevel,
  views,
  downloads,
  rating,
  author,
  previewImage,
  isVerified,
  isFree = true,
  price,
}: NoteCardProps) => {
  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="group bg-card rounded-xl border shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden"
    >
      {/* Preview Image */}
      <div className="aspect-[4/3] bg-secondary relative overflow-hidden">
        {previewImage ? (
          <img
            src={previewImage}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
            <BookOpen className="w-12 h-12 text-primary/30" />
          </div>
        )}
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors duration-300" />
        
        {/* Rating Badge */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
          <Badge variant="secondary" className="glass flex items-center gap-1">
            <Star className="w-3 h-3 fill-highlight text-highlight" />
            {rating.toFixed(1)}
          </Badge>
          {!isFree && price !== undefined && price > 0 && (
            <Badge className="bg-primary text-primary-foreground font-semibold">
              ₹{price}
            </Badge>
          )}
          {isFree && (
            <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30 font-semibold">
              Free
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className="text-xs">
            {classLevel}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {subject}
          </Badge>
        </div>

        <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm text-muted-foreground">by {author}</span>
          {isVerified && (
            <Badge className="gradient-primary text-[10px] px-1.5 py-0">
              Verified
            </Badge>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            {formatNumber(views)}
          </div>
          <div className="flex items-center gap-1">
            <Download className="w-4 h-4" />
            {formatNumber(downloads)}
          </div>
        </div>

        {/* Action */}
        <Link to={`/notes/${id}`}>
          <Button variant="secondary" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            View Notes
          </Button>
        </Link>
      </div>
    </motion.div>
  );
};

export default NoteCard;
