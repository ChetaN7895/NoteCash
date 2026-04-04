-- Add referral fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES public.profiles(id);

-- Create referrals table to track referral relationships and bonuses
CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL REFERENCES public.profiles(id),
  referred_id UUID NOT NULL REFERENCES public.profiles(id),
  bonus_amount NUMERIC(10,2) NOT NULL DEFAULT 10.00,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(referred_id)
);

-- Enable RLS on referrals table
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Policies for referrals table
CREATE POLICY "Users can view their own referrals as referrer"
ON public.referrals FOR SELECT
USING (auth.uid() = referrer_id);

CREATE POLICY "Users can view their own referral as referred"
ON public.referrals FOR SELECT
USING (auth.uid() = referred_id);

CREATE POLICY "System can insert referrals"
ON public.referrals FOR INSERT
WITH CHECK (true);

CREATE POLICY "System can update referrals"
ON public.referrals FOR UPDATE
USING (true);

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate 8 character alphanumeric code
    new_code := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE referral_code = new_code) INTO code_exists;
    
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  NEW.referral_code := new_code;
  RETURN NEW;
END;
$$;

-- Trigger to auto-generate referral code on profile creation
CREATE TRIGGER generate_referral_code_trigger
BEFORE INSERT ON public.profiles
FOR EACH ROW
WHEN (NEW.referral_code IS NULL)
EXECUTE FUNCTION public.generate_referral_code();

-- Generate referral codes for existing profiles that don't have one
UPDATE public.profiles 
SET referral_code = upper(substring(md5(id::text || now()::text) from 1 for 8))
WHERE referral_code IS NULL;

-- Function to process referral bonus when referred user uploads first note
CREATE OR REPLACE FUNCTION public.process_referral_bonus()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  referral_record RECORD;
  bonus_amount NUMERIC(10,2) := 10.00;
BEGIN
  -- Check if this is the user's first approved note
  IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
    -- Find pending referral for this user
    SELECT * INTO referral_record 
    FROM public.referrals 
    WHERE referred_id = NEW.user_id AND status = 'pending'
    LIMIT 1;
    
    IF FOUND THEN
      -- Update referral status to completed
      UPDATE public.referrals 
      SET status = 'completed', completed_at = now()
      WHERE id = referral_record.id;
      
      -- Credit referrer
      INSERT INTO public.transactions (user_id, amount, type, description)
      VALUES (referral_record.referrer_id, bonus_amount, 'referral_bonus', 'Referral bonus earned');
      
      UPDATE public.profiles 
      SET balance = balance + bonus_amount 
      WHERE id = referral_record.referrer_id;
      
      -- Credit referred user
      INSERT INTO public.transactions (user_id, amount, type, description)
      VALUES (referral_record.referred_id, bonus_amount, 'referral_bonus', 'Welcome bonus from referral');
      
      UPDATE public.profiles 
      SET balance = balance + bonus_amount 
      WHERE id = referral_record.referred_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger to process referral bonus when note is approved
CREATE TRIGGER process_referral_bonus_trigger
AFTER UPDATE ON public.notes
FOR EACH ROW
EXECUTE FUNCTION public.process_referral_bonus();