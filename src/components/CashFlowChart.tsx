import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, parseISO, isWithinInterval, subDays, subWeeks } from 'date-fns';
import { cn } from '@/lib/utils';

interface CashFlowData {
  date: string;
  moneyIn: number;
  moneyOut: number;
  net: number;
}

interface CashFlowChartProps {
  data: CashFlowData[];
  period: {
    type: '7d' | '30d' | 'QTD' | 'YTD' | 'custom';
    from?: string;
    to?: string;
  };
  className?: string;
}

export const CashFlowChart = ({ data, period, className }: CashFlowChartProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sr-RS', {
      style: 'currency',
      currency: 'RSD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('sr-RS', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getGroupedData = () => {
    if (!data || data.length === 0) return [];

    // Determine if we should group by day or week
    const shouldGroupByWeek = period.type === 'QTD' || period.type === 'YTD' || 
      (period.type === 'custom' && period.from && period.to && 
       Math.floor((new Date(period.to).getTime() - new Date(period.from).getTime()) / (1000 * 60 * 60 * 24)) > 31);

    if (shouldGroupByWeek) {
      // Group by week
      const weeklyData: { [key: string]: CashFlowData } = {};
      
      data.forEach(item => {
        const date = parseISO(item.date);
        const weekStart = subWeeks(date, Math.floor((new Date().getTime() - date.getTime()) / (7 * 24 * 60 * 60 * 1000)));
        const weekKey = format(weekStart, 'yyyy-MM-dd');
        
        if (!weeklyData[weekKey]) {
          weeklyData[weekKey] = {
            date: weekKey,
            moneyIn: 0,
            moneyOut: 0,
            net: 0
          };
        }
        
        weeklyData[weekKey].moneyIn += item.moneyIn;
        weeklyData[weekKey].moneyOut += item.moneyOut;
        weeklyData[weekKey].net += item.net;
      });
      
      return Object.values(weeklyData).sort((a, b) => a.date.localeCompare(b.date));
    } else {
      // Group by day
      return data.sort((a, b) => a.date.localeCompare(b.date));
    }
  };

  const chartData = getGroupedData();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">
            {format(parseISO(label), 'MMM dd, yyyy')}
          </p>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Money In: {formatCurrency(data.moneyIn)}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>Money Out: {formatCurrency(data.moneyOut)}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Net: {formatCurrency(data.net)}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Cash Flow Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No cash flow data available</p>
            <p className="text-sm">Data will appear when transactions are recorded</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('transition-all duration-200 hover:shadow-md', className)}>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Cash Flow Chart</CardTitle>
        <p className="text-xs text-muted-foreground">
          {period.type === 'QTD' || period.type === 'YTD' || 
           (period.type === 'custom' && period.from && period.to && 
            Math.floor((new Date(period.to).getTime() - new Date(period.from).getTime()) / (1000 * 60 * 60 * 24)) > 31)
            ? 'Grouped by week' : 'Grouped by day'}
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => format(parseISO(value), 'MMM dd')}
                className="text-xs"
              />
              <YAxis 
                tickFormatter={(value) => formatAmount(value)}
                className="text-xs"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone"
                dataKey="moneyIn" 
                name="Money In" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                className="hover:opacity-80 transition-opacity duration-200"
              />
              <Line 
                type="monotone"
                dataKey="moneyOut" 
                name="Money Out" 
                stroke="#ef4444" 
                strokeWidth={3}
                dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#ef4444', strokeWidth: 2 }}
                className="hover:opacity-80 transition-opacity duration-200"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
