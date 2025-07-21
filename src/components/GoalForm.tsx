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
import { Plus, Edit3, CalendarIcon, Target } from "lucide-react";
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
    { value: "savings", label: "Savings Goal", icon: "💰" },
    { value: "debt_payoff", label: "Debt Payoff", icon: "💳" },
    { value: "income", label: "Income Target", icon: "📈" },
    { value: "investment", label: "Investment Goal", icon: "📊" },
    { value: "expense_reduction", label: "Expense Reduction", icon: "📉" },
    { value: "emergency_fund", label: "Emergency Fund", icon: "🛡️" },
  ];

  return (
    <Card className="border-0 shadow-sm ring-1 ring-gray-200">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-purple-50 rounded-lg">
            {initialData ? <Edit3 className="h-5 w-5 text-purple-600" /> : <Plus className="h-5 w-5 text-purple-600" />}
          </div>
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">
              {initialData ? "Edit Financial Goal" : "Create New Financial Goal"}
            </CardTitle>
            <p className="text-sm text-gray-600">
              {initialData ? "Update your financial goal" : "Set a target and track your progress"}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                Goal Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Buy a new car"
                className="h-10"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="goalType" className="text-sm font-medium text-gray-700">
                Goal Type <span className="text-red-500">*</span>
              </Label>
              <Select value={goalType} onValueChange={(value: any) => setGoalType(value)}>
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {goalTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <span className="flex items-center gap-2">
                        <span>{option.icon}</span>
                        {option.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">
              Description <span className="text-xs text-gray-500">(optional)</span>
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your goal and why it's important to you..."
              className="min-h-[80px]"
              maxLength={500}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="targetAmount" className="text-sm font-medium text-gray-700">
                Target Amount <span className="text-red-500">*</span>
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
                className="h-10"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentAmount" className="text-sm font-medium text-gray-700">
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
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency" className="text-sm font-medium text-gray-700">
                Currency <span className="text-red-500">*</span>
              </Label>
              <Select value={currency} onValueChange={(value: "USD" | "EUR" | "RSD") => setCurrency(value)}>
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="RSD">RSD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Target Date <span className="text-xs text-gray-500">(optional)</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "h-10 w-full justify-start text-left font-normal",
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
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority" className="text-sm font-medium text-gray-700">
                Priority
              </Label>
              <Select value={priority} onValueChange={(value: "low" | "medium" | "high") => setPriority(value)}>
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">🔵 Low</SelectItem>
                  <SelectItem value="medium">🟡 Medium</SelectItem>
                  <SelectItem value="high">🔴 High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium text-gray-700">
              Category <span className="text-xs text-gray-500">(optional)</span>
            </Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., Home, Travel, Education"
              className="h-10"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="isRecurring"
                checked={isRecurring}
                onCheckedChange={setIsRecurring}
              />
              <Label htmlFor="isRecurring" className="text-sm font-medium text-gray-700">
                Recurring Goal
              </Label>
            </div>

            {isRecurring && (
              <div className="space-y-2">
                <Label htmlFor="recurringPeriod" className="text-sm font-medium text-gray-700">
                  Recurring Period
                </Label>
                <Select value={recurringPeriod} onValueChange={(value: any) => setRecurringPeriod(value)}>
                  <SelectTrigger className="h-10">
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

          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {initialData ? <Edit3 className="h-4 w-4 mr-2" /> : <Target className="h-4 w-4 mr-2" />}
              {initialData ? "Update Goal" : "Create Goal"}
            </Button>
            {initialData && (
              <Button 
                type="button"
                variant="outline"
                onClick={onCancel}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};