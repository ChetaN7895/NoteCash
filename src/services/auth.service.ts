import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  role: 'student' | 'viewer';
}

export interface SignInData {
  email: string;
  password: string;
}

class AuthService {
  async signUp(data: SignUpData) {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: data.fullName,
          role: data.role,
        },
      },
    });

    if (error) {
      this.handleAuthError(error);
      throw error;
    }

    return authData;
  }

  async signIn(data: SignInData) {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      this.handleAuthError(error);
      throw error;
    }

    return authData;
  }

  async signOut() {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      this.handleAuthError(error);
      throw error;
    }
  }

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      this.handleAuthError(error);
      throw error;
    }

    toast({
      title: 'Password Reset Email Sent',
      description: 'Check your email for the password reset link.',
    });
  }

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Session error:', error);
      throw error;
    }
    
    return data.session;
  }

  async getUser() {
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('User error:', error);
      return null;
    }
    
    return data.user;
  }

  private handleAuthError(error: { message: string; status?: number }) {
    let title = 'Authentication Error';
    let description = error.message;

    if (error.message.includes('Invalid login credentials')) {
      description = 'Invalid email or password. Please try again.';
    } else if (error.message.includes('User already registered')) {
      description = 'An account with this email already exists.';
    } else if (error.message.includes('Password')) {
      description = 'Password must be at least 6 characters long.';
    } else if (error.message.includes('Email')) {
      description = 'Please enter a valid email address.';
    }

    toast({
      title,
      description,
      variant: 'destructive',
    });
  }
}

export const authService = new AuthService();
