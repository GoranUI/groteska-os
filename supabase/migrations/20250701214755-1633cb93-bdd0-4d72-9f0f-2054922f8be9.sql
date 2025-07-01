
-- Add status column to incomes table if it doesn't exist
ALTER TABLE public.incomes 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending' CHECK (status IN ('paid', 'pending'));
