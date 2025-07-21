import { useState } from "react";
import { useGoalData } from "@/hooks/data/useGoalData";
import { GoalForm } from "@/components/GoalForm";
import { GoalTracker } from "@/components/GoalTracker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Trophy, Target, TrendingUp } from "lucide-react";
import { FinancialGoal } from "@/types";

const GoalsPage = () => {
  const { goals, loading, addGoal, updateGoal, deleteGoal, updateGoalProgress } = useGoalData();
  const [editingGoal, setEditingGoal] = useState<FinancialGoal | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 shadow-lg">
          <CardContent className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading your financial goals...</p>
          </CardContent>
        </Card>
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
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto p-4 lg:p-8 space-y-8">
        {/* Enhanced Header */}
        <div className="text-center space-y-4 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <Trophy className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-gradient-primary">
              Financial Goals
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transform your financial dreams into achievable targets. Set goals, track progress, and celebrate your success.
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
                <TrendingUp className="h-4 w-4" />
                Goal Tracker
              </TabsTrigger>
              <TabsTrigger 
                value="manage"
                className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <Target className="h-4 w-4" />
                Manage Goals
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="tracker" className="space-y-6">
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
          
          <TabsContent value="manage" className="space-y-8">
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
    </div>
  );
};

export default GoalsPage;