
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Client, Income, Expense, Savings } from '@/types';
import { useToast } from '@/hooks/use-toast';

export const useSupabaseData = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [savings, setSavings] = useState<Savings[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all data
  const fetchData = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch clients
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (clientsError) throw clientsError;

      // Fetch incomes
      const { data: incomesData, error: incomesError } = await supabase
        .from('incomes')
        .select('*')
        .order('date', { ascending: false });

      if (incomesError) throw incomesError;

      // Fetch expenses
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });

      if (expensesError) throw expensesError;

      // Fetch savings
      const { data: savingsData, error: savingsError } = await supabase
        .from('savings')
        .select('*')
        .order('date', { ascending: false });

      if (savingsError) throw savingsError;

      setClients(clientsData || []);
      setIncomes(incomesData || []);
      setExpenses(expensesData || []);
      setSavings(savingsData || []);
    } catch (error: any) {
      toast({
        title: "Error fetching data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Client CRUD
  const addClient = useCallback(async (client: Omit<Client, 'id' | 'createdAt'>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('clients')
      .insert([{ ...client, user_id: user.id }])
      .select()
      .single();

    if (error) {
      toast({
        title: "Error adding client",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setClients(prev => [data, ...prev]);
    toast({
      title: "Client added",
      description: `${client.name} has been added successfully.`,
    });
  }, [user, toast]);

  const updateClient = useCallback(async (id: string, updates: Partial<Client>) => {
    const { data, error } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      toast({
        title: "Error updating client",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setClients(prev => prev.map(client => client.id === id ? data : client));
    toast({
      title: "Client updated",
      description: "Client has been updated successfully.",
    });
  }, [toast]);

  const deleteClient = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error deleting client",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setClients(prev => prev.filter(client => client.id !== id));
    toast({
      title: "Client deleted",
      description: "Client has been deleted successfully.",
    });
  }, [toast]);

  // Income CRUD
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

    setIncomes(prev => [data, ...prev]);
    toast({
      title: "Income added",
      description: "Income has been added successfully.",
    });
  }, [user, toast]);

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

    setIncomes(prev => prev.map(income => income.id === id ? data : income));
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

  // Expense CRUD
  const addExpense = useCallback(async (expense: Omit<Expense, 'id'>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('expenses')
      .insert([{ ...expense, user_id: user.id }])
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

    setExpenses(prev => [data, ...prev]);
    toast({
      title: "Expense added",
      description: "Expense has been added successfully.",
    });
  }, [user, toast]);

  const updateExpense = useCallback(async (id: string, updates: Partial<Expense>) => {
    const { data, error } = await supabase
      .from('expenses')
      .update(updates)
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

    setExpenses(prev => prev.map(expense => expense.id === id ? data : expense));
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

  // Savings CRUD
  const addSavings = useCallback(async (saving: Omit<Savings, 'id'>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('savings')
      .insert([{ ...saving, user_id: user.id }])
      .select()
      .single();

    if (error) {
      toast({
        title: "Error adding savings",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setSavings(prev => [data, ...prev]);
    toast({
      title: "Savings added",
      description: "Savings entry has been added successfully.",
    });
  }, [user, toast]);

  const updateSavings = useCallback(async (id: string, updates: Partial<Savings>) => {
    const { data, error } = await supabase
      .from('savings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      toast({
        title: "Error updating savings",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setSavings(prev => prev.map(saving => saving.id === id ? data : saving));
    toast({
      title: "Savings updated",
      description: "Savings has been updated successfully.",
    });
  }, [toast]);

  const deleteSavings = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('savings')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error deleting savings",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setSavings(prev => prev.filter(saving => saving.id !== id));
    toast({
      title: "Savings deleted",
      description: "Savings has been deleted successfully.",
    });
  }, [toast]);

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

  // Utility functions
  const exchangeRates = { USD: 1, EUR: 1.1, RSD: 0.009 };

  const convertToRSD = useCallback((amount: number, currency: "USD" | "EUR" | "RSD") => {
    if (currency === "RSD") return amount;
    return amount / exchangeRates[currency];
  }, []);

  const getTotalBalance = useCallback(() => {
    const balances = { USD: 0, EUR: 0, RSD: 0 };
    
    incomes.forEach(income => {
      balances[income.currency] += Number(income.amount);
    });
    
    expenses.forEach(expense => {
      balances[expense.currency] -= Number(expense.amount);
    });
    
    return balances;
  }, [incomes, expenses]);

  const getTotalInRSD = useCallback(() => {
    const totalIncomeRSD = incomes.reduce((sum, income) => 
      sum + convertToRSD(Number(income.amount), income.currency), 0);
    const totalExpenseRSD = expenses.reduce((sum, expense) => 
      sum + convertToRSD(Number(expense.amount), expense.currency), 0);
    
    return { income: totalIncomeRSD, expense: totalExpenseRSD, balance: totalIncomeRSD - totalExpenseRSD };
  }, [incomes, expenses, convertToRSD]);

  const getActiveClients = useCallback(() => {
    return clients.filter(client => client.status === "active").length;
  }, [clients]);

  return {
    // Data
    clients,
    incomes,
    expenses,
    savings,
    loading,
    
    // Client CRUD
    addClient,
    updateClient,
    deleteClient,
    
    // Income CRUD
    addIncome,
    updateIncome,
    deleteIncome,
    
    // Expense CRUD
    addExpense,
    updateExpense,
    deleteExpense,
    
    // Savings CRUD
    addSavings,
    updateSavings,
    deleteSavings,
    
    // Utilities
    getTotalBalance,
    getTotalInRSD,
    getActiveClients,
    convertToRSD,
  };
};
