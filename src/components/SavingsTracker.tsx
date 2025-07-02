
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Savings } from "@/types";
import { PiggyBank, TrendingUp, TrendingDown, DollarSign, RefreshCw, Info } from "lucide-react";
import { useExchangeRates } from "@/hooks/useExchangeRates";
import { format } from "date-fns";

interface SavingsTrackerProps {
  savings: Savings[];
  convertToRSD: (amount: number, currency: "USD" | "EUR" | "RSD") => number;
}

const SavingsTracker = ({ savings, convertToRSD }: SavingsTrackerProps) => {
  const { rates, loading: ratesLoading, error: ratesError, lastUpdated, forceRefresh } = useExchangeRates();
  
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
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-600">Current Balance by Currency (RSD)</p>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-gray-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        <div className="space-y-2">
                          <p className="font-medium">Exchange Rates (to RSD):</p>
                          <div className="space-y-1 text-sm">
                            <p>1 USD = {rates.USD.toLocaleString()} RSD</p>
                            <p>1 EUR = {rates.EUR.toLocaleString()} RSD</p>
                          </div>
                          {lastUpdated && (
                            <div className="pt-1 mt-2 border-t border-gray-200">
                              <p className="text-xs text-gray-500">
                                Last updated: {format(lastUpdated, 'MMM dd, yyyy HH:mm')}
                              </p>
                            </div>
                          )}
                          {ratesError && (
                            <p className="text-xs text-red-500">
                              Error: {ratesError}
                            </p>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-gray-500">
                    {convertToRSD(totals.USD, 'USD').toLocaleString('en-US', { maximumFractionDigits: 0 })} + {convertToRSD(totals.EUR, 'EUR').toLocaleString('en-US', { maximumFractionDigits: 0 })} + {convertToRSD(totals.RSD, 'RSD').toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </div>
                  <p className={`text-2xl font-bold ${totalRSD >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    = {totalRSD.toLocaleString('en-US', { maximumFractionDigits: 0 })} RSD
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => forceRefresh()}
                  disabled={ratesLoading}
                  className="h-8 w-8 p-0"
                >
                  <RefreshCw className={`h-4 w-4 ${ratesLoading ? 'animate-spin' : ''}`} />
                </Button>
                <div className="p-3 bg-blue-50 rounded-full">
                  <PiggyBank className="h-6 w-6 text-blue-600" />
                </div>
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
