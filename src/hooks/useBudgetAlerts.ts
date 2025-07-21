import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Budget, Expense } from "@/types";
import { useExchangeRates } from "@/hooks/useExchangeRates";

interface BudgetAlert {
  category: string;
  spent: number;
  budget: number;
  percentage: number;
  status: "warning" | "exceeded" | "critical";
}

export const useBudgetAlerts = (budgets: Budget[], expenses: Expense[]) => {
  const { toast } = useToast();
  const { rates } = useExchangeRates();

  const convertToRSD = (amount: number, currency: "USD" | "EUR" | "RSD"): number => {
    if (currency === "RSD") return amount;
    if (currency === "USD") return amount * (rates.USD || 110);
    if (currency === "EUR") return amount * (rates.EUR || 117);
    return amount;
  };

  const getCurrentMonthExpenses = (category: string): number => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    return expenses
      .filter(expense => {
        const expenseDate = new Date(expense.date);
        return expense.category === category &&
               expenseDate.getMonth() + 1 === currentMonth &&
               expenseDate.getFullYear() === currentYear;
      })
      .reduce((total, expense) => total + convertToRSD(expense.amount, expense.currency), 0);
  };

  const checkBudgetAlerts = (): BudgetAlert[] => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const currentBudgets = budgets.filter(budget => 
      budget.month === currentMonth && budget.year === currentYear
    );

    const alerts: BudgetAlert[] = [];

    currentBudgets.forEach(budget => {
      const spent = getCurrentMonthExpenses(budget.category);
      const budgetAmountRSD = convertToRSD(budget.amount, budget.currency);
      const percentage = budgetAmountRSD > 0 ? (spent / budgetAmountRSD) * 100 : 0;

      if (percentage >= 100) {
        alerts.push({
          category: budget.category,
          spent,
          budget: budgetAmountRSD,
          percentage,
          status: "exceeded"
        });
      } else if (percentage >= 90) {
        alerts.push({
          category: budget.category,
          spent,
          budget: budgetAmountRSD,
          percentage,
          status: "critical"
        });
      } else if (percentage >= 75) {
        alerts.push({
          category: budget.category,
          spent,
          budget: budgetAmountRSD,
          percentage,
          status: "warning"
        });
      }
    });

    return alerts;
  };

  const showBudgetAlert = (alert: BudgetAlert) => {
    const remaining = alert.budget - alert.spent;
    
    if (alert.status === "exceeded") {
      toast({
        title: "🚨 Budget Exceeded!",
        description: `${alert.category}: ${alert.spent.toLocaleString()} RSD spent (${Math.round(alert.percentage)}% of budget). Over by ${Math.abs(remaining).toLocaleString()} RSD.`,
        variant: "destructive",
      });
    } else if (alert.status === "critical") {
      toast({
        title: "⚠️ Budget Alert - Critical",
        description: `${alert.category}: ${Math.round(alert.percentage)}% of budget used. Only ${remaining.toLocaleString()} RSD remaining.`,
        variant: "destructive",
      });
    } else if (alert.status === "warning") {
      toast({
        title: "📊 Budget Alert - Warning",
        description: `${alert.category}: ${Math.round(alert.percentage)}% of budget used. ${remaining.toLocaleString()} RSD remaining.`,
      });
    }
  };

  const triggerBudgetAlerts = () => {
    const alerts = checkBudgetAlerts();
    
    // Show alerts for critical and exceeded budgets
    alerts
      .filter(alert => alert.status === "exceeded" || alert.status === "critical")
      .forEach(showBudgetAlert);
  };

  const checkNewExpenseAlert = (newExpense: Expense) => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const relevantBudget = budgets.find(budget => 
      budget.category === newExpense.category &&
      budget.month === currentMonth &&
      budget.year === currentYear
    );

    if (!relevantBudget) return;

    const currentSpent = getCurrentMonthExpenses(newExpense.category);
    const newSpent = currentSpent + convertToRSD(newExpense.amount, newExpense.currency);
    const budgetAmountRSD = convertToRSD(relevantBudget.amount, relevantBudget.currency);
    const newPercentage = (newSpent / budgetAmountRSD) * 100;

    // Check if this expense pushes us into a new alert threshold
    const currentPercentage = (currentSpent / budgetAmountRSD) * 100;
    
    if (newPercentage >= 100 && currentPercentage < 100) {
      showBudgetAlert({
        category: newExpense.category,
        spent: newSpent,
        budget: budgetAmountRSD,
        percentage: newPercentage,
        status: "exceeded"
      });
    } else if (newPercentage >= 90 && currentPercentage < 90) {
      showBudgetAlert({
        category: newExpense.category,
        spent: newSpent,
        budget: budgetAmountRSD,
        percentage: newPercentage,
        status: "critical"
      });
    } else if (newPercentage >= 75 && currentPercentage < 75) {
      showBudgetAlert({
        category: newExpense.category,
        spent: newSpent,
        budget: budgetAmountRSD,
        percentage: newPercentage,
        status: "warning"
      });
    }
  };

  return {
    checkBudgetAlerts,
    triggerBudgetAlerts,
    checkNewExpenseAlert,
    showBudgetAlert,
  };
};