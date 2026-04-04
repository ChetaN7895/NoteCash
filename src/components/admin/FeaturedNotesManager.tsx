import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  Sparkles,
  Search,
  Star,
  X,
  FileText,
  Eye,
  Download,
} from 'lucide-react';
import { format } from 'date-fns';

interface Note {
  id: string;
  title: string;
  subject: string;
  class_level: string;
  views_count: number;
  downloads_count: number;
  rating_avg: number;
  is_featured: boolean;
  featured_at: string | null;
  thumbnail_url: string | null;
  created_at: string;
}

const FeaturedNotesManager = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [featuredNotes, setFeaturedNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchNotes = async () => {
    try {
      // Fetch featured notes
      const { data: featured, error: featuredError } = await supabase
        .from('notes')
        .select('id, title, subject, class_level, views_count, downloads_count, rating_avg, is_featured, featured_at, thumbnail_url, created_at')
        .eq('status', 'approved')
        .eq('is_featured', true)
        .order('featured_at', { ascending: false });

      if (featuredError) throw featuredError;
      setFeaturedNotes(featured || []);

      // Fetch all approved non-featured notes for search
      const { data: allNotes, error: allError } = await supabase
        .from('notes')
        .select('id, title, subject, class_level, views_count, downloads_count, rating_avg, is_featured, featured_at, thumbnail_url, created_at')
        .eq('status', 'approved')
        .eq('is_featured', false)
        .order('rating_avg', { ascending: false })
        .limit(50);

      if (allError) throw allError;
      setNotes(allNotes || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast.error('Failed to load notes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const toggleFeatured = async (note: Note, isFeaturing: boolean) => {
    setProcessing(note.id);
    try {
      const { error } = await supabase
        .from('notes')
        .update({
          is_featured: isFeaturing,
          featured_at: isFeaturing ? new Date().toISOString() : null,
        })
        .eq('id', note.id);

      if (error) throw error;

      toast.success(
        isFeaturing
          ? `"${note.title}" is now featured!`
          : `"${note.title}" removed from featured`
      );

      fetchNotes();
    } catch (error) {
      console.error('Error updating featured status:', error);
      toast.error('Failed to update featured status');
    } finally {
      setProcessing(null);
    }
  };

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Featured Notes Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-highlight" />
          <h3 className="text-lg font-semibold">Currently Featured ({featuredNotes.length})</h3>
        </div>

        {featuredNotes.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No featured notes yet. Add some below!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {featuredNotes.map((note) => (
              <Card key={note.id} className="relative overflow-hidden group">
                <div className="absolute top-2 right-2 z-10">
                  <Badge className="bg-highlight text-highlight-foreground">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Featured
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <div className="h-20 bg-muted rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                    {note.thumbnail_url ? (
                      <img
                        src={note.thumbnail_url}
                        alt={note.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <FileText className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>

                  <h4 className="font-semibold truncate mb-1">{note.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    {note.subject} • {note.class_level}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {note.views_count || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Download className="w-3 h-3" />
                      {note.downloads_count || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-highlight text-highlight" />
                      {(note.rating_avg || 0).toFixed(1)}
                    </span>
                  </div>

                  {note.featured_at && (
                    <p className="text-xs text-muted-foreground mb-3">
                      Featured on {format(new Date(note.featured_at), 'MMM d, yyyy')}
                    </p>
                  )}

                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full"
                    onClick={() => toggleFeatured(note, false)}
                    disabled={processing === note.id}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Remove from Featured
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add New Featured Notes */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Add to Featured</h3>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search notes by title or subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredNotes.slice(0, 12).map((note) => (
            <Card key={note.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="h-16 bg-muted rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                  {note.thumbnail_url ? (
                    <img
                      src={note.thumbnail_url}
                      alt={note.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <FileText className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>

                <h4 className="font-medium truncate text-sm mb-1">{note.title}</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  {note.subject} • {note.class_level}
                </p>

                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-highlight text-highlight" />
                    {(note.rating_avg || 0).toFixed(1)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Download className="w-3 h-3" />
                    {note.downloads_count || 0}
                  </span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => toggleFeatured(note, true)}
                  disabled={processing === note.id}
                >
                  <Sparkles className="w-4 h-4 mr-1" />
                  Add to Featured
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredNotes.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No notes found matching your search.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default FeaturedNotesManager;
