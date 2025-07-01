
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Income } from '@/types';
import { useToast } from '@/hooks/use-toast';

const transformIncome = (dbIncome: any): Income => ({
  id: dbIncome.id,
  amount: Number(dbIncome.amount),
  currency: dbIncome.currency as "USD" | "EUR" | "RSD",
  client: dbIncome.client,
  clientId: dbIncome.client_id,
  date: dbIncome.date,
  category: dbIncome.category as "full-time" | "one-time",
  description: dbIncome.description,
  status: dbIncome.status as "paid" | "pending" || "pending",
});

export const useIncomeData = () => {
  const { user } = useAuth();
  const { toast } = useToast();
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
      toast({
        title: "Error",
        description: "Failed to load income data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Auto-fetch incomes when user changes
  useEffect(() => {
    fetchIncomes();
  }, [fetchIncomes]);

  const addIncome = useCallback(async (income: Omit<Income, 'id'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('incomes')
        .insert([{ ...income, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      setIncomes(prev => [transformIncome(data), ...prev]);
      toast({
        title: "Success",
        description: "Income has been added successfully.",
      });
    } catch (error: any) {
      console.error('Error adding income:', error);
      toast({
        title: "Error",
        description: "Failed to add income. Please try again.",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  const addIncomeBulk = useCallback(async (incomes: Omit<Income, 'id'>[]) => {
    if (!user) return { success: 0, failed: 0 };

    try {
      const dbIncomes = incomes.map(income => ({
        ...income,
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
      const { data, error } = await supabase
        .from('incomes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setIncomes(prev => prev.map(income => income.id === id ? transformIncome(data) : income));
      toast({
        title: "Success",
        description: "Income has been updated successfully.",
      });
    } catch (error: any) {
      console.error('Error updating income:', error);
      toast({
        title: "Error",
        description: "Failed to update income. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const deleteIncome = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('incomes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setIncomes(prev => prev.filter(income => income.id !== id));
      toast({
        title: "Success",
        description: "Income has been deleted successfully.",
      });
    } catch (error: any) {
      console.error('Error deleting income:', error);
      toast({
        title: "Error",
        description: "Failed to delete income. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast]);

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
