-- Create financial goals table
CREATE TABLE public.financial_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('savings', 'debt_payoff', 'income', 'investment', 'expense_reduction', 'emergency_fund')),
  target_amount NUMERIC NOT NULL DEFAULT 0,
  current_amount NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'RSD',
  target_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  category TEXT,
  is_recurring BOOLEAN DEFAULT false,
  recurring_period TEXT CHECK (recurring_period IN ('weekly', 'monthly', 'quarterly', 'yearly'))
);

-- Enable Row Level Security
ALTER TABLE public.financial_goals ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own goals" 
ON public.financial_goals 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own goals" 
ON public.financial_goals 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals" 
ON public.financial_goals 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals" 
ON public.financial_goals 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_financial_goals_updated_at
BEFORE UPDATE ON public.financial_goals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create goal milestones table for tracking progress
CREATE TABLE public.goal_milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID NOT NULL REFERENCES public.financial_goals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  target_amount NUMERIC NOT NULL,
  achieved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  milestone_order INTEGER NOT NULL DEFAULT 1
);

-- Enable RLS on milestones
ALTER TABLE public.goal_milestones ENABLE ROW LEVEL SECURITY;

-- Create policies for milestones
CREATE POLICY "Users can view milestones for their goals" 
ON public.goal_milestones 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.financial_goals 
  WHERE id = goal_milestones.goal_id AND user_id = auth.uid()
));

CREATE POLICY "Users can create milestones for their goals" 
ON public.goal_milestones 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.financial_goals 
  WHERE id = goal_milestones.goal_id AND user_id = auth.uid()
));

CREATE POLICY "Users can update milestones for their goals" 
ON public.goal_milestones 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.financial_goals 
  WHERE id = goal_milestones.goal_id AND user_id = auth.uid()
));

CREATE POLICY "Users can delete milestones for their goals" 
ON public.goal_milestones 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.financial_goals 
  WHERE id = goal_milestones.goal_id AND user_id = auth.uid()
));