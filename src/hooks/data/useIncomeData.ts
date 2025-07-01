
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
      toast({
        title: "Error fetching incomes",
        description: error.message,
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

    const { data, error } = await supabase
      .from('incomes')
      .insert([{ ...income, user_id: user.id }])
      .select()
      .single();

    if (error) {
      toast({
        title: "Error adding income",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setIncomes(prev => [transformIncome(data), ...prev]);
    toast({
      title: "Income added",
      description: "Income has been added successfully.",
    });
  }, [user, toast]);

  const addIncomeBulk = useCallback(async (incomes: Omit<Income, 'id'>[]) => {
    if (!user) return { success: 0, failed: 0 };

    const dbIncomes = incomes.map(income => ({
      ...income,
      user_id: user.id
    }));

    const { data, error } = await supabase
      .from('incomes')
      .insert(dbIncomes)
      .select();

    if (error) {
      console.error('Bulk insert error:', error);
      return { success: 0, failed: incomes.length };
    }

    const newIncomes = (data || []).map(transformIncome);
    setIncomes(prev => [...newIncomes, ...prev]);

    return { success: data?.length || 0, failed: incomes.length - (data?.length || 0) };
  }, [user]);

  const updateIncome = useCallback(async (id: string, updates: Partial<Income>) => {
    const { data, error } = await supabase
      .from('incomes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      toast({
        title: "Error updating income",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setIncomes(prev => prev.map(income => income.id === id ? transformIncome(data) : income));
    toast({
      title: "Income updated",
      description: "Income has been updated successfully.",
    });
  }, [toast]);

  const deleteIncome = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('incomes')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error deleting income",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setIncomes(prev => prev.filter(income => income.id !== id));
    toast({
      title: "Income deleted",
      description: "Income has been deleted successfully.",
    });
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
