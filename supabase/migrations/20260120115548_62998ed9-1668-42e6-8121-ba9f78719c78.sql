-- Drop existing download trigger function
DROP FUNCTION IF EXISTS public.on_download_created() CASCADE;

-- Create new download trigger function with updated rate (₹25 per 100 downloads = ₹0.25 per download)
CREATE OR REPLACE FUNCTION public.on_download_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  note_owner_id UUID;
  download_earnings DECIMAL(10,2) := 0.25; -- ₹25 per 100 downloads = ₹0.25 per download
BEGIN
  -- Get note owner
  SELECT user_id INTO note_owner_id FROM public.notes WHERE id = NEW.note_id;
  
  -- Increment download count
  UPDATE public.notes 
  SET downloads_count = downloads_count + 1 
  WHERE id = NEW.note_id;
  
  -- Add earning transaction for note owner
  INSERT INTO public.transactions (user_id, amount, type, description, note_id)
  VALUES (note_owner_id, download_earnings, 'earning', 'Download earning', NEW.note_id);
  
  -- Update owner balance
  UPDATE public.profiles 
  SET balance = balance + download_earnings 
  WHERE id = note_owner_id;
  
  RETURN NEW;
END;
$function$;

-- Re-create the trigger on downloads table
CREATE TRIGGER on_download_created
  AFTER INSERT ON public.downloads
  FOR EACH ROW
  EXECUTE FUNCTION public.on_download_created();

-- Create function for view-based earnings with milestone system
-- First 1000 views = ₹50 bonus, After that = ₹10 per 1000 views (₹0.01 per view)
CREATE OR REPLACE FUNCTION public.on_note_views_updated()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  note_owner_id UUID;
  old_views INT;
  new_views INT;
  milestone_reached BOOLEAN;
  views_earning DECIMAL(10,2);
  old_thousands INT;
  new_thousands INT;
  thousands_crossed INT;
BEGIN
  note_owner_id := NEW.user_id;
  old_views := COALESCE(OLD.views_count, 0);
  new_views := COALESCE(NEW.views_count, 0);
  
  -- Only process if views actually increased
  IF new_views <= old_views THEN
    RETURN NEW;
  END IF;
  
  -- Check for first 1000 views milestone (₹50 bonus)
  IF old_views < 1000 AND new_views >= 1000 THEN
    -- First milestone reached - give ₹50 bonus
    INSERT INTO public.transactions (user_id, amount, type, description, note_id)
    VALUES (note_owner_id, 50.00, 'earning', 'First 1000 views milestone bonus', NEW.id);
    
    UPDATE public.profiles 
    SET balance = balance + 50.00 
    WHERE id = note_owner_id;
    
    -- Set old_views to 1000 for subsequent calculation
    old_views := 1000;
  END IF;
  
  -- Calculate earnings for views beyond 1000 (₹10 per 1000 views)
  IF new_views > 1000 THEN
    -- Only count views beyond 1000
    old_thousands := GREATEST(old_views - 1000, 0) / 1000;
    new_thousands := (new_views - 1000) / 1000;
    thousands_crossed := new_thousands - old_thousands;
    
    IF thousands_crossed > 0 THEN
      views_earning := thousands_crossed * 10.00; -- ₹10 per 1000 views
      
      INSERT INTO public.transactions (user_id, amount, type, description, note_id)
      VALUES (note_owner_id, views_earning, 'earning', 'Views earning (' || thousands_crossed || 'K views)', NEW.id);
      
      UPDATE public.profiles 
      SET balance = balance + views_earning 
      WHERE id = note_owner_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger for view-based earnings
CREATE TRIGGER on_note_views_updated
  AFTER UPDATE OF views_count ON public.notes
  FOR EACH ROW
  EXECUTE FUNCTION public.on_note_views_updated();