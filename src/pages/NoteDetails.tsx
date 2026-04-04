import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Eye,
  Download,
  Star,
  Share2,
  Flag,
  ExternalLink,
  ChevronLeft,
  FileText,
  Calendar,
  CheckCircle,
  Loader2,
  Lock,
  Gift,
  MessageSquare,
  BookOpen,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import PDFPreview from "@/components/PDFPreview";
import RatingForm from "@/components/RatingForm";
import ReviewsList from "@/components/ReviewsList";
import RelatedNotes from "@/components/RelatedNotes";
import { Rating } from "@/services/ratings.service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { usePersonalizedSuggestions } from "@/hooks/usePersonalizedSuggestions";
import { useAuthStore } from "@/stores/authStore";
import { useFreeDownloads, FREE_DOWNLOAD_LIMIT_CONST } from "@/hooks/useFreeDownloads";
import { supabase } from "@/integrations/supabase/client";
import { notesService, Note } from "@/services/notes.service";

interface UploaderStats {
  totalNotes: number;
  totalDownloads: number;
}

const NoteDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session } = useAuthStore();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [note, setNote] = useState<Note | null>(null);
  const [uploaderStats, setUploaderStats] = useState<UploaderStats | null>(null);
  const [alreadyDownloaded, setAlreadyDownloaded] = useState(false);
  const [reviewsRefreshTrigger, setReviewsRefreshTrigger] = useState(0);
  const [editingReview, setEditingReview] = useState<Rating | null>(null);
  const { trackNoteView } = usePersonalizedSuggestions();
  
  const { 
    freeDownloadsRemaining, 
    canDownloadFree, 
    recordDownload, 
    hasDownloaded,
    isLoading: isCheckingDownloads 
  } = useFreeDownloads();
  
  const isGuest = !session;

  // Fetch note data
  useEffect(() => {
    const fetchNote = async () => {
      if (!id) return;
      
      setIsLoading(true);
      const noteData = await notesService.getNoteById(id);
      
      if (noteData) {
        setNote(noteData);
        // Increment views
        notesService.incrementViews(id);
        
        // Fetch uploader stats
        const stats = await notesService.getUserStats(noteData.user_id);
        setUploaderStats({
          totalNotes: stats.totalNotes,
          totalDownloads: stats.totalDownloads
        });
      }
      
      setIsLoading(false);
    };
    
    fetchNote();
  }, [id]);

  // Track view when page loads
  useEffect(() => {
    if (id) {
      trackNoteView(id);
    }
  }, [id]);

  // Check if user already downloaded this note
  useEffect(() => {
    const checkDownloadStatus = async () => {
      if (session?.user?.id && id) {
        const downloaded = await hasDownloaded(id);
        setAlreadyDownloaded(downloaded);
      }
    };
    checkDownloadStatus();
  }, [session?.user?.id, id, hasDownloaded]);

  const formatFileSize = (bytes: number) => {
    if (bytes >= 1024 * 1024) {
      return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    }
    return (bytes / 1024).toFixed(1) + " KB";
  };

  const canDownload = alreadyDownloaded || canDownloadFree;

  const performActualDownload = async () => {
    if (!note) return false;
    
    try {
      // Extract file path from the URL
      const filePathMatch = note.file_url.match(/notes\/(.+)/);
      
      if (filePathMatch) {
        // Get signed URL for download from Supabase storage
        const { data, error } = await supabase.storage
          .from('notes')
          .createSignedUrl(filePathMatch[1], 60);

        if (error) throw error;

        // Determine file extension from file_type
        const extension = note.file_type.toLowerCase();
        const fileName = `${note.title}.${extension}`;

        // Trigger download
        const link = document.createElement('a');
        link.href = data.signedUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        return true;
      } else {
        // Direct download if URL format is different (public URL)
        window.open(note.file_url, '_blank');
        return true;
      }
    } catch (error) {
      console.error('Download error:', error);
      return false;
    }
  };

  const handleDownload = async () => {
    if (isGuest) {
      toast({
        title: "Login Required",
        description: "Please login to download notes.",
      });
      navigate('/login', { state: { from: `/notes/${id}` } });
      return;
    }

    setIsDownloading(true);

    // Check if already downloaded - allow re-download
    if (alreadyDownloaded) {
      const success = await performActualDownload();
      setIsDownloading(false);
      if (success) {
        toast({
          title: "Download Started!",
          description: "Your notes are being downloaded.",
        });
      } else {
        toast({
          title: "Download Failed",
          description: "Failed to download. Please try again.",
          variant: "destructive",
        });
      }
      return;
    }

    // Check free download limit
    if (!canDownloadFree) {
      setIsDownloading(false);
      toast({
        title: "No Free Downloads Left",
        description: `You've used all ${FREE_DOWNLOAD_LIMIT_CONST} free downloads. Upgrade to premium for unlimited access!`,
        variant: "destructive",
      });
      return;
    }
    
    // Record the download first
    const recorded = await recordDownload(id || "");
    
    if (recorded) {
      setAlreadyDownloaded(true);
      const success = await performActualDownload();
      setIsDownloading(false);
      if (success) {
        toast({
          title: "Download Started!",
          description: "Your notes are being downloaded.",
        });
      } else {
        toast({
          title: "Download Failed",
          description: "Failed to download. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      setIsDownloading(false);
      toast({
        title: "Download Failed",
        description: "Failed to process download. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link Copied!",
      description: "Share this link with your friends.",
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-20">
          <div className="container mx-auto px-4">
            <Skeleton className="h-6 w-32 mb-6" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
                <Skeleton className="h-48 w-full rounded-xl" />
              </div>
              <div>
                <Skeleton className="h-96 w-full rounded-xl" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!note) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-2xl font-bold mb-4">Note Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The note you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link to="/browse">Browse Notes</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const authorName = note.uploader?.full_name || "Anonymous";
  const authorInitials = authorName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={note.title}
        description={note.description || undefined}
        keywords={`${note.subject} notes, ${note.class_level} notes`}
        ogType="article"
      />
      <Navbar />

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Link
              to="/browse"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to Browse
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* PDF Preview with Guest Limitations */}
              <PDFPreview
                fileUrl={note.file_url}
                title={note.title}
                isGuest={isGuest}
                noteId={id || ""}
                previewPages={2}
              />

              {/* Description */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-card rounded-xl border p-6 shadow-card"
              >
                <h2 className="text-lg font-semibold mb-4">About these notes</h2>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {note.description || "No description available."}
                </p>

                <h3 className="font-semibold mb-3">Details</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{note.subject}</Badge>
                  <Badge variant="secondary">{note.class_level}</Badge>
                  <Badge variant="secondary">{note.file_type.toUpperCase()}</Badge>
                </div>
              </motion.div>

              {/* Rating Form */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card rounded-xl border p-6 shadow-card"
                data-rating-form
              >
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-highlight" />
                  Rate & Review
                </h2>
                <RatingForm
                  noteId={id || ""}
                  hasDownloaded={alreadyDownloaded}
                  noteUserId={note.user_id}
                  editingReview={editingReview}
                  onCancelEdit={() => setEditingReview(null)}
                  onRatingSubmitted={() => {
                    setReviewsRefreshTrigger((prev) => prev + 1);
                    setEditingReview(null);
                    // Refresh note data to get updated rating
                    if (id) {
                      notesService.getNoteById(id).then((data) => {
                        if (data) setNote(data);
                      });
                    }
                  }}
                />
              </motion.div>

              {/* Reviews List */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="bg-card rounded-xl border p-6 shadow-card"
              >
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Reviews ({note.rating_count})
                </h2>
                <ReviewsList
                  noteId={id || ""}
                  refreshTrigger={reviewsRefreshTrigger}
                  onEditReview={(review) => {
                    setEditingReview(review);
                    // Scroll to rating form
                    document.querySelector('[data-rating-form]')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                />
              </motion.div>

              {/* Related Notes */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-card rounded-xl border p-6 shadow-card"
              >
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Related Notes
                </h2>
                <RelatedNotes
                  currentNoteId={id || ""}
                  subject={note.subject}
                  classLevel={note.class_level}
                />
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Note Info Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-card rounded-xl border p-6 shadow-card sticky top-24"
              >
                {/* Title & Meta */}
                <div className="mb-6">
                  {/* Price Indicator */}
                  <div className="mb-4">
                    {note.is_free ? (
                      <Badge className="bg-green-500/10 text-green-600 border-green-500/30 font-semibold text-base px-4 py-1.5">
                        <Gift className="w-4 h-4 mr-1.5" />
                        Free
                      </Badge>
                    ) : (
                      <Badge className="bg-primary text-primary-foreground font-semibold text-base px-4 py-1.5">
                        ₹{note.price}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline">{note.class_level}</Badge>
                    <Badge variant="secondary">{note.subject}</Badge>
                  </div>
                  <h1 className="text-xl font-bold mb-4">{note.title}</h1>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {formatNumber(note.views_count)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="w-4 h-4" />
                      {formatNumber(note.downloads_count)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-highlight text-highlight" />
                      {note.rating_avg.toFixed(1)} ({note.rating_count})
                    </div>
                  </div>
                </div>

                {/* Author */}
                <div className="flex items-center gap-3 p-4 bg-secondary rounded-xl mb-6">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {authorInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{authorName}</p>
                      {note.uploader?.is_verified && (
                        <CheckCircle className="w-4 h-4 text-primary fill-primary/20" />
                      )}
                    </div>
                    {uploaderStats && (
                      <p className="text-sm text-muted-foreground">
                        {uploaderStats.totalNotes} notes • {formatNumber(uploaderStats.totalDownloads)} downloads
                      </p>
                    )}
                  </div>
                </div>

                {/* Meta Info */}
                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <FileText className="w-4 h-4" />
                    {note.file_type.toUpperCase()}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Download className="w-4 h-4" />
                    {formatFileSize(note.file_size)}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {new Date(note.created_at).toLocaleDateString()}
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  {/* Free Downloads Counter for logged-in users */}
                  {!isGuest && note.is_free && !alreadyDownloaded && (
                    <div className="flex items-center justify-center gap-2 p-3 bg-primary/10 rounded-lg mb-2">
                      <Gift className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">
                        {freeDownloadsRemaining} of {FREE_DOWNLOAD_LIMIT_CONST} free downloads remaining
                      </span>
                    </div>
                  )}
                  
                  {alreadyDownloaded && !isGuest && (
                    <div className="flex items-center justify-center gap-2 p-3 bg-green-500/10 rounded-lg mb-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-600">
                        Already downloaded - Download again anytime!
                      </span>
                    </div>
                  )}

                  <Button
                    variant="hero"
                    size="lg"
                    className="w-full"
                    onClick={handleDownload}
                    disabled={isDownloading || isCheckingDownloads || (!isGuest && !canDownload && !alreadyDownloaded)}
                  >
                    {isDownloading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Downloading...
                      </>
                    ) : isCheckingDownloads ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading...
                      </>
                    ) : isGuest ? (
                      <>
                        <Lock className="w-5 h-5" />
                        Login to Download
                      </>
                    ) : !canDownload && !alreadyDownloaded ? (
                      <>
                        <Lock className="w-5 h-5" />
                        No Free Downloads Left
                      </>
                    ) : alreadyDownloaded ? (
                      <>
                        <Download className="w-5 h-5" />
                        Download Again
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        Download Free
                      </>
                    )}
                  </Button>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={handleShare}
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Flag className="w-4 h-4 mr-2" />
                      Report
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NoteDetails;
