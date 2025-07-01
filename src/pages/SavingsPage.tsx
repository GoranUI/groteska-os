
import { useState } from "react";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { SavingsForm } from "@/components/SavingsForm";
import { SavingsList } from "@/components/SavingsList";
import { Loader2 } from "lucide-react";

const SavingsPage = () => {
  const { savings, addSavings, updateSavings, deleteSavings, loading } = useSupabaseData();
  const [editingSaving, setEditingSaving] = useState(null);

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
