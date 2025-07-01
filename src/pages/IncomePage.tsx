
import { useState } from "react";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { IncomeForm } from "@/components/IncomeForm";
import { IncomeList } from "@/components/IncomeList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { ImportIncomes } from "@/components/import/ImportIncomes";

const IncomePage = () => {
  const { incomes, clients, addIncome, updateIncome, deleteIncome, loading } = useSupabaseData();
  const [editingIncome, setEditingIncome] = useState(null);

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Income Tracker</h1>
        <p className="text-gray-600">Track your income from clients and projects</p>
      </div>

      <Tabs defaultValue="manual" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          <TabsTrigger value="import">Import Incomes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="manual" className="space-y-8">
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
