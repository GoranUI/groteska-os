import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, TrendingUp, Target, X, Bell } from "lucide-react";
import { Budget, Expense } from "@/types";
import { useExchangeRates } from "@/hooks/useExchangeRates";
import { useBudgetAlerts } from "@/hooks/useBudgetAlerts";

interface BudgetAlertsWidgetProps {
  budgets: Budget[];
  expenses: Expense[];
  className?: string;
}

export const BudgetAlertsWidget = ({ budgets, expenses, className }: BudgetAlertsWidgetProps) => {
  const { rates } = useExchangeRates();
  const { checkBudgetAlerts } = useBudgetAlerts(budgets, expenses);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const convertToRSD = (amount: number, currency: "USD" | "EUR" | "RSD"): number => {
    if (currency === "RSD") return amount;
    if (currency === "USD") return amount * (rates.USD || 110);
    if (currency === "EUR") return amount * (rates.EUR || 117);
    return amount;
  };

  useEffect(() => {
    const budgetAlerts = checkBudgetAlerts();
    setAlerts(budgetAlerts.filter(alert => !dismissed.has(alert.category)));
  }, [budgets, expenses, dismissed, checkBudgetAlerts]);

  const dismissAlert = (category: string) => {
    setDismissed(prev => new Set([...prev, category]));
  };

  const getAlertIcon = (status: string) => {
    switch (status) {
      case "exceeded":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case "warning":
        return <TrendingUp className="h-4 w-4 text-yellow-500" />;
      default:
        return <Target className="h-4 w-4 text-blue-500" />;
    }
  };

  const getAlertColor = (status: string) => {
    switch (status) {
      case "exceeded":
        return "border-red-200 bg-red-50";
      case "critical":
        return "border-orange-200 bg-orange-50";
      case "warning":
        return "border-yellow-200 bg-yellow-50";
      default:
        return "border-blue-200 bg-blue-50";
    }
  };

  if (alerts.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="h-5 w-5 text-orange-600" />
            Budget Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {alerts.map((alert) => {
            const remaining = alert.budget - alert.spent;
            
            return (
              <div
                key={alert.category}
                className={`p-3 rounded-lg border ${getAlertColor(alert.status)}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getAlertIcon(alert.status)}
                    <span className="font-medium text-gray-900">
                      {alert.category}
                    </span>
                    <Badge 
                      variant={alert.status === "exceeded" ? "destructive" : "secondary"}
                      className="text-xs"
                    >
                      {alert.status === "exceeded" ? "Over Budget" : 
                       alert.status === "critical" ? "Critical" : "Warning"}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dismissAlert(alert.category)}
                    className="h-6 w-6 p-0 hover:bg-white/50"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Spent: {alert.spent.toLocaleString()} RSD</span>
                    <span>Budget: {alert.budget.toLocaleString()} RSD</span>
                  </div>
                  
                  <Progress 
                    value={Math.min(alert.percentage, 100)} 
                    className="h-2"
                  />
                  
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>{Math.round(alert.percentage)}% used</span>
                    <span>
                      {alert.status === "exceeded" 
                        ? `Over by ${Math.abs(remaining).toLocaleString()} RSD`
                        : `${remaining.toLocaleString()} RSD remaining`
                      }
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};