
import { useState } from "react";
import { useFinancialData } from "@/hooks/useFinancialData";
import { SavingsForm } from "@/components/SavingsForm";
import { SavingsList } from "@/components/SavingsList";

const SavingsPage = () => {
  const { savings, addSavings, updateSavings, deleteSavings } = useFinancialData();
  const [editingSaving, setEditingSaving] = useState(null);

  return (
    <div className="p-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Savings Tracker</h1>
        <p className="text-gray-600">Track your savings deposits and withdrawals</p>
      </div>

      <SavingsForm
        onSubmit={editingSaving ? 
          (data) => {
            updateSavings(editingSaving.id, data);
            setEditingSaving(null);
          } :
          addSavings
        }
        initialData={editingSaving}
        onCancel={() => setEditingSaving(null)}
      />

      <SavingsList
        savings={savings}
        onEdit={setEditingSaving}
        onDelete={deleteSavings}
      />
    </div>
  );
};

export default SavingsPage;
