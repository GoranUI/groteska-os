
import { useState } from "react";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { SavingsForm } from "@/components/SavingsForm";
import { SavingsList } from "@/components/SavingsList";
import SavingsTracker from "@/components/SavingsTracker";
import { Loader2 } from "lucide-react";
import { ExportButton } from "@/components/ExportButton";

const SavingsPage = () => {
  const { savings, addSavings, updateSavings, deleteSavings, convertToRSD, loading } = useSupabaseData();
  const [editingSaving, setEditingSaving] = useState(null);

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
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
              <svg className="h-8 w-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-success via-success-light to-success bg-clip-text text-transparent">
              Savings Tracker
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Build your financial future with smart savings tracking and insights
          </p>
          
          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <ExportButton savings={savings} type="savings" />
          </div>
        </div>

        <div className="space-y-8">
          <SavingsTracker savings={savings} convertToRSD={convertToRSD} addSavings={addSavings} />

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
      </div>
    </div>
  );
};

export default SavingsPage;
