
-- Add billing_type field to invoices table
ALTER TABLE public.invoices ADD COLUMN billing_type TEXT DEFAULT 'project';
