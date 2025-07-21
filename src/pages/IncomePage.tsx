
import { useState } from "react";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { IncomeForm } from "@/components/IncomeForm";
import { IncomeList } from "@/components/IncomeList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, DollarSign, TrendingUp, Upload, List } from "lucide-react";
import { ImportIncomes } from "@/components/import/ImportIncomes";
import { ExportButton } from "@/components/ExportButton";

const IncomePage = () => {
  const { incomes, clients, addIncome, updateIncome, deleteIncome, loading } = useSupabaseData();
  const [editingIncome, setEditingIncome] = useState(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 shadow-lg">
          <CardContent className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading your income data...</p>
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
            <div className="p-3 bg-success/10 rounded-2xl">
              <DollarSign className="h-8 w-8 text-success" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-gradient-primary">
              Income Tracker
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Track your income from clients and projects with powerful insights and analytics
          </p>
          <div className="flex justify-center">
            <ExportButton incomes={incomes} type="incomes" />
          </div>
        </div>

        {/* Enhanced Tabs */}
        <Tabs defaultValue="manual" className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="grid w-full max-w-md grid-cols-2 h-12 p-1 bg-muted/50 backdrop-blur-sm">
              <TabsTrigger 
                value="manual" 
                className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <TrendingUp className="h-4 w-4" />
                Manual Entry
              </TabsTrigger>
              <TabsTrigger 
                value="import"
                className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <Upload className="h-4 w-4" />
                Import Incomes
              </TabsTrigger>
            </TabsList>
          </div>
          
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
    </div>
  );
};

export default IncomePage;
