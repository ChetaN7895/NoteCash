import { useState } from 'react';
import { Note } from '@/services/notes.service';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Eye,
  Check,
  X,
  FileText,
  User,
  Calendar,
  BookOpen,
  Trash2,
} from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import ReviewModal from './ReviewModal';
import NotePreviewModal from './NotePreviewModal';
import DeleteNoteDialog from '@/components/DeleteNoteDialog';

interface PendingNotesProps {
  notes: Note[];
  isLoading?: boolean;
  onApprove: (noteId: string) => Promise<void>;
  onReject: (noteId: string, reason: string) => Promise<void>;
  onPreview: (note: Note) => void;
  onDelete?: (noteId: string) => Promise<void>;
}

const PendingNotes = ({
  notes,
  isLoading = false,
  onApprove,
  onReject,
  onPreview,
  onDelete,
}: PendingNotesProps) => {
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [previewNote, setPreviewNote] = useState<Note | null>(null);
  const [deleteNote, setDeleteNote] = useState<Note | null>(null);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(
    null
  );
  const [processing, setProcessing] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteNote || !onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(deleteNote.id);
    } finally {
      setIsDeleting(false);
      setDeleteNote(null);
    }
  };

  const handleApprove = async (note: Note) => {
    setProcessing(note.id);
    try {
      await onApprove(note.id);
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectClick = (note: Note) => {
    setSelectedNote(note);
    setReviewAction('reject');
  };

  const handleRejectConfirm = async (reason: string) => {
    if (!selectedNote) return;
    setProcessing(selectedNote.id);
    try {
      await onReject(selectedNote.id, reason);
    } finally {
      setProcessing(null);
      setSelectedNote(null);
      setReviewAction(null);
    }
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4 space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex gap-2">
                <Skeleton className="h-9 flex-1" />
                <Skeleton className="h-9 flex-1" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Check className="w-12 h-12 mx-auto mb-4 text-green-500" />
        <p className="text-lg font-medium">All caught up!</p>
        <p className="text-sm mt-1">No pending notes to review.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {notes.map((note) => (
          <Card
            key={note.id}
            className="hover:shadow-lg transition-all duration-200"
          >
            <CardContent className="p-4">
              {/* Preview Area */}
              <div
                className="h-32 bg-muted rounded-lg mb-4 flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors"
                onClick={() => setPreviewNote(note)}
              >
                {note.thumbnail_url ? (
                  <img
                    src={note.thumbnail_url}
                    alt={note.title}
                    className="h-full w-full object-cover rounded-lg"
                  />
                ) : (
                  <FileText className="w-12 h-12 text-muted-foreground" />
                )}
              </div>

              {/* Title & Info */}
              <h3 className="font-semibold truncate mb-2" title={note.title}>
                {note.title}
              </h3>

              <div className="space-y-2 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>{note.subject}</span>
                  <Badge variant="outline" className="ml-auto text-xs">
                    {note.class_level}
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{note.uploader?.full_name || 'Anonymous'}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{format(new Date(note.created_at), 'MMM d, yyyy')}</span>
                </div>
              </div>

              {/* Price Badge */}
              <div className="mb-4">
                {note.is_free ? (
                  <Badge variant="secondary">Free</Badge>
                ) : (
                  <Badge>₹{note.price}</Badge>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setPreviewNote(note)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Preview
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleApprove(note)}
                  disabled={processing === note.id}
                >
                  <Check className="w-4 h-4 mr-1" />
                  Approve
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRejectClick(note)}
                  disabled={processing === note.id}
                >
                  <X className="w-4 h-4" />
                </Button>
                {onDelete && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteNote(note)}
                    disabled={processing === note.id}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Note Preview Modal */}
      <NotePreviewModal
        note={previewNote}
        isOpen={!!previewNote}
        onClose={() => setPreviewNote(null)}
        onApprove={async (noteId) => {
          await onApprove(noteId);
          setPreviewNote(null);
        }}
        onReject={(noteId) => {
          const note = notes.find(n => n.id === noteId);
          if (note) {
            setSelectedNote(note);
            setReviewAction('reject');
          }
          setPreviewNote(null);
        }}
      />

      {/* Review Modal */}
      <ReviewModal
        isOpen={reviewAction === 'reject' && !!selectedNote}
        onClose={() => {
          setSelectedNote(null);
          setReviewAction(null);
        }}
        onConfirm={handleRejectConfirm}
        noteTitle={selectedNote?.title || ''}
        action="reject"
      />

      {/* Delete Confirmation Dialog */}
      <DeleteNoteDialog
        isOpen={!!deleteNote}
        onClose={() => setDeleteNote(null)}
        onConfirm={handleDelete}
        noteTitle={deleteNote?.title || ''}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default PendingNotes;