import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { Loader2, MessageSquare, Pencil, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import StarRating from "@/components/StarRating";
import { ratingsService, Rating } from "@/services/ratings.service";
import { useAuthStore } from "@/stores/authStore";

interface ReviewsListProps {
  noteId: string;
  refreshTrigger?: number;
  onEditReview?: (review: Rating) => void;
}

const ReviewsList = ({ noteId, refreshTrigger, onEditReview }: ReviewsListProps) => {
  const [reviews, setReviews] = useState<Rating[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { session } = useAuthStore();

  const fetchReviews = async () => {
    setIsLoading(true);
    const data = await ratingsService.getNoteRatings(noteId);
    setReviews(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, [noteId, refreshTrigger]);

  const handleDelete = async (ratingId: string) => {
    setDeletingId(ratingId);
    const success = await ratingsService.deleteRating(ratingId);
    if (success) {
      setReviews((prev) => prev.filter((r) => r.id !== ratingId));
    }
    setDeletingId(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-muted-foreground">No reviews yet</p>
        <p className="text-sm text-muted-foreground/70">
          Be the first to review this note!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => {
        const userName = review.user?.full_name || "Anonymous";
        const initials = userName
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);
        const isOwner = session?.user?.id === review.user_id;

        return (
          <div
            key={review.id}
            className="bg-muted/30 rounded-lg p-4 space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">{userName}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(review.created_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StarRating rating={review.rating} readonly size="sm" />
                {isOwner && (
                  <div className="flex items-center gap-1 ml-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onEditReview?.(review)}
                      title="Edit review"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          title="Delete review"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Review</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete your review? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(review.id)}
                            disabled={deletingId === review.id}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {deletingId === review.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Delete"
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </div>
            </div>

            {review.review && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {review.review}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ReviewsList;
