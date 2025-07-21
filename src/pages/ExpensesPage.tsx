
import { useState } from "react";
import { useExpenseData } from "@/hooks/data/useExpenseData";
import { ExpenseForm } from "@/components/ExpenseForm";
import { ExpenseTable } from "@/components/ExpenseTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CreditCard, TrendingDown, Upload } from "lucide-react";
import { ImportExpenses } from "@/components/import/ImportExpenses";
import { ExportButton } from "@/components/ExportButton";
import { BudgetAlertsWidget } from "@/components/BudgetAlertsWidget";
import { useBudgetData } from "@/hooks/data/useBudgetData";

const ExpensesPage = () => {
  const { expenses, addExpense, updateExpense, deleteExpense, loading } = useExpenseData();
  const { budgets } = useBudgetData();
  const [editingExpense, setEditingExpense] = useState(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 shadow-lg">
          <CardContent className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading your expenses...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto p-4 lg:p-8 space-y-8">
        {/* Enhanced Header */}
        <div className="text-center space-y-4 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="p-3 bg-destructive/10 rounded-2xl">
              <CreditCard className="h-8 w-8 text-destructive" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-gradient-primary">
              Expense Tracker
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Track and categorize your expenses with powerful budgeting insights
          </p>
          <div className="flex justify-center">
            <ExportButton expenses={expenses} type="expenses" />
          </div>
        </div>

        {/* Budget Alerts */}
        <BudgetAlertsWidget 
          budgets={budgets} 
          expenses={expenses} 
          className="animate-fade-in" 
        />

        {/* Enhanced Tabs */}
        <Tabs defaultValue="manual" className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="grid w-full max-w-md grid-cols-2 h-12 p-1 bg-muted/50 backdrop-blur-sm">
              <TabsTrigger 
                value="manual" 
                className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <TrendingDown className="h-4 w-4" />
                Manual Entry
              </TabsTrigger>
              <TabsTrigger 
                value="import"
                className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <Upload className="h-4 w-4" />
                Import Expenses
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="manual" className="space-y-8">
            <ExpenseForm
              onSubmit={editingExpense ? 
                (data) => {
                  updateExpense(editingExpense.id, data);
                  setEditingExpense(null);
                } :
                addExpense
              }
              initialData={editingExpense}
              onCancel={() => setEditingExpense(null)}
            />

            <ExpenseTable
              expenses={expenses}
              onEdit={setEditingExpense}
              onDelete={deleteExpense}
            />
          </TabsContent>
          
          <TabsContent value="import">
            <ImportExpenses />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ExpensesPage;
