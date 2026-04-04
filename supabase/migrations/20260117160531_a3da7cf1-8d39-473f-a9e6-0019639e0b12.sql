-- Allow users to delete their own ratings
CREATE POLICY "Users can delete their own ratings"
ON public.ratings
FOR DELETE
USING (auth.uid() = user_id);