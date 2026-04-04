import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { UserProfile, UserRole } from '@/stores/authStore';

export interface UpdateProfileData {
  fullName?: string;
  avatarUrl?: string;
}

export interface EarningsData {
  totalEarnings: number;
  pendingEarnings: number;
  withdrawnAmount: number;
  viewsEarnings: number;
  downloadsEarnings: number;
}

export interface DashboardStats {
  totalNotes: number;
  totalViews: number;
  totalDownloads: number;
  totalEarnings: number;
  pendingNotes: number;
  approvedNotes: number;
}

export interface AdminUser extends UserProfile {
  notes_count: number;
  downloads_count: number;
}

class UserService {
  private handleError(error: unknown, message: string) {
    console.error(message, error);
    toast({
      title: 'Error',
      description: message,
      variant: 'destructive',
    });
    throw error;
  }

  async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) throw profileError;
      if (!profileData) return null;

      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      return {
        id: profileData.id,
        email: profileData.email,
        full_name: profileData.full_name,
        role: (roleData?.role as 'user' | 'admin' | 'moderator') || 'user',
        avatar_url: profileData.avatar_url,
        balance: Number(profileData.balance) || 0,
        is_verified: profileData.is_verified || false,
        created_at: profileData.created_at,
      };
    } catch (error) {
      this.handleError(error, 'Failed to fetch profile');
      return null;
    }
  }

  async updateProfile(userId: string, data: UpdateProfileData): Promise<UserProfile | null> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.fullName,
          avatar_url: data.avatarUrl,
        })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully.',
      });

      return this.getProfile(userId);
    } catch (error) {
      this.handleError(error, 'Failed to update profile');
      return null;
    }
  }

  async getDashboardStats(userId: string): Promise<DashboardStats> {
    // Mock implementation
    return {
      totalNotes: 12,
      totalViews: 45200,
      totalDownloads: 8900,
      totalEarnings: 4520,
      pendingNotes: 2,
      approvedNotes: 10,
    };
  }

  async getEarnings(userId: string): Promise<EarningsData> {
    // Mock implementation
    return {
      totalEarnings: 4520,
      pendingEarnings: 1250,
      withdrawnAmount: 3000,
      viewsEarnings: 3200,
      downloadsEarnings: 1320,
    };
  }

  async requestWithdrawal(userId: string, amount: number): Promise<void> {
    if (amount < 500) {
      toast({
        title: 'Minimum Withdrawal',
        description: 'Minimum withdrawal amount is ₹500',
        variant: 'destructive',
      });
      throw new Error('Minimum withdrawal amount is ₹500');
    }

    // Mock implementation
    toast({
      title: 'Withdrawal Requested',
      description: `₹${amount} withdrawal has been requested. It will be processed within 3-5 business days.`,
    });
  }

  // Admin functions
  async getAllUsers(): Promise<AdminUser[]> {
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Get roles for all users
      const userIds = profiles?.map(p => p.id) || [];
      const { data: roles } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', userIds);

      // Get note counts for all users
      const { data: noteCounts } = await supabase
        .from('notes')
        .select('user_id');

      // Get download counts
      const { data: downloadCounts } = await supabase
        .from('downloads')
        .select('user_id');

      const roleMap = new Map(roles?.map(r => [r.user_id, r.role]) || []);
      const noteCountMap = new Map<string, number>();
      const downloadCountMap = new Map<string, number>();

      noteCounts?.forEach(n => {
        noteCountMap.set(n.user_id, (noteCountMap.get(n.user_id) || 0) + 1);
      });

      downloadCounts?.forEach(d => {
        downloadCountMap.set(d.user_id, (downloadCountMap.get(d.user_id) || 0) + 1);
      });

      return (profiles || []).map(p => ({
        id: p.id,
        email: p.email,
        full_name: p.full_name,
        role: (roleMap.get(p.id) as UserRole) || 'user',
        avatar_url: p.avatar_url,
        balance: Number(p.balance) || 0,
        is_verified: p.is_verified || false,
        created_at: p.created_at,
        notes_count: noteCountMap.get(p.id) || 0,
        downloads_count: downloadCountMap.get(p.id) || 0,
      }));
    } catch (error) {
      console.error('Failed to fetch users:', error);
      return [];
    }
  }

  async verifyUser(userId: string, verified: boolean): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_verified: verified })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: verified ? 'User Verified' : 'Verification Removed',
        description: verified 
          ? 'User has been verified successfully.' 
          : 'User verification has been removed.',
      });
      return true;
    } catch (error) {
      console.error('Failed to update verification:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user verification status.',
        variant: 'destructive',
      });
      return false;
    }
  }

  async updateUserRole(userId: string, role: UserRole): Promise<boolean> {
    try {
      // Check if role exists
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (existingRole) {
        const { error } = await supabase
          .from('user_roles')
          .update({ role })
          .eq('user_id', userId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role });
        if (error) throw error;
      }

      toast({
        title: 'Role Updated',
        description: `User role has been updated to ${role}.`,
      });
      return true;
    } catch (error) {
      console.error('Failed to update role:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user role.',
        variant: 'destructive',
      });
      return false;
    }
  }
}

export const userService = new UserService();
