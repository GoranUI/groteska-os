
import { useCallback } from 'react';
import { Income, Expense } from '@/types';
import { useExchangeRates } from '@/hooks/useExchangeRates';

export const useFinancialCalculations = () => {
  const { rates } = useExchangeRates();

  const convertToRSD = useCallback((amount: number, currency: "USD" | "EUR" | "RSD") => {
    if (currency === "RSD") return amount;
    // Since rates represent how many RSD = 1 foreign currency, multiply to convert
    return amount * rates[currency];
  }, [rates]);

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
    exchangeRates: rates,
  };
};
