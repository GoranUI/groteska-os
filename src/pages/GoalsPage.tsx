import { useState } from "react";
import { useGoalData } from "@/hooks/data/useGoalData";
import { GoalForm } from "@/components/GoalForm";
import { GoalTracker } from "@/components/GoalTracker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { FinancialGoal } from "@/types";

const GoalsPage = () => {
  const { goals, loading, addGoal, updateGoal, deleteGoal, updateGoalProgress } = useGoalData();
  const [editingGoal, setEditingGoal] = useState<FinancialGoal | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleEditGoal = (goal: FinancialGoal) => {
    setEditingGoal(goal);
  };

  const handleUpdateGoal = (data: Omit<FinancialGoal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (editingGoal) {
      updateGoal(editingGoal.id, data);
      setEditingGoal(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingGoal(null);
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 lg:space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl lg:text-3xl font-semibold tracking-tight text-foreground">Financial Goals</h1>
        <p className="text-muted-foreground">Set targets, track progress, and achieve your financial dreams</p>
      </div>

      <Tabs defaultValue="tracker" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tracker">Goal Tracker</TabsTrigger>
          <TabsTrigger value="manage">Manage Goals</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tracker" className="space-y-6 lg:space-y-8">
          <GoalTracker
            goals={goals}
            onEditGoal={handleEditGoal}
            onDeleteGoal={deleteGoal}
            onUpdateProgress={updateGoalProgress}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            priorityFilter={priorityFilter}
            onPriorityFilterChange={setPriorityFilter}
          />
        </TabsContent>
        
        <TabsContent value="manage" className="space-y-6 lg:space-y-8">
          <GoalForm
            onSubmit={editingGoal ? handleUpdateGoal : addGoal}
            initialData={editingGoal}
            onCancel={handleCancelEdit}
          />

          <GoalTracker
            goals={goals}
            onEditGoal={handleEditGoal}
            onDeleteGoal={deleteGoal}
            onUpdateProgress={updateGoalProgress}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            priorityFilter={priorityFilter}
            onPriorityFilterChange={setPriorityFilter}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GoalsPage;