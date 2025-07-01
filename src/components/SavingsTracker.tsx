
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Savings } from "@/types";
import { PiggyBank, TrendingUp, TrendingDown, DollarSign } from "lucide-react";

interface SavingsTrackerProps {
  savings: Savings[];
  convertToRSD: (amount: number, currency: "USD" | "EUR" | "RSD") => number;
}

const SavingsTracker = ({ savings, convertToRSD }: SavingsTrackerProps) => {
  // Calculate totals by currency
  const totals = savings.reduce(
    (acc, saving) => {
      const amount = saving.type === 'deposit' ? saving.amount : -saving.amount;
      acc[saving.currency] += amount;
      return acc;
    },
    { USD: 0, EUR: 0, RSD: 0 }
  );

  // Calculate total in RSD
  const totalRSD = Object.entries(totals).reduce(
    (sum, [currency, amount]) => sum + convertToRSD(amount, currency as "USD" | "EUR" | "RSD"),
    0
  );

  // Calculate deposit and withdrawal totals
  const depositTotal = savings
    .filter(s => s.type === 'deposit')
    .reduce((sum, s) => sum + convertToRSD(s.amount, s.currency), 0);

  const withdrawalTotal = savings
    .filter(s => s.type === 'withdrawal')
    .reduce((sum, s) => sum + convertToRSD(s.amount, s.currency), 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm ring-1 ring-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Deposits (RSD)</p>
                <p className="text-2xl font-bold text-green-600">
                  {depositTotal.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm ring-1 ring-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Withdrawals (RSD)</p>
                <p className="text-2xl font-bold text-red-600">
                  {withdrawalTotal.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </p>
              </div>
              <div className="p-3 bg-red-50 rounded-full">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm ring-1 ring-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Current Balance (RSD)</p>
                <p className={`text-2xl font-bold ${totalRSD >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {totalRSD.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <PiggyBank className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Currency Breakdown */}
      <Card className="border-0 shadow-sm ring-1 ring-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900">Current Balance by Currency</CardTitle>
          <p className="text-sm text-gray-600">Your savings distributed across different currencies</p>
        </CardHeader>
        <CardContent className="pb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(totals).map(([currency, amount]) => (
              <div key={currency} className={`p-4 rounded-xl border-2 ${
                amount > 0 ? 'bg-green-50 border-green-200' : 
                amount < 0 ? 'bg-red-50 border-red-200' : 
                'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{currency}</p>
                    <p className={`text-xl font-bold ${
                      amount > 0 ? 'text-green-600' : 
                      amount < 0 ? 'text-red-600' : 
                      'text-gray-600'
                    }`}>
                      {amount.toLocaleString()} {currency}
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {convertToRSD(amount, currency as "USD" | "EUR" | "RSD").toLocaleString('en-US', { maximumFractionDigits: 0 })} RSD
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SavingsTracker;
