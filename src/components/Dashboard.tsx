
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { CircleDollarSign, PiggyBank, FileDown, FileUp, Users, LayoutDashboard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useExchangeRates } from "@/hooks/useExchangeRates";
import { ExpenseForm } from "@/components/ExpenseForm";
import { IncomeForm } from "@/components/IncomeForm";
import { SavingsForm } from "@/components/SavingsForm";
import { ExpenseTable } from "@/components/ExpenseTable";
import { ExportButton } from "@/components/ExportButton";
import { Project, SubTask } from "@/types";

interface DashboardProps {
  totalBalance: number;
  totalInRSD: number;
  exchangeRates: {
    USD: number;
    EUR: number;
  };
  clients: any[];
  expenses: any[];
  incomes: any[];
  savings: any[];
  projects: Project[];
  subTasks: SubTask[];
  addIncome: (data: any) => void;
  addExpense: (data: any) => void;
  addSavings: (data: any) => void;
  updateIncome: (id: string, data: any) => void;
  updateExpense: (id: string, data: any) => void;
  updateSavings: (id: string, data: any) => void;
  deleteIncome: (id: string) => void;
  deleteExpense: (id: string) => void;
  deleteSavings: (id: string) => void;
}

export const Dashboard = ({
  totalBalance,
  totalInRSD,
  exchangeRates,
  clients,
  expenses,
  incomes,
  savings,
  projects,
  subTasks,
  addIncome,
  addExpense,
  addSavings,
  updateIncome,
  updateExpense,
  updateSavings,
  deleteIncome,
  deleteExpense,
  deleteSavings,
}: DashboardProps) => {
  const { toast } = useToast();
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showSavingsForm, setShowSavingsForm] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);
  const [editingSavings, setEditingSavings] = useState(null);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-12 px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-white shadow-md rounded-lg overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Balance
              </CardTitle>
              <CircleDollarSign className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalBalance.toLocaleString()} EUR
              </div>
              <p className="text-sm text-gray-500">
                = {totalInRSD.toLocaleString()} RSD
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-md rounded-lg overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Clients
              </CardTitle>
              <Users className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clients.length}</div>
              <p className="text-sm text-gray-500">
                {clients.length > 0 ? 'Clients' : 'No clients yet'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-md rounded-lg overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Savings
              </CardTitle>
              <PiggyBank className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{savings.length}</div>
              <p className="text-sm text-gray-500">
                {savings.length > 0 ? 'Savings entries' : 'No savings yet'}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2">
            <Card className="bg-white shadow-md rounded-lg overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Recent Expenses
                </CardTitle>
                <Button size="sm" onClick={() => setShowExpenseForm(true)}>
                  Add Expense
                </Button>
              </CardHeader>
              <CardContent>
                <ExpenseTable
                  expenses={expenses}
                  onEdit={setEditingExpense}
                  onDelete={deleteExpense}
                />
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="bg-white shadow-md rounded-lg overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Recent Income
                </CardTitle>
                <Button size="sm" onClick={() => setShowIncomeForm(true)}>
                  Add Income
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {incomes.slice(0, 5).map((income) => (
                    <div key={income.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">{income.client}</p>
                        <p className="text-sm text-gray-500">{income.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{income.amount} {income.currency}</p>
                        <p className="text-sm text-gray-500">{income.category}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div>
            <Card className="bg-white shadow-md rounded-lg overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Savings Overview
                </CardTitle>
                <Button size="sm" onClick={() => setShowSavingsForm(true)}>
                  Add Savings
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {savings.slice(0, 5).map((saving) => (
                    <div key={saving.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">{saving.description}</p>
                        <p className="text-sm text-gray-500">{saving.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{saving.amount} {saving.currency}</p>
                        <p className="text-sm text-gray-500">{saving.type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {showIncomeForm && (
          <IncomeForm
            clients={clients}
            onSubmit={(data) => {
              addIncome(data);
              setShowIncomeForm(false);
            }}
            onCancel={() => setShowIncomeForm(false)}
          />
        )}

        {showExpenseForm && (
          <ExpenseForm
            onSubmit={(data) => {
              addExpense(data);
              setShowExpenseForm(false);
            }}
            onCancel={() => setShowExpenseForm(false)}
          />
        )}

        {showSavingsForm && (
          <SavingsForm
            onSubmit={(data) => {
              addSavings(data);
              setShowSavingsForm(false);
            }}
            onCancel={() => setShowSavingsForm(false)}
          />
        )}
      </div>
    </div>
  );
};
