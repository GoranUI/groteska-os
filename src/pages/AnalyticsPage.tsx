import { useState } from "react";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useBudgetData } from "@/hooks/data/useBudgetData";
import { useFinancialAnalytics } from "@/hooks/useFinancialAnalytics";
import { FinancialHealthScore } from "@/components/FinancialHealthScore";
import { SpendingInsights } from "@/components/SpendingInsights";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { Loader2, TrendingUp, PiggyBank, Target, BarChart3 } from "lucide-react";

const AnalyticsPage = () => {
  const { expenses, incomes, loading } = useSupabaseData();
  const { budgets } = useBudgetData();
  const analytics = useFinancialAnalytics(expenses, incomes, budgets);
  const [timeRange, setTimeRange] = useState<"3m" | "6m" | "1y">("6m");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 shadow-lg">
          <CardContent className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading your analytics data...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  const pieChartData = Object.entries(analytics.categoryAnalysis)
    .sort(([,a], [,b]) => b.total - a.total)
    .slice(0, 6)
    .map(([category, data]) => ({
      name: category,
      value: data.total,
      count: data.count
    }));

  const monthlyTrend = analytics.monthlyData.length >= 2 
    ? analytics.monthlyData[analytics.monthlyData.length - 1].expenses > analytics.monthlyData[analytics.monthlyData.length - 2].expenses
      ? 'increasing' 
      : 'decreasing'
    : 'stable';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto p-4 lg:p-8 space-y-8">
        {/* Enhanced Header */}
        <div className="text-center space-y-4 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-gradient-primary">
              Financial Analytics
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Deep insights into your spending patterns and financial health
          </p>
          <div className="flex justify-center">
            <Select value={timeRange} onValueChange={(value: "3m" | "6m" | "1y") => setTimeRange(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3m">3 Months</SelectItem>
                <SelectItem value="6m">6 Months</SelectItem>
                <SelectItem value="1y">1 Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Income</p>
                <p className="text-2xl font-bold text-green-600">
                  {analytics.summary.totalIncome.toLocaleString()} RSD
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Expenses</p>
                <p className="text-2xl font-bold text-red-600">
                  {analytics.summary.totalExpenses.toLocaleString()} RSD
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Savings Rate</p>
                <p className="text-2xl font-bold text-blue-600">
                  {analytics.summary.savingsRate.toFixed(1)}%
                </p>
              </div>
              <PiggyBank className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Budget Usage</p>
                <p className="text-2xl font-bold text-purple-600">
                  {analytics.summary.budgetUtilization.toFixed(0)}%
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="health">Health Score</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Cash Flow */}
            <Card>
              <CardHeader>
                <CardTitle>Cash Flow Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [`${value.toLocaleString()} RSD`, '']}
                    />
                    <Line type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2} name="Income" />
                    <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} name="Expenses" />
                    <Line type="monotone" dataKey="savings" stroke="#3B82F6" strokeWidth={2} name="Savings" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Expense Categories Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Expense Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`${value.toLocaleString()} RSD`, 'Amount']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Savings Rate Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Savings Rate Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => [`${value.toFixed(1)}%`, 'Savings Rate']}
                  />
                  <Bar dataKey="savingsRate" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="health">
          <FinancialHealthScore
            score={analytics.healthScore}
            savingsRate={analytics.summary.savingsRate}
            budgetPerformance={analytics.budgetPerformance.map(bp => ({
              category: bp.category,
              status: bp.status as 'good' | 'warning' | 'exceeded',
              percentage: bp.percentage
            }))}
            monthlyTrend={monthlyTrend}
          />
        </TabsContent>
        
        <TabsContent value="insights">
          <SpendingInsights
            categoryAnalysis={analytics.categoryAnalysis}
            spendingPatterns={analytics.spendingPatterns}
            predictions={{
              ...analytics.predictions,
              nextMonthBudgetRisk: analytics.predictions.nextMonthBudgetRisk as 'low' | 'medium' | 'high' | 'unknown',
              expenseForecasts: analytics.predictions.expenseForecasts.map(ef => ({
                ...ef,
                trend: ef.trend as 'increasing' | 'decreasing'
              }))
            }}
          />
        </TabsContent>
        
        <TabsContent value="trends" className="space-y-6">
          {/* Category Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Category Spending Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(analytics.categoryAnalysis)
                  .sort(([,a], [,b]) => b.total - a.total)
                  .slice(0, 8)
                  .map(([category, data]) => (
                    <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium">{category}</div>
                        <div className="text-sm text-gray-600">
                          {data.count} transactions • Avg: {data.average.toLocaleString()} RSD
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{data.total.toLocaleString()} RSD</div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Budget Performance */}
          {analytics.budgetPerformance.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Budget Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.budgetPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [`${value.toLocaleString()} RSD`, '']}
                    />
                    <Bar dataKey="budgeted" fill="#E5E7EB" name="Budgeted" />
                    <Bar dataKey="spent" fill="#3B82F6" name="Spent" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
};

export default AnalyticsPage;