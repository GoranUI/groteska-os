
import { useState } from "react";
import { useFinancialData } from "@/hooks/useFinancialData";
import { ExpenseForm } from "@/components/ExpenseForm";
import { ExpenseList } from "@/components/ExpenseList";

const ExpensesPage = () => {
  const { expenses, addExpense, updateExpense, deleteExpense } = useFinancialData();
  const [editingExpense, setEditingExpense] = useState(null);

  return (
    <div className="p-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Expense Tracker</h1>
        <p className="text-gray-600">Track and categorize your expenses</p>
      </div>

      <ExpenseForm
        onSubmit={editingExpense ? 
          (data) => {
            updateExpense(editingExpense.id, data);
            setEditingExpense(null);
          } :
          addExpense
        }
        initialData={editingExpense}
        onCancel={() => setEditingExpense(null)}
      />

      <ExpenseList
        expenses={expenses}
        onEdit={setEditingExpense}
        onDelete={deleteExpense}
      />
    </div>
  );
};

export default ExpensesPage;
