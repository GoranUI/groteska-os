
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFinancialData } from "@/hooks/useFinancialData";
import Dashboard from "@/components/Dashboard";
import IncomeTracker from "@/components/IncomeTracker";
import ExpenseTracker from "@/components/ExpenseTracker";
import { BarChart3, TrendingUp, Receipt } from "lucide-react";

const Index = () => {
  const { incomes, expenses, addIncome, addExpense } = useFinancialData();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-xl">
                <BarChart3 className="h-8 w-8 text-orange-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Financial Tracker</h1>
                <p className="text-sm text-gray-600">Multi-currency income and expense management</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="dashboard" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 bg-white border border-gray-200 p-1">
            <TabsTrigger 
              value="dashboard" 
              className="flex items-center space-x-2 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-600 data-[state=active]:border-orange-200"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger 
              value="income" 
              className="flex items-center space-x-2 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-600 data-[state=active]:border-orange-200"
            >
              <TrendingUp className="h-4 w-4" />
              <span>Income</span>
            </TabsTrigger>
            <TabsTrigger 
              value="expenses" 
              className="flex items-center space-x-2 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-600 data-[state=active]:border-orange-200"
            >
              <Receipt className="h-4 w-4" />
              <span>Expenses</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-8">
            <Dashboard incomes={incomes} expenses={expenses} />
          </TabsContent>

          <TabsContent value="income" className="mt-8">
            <IncomeTracker incomes={incomes} onAddIncome={addIncome} />
          </TabsContent>

          <TabsContent value="expenses" className="mt-8">
            <ExpenseTracker expenses={expenses} onAddExpense={addExpense} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
