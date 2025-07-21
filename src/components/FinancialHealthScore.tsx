import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, Heart, Brain, Target, Zap } from "lucide-react";

interface FinancialHealthScoreProps {
  score: number;
  savingsRate: number;
  budgetPerformance: Array<{
    category: string;
    status: 'good' | 'warning' | 'exceeded';
    percentage: number;
  }>;
  monthlyTrend: 'increasing' | 'decreasing' | 'stable';
}

export const FinancialHealthScore = ({ 
  score, 
  savingsRate, 
  budgetPerformance, 
  monthlyTrend 
}: FinancialHealthScoreProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-8 w-8 text-green-600" />;
    if (score >= 60) return <AlertCircle className="h-8 w-8 text-yellow-600" />;
    return <AlertCircle className="h-8 w-8 text-red-600" />;
  };

  const getHealthLevel = (score: number) => {
    if (score >= 80) return { level: 'Excellent', color: 'bg-green-100 text-green-800 border-green-200' };
    if (score >= 60) return { level: 'Good', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
    if (score >= 40) return { level: 'Fair', color: 'bg-orange-100 text-orange-800 border-orange-200' };
    return { level: 'Needs Improvement', color: 'bg-red-100 text-red-800 border-red-200' };
  };

  const healthLevel = getHealthLevel(score);
  const budgetViolations = budgetPerformance.filter(b => b.status === 'exceeded').length;
  const budgetWarnings = budgetPerformance.filter(b => b.status === 'warning').length;

  return (
    <Card className="border-2 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Heart className="h-6 w-6 text-primary" />
          Financial Health Score
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Score Display */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-4">
            {getScoreIcon(score)}
            <div>
              <div className={`text-4xl font-bold ${getScoreColor(score)}`}>
                {score}
              </div>
              <div className="text-sm text-gray-500">out of 100</div>
            </div>
          </div>
          
          <Badge variant="outline" className={healthLevel.color}>
            {healthLevel.level}
          </Badge>
          
          <div className="space-y-2">
            <Progress value={score} className="h-3" />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Needs Work</span>
              <span>Good</span>
              <span>Excellent</span>
            </div>
          </div>
        </div>

        {/* Health Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Savings Rate</span>
            </div>
            <div className="text-2xl font-semibold">
              {savingsRate.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500">
              {savingsRate >= 20 ? 'Excellent' : savingsRate >= 10 ? 'Good' : 'Needs Improvement'}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Budget Control</span>
            </div>
            <div className="text-2xl font-semibold">
              {budgetPerformance.length - budgetViolations}/{budgetPerformance.length}
            </div>
            <div className="text-xs text-gray-500">
              {budgetViolations === 0 ? 'Perfect' : budgetViolations <= 1 ? 'Good' : 'Needs Work'}
            </div>
          </div>
        </div>

        {/* Quick Insights */}
        <div className="space-y-3 border-t pt-4">
          <h4 className="font-medium flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-500" />
            Quick Insights
          </h4>
          
          <div className="space-y-2 text-sm">
            {savingsRate < 10 && (
              <div className="flex items-center gap-2 text-orange-600">
                <TrendingDown className="h-3 w-3" />
                <span>Consider increasing your savings rate to 10%+</span>
              </div>
            )}
            
            {budgetViolations > 0 && (
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-3 w-3" />
                <span>{budgetViolations} budget{budgetViolations > 1 ? 's' : ''} exceeded this month</span>
              </div>
            )}
            
            {budgetWarnings > 0 && (
              <div className="flex items-center gap-2 text-yellow-600">
                <AlertCircle className="h-3 w-3" />
                <span>{budgetWarnings} budget{budgetWarnings > 1 ? 's' : ''} approaching limit</span>
              </div>
            )}
            
            {monthlyTrend === 'increasing' && (
              <div className="flex items-center gap-2 text-blue-600">
                <TrendingUp className="h-3 w-3" />
                <span>Expenses trending upward - monitor spending</span>
              </div>
            )}
            
            {score >= 80 && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-3 w-3" />
                <span>Great financial habits - keep it up!</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};