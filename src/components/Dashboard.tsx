
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Users, Receipt, DollarSign, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Income, Expense } from "@/types";
import MonthlyExpenseChart from "@/components/MonthlyExpenseChart";
import { TimeRangeFilter, TimeRange } from "@/components/TimeRangeFilter";
import { ExportButton } from "@/components/ExportButton";
import { useExchangeRates } from "@/hooks/useExchangeRates";
import { format } from "date-fns";

interface DashboardProps {
  incomes: Income[];
  expenses: Expense[];
  rsdTotals: { income: number; expense: number; balance: number };
  activeClients: number;
}

const Dashboard = ({ incomes, expenses, rsdTotals, activeClients }: DashboardProps) => {
  const [recentTransactionsPage, setRecentTransactionsPage] = useState(1);
  const [timeRange, setTimeRange] = useState<TimeRange>({ from: undefined, to: undefined });
  const { lastUpdated, refetch, loading: ratesLoading } = useExchangeRates();
  const itemsPerPage = 10;

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
    <div className="space-y-6">
      {/* Controls Section */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <TimeRangeFilter 
          onRangeChange={setTimeRange}
          className="w-full lg:w-auto"
        />
        
        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
          <ExportButton 
            incomes={filteredData.incomes}
            expenses={filteredData.expenses}
          />
          
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            disabled={ratesLoading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${ratesLoading ? 'animate-spin' : ''}`} />
            Update Rates
          </Button>
        </div>
      </div>

      {/* Exchange Rate Status */}
      {lastUpdated && (
        <div className="text-sm text-gray-500 text-center lg:text-right">
          Exchange rates last updated: {format(lastUpdated, 'MMM dd, yyyy HH:mm')}
        </div>
      )}

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
        <Card className="border-0 shadow-sm ring-1 ring-gray-200">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-600 truncate">Total Income (RSD)</p>
                <p className="text-xl lg:text-2xl font-bold text-green-600 truncate">
                  {rsdTotals.income.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </p>
              </div>
              <div className="p-2 lg:p-3 bg-green-50 rounded-full flex-shrink-0">
                <TrendingUp className="h-5 w-5 lg:h-6 lg:w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm ring-1 ring-gray-200">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-600 truncate">Total Expenses (RSD)</p>
                <p className="text-xl lg:text-2xl font-bold text-red-600 truncate">
                  {rsdTotals.expense.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </p>
              </div>
              <div className="p-2 lg:p-3 bg-red-50 rounded-full flex-shrink-0">
                <Receipt className="h-5 w-5 lg:h-6 lg:w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm ring-1 ring-gray-200">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-600 truncate">Net Balance (RSD)</p>
                <p className={`text-xl lg:text-2xl font-bold truncate ${rsdTotals.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {rsdTotals.balance >= 0 ? '+' : ''}{rsdTotals.balance.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </p>
              </div>
              <div className={`p-2 lg:p-3 rounded-full flex-shrink-0 ${rsdTotals.balance >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                <DollarSign className={`h-5 w-5 lg:h-6 lg:w-6 ${rsdTotals.balance >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm ring-1 ring-gray-200">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-600 truncate">Active Clients</p>
                <p className="text-xl lg:text-2xl font-bold text-blue-600">{activeClients}</p>
              </div>
              <div className="p-2 lg:p-3 bg-blue-50 rounded-full flex-shrink-0">
                <Users className="h-5 w-5 lg:h-6 lg:w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
        <Card className="border-0 shadow-sm ring-1 ring-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900">Income vs Expenses</CardTitle>
            <p className="text-sm text-gray-600">Comparison by currency</p>
          </CardHeader>
          <CardContent className="pb-6">
            <div className="h-64 lg:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={currencyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="currency" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Bar dataKey="income" fill="#10b981" name="Income" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" fill="#ef4444" name="Expenses" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <MonthlyExpenseChart expenses={filteredData.expenses} />
      </div>

      {/* Recent Transactions */}
      <Card className="border-0 shadow-sm ring-1 ring-gray-200">
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
                    {transaction.type === 'income' ? '+' : '-'}{transaction.amount.toLocaleString()} {transaction.currency}
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
    </div>
  );
};

export default Dashboard;
