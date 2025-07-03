-- Create time_entries table for advanced time tracking
CREATE TABLE public.time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.sub_tasks(id) ON DELETE SET NULL,
  user_id UUID NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  duration INTEGER NOT NULL CHECK (duration >= 0),
  note TEXT,
  is_billable BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own time entries
CREATE POLICY "Users can view their own time entries"
  ON public.time_entries FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own time entries
CREATE POLICY "Users can insert their own time entries"
  ON public.time_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own time entries
CREATE POLICY "Users can update their own time entries"
  ON public.time_entries FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own time entries
CREATE POLICY "Users can delete their own time entries"
  ON public.time_entries FOR DELETE
  USING (auth.uid() = user_id); 