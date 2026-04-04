-- Create approval_logs table for audit transparency
CREATE TABLE public.approval_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  note_id UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  check_results JSONB,
  ai_analysis TEXT,
  confidence_score NUMERIC(3,2),
  processed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processing_time_ms INTEGER
);

-- Enable RLS
ALTER TABLE public.approval_logs ENABLE ROW LEVEL SECURITY;

-- Admins can view all logs
CREATE POLICY "Admins can view all approval logs" 
ON public.approval_logs 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Users can view logs for their own notes
CREATE POLICY "Users can view logs for their own notes" 
ON public.approval_logs 
FOR SELECT 
USING (
  note_id IN (SELECT id FROM public.notes WHERE user_id = auth.uid())
);

-- System can insert logs (via service role)
CREATE POLICY "System can insert approval logs" 
ON public.approval_logs 
FOR INSERT 
WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX idx_approval_logs_note_id ON public.approval_logs(note_id);
CREATE INDEX idx_approval_logs_status ON public.approval_logs(status);