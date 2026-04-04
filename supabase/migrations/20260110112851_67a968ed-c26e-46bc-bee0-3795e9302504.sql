-- Enable realtime for notes table to track new uploads and stats changes
ALTER PUBLICATION supabase_realtime ADD TABLE public.notes;

-- Enable realtime for profiles table to track new users
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

-- Enable realtime for transactions to track earnings
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;