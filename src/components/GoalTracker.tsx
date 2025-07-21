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
  Trophy,
  Clock,
  DollarSign,
  AlertTriangle,
  Sparkles
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

  const getStatusBadge = (status: string) => {
    const badges = {
      completed: { variant: "default", className: "status-success", icon: CheckCircle },
      paused: { variant: "secondary", className: "status-warning", icon: Pause },
      cancelled: { variant: "destructive", className: "status-danger", icon: Trash2 },
      active: { variant: "default", className: "status-info", icon: Play }
    };
    const config = badges[status as keyof typeof badges] || badges.active;
    const Icon = config.icon;
    
    return (
      <Badge className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const badges = {
      high: { className: "status-danger", color: "bg-danger" },
      medium: { className: "status-warning", color: "bg-warning" },
      low: { className: "status-info", color: "bg-info" }
    };
    const config = badges[priority as keyof typeof badges] || badges.medium;
    
    return (
      <Badge className={config.className}>
        <div className={cn("w-2 h-2 rounded-full mr-1", config.color)}></div>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
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
    <div className="space-y-6 animate-fade-in">
      {/* Enhanced Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-elevated overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Goals</p>
                <p className="text-3xl font-bold text-foreground mt-1">{totalGoals}</p>
                <p className="text-xs text-muted-foreground mt-1">Financial targets</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-xl">
                <Target className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Goals</p>
                <p className="text-3xl font-bold text-info mt-1">{activeGoals}</p>
                <p className="text-xs text-muted-foreground mt-1">In progress</p>
              </div>
              <div className="p-3 bg-info/10 rounded-xl">
                <TrendingUp className="h-6 w-6 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-3xl font-bold text-success mt-1">{completedGoals}</p>
                <p className="text-xs text-muted-foreground mt-1">Achieved</p>
              </div>
              <div className="p-3 bg-success/10 rounded-xl">
                <Trophy className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overall Progress</p>
                <p className="text-3xl font-bold text-primary mt-1">{overallProgress.toFixed(0)}%</p>
                <Progress value={overallProgress} className="h-2 mt-2" />
              </div>
              <div className="p-3 bg-primary/10 rounded-xl">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex gap-3">
              <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                <SelectTrigger className="w-40 focus-ring">
                  <SelectValue placeholder="Status" />
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
                <SelectTrigger className="w-40 focus-ring">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="text-sm text-muted-foreground">
              Showing {filteredGoals.length} of {goals.length} goals
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Goals Grid */}
      {filteredGoals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
                "card-elevated overflow-hidden transition-all duration-300 hover:scale-[1.02]",
                goal.status === 'completed' && "ring-2 ring-success/20 bg-success/5",
                isOverdue && "ring-2 ring-danger/20 bg-danger/5"
              )}>
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="text-3xl flex-shrink-0">
                        {getGoalIcon(goal.goalType)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-lg font-semibold truncate text-foreground">
                          {goal.title}
                        </CardTitle>
                        {goal.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {goal.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditGoal(goal)}
                        className="h-8 w-8 p-0 hover:bg-primary/10"
                      >
                        <Pencil className="h-4 w-4 text-primary" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteGoal(goal.id)}
                        className="h-8 w-8 p-0 hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-3">
                    {getStatusBadge(goal.status)}
                    {getPriorityBadge(goal.priority)}
                    {goal.category && (
                      <Badge variant="outline" className="text-xs">
                        {goal.category}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-semibold text-foreground">{progress.toFixed(1)}%</span>
                    </div>
                    <Progress value={progress} className="h-3" />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {currentAmountRSD.toLocaleString()} RSD
                      </span>
                      <span className="font-medium text-foreground">
                        {targetAmountRSD.toLocaleString()} RSD
                      </span>
                    </div>
                  </div>

                  {goal.targetDate && (
                    <div className="flex items-center gap-2 text-sm p-3 bg-muted/30 rounded-lg">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className={cn(
                        "font-medium",
                        isOverdue ? "text-danger" : "text-muted-foreground"
                      )}>
                        {isOverdue 
                          ? `Overdue by ${Math.abs(daysLeft!)} days`
                          : daysLeft! > 0 
                            ? `${daysLeft} days remaining`
                            : "Due today"
                        }
                      </span>
                      {isOverdue && <AlertTriangle className="h-4 w-4 text-danger" />}
                    </div>
                  )}

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="w-full focus-ring"
                        onClick={() => openProgressDialog(goal)}
                        disabled={goal.status === 'completed' || goal.status === 'cancelled'}
                      >
                        <DollarSign className="h-4 w-4 mr-2" />
                        Update Progress
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-primary" />
                          Update Goal Progress
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="p-4 bg-muted/30 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">Current Amount</p>
                          <p className="text-lg font-semibold text-foreground">
                            {goal.currentAmount.toLocaleString()} {goal.currency}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">
                            New Amount
                          </label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={progressAmount}
                            onChange={(e) => setProgressAmount(e.target.value)}
                            placeholder="Enter new amount"
                            className="focus-ring"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            onClick={handleUpdateProgress} 
                            className="btn-primary flex-1"
                          >
                            Update Progress
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => setProgressDialog(null)}
                            className="focus-ring"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>

                {goal.status === 'completed' && (
                  <div className="absolute top-4 right-4">
                    <div className="p-2 bg-success/10 rounded-full">
                      <CheckCircle className="h-5 w-5 text-success" />
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="card-elevated">
          <CardContent className="text-center py-12">
            <div className="p-4 bg-muted/30 rounded-full w-fit mx-auto mb-4">
              <Target className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No Goals Found</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
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