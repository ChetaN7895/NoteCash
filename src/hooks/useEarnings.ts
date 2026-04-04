import { useState, useEffect, useCallback } from 'react';
import { userService, EarningsData, DashboardStats } from '@/services/user.service';
import { useAuthStore } from '@/stores/authStore';

export const useEarnings = () => {
  const { user } = useAuthStore();
  const [earnings, setEarnings] = useState<EarningsData | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEarnings = useCallback(async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const data = await userService.getEarnings(user.id);
      setEarnings(data);
    } catch (error) {
      console.error('Error fetching earnings:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const fetchStats = useCallback(async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const data = await userService.getDashboardStats(user.id);
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const requestWithdrawal = useCallback(async (amount: number) => {
    if (!user?.id) return;
    
    await userService.requestWithdrawal(user.id, amount);
    await fetchEarnings(); // Refresh earnings after withdrawal
  }, [user?.id, fetchEarnings]);

  useEffect(() => {
    fetchEarnings();
    fetchStats();
  }, [fetchEarnings, fetchStats]);

  return {
    earnings,
    stats,
    isLoading,
    fetchEarnings,
    fetchStats,
    requestWithdrawal,
  };
};
