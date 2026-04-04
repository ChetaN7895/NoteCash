import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Session } from '@supabase/supabase-js';

export type UserRole = 'user' | 'admin' | 'moderator';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  avatar_url: string | null;
  balance: number;
  is_verified: boolean;
  created_at: string | null;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isInitialized: boolean;
  
  // Computed
  isAuthenticated: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  logout: () => Promise<void>;
  reset: () => void;
}

import { supabase } from '@/integrations/supabase/client';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      profile: null,
      isLoading: true,
      isInitialized: false,
      
      isAuthenticated: false,
      
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setSession: (session) => set({ session, isAuthenticated: !!session }),
      setProfile: (profile) => set({ profile }),
      setLoading: (isLoading) => set({ isLoading }),
      setInitialized: (isInitialized) => set({ isInitialized }),
      logout: async () => {
        await supabase.auth.signOut();
        set({ 
          user: null, 
          session: null, 
          profile: null, 
          isLoading: false,
          isAuthenticated: false
        });
      },
      reset: () => set({ 
        user: null, 
        session: null, 
        profile: null, 
        isLoading: false,
        isAuthenticated: false
      }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        // Only persist non-sensitive data
        profile: state.profile 
      }),
    }
  )
);
