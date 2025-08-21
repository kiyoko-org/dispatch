-- Enable Row Level Security for reports table
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Create policy for inserting reports (authenticated users can create reports)
CREATE POLICY "Users can insert their own reports" ON public.reports
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

-- Create policy for selecting reports (authenticated users can view only their reports)
CREATE POLICY "Users can view their own reports" ON public.reports
  FOR SELECT
  TO authenticated
  USING (auth.uid() = reporter_id);

-- Create policy for updating reports (authenticated users can update only their reports)
CREATE POLICY "Users can update their own reports" ON public.reports
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = reporter_id);

-- Create policy for deleting reports (authenticated users can delete only their reports)
CREATE POLICY "Users can delete their own reports" ON public.reports
  FOR DELETE
  TO authenticated
  USING (auth.uid() = reporter_id);

-- Admins can see all reports (create a separate role for admins if needed)
-- CREATE POLICY "Admins can see all reports" ON public.reports
--   FOR ALL
--   TO authenticated
--   USING (auth.jwt() ->> 'role' = 'admin');