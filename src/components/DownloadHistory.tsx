import { Download as DownloadType } from '@/types/download';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';

interface DownloadHistoryProps {
  downloads: DownloadType[];
  isLoading?: boolean;
  onRedownload?: (download: DownloadType) => void;
}

const DownloadHistory = ({
  downloads,
  isLoading = false,
  onRedownload,
}: DownloadHistoryProps) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Skeleton className="w-12 h-12 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-9 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (downloads.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Download className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No downloads yet.</p>
        <p className="text-sm mt-1">
          Browse notes and download your first one!
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate('/browse')}
        >
          Browse Notes
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {downloads.map((download) => (
        <Card key={download.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              {/* File Icon */}
              <div className="w-12 h-12 rounded bg-primary/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary" />
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <h4
                  className="font-medium truncate cursor-pointer hover:text-primary"
                  onClick={() => navigate(`/notes/${download.note_id}`)}
                >
                  {download.note?.title || 'Untitled Note'}
                </h4>
                <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                  <Badge variant="outline" className="text-xs">
                    {download.note?.subject || 'Unknown'}
                  </Badge>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(download.downloaded_at), 'MMM d, yyyy')}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRedownload?.(download)}
              >
                <Download className="w-4 h-4 mr-2" />
                Redownload
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DownloadHistory;
