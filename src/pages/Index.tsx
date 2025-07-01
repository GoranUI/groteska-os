
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import IncomeTracker from "@/components/IncomeTracker";
import ExpenseTracker from "@/components/ExpenseTracker";
import Dashboard from "@/components/Dashboard";
import { useFinancialData } from "@/hooks/useFinancialData";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { incomes, expenses, addIncome, addExpense, getTotalBalance } = useFinancialData();

  const balances = getTotalBalance();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Financial Tracker</h1>
          <p className="text-gray-600">Track your income and expenses across multiple currencies</p>
        </div>

        {/* Balance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {Object.entries(balances).map(([currency, balance]) => (
            <Card key={currency} className="border-orange-200 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Balance ({currency})
                </CardTitle>
                <DollarSign className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {balance.toFixed(2)} {currency}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Current balance
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-orange-100">
            <TabsTrigger 
              value="dashboard" 
              className="data-[state=active]:bg-orange-600 data-[state=active]:text-white"
            >
              Dashboard
            </TabsTrigger>
            <TabsTrigger 
              value="income"
              className="data-[state=active]:bg-orange-600 data-[state=active]:text-white"
            >
              Income
            </TabsTrigger>
            <TabsTrigger 
              value="expenses"
              className="data-[state=active]:bg-orange-600 data-[state=active]:text-white"
            >
              Expenses
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <Dashboard incomes={incomes} expenses={expenses} />
          </TabsContent>

          <TabsContent value="income" className="space-y-6">
            <IncomeTracker incomes={incomes} onAddIncome={addIncome} />
          </TabsContent>

          <TabsContent value="expenses" className="space-y-6">
            <ExpenseTracker expenses={expenses} onAddExpense={addExpense} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
