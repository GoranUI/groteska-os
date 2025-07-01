
import { useCallback } from 'react';
import { Income, Expense } from '@/types';

export const useFinancialCalculations = () => {
  const exchangeRates = { USD: 1, EUR: 1.1, RSD: 0.009 };

  const convertToRSD = useCallback((amount: number, currency: "USD" | "EUR" | "RSD") => {
    if (currency === "RSD") return amount;
    return amount / exchangeRates[currency];
  }, []);

  const getTotalBalance = useCallback((incomes: Income[], expenses: Expense[]) => {
    const balances = { USD: 0, EUR: 0, RSD: 0 };
    
    incomes.forEach(income => {
      balances[income.currency] += Number(income.amount);
    });
    
    expenses.forEach(expense => {
      balances[expense.currency] -= Number(expense.amount);
    });
    
    return balances;
  }, []);

  const getTotalInRSD = useCallback((incomes: Income[], expenses: Expense[]) => {
    const totalIncomeRSD = incomes.reduce((sum, income) => 
      sum + convertToRSD(Number(income.amount), income.currency), 0);
    const totalExpenseRSD = expenses.reduce((sum, expense) => 
      sum + convertToRSD(Number(expense.amount), expense.currency), 0);
    
    return { income: totalIncomeRSD, expense: totalExpenseRSD, balance: totalIncomeRSD - totalExpenseRSD };
  }, [convertToRSD]);

  return {
    convertToRSD,
    getTotalBalance,
    getTotalInRSD,
  };
};
