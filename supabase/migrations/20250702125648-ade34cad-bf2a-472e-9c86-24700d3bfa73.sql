-- Drop the existing check constraint
ALTER TABLE public.expenses DROP CONSTRAINT IF EXISTS expenses_category_check;

-- Add new check constraint with all the updated categories
ALTER TABLE public.expenses ADD CONSTRAINT expenses_category_check 
CHECK (category IN ('Recurring', 'Food', 'External Food', 'Transport', 'Holiday', 'Utilities', 'Software', 'Marketing', 'Office', 'Cash Withdrawal', 'Medical/Health', 'Fees', 'Other'));