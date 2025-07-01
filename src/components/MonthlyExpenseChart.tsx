
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Expense } from "@/types";
import { Calendar } from "lucide-react";

interface MonthlyExpenseChartProps {
  expenses: Expense[];
}

const MonthlyExpenseChart = ({ expenses }: MonthlyExpenseChartProps) => {
  // Get current month expenses
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const currentMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
  });

  // Group expenses by category
  const expensesByCategory = currentMonthExpenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  // Prepare chart data
  const chartData = Object.entries(expensesByCategory)
    .map(([category, amount]) => ({
      category: category.length > 10 ? category.substring(0, 10) + '...' : category,
      fullCategory: category,
      amount: Number(amount.toFixed(2))
    }))
    .sort((a, b) => b.amount - a.amount);

  const currentMonthName = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  if (chartData.length === 0) {
    return (
      <Card className="border-0 shadow-sm ring-1 ring-gray-200">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-orange-600" />
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                {currentMonthName} Expenses by Category
              </CardTitle>
              <p className="text-sm text-gray-600">No expenses recorded this month</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-6">
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>No expense data available for this month</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm ring-1 ring-gray-200">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-orange-600" />
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">
              {currentMonthName} Expenses by Category
            </CardTitle>
            <p className="text-sm text-gray-600">
              Total: {chartData.reduce((sum, item) => sum + item.amount, 0).toLocaleString()} 
              {currentMonthExpenses[0]?.currency || 'USD'}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-6">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis 
              dataKey="category"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
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
              formatter={(value, name, props) => [
                `${Number(value).toLocaleString()} ${currentMonthExpenses[0]?.currency || 'USD'}`,
                props?.payload?.fullCategory || name
              ]}
              labelFormatter={() => ''}
            />
            <Bar 
              dataKey="amount" 
              fill="#f97316" 
              name="Amount" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default MonthlyExpenseChart;
