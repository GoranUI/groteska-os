-- Update income categories for design agency business model
ALTER TABLE public.incomes DROP CONSTRAINT IF EXISTS incomes_category_check;
ALTER TABLE public.incomes ADD CONSTRAINT incomes_category_check 
  CHECK (category IN ('client-projects', 'retainer-services', 'consulting', 'product-sales', 'licensing', 'partnerships', 'other-business'));

-- Update expense categories for business operations
ALTER TABLE public.expenses DROP CONSTRAINT IF EXISTS expenses_category_check;
ALTER TABLE public.expenses ADD CONSTRAINT expenses_category_check 
  CHECK (category IN ('office-rent', 'equipment', 'software-subscriptions', 'marketing-advertising', 'professional-services', 'travel-client-meetings', 'education-training', 'insurance', 'utilities', 'office-supplies', 'client-entertainment', 'banking-fees', 'taxes-compliance', 'other-business'));

-- Update existing data to new categories (optional - for existing data migration)
-- Map old income categories to new ones
UPDATE public.incomes SET category = 'client-projects' WHERE category = 'full-time';
UPDATE public.incomes SET category = 'other-business' WHERE category = 'one-time';

-- Map old expense categories to new ones
UPDATE public.expenses SET category = 'software-subscriptions' WHERE category = 'Software';
UPDATE public.expenses SET category = 'marketing-advertising' WHERE category = 'Marketing';
UPDATE public.expenses SET category = 'office-rent' WHERE category = 'Office';
UPDATE public.expenses SET category = 'utilities' WHERE category = 'Utilities';
UPDATE public.expenses SET category = 'client-entertainment' WHERE category = 'External Food';
UPDATE public.expenses SET category = 'office-supplies' WHERE category = 'Food';
UPDATE public.expenses SET category = 'travel-client-meetings' WHERE category = 'Transport';
UPDATE public.expenses SET category = 'other-business' WHERE category IN ('Recurring', 'Holiday', 'Cash Withdrawal', 'Medical/Health', 'Fees', 'Other');
