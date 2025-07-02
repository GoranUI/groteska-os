import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Expense } from '@/types';
import { useToast } from '@/hooks/use-toast';

const transformExpense = (dbExpense: any): Expense => ({
  id: dbExpense.id,
  amount: Number(dbExpense.amount),
  currency: dbExpense.currency as "USD" | "EUR" | "RSD",
  date: dbExpense.date,
  category: dbExpense.category as "Recurring" | "Food" | "External Food" | "Transport" | "Holiday" | "Utilities" | "Software" | "Marketing" | "Office" | "Cash Withdrawal" | "Medical/Health" | "Fees" | "Other",
  description: dbExpense.description,
  isRecurring: dbExpense.is_recurring,
  recurringFrequency: dbExpense.recurring_frequency as "weekly" | "monthly" | "yearly" | undefined,
});

export const useExpenseData = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExpenses = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (expensesError) throw expensesError;
      setExpenses((expensesData || []).map(transformExpense));
    } catch (error: any) {
      toast({
        title: "Error fetching expenses",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Auto-fetch expenses when user changes
  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const addExpense = useCallback(async (expense: Omit<Expense, 'id'>) => {
    if (!user) return;

    const dbExpense = {
      ...expense,
      is_recurring: expense.isRecurring,
      recurring_frequency: expense.recurringFrequency,
      user_id: user.id
    };
    delete (dbExpense as any).isRecurring;
    delete (dbExpense as any).recurringFrequency;

    const { data, error } = await supabase
      .from('expenses')
      .insert([dbExpense])
      .select()
      .single();

    if (error) {
      toast({
        title: "Error adding expense",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setExpenses(prev => [transformExpense(data), ...prev]);
    toast({
      title: "Expense added",
      description: "Expense has been added successfully.",
    });
  }, [user, toast]);

  const addExpenseBulk = useCallback(async (expenses: Omit<Expense, 'id'>[]) => {
    if (!user) return { success: 0, failed: 0 };

    const dbExpenses = expenses.map(expense => ({
      ...expense,
      is_recurring: expense.isRecurring || false,
      recurring_frequency: expense.recurringFrequency,
      user_id: user.id
    }));

    dbExpenses.forEach(expense => {
      delete (expense as any).isRecurring;
      delete (expense as any).recurringFrequency;
    });

    const { data, error } = await supabase
      .from('expenses')
      .insert(dbExpenses)
      .select();

    if (error) {
      console.error('Bulk insert error:', error);
      return { success: 0, failed: expenses.length };
    }

    const newExpenses = (data || []).map(transformExpense);
    setExpenses(prev => [...newExpenses, ...prev]);

    return { success: data?.length || 0, failed: expenses.length - (data?.length || 0) };
  }, [user]);

  const updateExpense = useCallback(async (id: string, updates: Partial<Expense>) => {
    const dbUpdates = { ...updates };
    if (updates.isRecurring !== undefined) {
      (dbUpdates as any).is_recurring = updates.isRecurring;
      delete (dbUpdates as any).isRecurring;
    }
    if (updates.recurringFrequency !== undefined) {
      (dbUpdates as any).recurring_frequency = updates.recurringFrequency;
      delete (dbUpdates as any).recurringFrequency;
    }

    const { data, error } = await supabase
      .from('expenses')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      toast({
        title: "Error updating expense",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setExpenses(prev => prev.map(expense => expense.id === id ? transformExpense(data) : expense));
    toast({
      title: "Expense updated",
      description: "Expense has been updated successfully.",
    });
  }, [toast]);

  const deleteExpense = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error deleting expense",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setExpenses(prev => prev.filter(expense => expense.id !== id));
    toast({
      title: "Expense deleted",
      description: "Expense has been deleted successfully.",
    });
  }, [toast]);

  return {
    expenses,
    loading,
    fetchExpenses,
    addExpense,
    addExpenseBulk,
    updateExpense,
    deleteExpense,
  };
};
