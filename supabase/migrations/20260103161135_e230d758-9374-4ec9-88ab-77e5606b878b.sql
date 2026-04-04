-- Create table to track user note views for personalization
CREATE TABLE public.user_note_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  note_id UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, note_id)
);

-- Enable RLS
ALTER TABLE public.user_note_views ENABLE ROW LEVEL SECURITY;

-- Users can view their own view history
CREATE POLICY "Users can view their own views"
ON public.user_note_views
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own views
CREATE POLICY "Users can insert their own views"
ON public.user_note_views
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own views (for updating viewed_at)
CREATE POLICY "Users can update their own views"
ON public.user_note_views
FOR UPDATE
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_user_note_views_user_id ON public.user_note_views(user_id);
CREATE INDEX idx_user_note_views_note_id ON public.user_note_views(note_id);