import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  noteTitle: string;
  action: 'approve' | 'reject';
}

const REJECTION_REASONS = [
  'Poor quality or unclear content',
  'Duplicate or already exists',
  'Inappropriate or offensive content',
  'Copyright violation',
  'Incomplete notes',
  'Other (please specify)',
];

const ReviewModal = ({
  isOpen,
  onClose,
  onConfirm,
  noteTitle,
  action,
}: ReviewModalProps) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    const reason =
      selectedReason === 'Other (please specify)'
        ? customReason
        : selectedReason;

    if (!reason.trim()) return;

    setIsSubmitting(true);
    try {
      await onConfirm(reason);
      // Reset state after successful submission
      setSelectedReason('');
      setCustomReason('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedReason('');
    setCustomReason('');
    onClose();
  };

  const isValid =
    selectedReason &&
    (selectedReason !== 'Other (please specify)' || customReason.trim());

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Reject Note
          </DialogTitle>
          <DialogDescription>
            You are about to reject "{noteTitle}". Please select a reason for
            rejection. The uploader will be notified.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <Label>Reason for Rejection</Label>
            <RadioGroup
              value={selectedReason}
              onValueChange={setSelectedReason}
              className="space-y-2"
            >
              {REJECTION_REASONS.map((reason) => (
                <div key={reason} className="flex items-center space-x-3">
                  <RadioGroupItem value={reason} id={reason} />
                  <Label
                    htmlFor={reason}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {reason}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {selectedReason === 'Other (please specify)' && (
            <div className="space-y-2">
              <Label htmlFor="custom-reason">Specify Reason</Label>
              <Textarea
                id="custom-reason"
                placeholder="Enter the reason for rejection..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                rows={3}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Rejecting...
              </>
            ) : (
              'Reject Note'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewModal;
