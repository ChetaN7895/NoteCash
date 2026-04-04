-- Create KYC status enum
CREATE TYPE public.kyc_status AS ENUM ('pending', 'approved', 'rejected');

-- Create KYC details table
CREATE TABLE public.kyc_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    pan_number TEXT NOT NULL,
    pan_holder_name TEXT NOT NULL,
    account_number TEXT NOT NULL,
    ifsc_code TEXT NOT NULL,
    account_holder_name TEXT NOT NULL,
    bank_name TEXT NOT NULL,
    status kyc_status NOT NULL DEFAULT 'pending',
    rejection_reason TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.kyc_details ENABLE ROW LEVEL SECURITY;

-- Users can view their own KYC details
CREATE POLICY "Users can view their own KYC"
ON public.kyc_details
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own KYC details
CREATE POLICY "Users can insert their own KYC"
ON public.kyc_details
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending KYC
CREATE POLICY "Users can update their own pending KYC"
ON public.kyc_details
FOR UPDATE
USING (auth.uid() = user_id AND status = 'pending');

-- Admins can view all KYC details
CREATE POLICY "Admins can view all KYC"
ON public.kyc_details
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Admins can update any KYC (for approval/rejection)
CREATE POLICY "Admins can update any KYC"
ON public.kyc_details
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Create updated_at trigger
CREATE TRIGGER update_kyc_details_updated_at
BEFORE UPDATE ON public.kyc_details
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();