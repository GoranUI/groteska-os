import { useMemo } from "react";
import { Budget, Expense, Income } from "@/types";
import { useExchangeRates } from "@/hooks/useExchangeRates";

export const useFinancialAnalytics = (
  expenses: Expense[],
  incomes: Income[],
  budgets: Budget[]
) => {
  const { rates } = useExchangeRates();

  const convertToRSD = (amount: number, currency: "USD" | "EUR" | "RSD"): number => {
    if (currency === "RSD") return amount;
    if (currency === "USD") return amount * (rates.USD || 110);
    if (currency === "EUR") return amount * (rates.EUR || 117);
    return amount;
  };

  const analytics = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Get last 6 months of data
    const monthlyData = Array.from({ length: 6 }, (_, i) => {
      const date = new Date(currentYear, currentMonth - i, 1);
      const month = date.getMonth();
      const year = date.getFullYear();

      const monthExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === month && expenseDate.getFullYear() === year;
      });

      const monthIncomes = incomes.filter(income => {
        const incomeDate = new Date(income.date);
        return incomeDate.getMonth() === month && incomeDate.getFullYear() === year;
      });

      const totalExpenses = monthExpenses.reduce((sum, expense) => 
        sum + convertToRSD(expense.amount, expense.currency), 0
      );

      const totalIncome = monthIncomes.reduce((sum, income) => 
        sum + convertToRSD(income.amount, income.currency), 0
      );

      return {
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        expenses: totalExpenses,
        income: totalIncome,
        savings: totalIncome - totalExpenses,
        savingsRate: totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0
      };
    }).reverse();

    // Category analysis
    const categoryAnalysis = expenses.reduce((acc, expense) => {
      const amountRSD = convertToRSD(expense.amount, expense.currency);
      if (!acc[expense.category]) {
        acc[expense.category] = { total: 0, count: 0, average: 0 };
      }
      acc[expense.category].total += amountRSD;
      acc[expense.category].count += 1;
      acc[expense.category].average = acc[expense.category].total / acc[expense.category].count;
      return acc;
    }, {} as Record<string, { total: number; count: number; average: number }>);

    // Budget performance
    const currentMonthBudgets = budgets.filter(budget => 
      budget.month === currentMonth + 1 && budget.year === currentYear
    );

    const budgetPerformance = currentMonthBudgets.map(budget => {
      const spent = expenses
        .filter(expense => {
          const expenseDate = new Date(expense.date);
          return expense.category === budget.category &&
                 expenseDate.getMonth() === currentMonth &&
                 expenseDate.getFullYear() === currentYear;
        })
        .reduce((sum, expense) => sum + convertToRSD(expense.amount, expense.currency), 0);

      const budgetAmountRSD = convertToRSD(budget.amount, budget.currency);
      const percentage = budgetAmountRSD > 0 ? (spent / budgetAmountRSD) * 100 : 0;

      return {
        category: budget.category,
        budgeted: budgetAmountRSD,
        spent,
        remaining: budgetAmountRSD - spent,
        percentage,
        status: percentage >= 100 ? 'exceeded' : percentage >= 80 ? 'warning' : 'good'
      };
    });

    // Financial Health Score (0-100)
    const calculateHealthScore = () => {
      let score = 100;
      const currentMonthData = monthlyData[monthlyData.length - 1];

      // Savings rate impact (30% of score)
      if (currentMonthData.savingsRate < 0) score -= 30; // Negative savings
      else if (currentMonthData.savingsRate < 10) score -= 20;
      else if (currentMonthData.savingsRate < 20) score -= 10;
      else if (currentMonthData.savingsRate >= 30) score += 5;

      // Budget adherence impact (25% of score)
      const budgetViolations = budgetPerformance.filter(b => b.status === 'exceeded').length;
      const budgetWarnings = budgetPerformance.filter(b => b.status === 'warning').length;
      score -= (budgetViolations * 10) + (budgetWarnings * 5);

      // Income consistency (20% of score)
      const incomeVariability = monthlyData.slice(-3).reduce((acc, month, i, arr) => {
        if (i === 0) return 0;
        const prev = arr[i - 1];
        return acc + Math.abs(month.income - prev.income) / prev.income;
      }, 0) / 2;
      if (incomeVariability > 0.3) score -= 15;
      else if (incomeVariability > 0.2) score -= 10;

      // Expense growth trend (15% of score)
      const expenseGrowth = monthlyData.slice(-3).reduce((acc, month, i, arr) => {
        if (i === 0) return 0;
        const prev = arr[i - 1];
        return acc + ((month.expenses - prev.expenses) / prev.expenses);
      }, 0) / 2;
      if (expenseGrowth > 0.1) score -= 10;

      // Emergency fund estimation (10% of score)
      const avgMonthlyExpenses = monthlyData.reduce((sum, m) => sum + m.expenses, 0) / monthlyData.length;
      const totalSavings = incomes
        .filter(income => income.category === 'savings')
        .reduce((sum, income) => sum + convertToRSD(income.amount, income.currency), 0);
      const emergencyFundMonths = totalSavings / avgMonthlyExpenses;
      if (emergencyFundMonths < 1) score -= 10;
      else if (emergencyFundMonths < 3) score -= 5;
      else if (emergencyFundMonths >= 6) score += 5;

      return Math.max(0, Math.min(100, Math.round(score)));
    };

    // Spending patterns and insights
    const spendingPatterns = {
      mostExpensiveCategory: Object.entries(categoryAnalysis)
        .sort(([,a], [,b]) => b.total - a.total)[0],
      mostFrequentCategory: Object.entries(categoryAnalysis)
        .sort(([,a], [,b]) => b.count - a.count)[0],
      averageTransactionSize: expenses.length > 0 
        ? expenses.reduce((sum, e) => sum + convertToRSD(e.amount, e.currency), 0) / expenses.length 
        : 0,
      weekdayVsWeekend: calculateWeekdayWeekendSpending(),
      seasonalTrends: calculateSeasonalTrends()
    };

    function calculateWeekdayWeekendSpending() {
      const weekdaySpending = expenses
        .filter(expense => {
          const day = new Date(expense.date).getDay();
          return day >= 1 && day <= 5; // Monday to Friday
        })
        .reduce((sum, expense) => sum + convertToRSD(expense.amount, expense.currency), 0);

      const weekendSpending = expenses
        .filter(expense => {
          const day = new Date(expense.date).getDay();
          return day === 0 || day === 6; // Saturday and Sunday
        })
        .reduce((sum, expense) => sum + convertToRSD(expense.amount, expense.currency), 0);

      return { weekday: weekdaySpending, weekend: weekendSpending };
    }

    function calculateSeasonalTrends() {
      const seasons = {
        spring: [2, 3, 4], // Mar, Apr, May
        summer: [5, 6, 7], // Jun, Jul, Aug
        autumn: [8, 9, 10], // Sep, Oct, Nov
        winter: [11, 0, 1]  // Dec, Jan, Feb
      };

      return Object.entries(seasons).map(([season, months]) => {
        const seasonalExpenses = expenses
          .filter(expense => months.includes(new Date(expense.date).getMonth()))
          .reduce((sum, expense) => sum + convertToRSD(expense.amount, expense.currency), 0);

        return { season, amount: seasonalExpenses };
      });
    }

    // Predictions and recommendations
    const predictions = {
      nextMonthBudgetRisk: calculateBudgetRisk(),
      savingsProjection: calculateSavingsProjection(),
      expenseForecasts: calculateExpenseForecasts()
    };

    function calculateBudgetRisk() {
      const currentTrend = monthlyData.slice(-2);
      if (currentTrend.length < 2) return 'unknown';
      
      const expenseGrowth = (currentTrend[1].expenses - currentTrend[0].expenses) / currentTrend[0].expenses;
      if (expenseGrowth > 0.15) return 'high';
      if (expenseGrowth > 0.05) return 'medium';
      return 'low';
    }

    function calculateSavingsProjection() {
      const avgSavingsRate = monthlyData.reduce((sum, m) => sum + m.savingsRate, 0) / monthlyData.length;
      const avgIncome = monthlyData.reduce((sum, m) => sum + m.income, 0) / monthlyData.length;
      return {
        monthlyProjection: (avgIncome * avgSavingsRate) / 100,
        yearlyProjection: ((avgIncome * avgSavingsRate) / 100) * 12
      };
    }

    function calculateExpenseForecasts() {
      return Object.entries(categoryAnalysis).map(([category, data]) => {
        const recentTrend = expenses
          .filter(e => e.category === category)
          .slice(-10)
          .reduce((sum, e) => sum + convertToRSD(e.amount, e.currency), 0) / 10;

        return {
          category,
          currentAverage: data.average,
          projectedNext: recentTrend,
          trend: recentTrend > data.average ? 'increasing' : 'decreasing'
        };
      });
    }

    return {
      monthlyData,
      categoryAnalysis,
      budgetPerformance,
      healthScore: calculateHealthScore(),
      spendingPatterns,
      predictions,
      summary: {
        totalExpenses: monthlyData[monthlyData.length - 1]?.expenses || 0,
        totalIncome: monthlyData[monthlyData.length - 1]?.income || 0,
        savingsRate: monthlyData[monthlyData.length - 1]?.savingsRate || 0,
        budgetUtilization: budgetPerformance.length > 0 
          ? budgetPerformance.reduce((sum, b) => sum + b.percentage, 0) / budgetPerformance.length 
          : 0
      }
    };
  }, [expenses, incomes, budgets, rates]);

  return analytics;
};