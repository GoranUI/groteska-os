
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Income } from '@/types';
import { useToastNotifications } from '@/hooks/useToastNotifications';

const transformIncome = (dbIncome: any): Income => ({
  id: dbIncome.id,
  amount: Number(dbIncome.amount),
  currency: dbIncome.currency as "USD" | "EUR" | "RSD",
  client: dbIncome.client,
  clientId: dbIncome.client_id,
  projectId: dbIncome.project_id,
  subTaskId: dbIncome.sub_task_id,
  date: dbIncome.date,
  category: dbIncome.category as "full-time" | "one-time",
  description: dbIncome.description,
  status: "paid", // All income entries are now paid by default
});

export const useIncomeData = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToastNotifications();
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchIncomes = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data: incomesData, error: incomesError } = await supabase
        .from('incomes')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (incomesError) throw incomesError;
      setIncomes((incomesData || []).map(transformIncome));
    } catch (error: any) {
      console.error('Error fetching incomes:', error);
      showError("Error", "Failed to load income data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [user, showError]);

  // Auto-fetch incomes when user changes
  useEffect(() => {
    fetchIncomes();
  }, [fetchIncomes]);

  const addIncome = useCallback(async (income: Omit<Income, 'id'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('incomes')
        .insert([{ 
          amount: income.amount,
          currency: income.currency,
          client: income.client,
          client_id: income.clientId || null,
          project_id: income.projectId || null,
          sub_task_id: income.subTaskId || null,
          date: income.date,
          category: income.category,
          description: income.description,
          status: income.status,
          user_id: user.id 
        }])
        .select()
        .single();

      if (error) throw error;

      setIncomes(prev => [transformIncome(data), ...prev]);
      showSuccess("Success", "Income has been added successfully.");
    } catch (error: any) {
      console.error('Error adding income:', error);
      showError("Error", "Failed to add income. Please try again.");
    }
  }, [user, showSuccess, showError]);

  const addIncomeBulk = useCallback(async (incomes: Omit<Income, 'id'>[]) => {
    if (!user) return { success: 0, failed: 0 };

    try {
      const dbIncomes = incomes.map(income => ({
        amount: income.amount,
        currency: income.currency,
        client: income.client,
        client_id: income.clientId || null,
        project_id: income.projectId || null,
        sub_task_id: income.subTaskId || null,
        date: income.date,
        category: income.category,
        description: income.description,
        status: income.status,
        user_id: user.id
      }));

      const { data, error } = await supabase
        .from('incomes')
        .insert(dbIncomes)
        .select();

      if (error) throw error;

      const newIncomes = (data || []).map(transformIncome);
      setIncomes(prev => [...newIncomes, ...prev]);

      return { success: data?.length || 0, failed: incomes.length - (data?.length || 0) };
    } catch (error: any) {
      console.error('Bulk insert error:', error);
      return { success: 0, failed: incomes.length };
    }
  }, [user]);

  const updateIncome = useCallback(async (id: string, updates: Partial<Income>) => {
    try {
      const dbUpdates: any = {};
      
      if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
      if (updates.currency !== undefined) dbUpdates.currency = updates.currency;
      if (updates.client !== undefined) dbUpdates.client = updates.client;
      if (updates.clientId !== undefined) dbUpdates.client_id = updates.clientId || null;
      if (updates.projectId !== undefined) dbUpdates.project_id = updates.projectId || null;
      if (updates.subTaskId !== undefined) dbUpdates.sub_task_id = updates.subTaskId || null;
      if (updates.date !== undefined) dbUpdates.date = updates.date;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.status !== undefined) dbUpdates.status = updates.status;

      const { data, error } = await supabase
        .from('incomes')
        .update(dbUpdates)
        .eq('id', id)
        .eq('user_id', user?.id) // Additional security check
        .select()
        .single();

      if (error) throw error;

      setIncomes(prev => prev.map(income => income.id === id ? transformIncome(data) : income));
      showSuccess("Success", "Income has been updated successfully.");
    } catch (error: any) {
      console.error('Error updating income:', error);
      showError("Error", "Failed to update income. Please try again.");
    }
  }, [user?.id, showSuccess, showError]);

  const deleteIncome = useCallback(async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('incomes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id); // Additional security check

      if (error) throw error;

      setIncomes(prev => prev.filter(income => income.id !== id));
      showSuccess("Success", "Income has been deleted successfully.");
    } catch (error: any) {
      console.error('Error deleting income:', error);
      showError("Error", "Failed to delete income. Please try again.");
    }
  }, [user, showSuccess, showError]);

  return {
    incomes,
    loading,
    fetchIncomes,
    addIncome,
    addIncomeBulk,
    updateIncome,
    deleteIncome,
  };
};
