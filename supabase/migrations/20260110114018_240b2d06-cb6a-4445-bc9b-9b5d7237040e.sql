-- Add is_featured column to notes table
ALTER TABLE public.notes 
ADD COLUMN is_featured boolean DEFAULT false;

-- Add featured_at timestamp to track when it was featured
ALTER TABLE public.notes 
ADD COLUMN featured_at timestamp with time zone;

-- Create index for faster featured notes queries
CREATE INDEX idx_notes_featured ON public.notes (is_featured, featured_at DESC) WHERE is_featured = true;