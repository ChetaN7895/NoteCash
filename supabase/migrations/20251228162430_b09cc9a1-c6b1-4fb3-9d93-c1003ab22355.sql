-- Fix search_path for update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix search_path for update_note_rating function
CREATE OR REPLACE FUNCTION public.update_note_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  UPDATE public.notes
  SET 
    rating_avg = (SELECT COALESCE(AVG(rating), 0) FROM public.ratings WHERE note_id = NEW.note_id),
    rating_count = (SELECT COUNT(*) FROM public.ratings WHERE note_id = NEW.note_id)
  WHERE id = NEW.note_id;
  
  RETURN NEW;
END;
$$;