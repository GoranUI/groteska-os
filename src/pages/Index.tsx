
import { useFinancialData } from "@/hooks/useFinancialData";
import Dashboard from "@/components/Dashboard";

const Index = () => {
  const { incomes, expenses, clients, getTotalInRSD, getActiveClients } = useFinancialData();
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
