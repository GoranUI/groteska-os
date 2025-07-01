
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useClientData } from './data/useClientData';
import { useIncomeData } from './data/useIncomeData';
import { useExpenseData } from './data/useExpenseData';
import { useSavingsData } from './data/useSavingsData';
import { useFinancialCalculations } from './data/useFinancialCalculations';

export const useSupabaseData = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  // Import all data hooks
  const clientHook = useClientData();
  const incomeHook = useIncomeData();
  const expenseHook = useExpenseData();
  const savingsHook = useSavingsData();
  const calculations = useFinancialCalculations();

  // Fetch all data
  const fetchData = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      await Promise.all([
        clientHook.fetchClients(),
        incomeHook.fetchIncomes(),
        expenseHook.fetchExpenses(),
        savingsHook.fetchSavings(),
      ]);
    } catch (error: any) {
      toast({
        title: "Error fetching data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast, clientHook, incomeHook, expenseHook, savingsHook]);

  // Fetch data when user changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    const channels = [
      supabase
        .channel('clients_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, () => {
          fetchData();
        }),
      supabase
        .channel('incomes_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'incomes' }, () => {
          fetchData();
        }),
      supabase
        .channel('expenses_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, () => {
          fetchData();
        }),
      supabase
        .channel('savings_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'savings' }, () => {
          fetchData();
        }),
    ];

    channels.forEach(channel => channel.subscribe());

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [user, fetchData]);

  return {
    // Data
    clients: clientHook.clients,
    incomes: incomeHook.incomes,
    expenses: expenseHook.expenses,
    savings: savingsHook.savings,
    loading,
    
    // Client CRUD
    addClient: clientHook.addClient,
    updateClient: clientHook.updateClient,
    deleteClient: clientHook.deleteClient,
    
    // Income CRUD
    addIncome: incomeHook.addIncome,
    addIncomeBulk: incomeHook.addIncomeBulk,
    updateIncome: incomeHook.updateIncome,
    deleteIncome: incomeHook.deleteIncome,
    
    // Expense CRUD
    addExpense: expenseHook.addExpense,
    addExpenseBulk: expenseHook.addExpenseBulk,
    updateExpense: expenseHook.updateExpense,
    deleteExpense: expenseHook.deleteExpense,
    
    // Savings CRUD
    addSavings: savingsHook.addSavings,
    updateSavings: savingsHook.updateSavings,
    deleteSavings: savingsHook.deleteSavings,
    
    // Utilities
    getTotalBalance: (incomes, expenses) => calculations.getTotalBalance(incomes || incomeHook.incomes, expenses || expenseHook.expenses),
    getTotalInRSD: (incomes, expenses) => calculations.getTotalInRSD(incomes || incomeHook.incomes, expenses || expenseHook.expenses),
    getActiveClients: clientHook.getActiveClients,
    convertToRSD: calculations.convertToRSD,
  };
};
