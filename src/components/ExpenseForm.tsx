import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit3, Sparkles } from "lucide-react";
import { Expense } from "@/types";
import { sanitizeDescription, validateAmount } from "@/utils/securityUtils";
import { useToastNotifications } from "@/hooks/useToastNotifications";
import { getEnhancedSuggestedCategory, learnFromCorrection } from "@/utils/expenseCategorizationService";
import { useBudgetAlerts } from "@/hooks/useBudgetAlerts";
import { useBudgetData } from "@/hooks/data/useBudgetData";
import { cn } from "@/lib/utils";

interface ExpenseFormProps {
  onSubmit: (data: Omit<Expense, 'id'>) => void;
  initialData?: Expense | null;
  onCancel?: () => void;
}

export const ExpenseForm = ({ onSubmit, initialData, onCancel }: ExpenseFormProps) => {
  const { showError } = useToastNotifications();
  const { budgets } = useBudgetData();
  const { checkNewExpenseAlert } = useBudgetAlerts(budgets, []);
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<"USD" | "EUR" | "RSD">("USD");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<"office-rent" | "equipment" | "software-subscriptions" | "marketing-advertising" | "professional-services" | "travel-client-meetings" | "education-training" | "insurance" | "utilities" | "office-supplies" | "client-entertainment" | "banking-fees" | "taxes-compliance" | "other-business">("software-subscriptions");
  const [date, setDate] = useState("");
  const [suggestedCategory, setSuggestedCategory] = useState<{category: string, confidence: 'high' | 'medium' | 'low'} | null>(null);
  const [hasUserOverridden, setHasUserOverridden] = useState(false);

  useEffect(() => {
    if (initialData) {
      setAmount(initialData.amount.toString());
      setCurrency(initialData.currency);
      setDescription(initialData.description);
      setCategory(initialData.category as any);
      setDate(initialData.date);
      setHasUserOverridden(true); // Don't auto-suggest for existing data
    } else {
      setAmount("");
      setDescription("");
      setDate("");
      setHasUserOverridden(false);
    }
  }, [initialData]);

  // Auto-categorize when description or amount changes
  useEffect(() => {
    if (!hasUserOverridden && description.trim() && !initialData) {
      const amountNum = amount ? parseFloat(amount) : undefined;
      const suggestion = getEnhancedSuggestedCategory(description, amountNum);
      
      if (suggestion.category !== "Other") {
        setSuggestedCategory(suggestion);
        setCategory(suggestion.category as any);
      } else {
        setSuggestedCategory(null);
      }
    }
  }, [description, amount, hasUserOverridden, initialData]);

  const validateInputs = () => {
    // Validate amount
    if (!amount) {
      showError("Validation Error", "Amount is required");
      return false;
    }

    try {
      const validatedAmount = validateAmount(amount);
      if (validatedAmount <= 0) {
        showError("Validation Error", "Amount must be greater than zero");
        return false;
      }
    } catch (error: any) {
      showError("Validation Error", error.message);
      return false;
    }

    // Validate date
    if (!date) {
      showError("Validation Error", "Date is required");
      return false;
    }

    const selectedDate = new Date(date);
    const today = new Date();
    
    // Set both dates to midnight for proper comparison
    selectedDate.setHours(0, 0, 0, 0);
    today.setHours(23, 59, 59, 999); // Set to end of today to allow today's date
    
    if (selectedDate > today) {
      showError("Validation Error", "Expense date cannot be in the future");
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
      const validatedAmount = validateAmount(amount);
      const sanitizedDescription = description.trim() ? 
        sanitizeDescription(description) : 
        `${category} expense`;

      // Learn from user correction if they changed the suggested category
      if (suggestedCategory && suggestedCategory.category !== category) {
        learnFromCorrection(description, category);
      }

      const newExpense = {
        amount: validatedAmount,
        currency,
        description: sanitizedDescription,
        category,
        date,
      };

      // Check for budget alerts before submitting
      if (!initialData) {
        checkNewExpenseAlert(newExpense as Expense);
      }

      onSubmit(newExpense);

      if (!initialData) {
        setAmount("");
        setDescription("");
        setDate("");
        setSuggestedCategory(null);
        setHasUserOverridden(false);
      }
    } catch (error: any) {
      showError("Error", "Failed to process expense data. Please check your inputs.");
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
    if (hasUserOverridden) {
      setHasUserOverridden(false); // Reset override when user types new description
    }
  };

  const handleCategoryChange = (value: any) => {
    setCategory(value);
    setHasUserOverridden(true); // User manually selected category
    setSuggestedCategory(null); // Hide suggestion badge
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="animate-fade-in">
      <Card className="card-elevated border-0 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-destructive/5 to-destructive-light/5 border-b border-border/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-destructive/10 rounded-xl">
              {initialData ? <Edit3 className="h-6 w-6 text-destructive" /> : <Plus className="h-6 w-6 text-destructive" />}
            </div>
            <div>
              <CardTitle className="text-xl font-semibold text-foreground">
                {initialData ? "Edit Expense Entry" : "Add New Expense"}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {initialData ? "Update your expense details" : "Record a new expense and track your spending"}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Expense Category Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground">
                Expense Category <span className="text-destructive">*</span>
                {suggestedCategory && (
                  <Badge className={`ml-2 ${getConfidenceColor(suggestedCategory.confidence)} border font-medium`}>
                    <Sparkles className="h-3 w-3 mr-1" />
                    Auto-suggested
                  </Badge>
                )}
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { value: "office-rent", label: "Office Rent", icon: "🏢", description: "Workspace and rent costs" },
                  { value: "equipment", label: "Equipment", icon: "💻", description: "Computers, hardware, tools" },
                  { value: "software-subscriptions", label: "Software", icon: "🔧", description: "Design tools and subscriptions" },
                  { value: "marketing-advertising", label: "Marketing", icon: "📢", description: "Ads and promotion" },
                  { value: "professional-services", label: "Professional", icon: "⚖️", description: "Legal, accounting, consulting" },
                  { value: "travel-client-meetings", label: "Travel", icon: "✈️", description: "Client meetings and travel" },
                  { value: "education-training", label: "Education", icon: "🎓", description: "Courses and training" },
                  { value: "insurance", label: "Insurance", icon: "🛡️", description: "Business insurance" },
                  { value: "utilities", label: "Utilities", icon: "⚡", description: "Internet, phone, electricity" },
                  { value: "office-supplies", label: "Office Supplies", icon: "📝", description: "Stationery and materials" },
                  { value: "client-entertainment", label: "Client Entertainment", icon: "🍽️", description: "Business meals and events" },
                  { value: "banking-fees", label: "Banking Fees", icon: "🏦", description: "Transaction and banking costs" },
                  { value: "taxes-compliance", label: "Taxes", icon: "📊", description: "Business taxes and permits" },
                  { value: "other-business", label: "Other Business", icon: "📦", description: "Miscellaneous business expenses" }
                ].map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => handleCategoryChange(cat.value)}
                    className={cn(
                      "p-4 rounded-xl border-2 transition-all duration-200 text-left hover:scale-[1.02]",
                      category === cat.value
                        ? "border-destructive bg-destructive/5 shadow-md"
                        : "border-border hover:border-destructive/30 hover:bg-destructive/5"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{cat.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground">{cat.label}</p>
                        <p className="text-xs text-muted-foreground">{cat.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-sm font-medium text-foreground">
                  Amount <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  max="1000000000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="focus-ring h-11"
                  required
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

            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm font-medium text-foreground">
                Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="focus-ring h-11"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-foreground">
                Description <span className="text-xs text-muted-foreground">(optional)</span>
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={handleDescriptionChange}
                placeholder="Add details about this expense..."
                className="focus-ring min-h-[100px] resize-none"
                maxLength={1000}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button 
                type="submit" 
                className="btn-destructive flex-1 h-11"
              >
                {initialData ? <Edit3 className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                {initialData ? "Update Expense" : "Add Expense"}
              </Button>
              {initialData && (
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
