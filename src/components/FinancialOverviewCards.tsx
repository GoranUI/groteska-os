import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet, PiggyBank, Building, DollarSign } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";

interface FinancialOverviewCardsProps {
  totalBalance: number;
  cashAmount: number;
  investmentsAmount: number;
  historicalData: Array<{ month: string; balance: number; }>;
}

export const FinancialOverviewCards = ({
  totalBalance,
  cashAmount,
  investmentsAmount,
  historicalData,
}: FinancialOverviewCardsProps) => {
  // Calculate percentage changes from previous period
  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  // Get previous period values (simplified for demo)
  const previousBalance = historicalData.length > 1 ? historicalData[historicalData.length - 2]?.balance || 0 : 0;
  const balanceChange = calculatePercentageChange(totalBalance, previousBalance);

  const cards = [
    {
      title: "Net Worth",
      value: totalBalance,
      change: balanceChange,
      icon: DollarSign,
      color: "hsl(var(--primary))",
      bgColor: "hsl(var(--primary) / 0.1)",
    },
    {
      title: "Cash",
      value: cashAmount,
      change: 2.4,
      icon: Wallet,
      color: "hsl(142 76% 36%)",
      bgColor: "hsl(142 76% 36% / 0.1)",
    },
    {
      title: "Investments",
      value: investmentsAmount,
      change: -1.2,
      icon: Building,
      color: "hsl(262 83% 58%)",
      bgColor: "hsl(262 83% 58% / 0.1)",
    },
  ];

  const generateSparklineData = (value: number) => {
    // Generate mock sparkline data based on value
    const points = 12;
    return Array.from({ length: points }, (_, i) => ({
      x: i,
      y: value * (0.8 + Math.random() * 0.4),
    }));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => {
        const Icon = card.icon;
        const isPositive = card.change >= 0;
        const sparklineData = generateSparklineData(card.value);
        
        return (
          <Card key={index} className="relative overflow-hidden transition-all duration-200 hover:shadow-lg border-0 bg-card">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="p-2 rounded-xl"
                    style={{ backgroundColor: card.bgColor }}
                  >
                    <Icon 
                      className="h-5 w-5" 
                      style={{ color: card.color }}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {card.title}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  {isPositive ? (
                    <TrendingUp className="h-3 w-3 text-green-600" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600" />
                  )}
                  <span className={isPositive ? "text-green-600" : "text-red-600"}>
                    {isPositive ? "+" : ""}{card.change.toFixed(1)}%
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-2xl font-bold text-foreground">
                  {card.value.toLocaleString('en-US', { 
                    style: 'currency', 
                    currency: 'RSD',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0 
                  })}
                </p>
                
                {/* Mini Sparkline */}
                <div className="h-8 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sparklineData}>
                      <Line
                        type="monotone"
                        dataKey="y"
                        stroke={card.color}
                        strokeWidth={2}
                        dot={false}
                        activeDot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
            
            {/* Subtle gradient overlay */}
            <div 
              className="absolute inset-0 opacity-5 pointer-events-none"
              style={{ 
                background: `linear-gradient(135deg, ${card.color} 0%, transparent 50%)` 
              }}
            />
          </Card>
        );
      })}
    </div>
  );
};