import { Link } from "react-router-dom";
import { Bell, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotificationStore } from "@/stores/notificationStore";
import { formatDistanceToNow } from "date-fns";

const NotificationDropdown = () => {
  const { newNotes, newNotesCount, resetNewNotes } = useNotificationStore();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 relative"
          title={newNotesCount > 0 ? `${newNotesCount} new notes` : "No new notes"}
        >
          <Bell className="h-4 w-4 text-muted-foreground" />
          {newNotesCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 min-w-5 px-1 text-xs flex items-center justify-center"
            >
              {newNotesCount > 99 ? '99+' : newNotesCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <div className="flex items-center justify-between px-3 py-2">
          <p className="text-sm font-semibold">Notifications</p>
          {newNotesCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-auto py-1 px-2 text-muted-foreground hover:text-foreground"
              onClick={resetNewNotes}
            >
              Clear all
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        {newNotes.length === 0 ? (
          <div className="py-8 text-center">
            <Bell className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">No new notifications</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              New uploads will appear here
            </p>
          </div>
        ) : (
          <div className="max-h-[300px] overflow-y-auto">
            {newNotes.map((note) => (
              <DropdownMenuItem key={note.id} asChild>
                <Link
                  to={`/notes/${note.id}`}
                  className="flex items-start gap-3 px-3 py-2.5 cursor-pointer"
                  onClick={resetNewNotes}
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{note.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {note.subject} • {formatDistanceToNow(note.createdAt, { addSuffix: true })}
                    </p>
                  </div>
                </Link>
              </DropdownMenuItem>
            ))}
          </div>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            to="/browse"
            className="flex items-center justify-center py-2 text-sm text-primary cursor-pointer"
            onClick={resetNewNotes}
          >
            View all notes
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;
