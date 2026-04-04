import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Note } from '@/services/notes.service';
import {
  Download,
  ExternalLink,
  Check,
  X,
  FileText,
  User,
  Calendar,
  BookOpen,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';

interface NotePreviewModalProps {
  note: Note | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (noteId: string) => Promise<void>;
  onReject: (noteId: string) => void;
}

const NotePreviewModal = ({
  note,
  isOpen,
  onClose,
  onApprove,
  onReject,
}: NotePreviewModalProps) => {
  const [isApproving, setIsApproving] = useState(false);

  if (!note) return null;

  const isPDF = note.file_type === 'application/pdf' || note.file_url?.endsWith('.pdf');
  const isImage = note.file_type?.startsWith('image/') || 
    ['.jpg', '.jpeg', '.png', '.webp', '.gif'].some(ext => note.file_url?.toLowerCase().endsWith(ext));

  const handleDownload = () => {
    window.open(note.file_url, '_blank');
  };

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      await onApprove(note.id);
      onClose();
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = () => {
    onReject(note.id);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Preview: {note.title}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 gap-4 overflow-hidden">
          {/* File Preview */}
          <div className="flex-1 bg-muted rounded-lg overflow-hidden flex items-center justify-center">
            {isPDF ? (
              <iframe
                src={`${note.file_url}#toolbar=1&navpanes=0`}
                className="w-full h-full border-0"
                title={note.title}
              />
            ) : isImage ? (
              <img
                src={note.file_url}
                alt={note.title}
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <div className="text-center p-8">
                <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">
                  Preview not available for this file type
                </p>
                <Button onClick={handleDownload}>
                  <Download className="w-4 h-4 mr-2" />
                  Download to View
                </Button>
              </div>
            )}
          </div>

          {/* Note Details Sidebar */}
          <div className="w-72 flex-shrink-0 space-y-4 overflow-y-auto">
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">{note.title}</h3>
              
              {note.description && (
                <p className="text-sm text-muted-foreground">{note.description}</p>
              )}

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <BookOpen className="w-4 h-4" />
                  <span>{note.subject}</span>
                </div>
                
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span>{note.uploader?.full_name || 'Anonymous'}</span>
                </div>
                
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>{format(new Date(note.created_at), 'MMM d, yyyy h:mm a')}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Badge variant="outline">{note.class_level}</Badge>
                {note.is_free ? (
                  <Badge variant="secondary">Free</Badge>
                ) : (
                  <Badge>₹{note.price}</Badge>
                )}
              </div>

              <div className="text-xs text-muted-foreground">
                <p>File Type: {note.file_type}</p>
                <p>Size: {(note.file_size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-4 border-t">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleDownload}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open in New Tab
              </Button>
              
              <Button
                variant="default"
                className="w-full"
                onClick={handleApprove}
                disabled={isApproving}
              >
                {isApproving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Check className="w-4 h-4 mr-2" />
                )}
                Approve Note
              </Button>
              
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleReject}
              >
                <X className="w-4 h-4 mr-2" />
                Reject Note
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotePreviewModal;
