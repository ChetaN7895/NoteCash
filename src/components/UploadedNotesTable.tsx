import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Eye,
  MoreVertical,
  Pencil,
  Trash2,
  Download,
  Star,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { Note } from '@/types/note';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

interface UploadedNotesTableProps {
  notes: Note[];
  isLoading?: boolean;
  onView?: (note: Note) => void;
  onEdit?: (note: Note) => void;
  onDelete?: (note: Note) => void;
}

const StatusBadge = ({ status }: { status: Note['status'] }) => {
  const config = {
    pending: {
      icon: Clock,
      label: 'Pending',
      variant: 'secondary' as const,
    },
    approved: {
      icon: CheckCircle,
      label: 'Approved',
      variant: 'default' as const,
    },
    rejected: {
      icon: XCircle,
      label: 'Rejected',
      variant: 'destructive' as const,
    },
  };

  const { icon: Icon, label, variant } = config[status];

  return (
    <Badge variant={variant} className="gap-1">
      <Icon className="w-3 h-3" />
      {label}
    </Badge>
  );
};

const UploadedNotesTable = ({
  notes,
  isLoading = false,
  onView,
  onEdit,
  onDelete,
}: UploadedNotesTableProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-12 flex-1" />
            <Skeleton className="h-12 w-24" />
            <Skeleton className="h-12 w-20" />
            <Skeleton className="h-12 w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No notes uploaded yet.</p>
        <p className="text-sm mt-1">Start by uploading your first note!</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-center">Downloads</TableHead>
            <TableHead className="text-center">Rating</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Uploaded</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {notes.map((note) => (
            <TableRow key={note.id}>
              <TableCell className="font-medium">
                <div className="max-w-[200px] truncate" title={note.title}>
                  {note.title}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{note.subject}</Badge>
              </TableCell>
              <TableCell>
                <StatusBadge status={note.status} />
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Download className="w-4 h-4 text-muted-foreground" />
                  {note.download_count}
                </div>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  {note.average_rating.toFixed(1)}
                </div>
              </TableCell>
              <TableCell>
                {note.is_free ? (
                  <Badge variant="secondary">Free</Badge>
                ) : (
                  <span className="font-medium">₹{note.price}</span>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {format(new Date(note.created_at), 'MMM d, yyyy')}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onView?.(note)}>
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </DropdownMenuItem>
                    {note.status !== 'approved' && (
                      <DropdownMenuItem onClick={() => onEdit?.(note)}>
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => onDelete?.(note)}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UploadedNotesTable;
