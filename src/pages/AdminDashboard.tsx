import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SEOHead from '@/components/SEOHead';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PendingNotes from '@/components/admin/PendingNotes';
import UserManagement from '@/components/admin/UserManagement';
import KYCManagement from '@/components/admin/KYCManagement';
import FeaturedNotesManager from '@/components/admin/FeaturedNotesManager';
import BulkUpload from '@/components/admin/BulkUpload';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  FileText,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  Download,
  Shield,
  Sparkles,
  Upload,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/integrations/supabase/client';
import { notesService, Note } from '@/services/notes.service';
import { userService, AdminUser } from '@/services/user.service';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

interface AdminStats {
  totalUsers: number;
  totalNotes: number;
  pendingNotes: number;
  totalRevenue: number;
  totalDownloads: number;
  approvedToday: number;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const profile = useAuthStore((state) => state.profile);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalNotes: 0,
    pendingNotes: 0,
    totalRevenue: 0,
    totalDownloads: 0,
    approvedToday: 0,
  });
  const [pendingNotes, setPendingNotes] = useState<Note[]>([]);
  const [allUsers, setAllUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);

  useEffect(() => {
    // Check if user is admin
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (profile?.role !== 'admin') {
      toast.error('Access denied. Admin privileges required.');
      navigate('/dashboard');
      return;
    }

    fetchAdminData();
    fetchUsers();
  }, [isAuthenticated, profile, navigate]);

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const users = await userService.getAllUsers();
      setAllUsers(users);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      // Fetch pending notes
      const pending = await notesService.getPendingNotes();
      setPendingNotes(pending);

      // Fetch stats from database
      const [
        { count: usersCount },
        { count: notesCount },
        { data: revenueData },
        { data: downloadData },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('notes').select('*', { count: 'exact', head: true }),
        supabase.from('transactions').select('amount').eq('type', 'earning'),
        supabase.from('notes').select('downloads_count'),
      ]);

      // Calculate today's approved notes
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count: approvedTodayCount } = await supabase
        .from('notes')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved')
        .gte('updated_at', today.toISOString());

      const totalRevenue = (revenueData || []).reduce((sum, t) => sum + Number(t.amount), 0);
      const totalDownloads = (downloadData || []).reduce((sum, n) => sum + (n.downloads_count || 0), 0);

      setStats({
        totalUsers: usersCount || 0,
        totalNotes: notesCount || 0,
        pendingNotes: pending.length,
        totalRevenue,
        totalDownloads,
        approvedToday: approvedTodayCount || 0,
      });
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (noteId: string) => {
    const success = await notesService.approveNote(noteId);
    if (success) {
      setPendingNotes((prev) => prev.filter((n) => n.id !== noteId));
      setStats((prev) => ({
        ...prev,
        pendingNotes: prev.pendingNotes - 1,
        approvedToday: prev.approvedToday + 1,
      }));
    }
  };

  const handleReject = async (noteId: string, reason: string) => {
    const success = await notesService.rejectNote(noteId, reason);
    if (success) {
      setPendingNotes((prev) => prev.filter((n) => n.id !== noteId));
      setStats((prev) => ({
        ...prev,
        pendingNotes: prev.pendingNotes - 1,
      }));
    }
  };

  const handleDelete = async (noteId: string) => {
    const success = await notesService.deleteNote(noteId);
    if (success) {
      setPendingNotes((prev) => prev.filter((n) => n.id !== noteId));
      setStats((prev) => ({
        ...prev,
        pendingNotes: prev.pendingNotes - 1,
        totalNotes: prev.totalNotes - 1,
      }));
    }
  };

  const handlePreview = (note: Note) => {
    navigate(`/notes/${note.id}`);
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Total Notes',
      value: stats.totalNotes,
      icon: FileText,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Pending Review',
      value: stats.pendingNotes,
      icon: Clock,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      badge: stats.pendingNotes > 0,
    },
    {
      title: 'Total Revenue',
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
    },
    {
      title: 'Total Downloads',
      value: stats.totalDownloads.toLocaleString(),
      icon: Download,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Approved Today',
      value: stats.approvedToday,
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
  ];

  return (
    <>
      <SEOHead
        title="Admin Dashboard | YourNotes"
        description="Manage notes, users, and platform settings"
      />
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />

        <main className="flex-1 container mx-auto px-4 py-8 pt-24">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Manage notes, users, and platform settings
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {statCards.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    {stat.badge && (
                      <Badge variant="destructive" className="text-xs">
                        New
                      </Badge>
                    )}
                  </div>
                  {isLoading ? (
                    <Skeleton className="h-7 w-16" />
                  ) : (
                    <p className="text-2xl font-bold">{stat.value}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.title}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="pending" className="space-y-6">
            <TabsList>
              <TabsTrigger value="pending" className="gap-2">
                <Clock className="w-4 h-4" />
                Pending Review
                {stats.pendingNotes > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {stats.pendingNotes}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="kyc" className="gap-2">
                <Shield className="w-4 h-4" />
                KYC Requests
              </TabsTrigger>
              <TabsTrigger value="users" className="gap-2">
                <Users className="w-4 h-4" />
                Users
              </TabsTrigger>
              <TabsTrigger value="featured" className="gap-2">
                <Sparkles className="w-4 h-4" />
                Featured
              </TabsTrigger>
              <TabsTrigger value="bulk-upload" className="gap-2">
                <Upload className="w-4 h-4" />
                Bulk Upload
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-2">
                <TrendingUp className="w-4 h-4" />
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending">
              <Card>
                <CardHeader>
                  <CardTitle>Pending Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <PendingNotes
                    notes={pendingNotes}
                    isLoading={isLoading}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onPreview={handlePreview}
                    onDelete={handleDelete}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="kyc">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    KYC Verification Requests
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <KYCManagement />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <UserManagement 
                    users={allUsers} 
                    isLoading={usersLoading}
                    onRefresh={fetchUsers}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="featured">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-highlight" />
                    Featured Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FeaturedNotesManager />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bulk-upload">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Bulk Upload Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <BulkUpload />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-muted-foreground">
                    <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Analytics dashboard coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default AdminDashboard;