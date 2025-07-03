import { useEffect, useState } from "react";
import { Dashboard } from "@/components/Dashboard";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useExchangeRates } from "@/hooks/useExchangeRates";
import { TimeTracker } from "@/components/TimeTracker";

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
  const { exchangeRates } = useExchangeRates();
  const [totalBalance, setTotalBalance] = useState(0);
  const [totalInRSD, setTotalInRSD] = useState(0);

  useEffect(() => {
    if (incomes && expenses) {
      setTotalBalance(getTotalBalance(incomes, expenses));
      setTotalInRSD(getTotalInRSD(incomes, expenses));
    }
  }, [incomes, expenses, getTotalBalance, getTotalInRSD]);

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
        exchangeRates={exchangeRates}
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
      
      {/* Add TimeTracker component */}
      <TimeTracker projects={projects} subTasks={subTasks} />
    </div>
  );
}
