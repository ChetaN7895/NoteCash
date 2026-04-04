import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Lock, Loader2, Check, Gift } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Note } from '@/types/note';
import { supabase } from '@/integrations/supabase/client';
import { useFreeDownloads, FREE_DOWNLOAD_LIMIT_CONST } from '@/hooks/useFreeDownloads';

interface DownloadButtonProps {
  note: Note;
  hasPurchased?: boolean;
  onDownloadComplete?: () => void;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

const DownloadButton = ({
  note,
  hasPurchased = false,
  onDownloadComplete,
  variant = 'default',
  size = 'default',
  className = '',
}: DownloadButtonProps) => {
  const { session } = useAuthStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [alreadyDownloaded, setAlreadyDownloaded] = useState(false);
  
  const { 
    freeDownloadsRemaining, 
    canDownloadFree, 
    recordDownload, 
    hasDownloaded,
    isLoading: isCheckingDownloads 
  } = useFreeDownloads();

  const isOwner = note.uploader_id === session?.user?.id;

  // Check if user already downloaded this note
  useEffect(() => {
    const checkDownloadStatus = async () => {
      if (session?.user?.id && note.id) {
        const downloaded = await hasDownloaded(note.id);
        setAlreadyDownloaded(downloaded);
      }
    };
    checkDownloadStatus();
  }, [session?.user?.id, note.id, hasDownloaded]);

  // Determine if user can download
  const canDownload = isOwner || alreadyDownloaded || hasPurchased || (note.is_free && canDownloadFree);

  const performDownload = async () => {
    try {
      // Get signed URL for download
      const filePathMatch = note.file_url.match(/notes\/(.+)/);
      if (filePathMatch) {
        const { data, error } = await supabase.storage
          .from('notes')
          .createSignedUrl(filePathMatch[1], 60);

        if (error) throw error;

        // Trigger download
        const link = document.createElement('a');
        link.href = data.signedUrl;
        link.download = `${note.title}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setIsDownloaded(true);
        toast.success('Download started!');
        onDownloadComplete?.();

        // Reset downloaded state after 3 seconds
        setTimeout(() => setIsDownloaded(false), 3000);
      } else {
        // Direct download if URL format is different
        window.open(note.file_url, '_blank');
        setIsDownloaded(true);
        toast.success('Download started!');
        onDownloadComplete?.();
      }
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download. Please try again.');
    }
  };

  const handleDownload = async () => {
    // Check if user is logged in
    if (!session) {
      toast.error('Please login to download notes');
      navigate('/login', { state: { from: `/notes/${note.id}` } });
      return;
    }

    setIsLoading(true);

    try {
      // Owner can always download
      if (isOwner) {
        await performDownload();
        return;
      }

      // Already downloaded - allow re-download
      if (alreadyDownloaded) {
        await performDownload();
        return;
      }

      // Purchased notes can be downloaded
      if (hasPurchased) {
        await performDownload();
        return;
      }

      // Free notes - check and record download
      if (note.is_free) {
        if (!canDownloadFree) {
          toast.error(`You've used all ${FREE_DOWNLOAD_LIMIT_CONST} free downloads. Upgrade to premium for unlimited access!`);
          return;
        }

        const recorded = await recordDownload(note.id);
        if (recorded) {
          setAlreadyDownloaded(true);
          await performDownload();
        } else {
          toast.error('Failed to process download. Please try again.');
        }
        return;
      }

      // Paid note - user hasn't purchased
      toast.error('Please purchase this note to download');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = () => {
    if (!session) {
      toast.error('Please login to purchase notes');
      navigate('/login', { state: { from: `/notes/${note.id}` } });
      return;
    }

    // Navigate to purchase flow
    toast.info('Purchase feature coming soon!');
  };

  // Guest users - show login prompt
  if (!session) {
    return (
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => {
          toast.info('Please login to download notes');
          navigate('/login', { state: { from: `/notes/${note.id}` } });
        }}
      >
        <Lock className="w-4 h-4 mr-2" />
        Login to Download
      </Button>
    );
  }

  // Loading state while checking downloads
  if (isCheckingDownloads) {
    return (
      <Button variant={variant} size={size} className={className} disabled>
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        Loading...
      </Button>
    );
  }

  // If note is not free and user hasn't purchased (and is not owner)
  if (!note.is_free && !hasPurchased && !isOwner) {
    return (
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={handlePurchase}
      >
        <Lock className="w-4 h-4 mr-2" />
        Buy for ₹{note.price}
      </Button>
    );
  }

  // Free note but no downloads remaining and hasn't downloaded this note
  if (note.is_free && !canDownloadFree && !alreadyDownloaded && !isOwner) {
    return (
      <div className="space-y-2">
        <Button
          variant={variant}
          size={size}
          className={className}
          disabled
        >
          <Lock className="w-4 h-4 mr-2" />
          No Free Downloads Left
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          You've used all {FREE_DOWNLOAD_LIMIT_CONST} free downloads
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={handleDownload}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Downloading...
          </>
        ) : isDownloaded ? (
          <>
            <Check className="w-4 h-4 mr-2" />
            Downloaded
          </>
        ) : alreadyDownloaded ? (
          <>
            <Download className="w-4 h-4 mr-2" />
            Download Again
          </>
        ) : (
          <>
            <Download className="w-4 h-4 mr-2" />
            {note.is_free ? 'Download Free' : 'Download'}
          </>
        )}
      </Button>
      {note.is_free && !alreadyDownloaded && !isOwner && canDownloadFree && (
        <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
          <Gift className="w-3 h-3" />
          {freeDownloadsRemaining} free download{freeDownloadsRemaining !== 1 ? 's' : ''} remaining
        </p>
      )}
    </div>
  );
};

export default DownloadButton;
