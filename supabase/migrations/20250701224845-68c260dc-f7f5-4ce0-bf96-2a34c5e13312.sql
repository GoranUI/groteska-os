-- Update projects table to add priority and modify status constraints
ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_status_check;
ALTER TABLE public.projects ADD CONSTRAINT projects_status_check 
  CHECK (status IN ('negotiation', 'pending', 'in_progress', 'waiting_on_client', 'done', 'canceled'));

-- Add priority column to projects table
ALTER TABLE public.projects ADD COLUMN priority TEXT DEFAULT 'medium' 
  CHECK (priority IN ('low', 'medium', 'high', 'urgent'));