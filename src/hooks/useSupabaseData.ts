
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useClientData } from './data/useClientData';
import { useIncomeData } from './data/useIncomeData';
import { useExpenseData } from './data/useExpenseData';
import { useSavingsData } from './data/useSavingsData';
import { useProjectData } from './data/useProjectData';
import { useSubTaskData } from './data/useSubTaskData';
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
  const projectHook = useProjectData();
  const subTaskHook = useSubTaskData();
  const calculations = useFinancialCalculations();

  // Check if all individual hooks are done loading
  useEffect(() => {
    const allHooksLoaded = !clientHook.loading && 
                          !incomeHook.loading && 
                          !expenseHook.loading && 
                          !savingsHook.loading &&
                          !projectHook.loading &&
                          !subTaskHook.loading;
    
    if (allHooksLoaded) {
      setLoading(false);
    }
  }, [clientHook.loading, incomeHook.loading, expenseHook.loading, savingsHook.loading, projectHook.loading, subTaskHook.loading]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    const channels = [
      supabase
        .channel('clients_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, () => {
          clientHook.fetchClients();
        }),
      supabase
        .channel('incomes_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'incomes' }, () => {
          incomeHook.fetchIncomes();
        }),
      supabase
        .channel('expenses_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, () => {
          expenseHook.fetchExpenses();
        }),
      supabase
        .channel('savings_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'savings' }, () => {
          savingsHook.fetchSavings();
        }),
      supabase
        .channel('projects_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => {
          projectHook.fetchProjects();
        }),
      supabase
        .channel('sub_tasks_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'sub_tasks' }, () => {
          subTaskHook.fetchSubTasks();
        }),
    ];

    channels.forEach(channel => channel.subscribe());

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [user, clientHook, incomeHook, expenseHook, savingsHook, projectHook, subTaskHook]);

  return {
    // Data
    clients: clientHook.clients,
    incomes: incomeHook.incomes,
    expenses: expenseHook.expenses,
    savings: savingsHook.savings,
    projects: projectHook.projects,
    subTasks: subTaskHook.subTasks,
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
    
    // Project CRUD
    addProject: projectHook.addProject,
    updateProject: projectHook.updateProject,
    deleteProject: projectHook.deleteProject,
    
    // SubTask CRUD
    addSubTask: subTaskHook.addSubTask,
    updateSubTask: subTaskHook.updateSubTask,
    deleteSubTask: subTaskHook.deleteSubTask,
    markAsPaid: subTaskHook.markAsPaid,
    
    // Utilities
    getTotalBalance: (incomes, expenses) => calculations.getTotalBalance(incomes || incomeHook.incomes, expenses || expenseHook.expenses),
    getTotalInRSD: (incomes, expenses) => calculations.getTotalInRSD(incomes || incomeHook.incomes, expenses || expenseHook.expenses),
    getActiveClients: clientHook.getActiveClients,
    convertToRSD: calculations.convertToRSD,
  };
};
