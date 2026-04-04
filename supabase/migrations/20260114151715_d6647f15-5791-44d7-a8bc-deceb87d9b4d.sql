-- Update the process_referral_bonus function to use ₹1 instead of ₹10
CREATE OR REPLACE FUNCTION public.process_referral_bonus()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  referral_record RECORD;
  bonus_amount NUMERIC(10,2) := 1.00;
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
      SET status = 'completed', completed_at = now(), bonus_amount = 1.00
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
$function$;

-- Update default bonus_amount in referrals table
ALTER TABLE public.referrals ALTER COLUMN bonus_amount SET DEFAULT 1.00;