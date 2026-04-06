import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Upload,
  IndianRupee,
  FileText,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Eye,
  Download,
  TrendingUp,
  Clock,
  Pencil,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import EarningsCard from "@/components/EarningsCard";
import RecentlyViewed from "@/components/RecentlyViewed";
import TrendingNotes from "@/components/TrendingNotes";
import TopUploaders from "@/components/TopUploaders";
import TransactionHistory from "@/components/TransactionHistory";
import AchievementBadges from "@/components/AchievementBadges";
import ReferralCard from "@/components/ReferralCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuthStore } from "@/stores/authStore";
import { notesService, Note } from "@/services/notes.service";
import { format } from "date-fns";
import EditNoteModal from "@/components/EditNoteModal";

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const logout = useAuthStore((state) => state.logout);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userNotes, setUserNotes] = useState<Note[]>([]);
  const [editNote, setEditNote] = useState<Note | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [stats, setStats] = useState({
    totalNotes: 0,
    totalViews: 0,
    totalDownloads: 0,
    totalEarnings: 0
  });

  const sidebarLinks = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/profile", label: "My Uploads", icon: FileText },
    { href: "/upload", label: "Upload Notes", icon: Upload },
    { href: "/browse", label: "Browse Notes", icon: Eye },
  ];

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    let isMounted = true;
    
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [notes, userStats] = await Promise.all([
          notesService.getUserNotes(user.id),
          notesService.getUserStats(user.id)
        ]);
        if (isMounted) {
          setUserNotes(notes);
          setStats(userStats);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();
    
    return () => {
      isMounted = false;
    };
  }, [user?.id, navigate]);

  const refreshNotes = async () => {
    if (!user) return;
    const [notes, userStats] = await Promise.all([
      notesService.getUserNotes(user.id),
      notesService.getUserStats(user.id)
    ]);
    setUserNotes(notes);
    setStats(userStats);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-accent/10 text-accent border-accent/20">Approved</Badge>;
      case "pending":
        return <Badge variant="secondary" className="bg-highlight/10 text-highlight border-highlight/20">Pending</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return null;
    }
  };

  const statsCards = [
    { label: "Total Views", value: stats.totalViews.toLocaleString(), icon: Eye, trend: null },
    { label: "Downloads", value: stats.totalDownloads.toLocaleString(), icon: Download, trend: null },
    { label: "Uploads", value: stats.totalNotes.toString(), icon: FileText, trend: null },
    { label: "Earnings", value: `₹${stats.totalEarnings.toFixed(0)}`, icon: TrendingUp, trend: null },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="flex pt-16">
        {/* Mobile Sidebar Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed bottom-6 right-6 z-50 lg:hidden w-14 h-14 rounded-full gradient-primary shadow-lg shadow-primary/25 flex items-center justify-center text-primary-foreground"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Sidebar */}
        <aside
          className={`fixed lg:relative top-16 left-0 bottom-0 w-64 bg-card border-r z-40 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="p-4 space-y-1">
            {sidebarLinks.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </Link>
              );
            })}

            <div className="pt-4 mt-4 border-t">
              <button 
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 w-full transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8 min-h-[calc(100vh-4rem)]">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                Welcome back, {profile?.full_name || user?.email?.split('@')[0] || 'User'}! 👋
              </h1>
              <p className="text-muted-foreground">
                Here's an overview of your notes performance.
              </p>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {isLoading ? (
                Array(4).fill(0).map((_, i) => (
                  <div key={i} className="bg-card rounded-xl border p-4 shadow-card">
                    <Skeleton className="w-10 h-10 rounded-lg mb-3" />
                    <Skeleton className="h-8 w-16 mb-1" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))
              ) : (
                statsCards.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-card rounded-xl border p-4 shadow-card"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <stat.icon className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </motion.div>
                ))
              )}
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Earnings Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-6"
              >
                <EarningsCard
                  balance={profile?.balance ?? stats.totalEarnings}
                  withdrawable={Math.max(0, (profile?.balance ?? stats.totalEarnings) - 100)}
                  totalViews={stats.totalViews}
                  totalDownloads={stats.totalDownloads}
                  viewsToNextMilestone={Math.max(0, 1000 - (stats.totalViews % 1000))}
                />
                <TransactionHistory />
                <AchievementBadges
                  totalViews={stats.totalViews}
                  totalDownloads={stats.totalDownloads}
                  totalNotes={stats.totalNotes}
                />
                <ReferralCard />
                <TopUploaders />
              </motion.div>

              {/* Recent Uploads */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="lg:col-span-2 bg-card rounded-xl border shadow-card overflow-hidden"
              >
                <div className="p-4 border-b flex items-center justify-between">
                  <h2 className="font-semibold flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Your Uploads
                  </h2>
                  <Link to="/upload">
                    <Button variant="outline" size="sm">
                      <Upload className="w-4 h-4 mr-2" />
                      New Upload
                    </Button>
                  </Link>
                </div>

                {isLoading ? (
                  <div className="p-4 space-y-3">
                    {Array(3).fill(0).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : userNotes.length === 0 ? (
                  <div className="p-8 text-center">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium mb-2">No notes uploaded yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Start earning by uploading your first notes!
                    </p>
                    <Link to="/upload">
                      <Button>Upload Notes</Button>
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Views</TableHead>
                            <TableHead className="text-right">Downloads</TableHead>
                            <TableHead className="text-right">Uploaded</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {userNotes.slice(0, 5).map((note) => (
                            <TableRow key={note.id}>
                              <TableCell className="font-medium max-w-[200px] truncate">
                                <Link to={`/notes/${note.id}`} className="hover:text-primary">
                                  {note.title}
                                </Link>
                              </TableCell>
                              <TableCell>{getStatusBadge(note.status || 'pending')}</TableCell>
                              <TableCell className="text-right">
                                {(note.views_count || 0).toLocaleString()}
                              </TableCell>
                              <TableCell className="text-right">
                                {(note.downloads_count || 0).toLocaleString()}
                              </TableCell>
                              <TableCell className="text-right text-muted-foreground">
                                {note.created_at ? format(new Date(note.created_at), 'MMM dd, yyyy') : '-'}
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => { setEditNote(note); setEditOpen(true); }}
                                  title="Edit note"
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {userNotes.length > 5 && (
                      <div className="p-4 border-t text-center">
                        <Link
                          to="/profile"
                          className="text-sm text-primary hover:underline"
                        >
                          View all uploads →
                        </Link>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            </div>

            {/* Trending Notes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="mt-8"
            >
              <TrendingNotes />
            </motion.div>

            {/* Recently Viewed */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-8"
            >
              <RecentlyViewed />
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-8 bg-card rounded-xl border p-6 shadow-card"
            >
              <h2 className="font-semibold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link to="/upload">
                  <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                    <Upload className="w-5 h-5" />
                    <span>Upload Notes</span>
                  </Button>
                </Link>
                <Link to="/browse">
                  <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                    <FileText className="w-5 h-5" />
                    <span>Browse Notes</span>
                  </Button>
                </Link>
                <Link to="/profile">
                  <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                    <User className="w-5 h-5" />
                    <span>My Profile</span>
                  </Button>
                </Link>
                <Link to="/browse">
                  <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                    <IndianRupee className="w-5 h-5" />
                    <span>Earnings</span>
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </main>
      </div>

      <EditNoteModal
        note={editNote}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSaved={refreshNotes}
      />
    </div>
  );
};

export default Dashboard;
