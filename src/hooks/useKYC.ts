import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';

export type KYCStatus = 'not_submitted' | 'pending' | 'approved' | 'rejected';

export interface KYCDetails {
  id: string;
  user_id: string;
  pan_number: string;
  pan_holder_name: string;
  account_number: string;
  ifsc_code: string;
  account_holder_name: string;
  bank_name: string;
  status: KYCStatus;
  rejection_reason: string | null;
  submitted_at: string;
  reviewed_at: string | null;
}

export const useKYC = () => {
  const { user } = useAuthStore();
  const [kycDetails, setKycDetails] = useState<KYCDetails | null>(null);
  const [kycStatus, setKycStatus] = useState<KYCStatus>('not_submitted');
  const [isLoading, setIsLoading] = useState(true);

  const fetchKYCDetails = useCallback(async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('kyc_details')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setKycDetails(data as KYCDetails);
        setKycStatus(data.status as KYCStatus);
      } else {
        setKycDetails(null);
        setKycStatus('not_submitted');
      }
    } catch (error) {
      console.error('Error fetching KYC details:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const submitKYC = async (details: {
    pan_number: string;
    pan_holder_name: string;
    account_number: string;
    ifsc_code: string;
    account_holder_name: string;
    bank_name: string;
  }) => {
    if (!user?.id) return false;

    try {
      const { error } = await supabase.from('kyc_details').upsert({
        user_id: user.id,
        ...details,
        status: 'pending',
        submitted_at: new Date().toISOString(),
      });

      if (error) throw error;

      await fetchKYCDetails();
      return true;
    } catch (error) {
      console.error('Error submitting KYC:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchKYCDetails();
  }, [fetchKYCDetails]);

  return {
    kycDetails,
    kycStatus,
    isLoading,
    isKYCApproved: kycStatus === 'approved',
    isKYCPending: kycStatus === 'pending',
    isKYCRejected: kycStatus === 'rejected',
    submitKYC,
    refreshKYC: fetchKYCDetails,
  };
};
