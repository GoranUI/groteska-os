import { useState } from "react";
import { useBudgetData } from "@/hooks/data/useBudgetData";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { BudgetForm } from "@/components/BudgetForm";
import { BudgetTracker } from "@/components/BudgetTracker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
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
      <div className="p-8 flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
    <div className="p-4 lg:p-8 space-y-6 lg:space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl lg:text-3xl font-semibold tracking-tight text-foreground">Budget Management</h1>
        <p className="text-muted-foreground">Set spending limits and track your budget progress</p>
      </div>

      <Tabs defaultValue="tracker" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tracker">Budget Tracker</TabsTrigger>
          <TabsTrigger value="manage">Manage Budgets</TabsTrigger>
        </TabsList>
        
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
  );
};

export default BudgetPage;