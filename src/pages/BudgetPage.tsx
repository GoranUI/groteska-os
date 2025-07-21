import { useState } from "react";
import { useBudgetData } from "@/hooks/data/useBudgetData";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { BudgetForm } from "@/components/BudgetForm";
import { BudgetTracker } from "@/components/BudgetTracker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Target, TrendingUp, BarChart3 } from "lucide-react";
import { Budget } from "@/types";

const BudgetPage = () => {
  const { budgets, loading: budgetsLoading, addBudget, updateBudget, deleteBudget } = useBudgetData();
  const { expenses, loading: expensesLoading } = useSupabaseData();
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const loading = budgetsLoading || expensesLoading;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 shadow-lg">
          <CardContent className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading your budget data...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleEditBudget = (budget: Budget) => {
    setEditingBudget(budget);
  };

  const handleUpdateBudget = (data: Omit<Budget, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (editingBudget) {
      updateBudget(editingBudget.id, data);
      setEditingBudget(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingBudget(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto p-4 lg:p-8 space-y-8">
        {/* Enhanced Header */}
        <div className="text-center space-y-4 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <Target className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-gradient-primary">
              Budget Manager
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Set spending limits and track your budget progress with powerful insights
          </p>
        </div>

        {/* Enhanced Tabs */}
        <Tabs defaultValue="tracker" className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="grid w-full max-w-md grid-cols-2 h-12 p-1 bg-muted/50 backdrop-blur-sm">
              <TabsTrigger 
                value="tracker" 
                className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <BarChart3 className="h-4 w-4" />
                Budget Tracker
              </TabsTrigger>
              <TabsTrigger 
                value="manage"
                className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <TrendingUp className="h-4 w-4" />
                Manage Budgets
              </TabsTrigger>
            </TabsList>
          </div>
        
        <TabsContent value="tracker" className="space-y-6 lg:space-y-8">
          <BudgetTracker
            budgets={budgets}
            expenses={expenses}
            onEditBudget={handleEditBudget}
            onDeleteBudget={deleteBudget}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onMonthChange={setSelectedMonth}
            onYearChange={setSelectedYear}
          />
        </TabsContent>
        
        <TabsContent value="manage" className="space-y-6 lg:space-y-8">
          <BudgetForm
            onSubmit={editingBudget ? handleUpdateBudget : addBudget}
            initialData={editingBudget}
            onCancel={handleCancelEdit}
          />

          <BudgetTracker
            budgets={budgets}
            expenses={expenses}
            onEditBudget={handleEditBudget}
            onDeleteBudget={deleteBudget}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onMonthChange={setSelectedMonth}
            onYearChange={setSelectedYear}
          />
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
};

export default BudgetPage;