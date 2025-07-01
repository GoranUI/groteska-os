
import { useState } from "react";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { ExpenseForm } from "@/components/ExpenseForm";
import { ExpenseTable } from "@/components/ExpenseTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { ImportExpenses } from "@/components/import/ImportExpenses";
import { ExportButton } from "@/components/ExportButton";

const ExpensesPage = () => {
  const { expenses, addExpense, updateExpense, deleteExpense, loading } = useSupabaseData();
  const [editingExpense, setEditingExpense] = useState(null);

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-6 lg:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl lg:text-3xl font-semibold tracking-tight text-gray-900">Expense Tracker</h1>
          <p className="text-gray-600">Track and categorize your expenses</p>
        </div>
        <ExportButton expenses={expenses} type="expenses" />
      </div>

      <Tabs defaultValue="manual" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          <TabsTrigger value="import">Import Expenses</TabsTrigger>
        </TabsList>
        
        <TabsContent value="manual" className="space-y-6 lg:space-y-8">
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
  );
};

export default ExpensesPage;
