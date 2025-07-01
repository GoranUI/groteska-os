import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, TrendingDown, Users, Calendar, Receipt, DollarSign } from "lucide-react";
import { Income, Expense } from "@/hooks/useFinancialData";

interface DashboardProps {
  incomes: Income[];
  expenses: Expense[];
  rsdTotals: { income: number; expense: number; balance: number };
  activeClients: number;
}

const COLORS = ['#f97316', '#fb923c', '#fdba74', '#fed7aa', '#ffedd5'];

const Dashboard = ({ incomes, expenses, rsdTotals, activeClients }: DashboardProps) => {
  // Calculate totals by currency
  const totalIncomeByCurrency = incomes.reduce((acc, income) => {
    acc[income.currency] = (acc[income.currency] || 0) + income.amount;
    return acc;
  }, {} as Record<string, number>);

  const totalExpenseByCurrency = expenses.reduce((acc, expense) => {
    acc[expense.currency] = (acc[expense.currency] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  // Prepare chart data
  const currencyData = ['USD', 'EUR', 'RSD'].map(currency => ({
    currency,
    income: totalIncomeByCurrency[currency] || 0,
    expenses: totalExpenseByCurrency[currency] || 0,
  }));

  // Expense breakdown
  const expenseCategories = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const expensePieData = Object.entries(expenseCategories).map(([category, amount]) => ({
    name: category,
    value: amount,
  }));

  // Recent transactions
  const recentTransactions = [
    ...incomes.map(i => ({ ...i, type: 'income' as const })),
    ...expenses.map(e => ({ ...e, type: 'expense' as const }))
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Overview of your financial performance</p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm ring-1 ring-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Income (RSD)</p>
                <p className="text-2xl font-bold text-green-600">
                  {rsdTotals.income.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm ring-1 ring-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Expenses (RSD)</p>
                <p className="text-2xl font-bold text-red-600">
                  {rsdTotals.expense.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </p>
              </div>
              <div className="p-3 bg-red-50 rounded-full">
                <Receipt className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm ring-1 ring-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Net Balance (RSD)</p>
                <p className={`text-2xl font-bold ${rsdTotals.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {rsdTotals.balance >= 0 ? '+' : ''}{rsdTotals.balance.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </p>
              </div>
              <div className={`p-3 rounded-full ${rsdTotals.balance >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                <DollarSign className={`h-6 w-6 ${rsdTotals.balance >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm ring-1 ring-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Clients</p>
                <p className="text-2xl font-bold text-blue-600">{activeClients}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <Card className="border-0 shadow-sm ring-1 ring-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900">Income vs Expenses</CardTitle>
            <p className="text-sm text-gray-600">Comparison by currency</p>
          </CardHeader>
          <CardContent className="pb-6">
            <ResponsiveContainer width="100%" height={320}>
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
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm ring-1 ring-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900">Expense Breakdown</CardTitle>
            <p className="text-sm text-gray-600">Distribution by category</p>
          </CardHeader>
          <CardContent className="pb-6">
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={expensePieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expensePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="border-0 shadow-sm ring-1 ring-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900">Recent Transactions</CardTitle>
          <p className="text-sm text-gray-600">Latest income and expense entries</p>
        </CardHeader>
        <CardContent className="pb-6">
          <div className="space-y-4">
            {recentTransactions.map((transaction) => (
              <div 
                key={`${transaction.type}-${transaction.id}`} 
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${transaction.type === 'income' ? 'bg-green-500' : 'bg-red-500'}`} />
                  <div>
                    <p className="font-medium text-gray-900">
                      {'client' in transaction ? transaction.client : transaction.description}
                    </p>
                    <p className="text-sm text-gray-500">{new Date(transaction.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.type === 'income' ? '+' : '-'}{transaction.amount.toLocaleString()} {transaction.currency}
                  </p>
                  <p className="text-sm text-gray-500">
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
