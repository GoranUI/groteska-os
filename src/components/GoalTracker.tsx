import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Target, 
  Calendar, 
  TrendingUp, 
  Pencil, 
  Trash2, 
  Play, 
  Pause, 
  CheckCircle,
  Plus,
  Trophy,
  Clock,
  DollarSign
} from "lucide-react";
import { FinancialGoal } from "@/types";
import { useExchangeRates } from "@/hooks/useExchangeRates";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface GoalTrackerProps {
  goals: FinancialGoal[];
  onEditGoal: (goal: FinancialGoal) => void;
  onDeleteGoal: (id: string) => void;
  onUpdateProgress: (goalId: string, amount: number) => void;
  statusFilter?: string;
  onStatusFilterChange?: (status: string) => void;
  priorityFilter?: string;
  onPriorityFilterChange?: (priority: string) => void;
}

export const GoalTracker = ({ 
  goals, 
  onEditGoal, 
  onDeleteGoal,
  onUpdateProgress,
  statusFilter = "all",
  onStatusFilterChange,
  priorityFilter = "all",
  onPriorityFilterChange
}: GoalTrackerProps) => {
  const { rates } = useExchangeRates();
  const [progressDialog, setProgressDialog] = useState<{ goalId: string; currentAmount: number } | null>(null);
  const [progressAmount, setProgressAmount] = useState("");

  const convertToRSD = (amount: number, currency: "USD" | "EUR" | "RSD"): number => {
    if (currency === "RSD") return amount;
    if (currency === "USD") return amount * (rates.USD || 110);
    if (currency === "EUR") return amount * (rates.EUR || 117);
    return amount;
  };

  const getGoalIcon = (goalType: string) => {
    const icons = {
      savings: "💰",
      debt_payoff: "💳",
      income: "📈",
      investment: "📊",
      expense_reduction: "📉",
      emergency_fund: "🛡️"
    };
    return icons[goalType as keyof typeof icons] || "🎯";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredGoals = goals.filter(goal => {
    const statusMatch = statusFilter === "all" || goal.status === statusFilter;
    const priorityMatch = priorityFilter === "all" || goal.priority === priorityFilter;
    return statusMatch && priorityMatch;
  });

  const handleUpdateProgress = () => {
    if (progressDialog && progressAmount) {
      const amount = parseFloat(progressAmount);
      if (!isNaN(amount) && amount >= 0) {
        onUpdateProgress(progressDialog.goalId, amount);
        setProgressDialog(null);
        setProgressAmount("");
      }
    }
  };

  const openProgressDialog = (goal: FinancialGoal) => {
    setProgressDialog({ goalId: goal.id, currentAmount: goal.currentAmount });
    setProgressAmount(goal.currentAmount.toString());
  };

  // Calculate summary stats
  const totalGoals = filteredGoals.length;
  const completedGoals = filteredGoals.filter(g => g.status === 'completed').length;
  const activeGoals = filteredGoals.filter(g => g.status === 'active').length;
  const totalTargetAmount = filteredGoals.reduce((sum, goal) => 
    sum + convertToRSD(goal.targetAmount, goal.currency), 0
  );
  const totalCurrentAmount = filteredGoals.reduce((sum, goal) => 
    sum + convertToRSD(goal.currentAmount, goal.currency), 0
  );
  const overallProgress = totalTargetAmount > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Goals</p>
                <p className="text-2xl font-bold text-gray-900">{totalGoals}</p>
              </div>
              <Target className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Goals</p>
                <p className="text-2xl font-bold text-orange-600">{activeGoals}</p>
              </div>
              <Play className="h-6 w-6 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{completedGoals}</p>
              </div>
              <Trophy className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overall Progress</p>
                <p className="text-2xl font-bold text-purple-600">{overallProgress.toFixed(0)}%</p>
              </div>
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={onPriorityFilterChange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Goals Grid */}
      {filteredGoals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGoals.map((goal) => {
            const currentAmountRSD = convertToRSD(goal.currentAmount, goal.currency);
            const targetAmountRSD = convertToRSD(goal.targetAmount, goal.currency);
            const progress = targetAmountRSD > 0 ? Math.min((currentAmountRSD / targetAmountRSD) * 100, 100) : 0;
            const isOverdue = goal.targetDate && new Date(goal.targetDate) < new Date() && goal.status === 'active';
            const daysLeft = goal.targetDate 
              ? Math.ceil((new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
              : null;

            return (
              <Card key={goal.id} className={cn(
                "relative overflow-hidden",
                goal.status === 'completed' && "ring-2 ring-green-200",
                isOverdue && "ring-2 ring-red-200"
              )}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getGoalIcon(goal.goalType)}</span>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-base font-medium truncate">
                          {goal.title}
                        </CardTitle>
                        {goal.description && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {goal.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditGoal(goal)}
                        className="h-8 w-8 p-0"
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteGoal(goal.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="outline" className={getStatusColor(goal.status)}>
                      {goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
                    </Badge>
                    <Badge variant="outline" className={getPriorityColor(goal.priority)}>
                      {goal.priority.charAt(0).toUpperCase() + goal.priority.slice(1)}
                    </Badge>
                    {goal.category && (
                      <Badge variant="outline" className="text-xs">
                        {goal.category}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span className="font-medium">{progress.toFixed(1)}%</span>
                    </div>
                    <Progress value={progress} className="h-3" />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{currentAmountRSD.toLocaleString()} RSD</span>
                      <span>{targetAmountRSD.toLocaleString()} RSD</span>
                    </div>
                  </div>

                  {goal.targetDate && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className={cn(
                        isOverdue ? "text-red-600 font-medium" : "text-gray-600"
                      )}>
                        {isOverdue 
                          ? `Overdue by ${Math.abs(daysLeft!)} days`
                          : daysLeft! > 0 
                            ? `${daysLeft} days left`
                            : "Due today"
                        }
                      </span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => openProgressDialog(goal)}
                          disabled={goal.status === 'completed' || goal.status === 'cancelled'}
                        >
                          <DollarSign className="h-3 w-3 mr-1" />
                          Update Progress
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Update Goal Progress</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-gray-600 mb-2">
                              Current: {goal.currentAmount.toLocaleString()} {goal.currency}
                            </p>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={progressAmount}
                              onChange={(e) => setProgressAmount(e.target.value)}
                              placeholder="Enter new amount"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={handleUpdateProgress} className="flex-1">
                              Update
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => setProgressDialog(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>

                {goal.status === 'completed' && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Goals Found</h3>
            <p className="text-gray-600 mb-4">
              {statusFilter === "all" && priorityFilter === "all" 
                ? "Start setting financial goals to track your progress and achieve your dreams."
                : "No goals match the current filters. Try adjusting your filter settings."
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};