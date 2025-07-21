import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { format, subMonths, startOfMonth } from "date-fns";
import { useMemo } from "react";

interface BalanceTrendChartProps {
  incomes: any[];
  expenses: any[];
  savings: any[];
  exchangeRates: { USD: number; EUR: number; };
}

export const BalanceTrendChart = ({ 
  incomes, 
  expenses, 
  savings, 
  exchangeRates 
}: BalanceTrendChartProps) => {
  const chartData = useMemo(() => {
    // Generate last 12 months of data
    const months = [];
    for (let i = 11; i >= 0; i--) {
      months.push(startOfMonth(subMonths(new Date(), i)));
    }

    return months.map(month => {
      const monthStr = format(month, 'yyyy-MM');
      
      // Filter transactions for this month
      const monthIncomes = incomes.filter(income => 
        income.date.startsWith(monthStr)
      );
      const monthExpenses = expenses.filter(expense => 
        expense.date.startsWith(monthStr)
      );
      const monthSavings = savings.filter(saving => 
        saving.date.startsWith(monthStr)
      );
      
      // Convert all to RSD and calculate totals
      const totalIncome = monthIncomes.reduce((sum, income) => {
        const rate = income.currency === "RSD" ? 1 : exchangeRates[income.currency as keyof typeof exchangeRates] || 1;
        return sum + (Number(income.amount) * rate);
      }, 0);
      
      const totalExpenses = monthExpenses.reduce((sum, expense) => {
        const rate = expense.currency === "RSD" ? 1 : exchangeRates[expense.currency as keyof typeof exchangeRates] || 1;
        return sum + (Number(expense.amount) * rate);
      }, 0);
      
      const totalSavingsDeposits = monthSavings
        .filter(saving => saving.type === 'deposit')
        .reduce((sum, saving) => {
          const rate = saving.currency === "RSD" ? 1 : exchangeRates[saving.currency as keyof typeof exchangeRates] || 1;
          return sum + (Number(saving.amount) * rate);
        }, 0);
      
      const totalSavingsWithdrawals = monthSavings
        .filter(saving => saving.type === 'withdrawal')
        .reduce((sum, saving) => {
          const rate = saving.currency === "RSD" ? 1 : exchangeRates[saving.currency as keyof typeof exchangeRates] || 1;
          return sum + (Number(saving.amount) * rate);
        }, 0);
      
      const netFlow = totalIncome - totalExpenses + totalSavingsDeposits - totalSavingsWithdrawals;
      
      return {
        month: format(month, 'MMM'),
        fullMonth: format(month, 'MMM yyyy'),
        income: totalIncome,
        expenses: totalExpenses,
        savings: totalSavingsDeposits - totalSavingsWithdrawals,
        netWorth: netFlow,
        cumulativeBalance: 0, // We'll calculate this in the next step
      };
    });
  }, [incomes, expenses, savings, exchangeRates]);

  // Calculate cumulative balance
  const chartDataWithCumulative = useMemo(() => {
    let runningBalance = 0;
    return chartData.map(month => {
      runningBalance += month.netWorth;
      return {
        ...month,
        cumulativeBalance: runningBalance,
      };
    });
  }, [chartData]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'RSD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground mb-2">{data.fullMonth}</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Income:</span>
              <span className="font-medium text-green-600">{formatCurrency(data.income)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Expenses:</span>
              <span className="font-medium text-red-600">-{formatCurrency(data.expenses)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Savings:</span>
              <span className="font-medium text-blue-600">{formatCurrency(data.savings)}</span>
            </div>
            <hr className="my-1 border-border" />
            <div className="flex justify-between gap-4">
              <span className="font-medium text-foreground">Net Worth:</span>
              <span className="font-bold text-foreground">{formatCurrency(data.cumulativeBalance)}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="col-span-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          Net Worth Trend
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Monthly balance progression over the last 12 months
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartDataWithCumulative}>
              <defs>
                <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickFormatter={formatCurrency}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="cumulativeBalance"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#balanceGradient)"
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2, fill: 'hsl(var(--background))' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};