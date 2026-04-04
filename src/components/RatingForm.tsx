import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import StarRating from "@/components/StarRating";
import { ratingsService, Rating } from "@/services/ratings.service";
import { useAuthStore } from "@/stores/authStore";

interface RatingFormProps {
  noteId: string;
  hasDownloaded: boolean;
  noteUserId?: string;
  onRatingSubmitted: () => void;
  editingReview?: Rating | null;
  onCancelEdit?: () => void;
}

const RatingForm = ({ 
  noteId, 
  hasDownloaded, 
  noteUserId,
  onRatingSubmitted, 
  editingReview,
  onCancelEdit 
}: RatingFormProps) => {
  const { session } = useAuthStore();
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingRating, setExistingRating] = useState<Rating | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Handle external edit trigger
  useEffect(() => {
    if (editingReview) {
      setRating(editingReview.rating);
      setReview(editingReview.review || "");
      setExistingRating(editingReview);
    }
  }, [editingReview]);

  useEffect(() => {
    const fetchExistingRating = async () => {
      if (session?.user?.id && !editingReview) {
        setIsLoading(true);
        const existing = await ratingsService.getUserRating(noteId, session.user.id);
        if (existing) {
          setExistingRating(existing);
          setRating(existing.rating);
          setReview(existing.review || "");
        }
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    };

    fetchExistingRating();
  }, [noteId, session?.user?.id, editingReview]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user?.id || rating === 0) return;

    setIsSubmitting(true);
    const success = await ratingsService.submitRating(
      noteId,
      session.user.id,
      rating,
      review.trim() || undefined
    );

    if (success) {
      onRatingSubmitted();
      // Refresh existing rating
      const existing = await ratingsService.getUserRating(noteId, session.user.id);
      setExistingRating(existing);
      onCancelEdit?.();
    }
    setIsSubmitting(false);
  };

  const handleCancel = () => {
    if (existingRating && !editingReview) {
      setRating(existingRating.rating);
      setReview(existingRating.review || "");
    }
    onCancelEdit?.();
  };

  if (!session) {
    return (
      <div className="bg-muted/50 rounded-lg p-4 text-center">
        <p className="text-muted-foreground text-sm">
          Please log in to leave a review.
        </p>
      </div>
    );
  }

  if (!hasDownloaded) {
    return (
      <div className="bg-muted/50 rounded-lg p-4 text-center">
        <p className="text-muted-foreground text-sm">
          Download this note to leave a review.
        </p>
      </div>
    );
  }

  if (noteUserId && session?.user?.id === noteUserId) {
    return (
      <div className="bg-muted/50 rounded-lg p-4 text-center">
        <p className="text-muted-foreground text-sm">
          You cannot review your own notes.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          {existingRating ? "Update your rating" : "Rate this note"}
        </label>
        <StarRating rating={rating} onRatingChange={setRating} size="lg" />
      </div>

      <div>
        <label htmlFor="review" className="block text-sm font-medium mb-2">
          Write a review (optional)
        </label>
        <Textarea
          id="review"
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Share your thoughts about this note..."
          className="min-h-[100px] resize-none"
          maxLength={500}
        />
        <p className="text-xs text-muted-foreground mt-1">
          {review.length}/500 characters
        </p>
      </div>

      <div className="flex gap-2">
        {editingReview && (
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="flex-1"
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={rating === 0 || isSubmitting}
          className={editingReview ? "flex-1" : "w-full"}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Submitting...
            </>
          ) : existingRating ? (
            "Update Review"
          ) : (
            "Submit Review"
          )}
        </Button>
      </div>
    </form>
  );
};

export default RatingForm;
