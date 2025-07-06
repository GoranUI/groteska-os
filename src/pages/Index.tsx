
import { useEffect, useState } from "react";
import { Dashboard } from "@/components/Dashboard";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useExchangeRates } from "@/hooks/useExchangeRates";

export default function Index() {
  const {
    clients,
    incomes,
    expenses,
    savings,
    projects,
    subTasks,
    loading,
    addIncome,
    addExpense,
    addSavings,
    updateIncome,
    updateExpense,
    updateSavings,
    deleteIncome,
    deleteExpense,
    deleteSavings,
    getTotalBalance,
    getTotalInRSD,
  } = useSupabaseData();
  const { rates } = useExchangeRates();
  const [totalBalance, setTotalBalance] = useState(0);
  const [totalInRSD, setTotalInRSD] = useState(0);

  useEffect(() => {
    if (incomes && expenses) {
      const totalRSD = getTotalInRSD(incomes, expenses);
      
      // Set both values as RSD amounts
      setTotalBalance(totalRSD.balance);
      setTotalInRSD(totalRSD.balance);
    }
  }, [incomes, expenses, getTotalInRSD]);

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[400px]">
        Loading...
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Dashboard
        totalBalance={totalBalance}
        totalInRSD={totalInRSD}
        exchangeRates={{ USD: rates.USD, EUR: rates.EUR }}
        clients={clients}
        expenses={expenses}
        incomes={incomes}
        savings={savings}
        projects={projects}
        subTasks={subTasks}
        addIncome={addIncome}
        addExpense={addExpense}
        addSavings={addSavings}
        updateIncome={updateIncome}
        updateExpense={updateExpense}
        updateSavings={updateSavings}
        deleteIncome={deleteIncome}
        deleteExpense={deleteExpense}
        deleteSavings={deleteSavings}
      />
    </div>
  );
}
