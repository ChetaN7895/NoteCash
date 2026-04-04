export type UserRole = 'student' | 'viewer' | 'admin';

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  wallet_balance: number;
  total_earnings: number;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  college: string | null;
  branch: string | null;
  semester: number | null;
  wallet_balance: number;
  total_earnings: number;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserStats {
  totalUploads: number;
  totalDownloads: number;
  totalEarnings: number;
  averageRating: number;
}
