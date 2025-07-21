import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Trash2, Target, TrendingUp, AlertTriangle } from "lucide-react";
import { Budget, Expense } from "@/types";
import { useExchangeRates } from "@/hooks/useExchangeRates";

interface BudgetTrackerProps {
  budgets: Budget[];
  expenses: Expense[];
  onEditBudget: (budget: Budget) => void;
  onDeleteBudget: (id: string) => void;
  selectedMonth?: number;
  selectedYear?: number;
  onMonthChange?: (month: number) => void;
  onYearChange?: (year: number) => void;
}

export const BudgetTracker = ({ 
  budgets, 
  expenses, 
  onEditBudget, 
  onDeleteBudget,
  selectedMonth = new Date().getMonth() + 1,
  selectedYear = new Date().getFullYear(),
  onMonthChange,
  onYearChange
}: BudgetTrackerProps) => {
  const { rates } = useExchangeRates();

  const convertToRSD = (amount: number, currency: "USD" | "EUR" | "RSD"): number => {
    if (currency === "RSD") return amount;
    if (currency === "USD") return amount * (rates.USD || 110);
    if (currency === "EUR") return amount * (rates.EUR || 117);
    return amount;
  };

  const getSpentAmount = (category: string, month: number, year: number): number => {
    const categoryExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expense.category === category &&
             expenseDate.getMonth() + 1 === month &&
             expenseDate.getFullYear() === year;
    });

    return categoryExpenses.reduce((total, expense) => {
      return total + convertToRSD(expense.amount, expense.currency);
    }, 0);
  };

  const getBudgetStatus = (spent: number, budget: number) => {
    const percentage = (spent / budget) * 100;
    if (percentage >= 100) return { status: "exceeded", color: "bg-red-500", textColor: "text-red-600" };
    if (percentage >= 80) return { status: "warning", color: "bg-yellow-500", textColor: "text-yellow-600" };
    return { status: "good", color: "bg-green-500", textColor: "text-green-600" };
  };

  const monthlyBudgets = budgets.filter(budget => 
    budget.month === selectedMonth && budget.year === selectedYear
  );

  const totalBudget = monthlyBudgets.reduce((total, budget) => {
    return total + convertToRSD(budget.amount, budget.currency);
  }, 0);

  const totalSpent = monthlyBudgets.reduce((total, budget) => {
    return total + getSpentAmount(budget.category, selectedMonth, selectedYear);
  }, 0);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear + i - 2);

  return (
    <div className="space-y-6">
      {/* Header with Period Selection */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Budget Tracker</h2>
          <p className="text-gray-600">Monitor your spending against budget limits</p>
        </div>
        
        <div className="flex gap-2">
          <Select value={selectedMonth.toString()} onValueChange={(value) => onMonthChange?.(parseInt(value))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {monthNames.map((month, index) => (
                <SelectItem key={index + 1} value={(index + 1).toString()}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedYear.toString()} onValueChange={(value) => onYearChange?.(parseInt(value))}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Overall Budget Summary */}
      {monthlyBudgets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              {monthNames[selectedMonth - 1]} {selectedYear} Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Budget</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {totalBudget.toLocaleString()} RSD
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Spent</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {totalSpent.toLocaleString()} RSD
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Remaining</p>
                <p className={`text-2xl font-semibold ${totalSpent > totalBudget ? 'text-red-600' : 'text-green-600'}`}>
                  {(totalBudget - totalSpent).toLocaleString()} RSD
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Progress</span>
                <span>{totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0}%</span>
              </div>
              <Progress 
                value={totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0} 
                className="h-3"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Budget Cards */}
      {monthlyBudgets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {monthlyBudgets.map((budget) => {
            const spentAmount = getSpentAmount(budget.category, selectedMonth, selectedYear);
            const budgetAmountRSD = convertToRSD(budget.amount, budget.currency);
            const { status, color, textColor } = getBudgetStatus(spentAmount, budgetAmountRSD);
            const percentage = budgetAmountRSD > 0 ? Math.min((spentAmount / budgetAmountRSD) * 100, 100) : 0;

            return (
              <Card key={budget.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-medium">
                      {budget.category}
                    </CardTitle>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditBudget(budget)}
                        className="h-8 w-8 p-0"
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteBudget(budget.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant={status === "exceeded" ? "destructive" : status === "warning" ? "secondary" : "default"}>
                      {status === "exceeded" ? (
                        <AlertTriangle className="h-3 w-3 mr-1" />
                      ) : status === "warning" ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : (
                        <Target className="h-3 w-3 mr-1" />
                      )}
                      {status === "exceeded" ? "Over Budget" : status === "warning" ? "Close to Limit" : "On Track"}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Spent</span>
                    <span className={`font-medium ${textColor}`}>
                      {spentAmount.toLocaleString()} RSD
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Budget</span>
                    <span className="font-medium">
                      {budgetAmountRSD.toLocaleString()} RSD
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Progress</span>
                      <span>{Math.round(percentage)}%</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                  
                  <div className="text-right">
                    <span className={`text-sm font-medium ${spentAmount > budgetAmountRSD ? 'text-red-600' : 'text-green-600'}`}>
                      {spentAmount > budgetAmountRSD ? '+' : ''}{(spentAmount - budgetAmountRSD).toLocaleString()} RSD
                    </span>
                    <p className="text-xs text-gray-500">
                      {spentAmount > budgetAmountRSD ? 'over budget' : 'remaining'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Budgets Set</h3>
            <p className="text-gray-600 mb-4">
              Set monthly budget limits for {monthNames[selectedMonth - 1]} {selectedYear} to start tracking your spending.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};