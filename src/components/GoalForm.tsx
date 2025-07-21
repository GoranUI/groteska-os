import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Target, Edit3, Sparkles, TrendingUp } from "lucide-react";
import { FinancialGoal } from "@/types";
import { validateAmount } from "@/utils/securityUtils";
import { useToastNotifications } from "@/hooks/useToastNotifications";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface GoalFormProps {
  onSubmit: (data: Omit<FinancialGoal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  initialData?: FinancialGoal | null;
  onCancel?: () => void;
}

export const GoalForm = ({ onSubmit, initialData, onCancel }: GoalFormProps) => {
  const { showError } = useToastNotifications();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goalType, setGoalType] = useState<"savings" | "debt_payoff" | "income" | "investment" | "expense_reduction" | "emergency_fund">("savings");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [currency, setCurrency] = useState<"USD" | "EUR" | "RSD">("RSD");
  const [targetDate, setTargetDate] = useState<Date>();
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [category, setCategory] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringPeriod, setRecurringPeriod] = useState<"weekly" | "monthly" | "quarterly" | "yearly">("monthly");

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description || "");
      setGoalType(initialData.goalType);
      setTargetAmount(initialData.targetAmount.toString());
      setCurrentAmount(initialData.currentAmount.toString());
      setCurrency(initialData.currency);
      setTargetDate(initialData.targetDate ? new Date(initialData.targetDate) : undefined);
      setPriority(initialData.priority);
      setCategory(initialData.category || "");
      setIsRecurring(initialData.isRecurring);
      setRecurringPeriod(initialData.recurringPeriod || "monthly");
    } else {
      setTitle("");
      setDescription("");
      setTargetAmount("");
      setCurrentAmount("0");
      setCategory("");
      setTargetDate(undefined);
    }
  }, [initialData]);

  const validateInputs = () => {
    if (!title.trim()) {
      showError("Validation Error", "Goal title is required");
      return false;
    }

    if (!targetAmount) {
      showError("Validation Error", "Target amount is required");
      return false;
    }

    try {
      const validatedTargetAmount = validateAmount(targetAmount);
      if (validatedTargetAmount <= 0) {
        showError("Validation Error", "Target amount must be greater than zero");
        return false;
      }

      const validatedCurrentAmount = validateAmount(currentAmount || "0");
      if (validatedCurrentAmount < 0) {
        showError("Validation Error", "Current amount cannot be negative");
        return false;
      }
    } catch (error: any) {
      showError("Validation Error", error.message);
      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateInputs()) {
      return;
    }

    try {
      const validatedTargetAmount = validateAmount(targetAmount);
      const validatedCurrentAmount = validateAmount(currentAmount || "0");
      
      onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        goalType,
        targetAmount: validatedTargetAmount,
        currentAmount: validatedCurrentAmount,
        currency,
        targetDate: targetDate?.toISOString().split('T')[0],
        status: 'active',
        priority,
        category: category.trim() || undefined,
        isRecurring,
        recurringPeriod: isRecurring ? recurringPeriod : undefined,
      });

      if (!initialData) {
        setTitle("");
        setDescription("");
        setTargetAmount("");
        setCurrentAmount("0");
        setCategory("");
        setTargetDate(undefined);
      }
    } catch (error: any) {
      showError("Error", "Failed to process goal data. Please check your inputs.");
    }
  };

  const goalTypeOptions = [
    { value: "savings", label: "Savings Goal", icon: "💰", color: "success", description: "Build wealth over time" },
    { value: "debt_payoff", label: "Debt Payoff", icon: "💳", color: "warning", description: "Eliminate debt burden" },
    { value: "income", label: "Income Target", icon: "📈", color: "info", description: "Increase earnings" },
    { value: "investment", label: "Investment Goal", icon: "📊", color: "primary", description: "Grow investments" },
    { value: "expense_reduction", label: "Expense Reduction", icon: "📉", color: "danger", description: "Cut spending" },
    { value: "emergency_fund", label: "Emergency Fund", icon: "🛡️", color: "info", description: "Financial safety net" },
  ];

  const selectedGoalType = goalTypeOptions.find(option => option.value === goalType);

  return (
    <div className="animate-fade-in">
      <Card className="card-elevated border-0 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary-light/5 border-b border-border/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              {initialData ? (
                <Edit3 className="h-6 w-6 text-primary" />
              ) : (
                <Sparkles className="h-6 w-6 text-primary" />
              )}
            </div>
            <div>
              <CardTitle className="text-xl font-semibold text-foreground">
                {initialData ? "Edit Financial Goal" : "Create New Financial Goal"}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {initialData ? "Update your financial goal details" : "Set a target and track your progress toward financial success"}
              </p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Goal Type Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground">
                Goal Type <span className="text-destructive">*</span>
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {goalTypeOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setGoalType(option.value as any)}
                    className={cn(
                      "p-4 rounded-xl border-2 transition-all duration-200 text-left hover:scale-[1.02]",
                      goalType === option.value
                        ? "border-primary bg-primary/5 shadow-md"
                        : "border-border hover:border-primary/30 hover:bg-primary/5"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{option.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground">{option.label}</p>
                        <p className="text-xs text-muted-foreground">{option.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium text-foreground">
                  Goal Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Buy a new car, Emergency fund"
                  className="focus-ring h-11"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium text-foreground">
                  Category <span className="text-xs text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g., Home, Travel, Education"
                  className="focus-ring h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-foreground">
                Description <span className="text-xs text-muted-foreground">(optional)</span>
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your goal and why it's important to you..."
                className="focus-ring min-h-[100px] resize-none"
                maxLength={500}
              />
            </div>

            {/* Financial Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="targetAmount" className="text-sm font-medium text-foreground">
                  Target Amount <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="targetAmount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="1000000000"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  placeholder="0.00"
                  className="focus-ring h-11"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentAmount" className="text-sm font-medium text-foreground">
                  Current Amount
                </Label>
                <Input
                  id="currentAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  max="1000000000"
                  value={currentAmount}
                  onChange={(e) => setCurrentAmount(e.target.value)}
                  placeholder="0.00"
                  className="focus-ring h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency" className="text-sm font-medium text-foreground">
                  Currency <span className="text-destructive">*</span>
                </Label>
                <Select value={currency} onValueChange={(value: "USD" | "EUR" | "RSD") => setCurrency(value)}>
                  <SelectTrigger className="focus-ring h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RSD">🇷🇸 RSD</SelectItem>
                    <SelectItem value="USD">🇺🇸 USD</SelectItem>
                    <SelectItem value="EUR">🇪🇺 EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Timeline and Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  Target Date <span className="text-xs text-muted-foreground">(optional)</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "h-11 w-full justify-start text-left font-normal focus-ring",
                        !targetDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {targetDate ? format(targetDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={targetDate}
                      onSelect={setTargetDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority" className="text-sm font-medium text-foreground">
                  Priority Level
                </Label>
                <Select value={priority} onValueChange={(value: "low" | "medium" | "high") => setPriority(value)}>
                  <SelectTrigger className="focus-ring h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-info"></div>
                        Low Priority
                      </div>
                    </SelectItem>
                    <SelectItem value="medium">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-warning"></div>
                        Medium Priority
                      </div>
                    </SelectItem>
                    <SelectItem value="high">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-danger"></div>
                        High Priority
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Recurring Settings */}
            <div className="space-y-4 p-4 bg-muted/30 rounded-xl border border-border/50">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="isRecurring" className="text-sm font-medium text-foreground">
                    Recurring Goal
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Set this goal to repeat automatically
                  </p>
                </div>
                <Switch
                  id="isRecurring"
                  checked={isRecurring}
                  onCheckedChange={setIsRecurring}
                />
              </div>

              {isRecurring && (
                <div className="space-y-2 animate-slide-up">
                  <Label htmlFor="recurringPeriod" className="text-sm font-medium text-foreground">
                    Recurring Period
                  </Label>
                  <Select value={recurringPeriod} onValueChange={(value: any) => setRecurringPeriod(value)}>
                    <SelectTrigger className="focus-ring h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button 
                type="submit" 
                className="btn-primary flex-1 h-11"
              >
                <Target className="h-4 w-4 mr-2" />
                {initialData ? "Update Goal" : "Create Goal"}
              </Button>
              {initialData && onCancel && (
                <Button 
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  className="focus-ring h-11 px-6"
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};