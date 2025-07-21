import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  DollarSign, 
  BarChart3, 
  Clock, 
  AlertTriangle,
  Target,
  Lightbulb
} from "lucide-react";

interface SpendingInsightsProps {
  categoryAnalysis: Record<string, { total: number; count: number; average: number }>;
  spendingPatterns: {
    mostExpensiveCategory: [string, { total: number; count: number; average: number }];
    mostFrequentCategory: [string, { total: number; count: number; average: number }];
    averageTransactionSize: number;
    weekdayVsWeekend: { weekday: number; weekend: number };
    seasonalTrends: Array<{ season: string; amount: number }>;
  };
  predictions: {
    nextMonthBudgetRisk: 'low' | 'medium' | 'high' | 'unknown';
    savingsProjection: { monthlyProjection: number; yearlyProjection: number };
    expenseForecasts: Array<{
      category: string;
      currentAverage: number;
      projectedNext: number;
      trend: 'increasing' | 'decreasing';
    }>;
  };
}

export const SpendingInsights = ({ 
  categoryAnalysis, 
  spendingPatterns, 
  predictions 
}: SpendingInsightsProps) => {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTrendIcon = (trend: 'increasing' | 'decreasing') => {
    return trend === 'increasing' 
      ? <TrendingUp className="h-3 w-3 text-red-500" />
      : <TrendingDown className="h-3 w-3 text-green-500" />;
  };

  const weekendSpendingRatio = spendingPatterns.weekdayVsWeekend.weekend / 
    (spendingPatterns.weekdayVsWeekend.weekday + spendingPatterns.weekdayVsWeekend.weekend) * 100;

  return (
    <div className="space-y-6">
      {/* Top Spending Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Spending Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="font-medium">Highest Spending</span>
              </div>
              <div className="text-lg font-semibold">{spendingPatterns.mostExpensiveCategory[0]}</div>
              <div className="text-sm text-gray-600">
                {spendingPatterns.mostExpensiveCategory[1].total.toLocaleString()} RSD total
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Most Frequent</span>
              </div>
              <div className="text-lg font-semibold">{spendingPatterns.mostFrequentCategory[0]}</div>
              <div className="text-sm text-gray-600">
                {spendingPatterns.mostFrequentCategory[1].count} transactions
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Category Breakdown</h4>
            {Object.entries(categoryAnalysis)
              .sort(([,a], [,b]) => b.total - a.total)
              .slice(0, 5)
              .map(([category, data]) => {
                const maxTotal = Math.max(...Object.values(categoryAnalysis).map(c => c.total));
                const percentage = (data.total / maxTotal) * 100;
                
                return (
                  <div key={category} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{category}</span>
                      <span className="font-medium">{data.total.toLocaleString()} RSD</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>

      {/* Spending Patterns */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-600" />
            Spending Patterns
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <span className="font-medium">Average Transaction</span>
              <div className="text-2xl font-semibold">
                {spendingPatterns.averageTransactionSize.toLocaleString()} RSD
              </div>
            </div>

            <div className="space-y-2">
              <span className="font-medium">Weekend Spending</span>
              <div className="text-2xl font-semibold">{weekendSpendingRatio.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">of total spending</div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Seasonal Trends</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {spendingPatterns.seasonalTrends.map((trend) => (
                <div key={trend.season} className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-sm font-medium capitalize">{trend.season}</div>
                  <div className="text-xs text-gray-600">
                    {trend.amount.toLocaleString()} RSD
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Predictions & Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            Insights & Predictions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <span className="font-medium">Budget Risk</span>
              </div>
              <Badge variant="outline" className={getRiskColor(predictions.nextMonthBudgetRisk)}>
                {predictions.nextMonthBudgetRisk.charAt(0).toUpperCase() + predictions.nextMonthBudgetRisk.slice(1)} Risk
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-green-500" />
                <span className="font-medium">Savings Projection</span>
              </div>
              <div className="text-sm">
                <div>{predictions.savingsProjection.monthlyProjection.toLocaleString()} RSD/month</div>
                <div className="text-gray-600">
                  {predictions.savingsProjection.yearlyProjection.toLocaleString()} RSD/year
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Category Trends</h4>
            <div className="space-y-2">
              {predictions.expenseForecasts
                .sort((a, b) => Math.abs(b.projectedNext - b.currentAverage) - Math.abs(a.projectedNext - a.currentAverage))
                .slice(0, 4)
                .map((forecast) => {
                  const change = forecast.projectedNext - forecast.currentAverage;
                  const changePercent = Math.abs(change / forecast.currentAverage) * 100;
                  
                  return (
                    <div key={forecast.category} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        {getTrendIcon(forecast.trend)}
                        <span className="text-sm font-medium">{forecast.category}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {forecast.trend === 'increasing' ? '+' : '-'}{changePercent.toFixed(0)}%
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Smart Recommendations */}
          <div className="border-t pt-4 space-y-2">
            <h4 className="font-medium">Recommendations</h4>
            <div className="space-y-1 text-sm text-gray-700">
              {weekendSpendingRatio > 40 && (
                <div>• Consider setting weekend spending limits to improve budget control</div>
              )}
              {predictions.nextMonthBudgetRisk === 'high' && (
                <div>• High budget risk detected - review upcoming expenses and adjust spending</div>
              )}
              {spendingPatterns.averageTransactionSize > 5000 && (
                <div>• Large average transactions detected - consider breaking down major purchases</div>
              )}
              {predictions.savingsProjection.monthlyProjection < 0 && (
                <div>• Negative savings projection - focus on increasing income or reducing expenses</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};