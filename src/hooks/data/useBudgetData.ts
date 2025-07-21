import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToastNotifications } from "@/hooks/useToastNotifications";
import { Budget } from "@/types";

const transformBudget = (dbBudget: any): Budget => ({
  id: dbBudget.id,
  userId: dbBudget.user_id,
  category: dbBudget.category,
  amount: Number(dbBudget.amount),
  currency: dbBudget.currency as "USD" | "EUR" | "RSD",
  month: dbBudget.month,
  year: dbBudget.year,
  createdAt: dbBudget.created_at,
  updatedAt: dbBudget.updated_at,
});

export const useBudgetData = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { showSuccess, showError } = useToastNotifications();

  const fetchBudgets = async () => {
    if (!user) {
      setBudgets([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("budgets")
        .select("*")
        .eq("user_id", user.id)
        .order("year", { ascending: false })
        .order("month", { ascending: false });

      if (error) throw error;

      const transformedBudgets = data?.map(transformBudget) || [];
      setBudgets(transformedBudgets);
    } catch (error: any) {
      console.error("Error fetching budgets:", error);
      showError("Error", "Failed to load budgets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [user]);

  const addBudget = async (budget: Omit<Budget, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) {
      showError("Error", "You must be logged in to add budgets");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("budgets")
        .insert([{
          user_id: user.id,
          category: budget.category,
          amount: budget.amount,
          currency: budget.currency,
          month: budget.month,
          year: budget.year,
        }])
        .select()
        .single();

      if (error) throw error;

      const newBudget = transformBudget(data);
      setBudgets(prev => [newBudget, ...prev]);
      showSuccess("Success", "Budget added successfully");
    } catch (error: any) {
      console.error("Error adding budget:", error);
      if (error.code === '23505') {
        showError("Error", "Budget for this category and month already exists");
      } else {
        showError("Error", "Failed to add budget");
      }
    }
  };

  const updateBudget = async (id: string, updates: Partial<Budget>) => {
    try {
      const { data, error } = await supabase
        .from("budgets")
        .update({
          category: updates.category,
          amount: updates.amount,
          currency: updates.currency,
          month: updates.month,
          year: updates.year,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      const updatedBudget = transformBudget(data);
      setBudgets(prev => prev.map(budget => 
        budget.id === id ? updatedBudget : budget
      ));
      showSuccess("Success", "Budget updated successfully");
    } catch (error: any) {
      console.error("Error updating budget:", error);
      showError("Error", "Failed to update budget");
    }
  };

  const deleteBudget = async (id: string) => {
    try {
      const { error } = await supabase
        .from("budgets")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setBudgets(prev => prev.filter(budget => budget.id !== id));
      showSuccess("Success", "Budget deleted successfully");
    } catch (error: any) {
      console.error("Error deleting budget:", error);
      showError("Error", "Failed to delete budget");
    }
  };

  const getBudgetForCategory = (category: string, month: number, year: number): Budget | undefined => {
    return budgets.find(budget => 
      budget.category === category && 
      budget.month === month && 
      budget.year === year
    );
  };

  return {
    budgets,
    loading,
    fetchBudgets,
    addBudget,
    updateBudget,
    deleteBudget,
    getBudgetForCategory,
  };
};