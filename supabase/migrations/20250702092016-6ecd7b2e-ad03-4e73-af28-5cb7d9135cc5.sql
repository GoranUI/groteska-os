-- Add billing type and hourly rate to projects table
ALTER TABLE public.projects 
ADD COLUMN billing_type TEXT DEFAULT 'fixed' CHECK (billing_type IN ('fixed', 'hourly')),
ADD COLUMN hourly_rate NUMERIC;

-- Add hours tracking to sub_tasks table
ALTER TABLE public.sub_tasks 
ADD COLUMN hours NUMERIC DEFAULT 0;