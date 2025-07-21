
import { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Users, Receipt, DollarSign, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Income, Expense, Project, SubTask } from "@/types";
import MonthlyExpenseChart from "@/components/MonthlyExpenseChart";
import { FinancialOverviewCards } from "@/components/FinancialOverviewCards";
import { BalanceTrendChart } from "@/components/BalanceTrendChart";
import { CashFlowSankey } from "@/components/CashFlowSankey";
import { EnhancedActivityFeed } from "@/components/EnhancedActivityFeed";

import { ExportButton } from "@/components/ExportButton";
import { useExchangeRates } from "@/hooks/useExchangeRates";
import { format } from "date-fns";
import { ExpenseForm } from "@/components/ExpenseForm";
import { IncomeForm } from "@/components/IncomeForm";
import { SavingsForm } from "@/components/SavingsForm";
import { ExpenseTable } from "@/components/ExpenseTable";

interface DashboardProps {
  totalBalance: number;
  totalInRSD: number;
  exchangeRates: {
    USD: number;
    EUR: number;
  };
  clients: any[];
  expenses: any[];
  incomes: any[];
  savings: any[];
  projects: Project[];
  subTasks: SubTask[];
  addIncome: (data: any) => void;
  addExpense: (data: any) => void;
  addSavings: (data: any) => void;
  updateIncome: (id: string, data: any) => void;
  updateExpense: (id: string, data: any) => void;
  updateSavings: (id: string, data: any) => void;
  deleteIncome: (id: string) => void;
  deleteExpense: (id: string) => void;
  deleteSavings: (id: string) => void;
}

export const Dashboard = ({
  totalBalance,
  totalInRSD,
  exchangeRates,
  clients,
  expenses,
  incomes,
  savings,
  projects,
  subTasks,
  addIncome,
  addExpense,
  addSavings,
  updateIncome,
  updateExpense,
  updateSavings,
  deleteIncome,
  deleteExpense,
  deleteSavings,
}: DashboardProps) => {
  const [recentTransactionsPage, setRecentTransactionsPage] = useState(1);
  const [timeRange, setTimeRange] = useState<{ from?: Date; to?: Date }>({ from: undefined, to: undefined });
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showSavingsForm, setShowSavingsForm] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);
  const [editingSavings, setEditingSavings] = useState(null);
  
  const { lastUpdated, refetch, forceRefresh, loading: ratesLoading, error: ratesError, rates } = useExchangeRates();
  const itemsPerPage = 10;

  // Daily rate limiting functionality
  const canUpdateRates = useCallback(() => {
    if (!lastUpdated) return true;
    const today = new Date();
    const lastUpdateDate = new Date(lastUpdated);
    return today.toDateString() !== lastUpdateDate.toDateString();
  }, [lastUpdated]);

  const handleUpdateRates = useCallback(() => {
    if (canUpdateRates()) {
      forceRefresh();
    } else {
      console.log('Exchange rates already updated today');
    }
  }, [canUpdateRates, forceRefresh]);

  // Filter data based on time range
  const filteredData = useMemo(() => {
    if (!timeRange.from && !timeRange.to) {
      return { incomes, expenses };
    }

    const filterByDate = (items: any[]) => {
      return items.filter(item => {
        const itemDate = new Date(item.date);
        if (timeRange.from && itemDate < timeRange.from) return false;
        if (timeRange.to && itemDate > timeRange.to) return false;
        return true;
      });
    };

    return {
      incomes: filterByDate(incomes),
      expenses: filterByDate(expenses)
    };
  }, [incomes, expenses, timeRange]);

  // Calculate filtered totals for responsive metrics
  const filteredTotals = useMemo(() => {
    const totalIncomeRSD = filteredData.incomes.reduce((sum, income) => {
      const rate = income.currency === "RSD" ? 1 : rates[income.currency as keyof typeof rates] || 1;
      return sum + (Number(income.amount) * rate);
    }, 0);
    
    const totalExpenseRSD = filteredData.expenses.reduce((sum, expense) => {
      const rate = expense.currency === "RSD" ? 1 : rates[expense.currency as keyof typeof rates] || 1;
      return sum + (Number(expense.amount) * rate);
    }, 0);
    
    return { 
      income: totalIncomeRSD, 
      expense: totalExpenseRSD,
      balance: totalIncomeRSD - totalExpenseRSD
    };
  }, [filteredData, rates]);

  // Calculate totals by currency for filtered data
  const totalIncomeByCurrency = filteredData.incomes.reduce((acc, income) => {
    acc[income.currency] = (acc[income.currency] || 0) + income.amount;
    return acc;
  }, {} as Record<string, number>);

  const totalExpenseByCurrency = filteredData.expenses.reduce((acc, expense) => {
    acc[expense.currency] = (acc[expense.currency] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  // Prepare chart data for income vs expenses
  const currencyData = ['USD', 'EUR', 'RSD'].map(currency => ({
    currency,
    income: totalIncomeByCurrency[currency] || 0,
    expenses: totalExpenseByCurrency[currency] || 0,
  })).filter(data => data.income > 0 || data.expenses > 0);

  // Recent transactions with pagination
  const allTransactions = [
    ...filteredData.incomes.map(i => ({ ...i, type: 'income' as const })),
    ...filteredData.expenses.map(e => ({ ...e, type: 'expense' as const }))
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalTransactionPages = Math.ceil(allTransactions.length / itemsPerPage);
  const startIndex = (recentTransactionsPage - 1) * itemsPerPage;
  const paginatedTransactions = allTransactions.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-12 px-4 md:px-6">
        {/* Controls Section */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-6">
          <div className="text-sm text-gray-500 mb-4">
            Time range filtering removed
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
            <ExportButton 
              incomes={filteredData.incomes}
              expenses={filteredData.expenses}
            />
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleUpdateRates}
              disabled={ratesLoading || !canUpdateRates()}
              className="gap-2"
              title={!canUpdateRates() ? "Exchange rates already updated today" : "Update exchange rates"}
            >
              <RefreshCw className={`h-4 w-4 ${ratesLoading ? 'animate-spin' : ''}`} />
              {!canUpdateRates() ? 'Rates Updated Today' : 'Update Rates'}
            </Button>
          </div>
        </div>

        {/* Exchange Rate Status */}
        {lastUpdated && (
          <div className="text-sm text-gray-500 text-center lg:text-right mb-6">
            Exchange rates last updated: {format(lastUpdated, 'MMM dd, yyyy HH:mm')}
          </div>
        )}

        {/* Enhanced Overview Cards */}
        <FinancialOverviewCards
          totalBalance={totalBalance}
          cashAmount={filteredTotals.income}
          savingsAmount={savings.reduce((sum, saving) => {
            const rate = saving.currency === "RSD" ? 1 : rates[saving.currency as keyof typeof rates] || 1;
            const amount = Number(saving.amount) * rate;
            return saving.type === 'deposit' ? sum + amount : sum - amount;
          }, 0)}
          investmentsAmount={0} // You can add investments data later
          historicalData={[]} // We'll calculate this from transaction history
        />

        {/* Enhanced Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8 mb-8">
          {/* Balance Trend Chart */}
          <BalanceTrendChart
            incomes={filteredData.incomes}
            expenses={filteredData.expenses}
            savings={savings}
            exchangeRates={rates}
          />

          {/* Cash Flow Sankey */}
          <CashFlowSankey
            incomes={filteredData.incomes}
            expenses={filteredData.expenses}
            savings={savings}
            exchangeRates={rates}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Enhanced Activity Feed */}
          <EnhancedActivityFeed
            transactions={allTransactions as any}
            exchangeRates={rates}
          />

          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Recent Income
                </CardTitle>
                <Button size="sm" onClick={() => setShowIncomeForm(true)}>
                  Add Income
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {incomes.slice(0, 5).map((income) => (
                    <div key={income.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">{income.client}</p>
                        <p className="text-sm text-muted-foreground">{income.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">{income.amount} {income.currency}</p>
                        <p className="text-sm text-muted-foreground">{income.category}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Savings Overview
                </CardTitle>
                <Button size="sm" onClick={() => setShowSavingsForm(true)}>
                  Add Savings
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {savings.slice(0, 5).map((saving) => (
                    <div key={saving.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">{saving.description}</p>
                        <p className="text-sm text-muted-foreground">{saving.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-blue-600">{saving.amount} {saving.currency}</p>
                        <p className="text-sm text-muted-foreground">{saving.type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Expenses Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">
              Recent Expenses
            </CardTitle>
            <Button size="sm" onClick={() => setShowExpenseForm(true)}>
              Add Expense
            </Button>
          </CardHeader>
          <CardContent>
            <ExpenseTable
              expenses={expenses.slice(0, 10)}
              onEdit={setEditingExpense}
              onDelete={deleteExpense}
            />
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="bg-white shadow-md rounded-lg overflow-hidden mt-6">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">Recent Transactions</CardTitle>
                <p className="text-sm text-gray-600">
                  Latest income and expense entries
                  {(timeRange.from || timeRange.to) && ' (filtered)'}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRecentTransactionsPage(Math.max(1, recentTransactionsPage - 1))}
                  disabled={recentTransactionsPage === 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-600 hidden sm:inline">
                  {recentTransactionsPage} of {totalTransactionPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRecentTransactionsPage(Math.min(totalTransactionPages, recentTransactionsPage + 1))}
                  disabled={recentTransactionsPage === totalTransactionPages}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-6">
            <div className="space-y-3 lg:space-y-4">
              {paginatedTransactions.map((transaction) => (
                <div 
                  key={`${transaction.type}-${transaction.id}`} 
                  className="flex items-center justify-between p-3 lg:p-4 bg-gray-50 rounded-xl border border-gray-100"
                >
                  <div className="flex items-center space-x-3 lg:space-x-4 min-w-0 flex-1">
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${transaction.type === 'income' ? 'bg-green-500' : 'bg-red-500'}`} />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 truncate">
                        {'client' in transaction ? transaction.client : transaction.description}
                      </p>
                      <p className="text-sm text-gray-500">{new Date(transaction.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.amount.toLocaleString()} {transaction.currency}
                    </p>
                    <p className="text-sm text-gray-500 hidden sm:block">
                      {'category' in transaction && transaction.category}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Forms */}
        {showIncomeForm && (
          <IncomeForm
            clients={clients}
            onSubmit={(data) => {
              addIncome(data);
              setShowIncomeForm(false);
            }}
            onCancel={() => setShowIncomeForm(false)}
          />
        )}

        {showExpenseForm && (
          <ExpenseForm
            onSubmit={(data) => {
              addExpense(data);
              setShowExpenseForm(false);
            }}
            onCancel={() => setShowExpenseForm(false)}
          />
        )}

        {showSavingsForm && (
          <SavingsForm
            onSubmit={(data) => {
              addSavings(data);
              setShowSavingsForm(false);
            }}
            onCancel={() => setShowSavingsForm(false)}
          />
        )}
      </div>
    </div>
  );
};
