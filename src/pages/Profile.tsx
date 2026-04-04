import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Download, 
  Eye, 
  IndianRupee, 
  Settings, 
  Edit,
  CheckCircle,
  Calendar,
  Trash2
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import NoteCard from '@/components/NoteCard';
import NoteCardSkeleton from '@/components/skeletons/NoteCardSkeleton';
import EmptyState from '@/components/EmptyState';
import DeleteNoteDialog from '@/components/DeleteNoteDialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore } from '@/stores/authStore';
import { notesService, Note } from '@/services/notes.service';
import { format } from 'date-fns';
import AvatarUpload from '@/components/AvatarUpload';
import EditProfileModal from '@/components/EditProfileModal';
import MilestoneTracker from '@/components/MilestoneTracker';
import { toast } from '@/hooks/use-toast';

const Profile = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [uploadedNotes, setUploadedNotes] = useState<Note[]>([]);
  const [purchasedNotes, setPurchasedNotes] = useState<Note[]>([]);
  const [deleteNote, setDeleteNote] = useState<Note | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [stats, setStats] = useState({
    totalNotes: 0,
    totalViews: 0,
    totalDownloads: 0,
    totalEarnings: 0
  });

  const handleDeleteNote = async () => {
    if (!deleteNote) return;
    
    setIsDeleting(true);
    try {
      const success = await notesService.deleteNote(deleteNote.id);
      if (success) {
        setUploadedNotes(prev => prev.filter(n => n.id !== deleteNote.id));
        setStats(prev => ({
          ...prev,
          totalNotes: prev.totalNotes - 1
        }));
        toast({
          title: 'Note deleted',
          description: 'Your note has been permanently deleted.',
        });
      }
    } finally {
      setIsDeleting(false);
      setDeleteNote(null);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [notes, purchased, userStats] = await Promise.all([
          notesService.getUserNotes(user.id),
          notesService.getPurchasedNotes(user.id),
          notesService.getUserStats(user.id)
        ]);
        setUploadedNotes(notes);
        setPurchasedNotes(purchased);
        setStats(userStats);
      } catch (error) {
        console.error('Failed to fetch profile data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, isAuthenticated, navigate]);

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="My Profile"
        description="View and manage your profile, uploaded notes, and purchases."
      />
      <Navbar />

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl border shadow-card p-6 md:p-8 mb-8"
          >
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
              {/* Avatar with Upload */}
              <AvatarUpload
                currentAvatarUrl={profile?.avatar_url}
                userName={profile?.full_name || user?.email?.split('@')[0]}
                size="lg"
              />

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold">{profile?.full_name || user?.email?.split('@')[0] || 'User'}</h1>
                  {profile?.is_verified && (
                    <Badge className="gradient-primary">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground mb-3">{profile?.email || user?.email}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Joined {profile?.created_at ? format(new Date(profile.created_at), 'MMMM yyyy') : 'Recently'}
                  </span>
                  <Badge variant="secondary">{user?.role || 'User'}</Badge>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
                <Button variant="ghost" size="icon">
                  <Settings className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <EditProfileModal 
              open={isEditModalOpen} 
              onOpenChange={setIsEditModalOpen} 
            />

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t">
              {isLoading ? (
                Array(4).fill(0).map((_, i) => (
                  <div key={i} className="text-center">
                    <div className="h-8 w-16 bg-muted rounded mx-auto mb-1 animate-pulse" />
                    <div className="h-4 w-20 bg-muted rounded mx-auto animate-pulse" />
                  </div>
                ))
              ) : (
                <>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 text-2xl font-bold">
                      <FileText className="w-5 h-5 text-primary" />
                      {stats.totalNotes}
                    </div>
                    <p className="text-sm text-muted-foreground">Notes Uploaded</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 text-2xl font-bold">
                      <Eye className="w-5 h-5 text-primary" />
                      {formatNumber(stats.totalViews)}
                    </div>
                    <p className="text-sm text-muted-foreground">Total Views</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 text-2xl font-bold">
                      <Download className="w-5 h-5 text-primary" />
                      {formatNumber(stats.totalDownloads)}
                    </div>
                    <p className="text-sm text-muted-foreground">Downloads</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 text-2xl font-bold text-accent">
                      <IndianRupee className="w-5 h-5" />
                      {formatNumber(stats.totalEarnings)}
                    </div>
                    <p className="text-sm text-muted-foreground">Earnings</p>
                  </div>
                </>
              )}
            </div>

            {/* Milestone Tracker */}
            <div className="mt-6 pt-6 border-t">
              <MilestoneTracker totalViews={stats.totalViews} isLoading={isLoading} />
            </div>
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Tabs defaultValue="uploaded" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
                <TabsTrigger value="uploaded">
                  <FileText className="w-4 h-4 mr-2" />
                  My Uploads ({uploadedNotes.length})
                </TabsTrigger>
                <TabsTrigger value="purchased">
                  <Download className="w-4 h-4 mr-2" />
                  Purchased ({purchasedNotes.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="uploaded">
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                      <NoteCardSkeleton key={i} />
                    ))}
                  </div>
                ) : uploadedNotes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {uploadedNotes.map((note) => (
                      <div key={note.id} className="relative group">
                        <NoteCard 
                          id={note.id}
                          title={note.title}
                          subject={note.subject}
                          class={note.class_level}
                          views={note.views_count || 0}
                          downloads={note.downloads_count || 0}
                          rating={note.rating_avg || 0}
                          author={note.uploader?.full_name || profile?.full_name || 'You'}
                          previewImage={note.thumbnail_url || undefined}
                          isVerified={note.uploader?.is_verified || profile?.is_verified || false}
                          isFree={note.is_free ?? true}
                          price={note.price ?? undefined}
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setDeleteNote(note);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    variant="uploads"
                    title="No uploads yet"
                    description="Start earning by uploading your first notes. Share your knowledge with students worldwide."
                    actionLabel="Upload Notes"
                    actionHref="/upload"
                  />
                )}
              </TabsContent>

              <TabsContent value="purchased">
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                      <NoteCardSkeleton key={i} />
                    ))}
                  </div>
                ) : purchasedNotes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {purchasedNotes.map((note) => (
                      <NoteCard 
                        key={note.id} 
                        id={note.id}
                        title={note.title}
                        subject={note.subject}
                        class={note.class_level}
                        views={note.views_count || 0}
                        downloads={note.downloads_count || 0}
                        rating={note.rating_avg || 0}
                        author={note.uploader?.full_name || 'Unknown'}
                        previewImage={note.thumbnail_url || undefined}
                        isVerified={note.uploader?.is_verified || false}
                        isFree={note.is_free ?? true}
                        price={note.price ?? undefined}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    variant="purchases"
                    title="No purchases yet"
                    description="Browse our collection of quality notes and find the perfect study material."
                    actionLabel="Browse Notes"
                    actionHref="/browse"
                  />
                )}
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>

      <Footer />

      {/* Delete Confirmation Dialog */}
      <DeleteNoteDialog
        isOpen={!!deleteNote}
        onClose={() => setDeleteNote(null)}
        onConfirm={handleDeleteNote}
        noteTitle={deleteNote?.title || ''}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default Profile;
