
import { useState, useCallback, useMemo } from "react";
import { useExchangeRates } from './useExchangeRates';
import { Client, Income, Expense, Savings } from "@/types";

export const useFinancialData = () => {
  const [clients, setClients] = useState<Client[]>([
    {
      id: "1",
      name: "Tech Corp",
      email: "contact@techcorp.com",
      company: "Tech Corp Inc.",
      status: "active",
      createdAt: "2024-01-15"
    },
    {
      id: "2",
      name: "Design Studio",
      email: "hello@designstudio.com",
      company: "Design Studio LLC",
      status: "active",
      createdAt: "2024-02-10"
    }
  ]);

  const [incomes, setIncomes] = useState<Income[]>([
    {
      id: "1",
      amount: 5000,
      currency: "USD",
      client: "Tech Corp",
      clientId: "1",
      date: "2024-07-01",
      category: "main-bank",
      description: "Monthly salary"
    },
    {
      id: "2",
      amount: 800,
      currency: "EUR",
      client: "Design Studio",
      clientId: "2",
      date: "2024-06-28",
      category: "one-time",
      description: "Website design project"
    }
  ]);

  const [expenses, setExpenses] = useState<Expense[]>([
    {
      id: "1",
      amount: 1200,
      currency: "USD",
      date: "2024-07-01",
      category: "Recurring",
      description: "Rent",
      isRecurring: true,
      recurringFrequency: "monthly"
    },
    {
      id: "2",
      amount: 45,
      currency: "EUR",
      date: "2024-07-01",
      category: "Food",
      description: "Groceries"
    }
  ]);

  const [savings, setSavings] = useState<Savings[]>([
    {
      id: "1",
      amount: 1000,
      currency: "USD",
      date: "2024-07-01",
      type: "deposit",
      description: "Emergency fund"
    }
  ]);

  // Client CRUD
  const addClient = useCallback((client: Omit<Client, "id" | "createdAt">) => {
    const newClient: Client = {
      ...client,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0]
    };
    setClients(prev => [...prev, newClient]);
  }, []);

  const updateClient = useCallback((id: string, updates: Partial<Client>) => {
    setClients(prev => prev.map(client => 
      client.id === id ? { ...client, ...updates } : client
    ));
  }, []);

  const deleteClient = useCallback((id: string) => {
    setClients(prev => prev.filter(client => client.id !== id));
  }, []);

  // Income CRUD
  const addIncome = useCallback((income: Omit<Income, "id">) => {
    const newIncome: Income = {
      ...income,
      id: Date.now().toString()
    };
    setIncomes(prev => [...prev, newIncome]);
  }, []);

  const updateIncome = useCallback((id: string, updates: Partial<Income>) => {
    setIncomes(prev => prev.map(income => 
      income.id === id ? { ...income, ...updates } : income
    ));
  }, []);

  const deleteIncome = useCallback((id: string) => {
    setIncomes(prev => prev.filter(income => income.id !== id));
  }, []);

  // Expense CRUD
  const addExpense = useCallback((expense: Omit<Expense, "id">) => {
    const newExpense: Expense = {
      ...expense,
      id: Date.now().toString()
    };
    setExpenses(prev => [...prev, newExpense]);
  }, []);

  const updateExpense = useCallback((id: string, updates: Partial<Expense>) => {
    setExpenses(prev => prev.map(expense => 
      expense.id === id ? { ...expense, ...updates } : expense
    ));
  }, []);

  const deleteExpense = useCallback((id: string) => {
    setExpenses(prev => prev.filter(expense => expense.id !== id));
  }, []);

  // Savings CRUD
  const addSavings = useCallback((saving: Omit<Savings, "id">) => {
    const newSaving: Savings = {
      ...saving,
      id: Date.now().toString()
    };
    setSavings(prev => [...prev, newSaving]);
  }, []);

  const updateSavings = useCallback((id: string, updates: Partial<Savings>) => {
    setSavings(prev => prev.map(saving => 
      saving.id === id ? { ...saving, ...updates } : saving
    ));
  }, []);

  const deleteSavings = useCallback((id: string) => {
    setSavings(prev => prev.filter(saving => saving.id !== id));
  }, []);

  // Use live exchange rates from service
  const { rates } = useExchangeRates();

  const convertToRSD = useCallback((amount: number, currency: "USD" | "EUR" | "RSD") => {
    if (currency === "RSD") return amount;
    // Multiply by rate since rates represent how many RSD = 1 foreign currency
    return amount * (rates[currency] || 1);
  }, [rates]);

  const getTotalBalance = useCallback(() => {
    const balances = { USD: 0, EUR: 0, RSD: 0 };
    
    incomes.forEach(income => {
      balances[income.currency] += income.amount;
    });
    
    expenses.forEach(expense => {
      balances[expense.currency] -= expense.amount;
    });
    
    return balances;
  }, [incomes, expenses]);

  const getTotalInRSD = useCallback(() => {
    const totalIncomeRSD = incomes.reduce((sum, income) => 
      sum + convertToRSD(income.amount, income.currency), 0);
    const totalExpenseRSD = expenses.reduce((sum, expense) => 
      sum + convertToRSD(expense.amount, expense.currency), 0);
    
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
    convertToRSD
  };
};
