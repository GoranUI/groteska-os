
import { useState } from "react";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { IncomeForm } from "@/components/IncomeForm";
import { IncomeList } from "@/components/IncomeList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { ImportIncomes } from "@/components/import/ImportIncomes";
import { ExportButton } from "@/components/ExportButton";

const IncomePage = () => {
  const { incomes, clients, addIncome, updateIncome, deleteIncome, loading } = useSupabaseData();
  const [editingIncome, setEditingIncome] = useState(null);

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-6 lg:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl lg:text-3xl font-semibold tracking-tight text-foreground">Income Tracker</h1>
          <p className="text-muted-foreground">Track your income from clients and projects</p>
        </div>
        <ExportButton incomes={incomes} type="incomes" />
      </div>

      <Tabs defaultValue="manual" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          <TabsTrigger value="import">Import Incomes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="manual" className="space-y-6 lg:space-y-8">
          <IncomeForm
            clients={clients}
            onSubmit={editingIncome ? 
              (data) => {
                updateIncome(editingIncome.id, data);
                setEditingIncome(null);
              } :
              addIncome
            }
            initialData={editingIncome}
            onCancel={() => setEditingIncome(null)}
          />

          <IncomeList
            incomes={incomes}
            onEdit={setEditingIncome}
            onDelete={deleteIncome}
          />
        </TabsContent>
        
        <TabsContent value="import">
          <ImportIncomes />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IncomePage;
