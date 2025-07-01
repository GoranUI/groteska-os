
import { useSupabaseData } from "@/hooks/useSupabaseData";
import Dashboard from "@/components/Dashboard";
import { Loader2 } from "lucide-react";

const Index = () => {
  const { incomes, expenses, clients, getTotalInRSD, getActiveClients, loading } = useSupabaseData();
  
  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    );
  }

  const rsdTotals = getTotalInRSD();
  const activeClientsCount = getActiveClients();

  return (
    <div className="p-8">
      <div className="space-y-2 mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Overview of your financial performance</p>
      </div>
      
      <Dashboard 
        incomes={incomes} 
        expenses={expenses} 
        rsdTotals={rsdTotals}
        activeClients={activeClientsCount}
      />
    </div>
  );
};

export default Index;
