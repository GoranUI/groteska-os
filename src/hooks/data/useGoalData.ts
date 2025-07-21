import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToastNotifications } from "@/hooks/useToastNotifications";
import { FinancialGoal, GoalMilestone } from "@/types";

const transformGoal = (dbGoal: any): FinancialGoal => ({
  id: dbGoal.id,
  userId: dbGoal.user_id,
  title: dbGoal.title,
  description: dbGoal.description,
  goalType: dbGoal.goal_type,
  targetAmount: Number(dbGoal.target_amount),
  currentAmount: Number(dbGoal.current_amount),
  currency: dbGoal.currency as "USD" | "EUR" | "RSD",
  targetDate: dbGoal.target_date,
  status: dbGoal.status,
  priority: dbGoal.priority,
  category: dbGoal.category,
  isRecurring: dbGoal.is_recurring,
  recurringPeriod: dbGoal.recurring_period,
  createdAt: dbGoal.created_at,
  updatedAt: dbGoal.updated_at,
});

const transformMilestone = (dbMilestone: any): GoalMilestone => ({
  id: dbMilestone.id,
  goalId: dbMilestone.goal_id,
  title: dbMilestone.title,
  targetAmount: Number(dbMilestone.target_amount),
  achievedAt: dbMilestone.achieved_at,
  createdAt: dbMilestone.created_at,
  milestoneOrder: dbMilestone.milestone_order,
});

export const useGoalData = () => {
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [milestones, setMilestones] = useState<GoalMilestone[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { showSuccess, showError } = useToastNotifications();

  const fetchGoals = async () => {
    if (!user) {
      setGoals([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("financial_goals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const transformedGoals = data?.map(transformGoal) || [];
      setGoals(transformedGoals);
    } catch (error: any) {
      console.error("Error fetching goals:", error);
      showError("Error", "Failed to load financial goals");
    } finally {
      setLoading(false);
    }
  };

  const fetchMilestones = async (goalId?: string) => {
    if (!user) return;

    try {
      let query = supabase
        .from("goal_milestones")
        .select(`
          *,
          financial_goals!inner(user_id)
        `)
        .eq("financial_goals.user_id", user.id);

      if (goalId) {
        query = query.eq("goal_id", goalId);
      }

      const { data, error } = await query.order("milestone_order", { ascending: true });

      if (error) throw error;

      const transformedMilestones = data?.map(transformMilestone) || [];
      setMilestones(transformedMilestones);
    } catch (error: any) {
      console.error("Error fetching milestones:", error);
      showError("Error", "Failed to load goal milestones");
    }
  };

  useEffect(() => {
    fetchGoals();
    fetchMilestones();
  }, [user]);

  const addGoal = async (goal: Omit<FinancialGoal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) {
      showError("Error", "You must be logged in to add goals");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("financial_goals")
        .insert([{
          user_id: user.id,
          title: goal.title,
          description: goal.description,
          goal_type: goal.goalType,
          target_amount: goal.targetAmount,
          current_amount: goal.currentAmount,
          currency: goal.currency,
          target_date: goal.targetDate,
          status: goal.status,
          priority: goal.priority,
          category: goal.category,
          is_recurring: goal.isRecurring,
          recurring_period: goal.recurringPeriod,
        }])
        .select()
        .single();

      if (error) throw error;

      const newGoal = transformGoal(data);
      setGoals(prev => [newGoal, ...prev]);
      showSuccess("Success", "Financial goal created successfully");
      return newGoal;
    } catch (error: any) {
      console.error("Error adding goal:", error);
      showError("Error", "Failed to create financial goal");
    }
  };

  const updateGoal = async (id: string, updates: Partial<FinancialGoal>) => {
    try {
      const { data, error } = await supabase
        .from("financial_goals")
        .update({
          title: updates.title,
          description: updates.description,
          goal_type: updates.goalType,
          target_amount: updates.targetAmount,
          current_amount: updates.currentAmount,
          currency: updates.currency,
          target_date: updates.targetDate,
          status: updates.status,
          priority: updates.priority,
          category: updates.category,
          is_recurring: updates.isRecurring,
          recurring_period: updates.recurringPeriod,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      const updatedGoal = transformGoal(data);
      setGoals(prev => prev.map(goal => 
        goal.id === id ? updatedGoal : goal
      ));
      showSuccess("Success", "Goal updated successfully");
    } catch (error: any) {
      console.error("Error updating goal:", error);
      showError("Error", "Failed to update goal");
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      const { error } = await supabase
        .from("financial_goals")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setGoals(prev => prev.filter(goal => goal.id !== id));
      setMilestones(prev => prev.filter(milestone => milestone.goalId !== id));
      showSuccess("Success", "Goal deleted successfully");
    } catch (error: any) {
      console.error("Error deleting goal:", error);
      showError("Error", "Failed to delete goal");
    }
  };

  const addMilestone = async (milestone: Omit<GoalMilestone, 'id' | 'createdAt'>) => {
    try {
      const { data, error } = await supabase
        .from("goal_milestones")
        .insert([{
          goal_id: milestone.goalId,
          title: milestone.title,
          target_amount: milestone.targetAmount,
          milestone_order: milestone.milestoneOrder,
        }])
        .select()
        .single();

      if (error) throw error;

      const newMilestone = transformMilestone(data);
      setMilestones(prev => [...prev, newMilestone]);
      showSuccess("Success", "Milestone added successfully");
    } catch (error: any) {
      console.error("Error adding milestone:", error);
      showError("Error", "Failed to add milestone");
    }
  };

  const achieveMilestone = async (milestoneId: string) => {
    try {
      const { data, error } = await supabase
        .from("goal_milestones")
        .update({ achieved_at: new Date().toISOString() })
        .eq("id", milestoneId)
        .select()
        .single();

      if (error) throw error;

      const updatedMilestone = transformMilestone(data);
      setMilestones(prev => prev.map(milestone => 
        milestone.id === milestoneId ? updatedMilestone : milestone
      ));
      showSuccess("Success", "Milestone achieved! 🎉");
    } catch (error: any) {
      console.error("Error updating milestone:", error);
      showError("Error", "Failed to update milestone");
    }
  };

  const updateGoalProgress = async (goalId: string, amount: number) => {
    try {
      const { data, error } = await supabase
        .from("financial_goals")
        .update({ current_amount: amount })
        .eq("id", goalId)
        .select()
        .single();

      if (error) throw error;

      const updatedGoal = transformGoal(data);
      setGoals(prev => prev.map(goal => 
        goal.id === goalId ? updatedGoal : goal
      ));
      
      // Check if goal is completed
      if (amount >= updatedGoal.targetAmount && updatedGoal.status === 'active') {
        await updateGoal(goalId, { status: 'completed' });
        showSuccess("Success", "🎉 Goal completed! Congratulations!");
      }
    } catch (error: any) {
      console.error("Error updating goal progress:", error);
      showError("Error", "Failed to update goal progress");
    }
  };

  return {
    goals,
    milestones,
    loading,
    fetchGoals,
    fetchMilestones,
    addGoal,
    updateGoal,
    deleteGoal,
    addMilestone,
    achieveMilestone,
    updateGoalProgress,
  };
};