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
  USING ((SELECT auth.uid()) = user_id);

-- Policy: Users can insert their own time entries
CREATE POLICY "Users can insert their own time entries"
  ON public.time_entries FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Policy: Users can update their own time entries
CREATE POLICY "Users can update their own time entries"
  ON public.time_entries FOR UPDATE
  USING ((SELECT auth.uid()) = user_id);

-- Policy: Users can delete their own time entries
CREATE POLICY "Users can delete their own time entries"
  ON public.time_entries FOR DELETE
  USING ((SELECT auth.uid()) = user_id);

-- Create indexes for better performance
CREATE INDEX idx_time_entries_project_id ON public.time_entries(project_id);
CREATE INDEX idx_time_entries_task_id ON public.time_entries(task_id);
CREATE INDEX idx_time_entries_user_id ON public.time_entries(user_id);
CREATE INDEX idx_time_entries_start_time ON public.time_entries(start_time);