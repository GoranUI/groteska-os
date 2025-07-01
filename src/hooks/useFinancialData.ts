
import { useState, useCallback } from "react";

export interface Income {
  id: string;
  amount: number;
  currency: "USD" | "EUR" | "RSD";
  client: string;
  date: string;
  category: "full-time" | "one-time";
  description?: string;
}

export interface Expense {
  id: string;
  amount: number;
  currency: "USD" | "EUR" | "RSD";
  date: string;
  category: "Recurring" | "Food" | "Work Food" | "External Food" | "Transport" | "Holiday";
  description: string;
  isRecurring?: boolean;
  recurringFrequency?: "weekly" | "monthly" | "yearly";
}

export const useFinancialData = () => {
  const [incomes, setIncomes] = useState<Income[]>([
    {
      id: "1",
      amount: 5000,
      currency: "USD",
      client: "Tech Corp",
      date: "2024-07-01",
      category: "full-time",
      description: "Monthly salary"
    },
    {
      id: "2",
      amount: 800,
      currency: "EUR",
      client: "Design Studio",
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

  const addIncome = useCallback((income: Omit<Income, "id">) => {
    const newIncome: Income = {
      ...income,
      id: Date.now().toString()
    };
    setIncomes(prev => [...prev, newIncome]);
  }, []);

  const addExpense = useCallback((expense: Omit<Expense, "id">) => {
    const newExpense: Expense = {
      ...expense,
      id: Date.now().toString()
    };
    setExpenses(prev => [...prev, newExpense]);
  }, []);

  const getTotalBalance = useCallback(() => {
    const balances = { USD: 0, EUR: 0, RSD: 0 };
    
    // Add incomes
    incomes.forEach(income => {
      balances[income.currency] += income.amount;
    });
    
    // Subtract expenses
    expenses.forEach(expense => {
      balances[expense.currency] -= expense.amount;
    });
    
    return balances;
  }, [incomes, expenses]);

  const getIncomeByCategory = useCallback(() => {
    const fullTime = incomes.filter(i => i.category === "full-time").reduce((sum, i) => sum + i.amount, 0);
    const oneTime = incomes.filter(i => i.category === "one-time").reduce((sum, i) => sum + i.amount, 0);
    return { fullTime, oneTime };
  }, [incomes]);

  const getExpensesByCategory = useCallback(() => {
    const categories = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);
    return categories;
  }, [expenses]);

  return {
    incomes,
    expenses,
    addIncome,
    addExpense,
    getTotalBalance,
    getIncomeByCategory,
    getExpensesByCategory
  };
};
