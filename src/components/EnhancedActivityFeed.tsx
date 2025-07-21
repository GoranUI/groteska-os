import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown, TrendingUp, TrendingDown } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  currency: string;
  date: string;
  category: string;
  description?: string;
  client?: string;
}

interface EnhancedActivityFeedProps {
  transactions: Transaction[];
  exchangeRates: { USD: number; EUR: number; };
}

export const EnhancedActivityFeed = ({ 
  transactions, 
  exchangeRates 
}: EnhancedActivityFeedProps) => {
  // Convert amount to RSD
  const convertToRSD = (amount: number, currency: string) => {
    const rate = currency === "RSD" ? 1 : exchangeRates[currency as keyof typeof exchangeRates] || 1;
    return amount * rate;
  };

  // Sort transactions by date (newest first)
  const sortedTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 20); // Show last 20 transactions

  // Category color mapping
  const getCategoryColor = (category: string, type: 'income' | 'expense') => {
    if (type === 'income') {
      return 'bg-green-100 text-green-800 border-green-200';
    }
    
    const expenseColors: Record<string, string> = {
      'Food': 'bg-orange-100 text-orange-800 border-orange-200',
      'Transport': 'bg-blue-100 text-blue-800 border-blue-200',
      'Utilities': 'bg-purple-100 text-purple-800 border-purple-200',
      'Software': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'Marketing': 'bg-pink-100 text-pink-800 border-pink-200',
      'Office': 'bg-gray-100 text-gray-800 border-gray-200',
      'Medical/Health': 'bg-red-100 text-red-800 border-red-200',
      'Holiday': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'default': 'bg-slate-100 text-slate-800 border-slate-200'
    };
    
    return expenseColors[category] || expenseColors.default;
  };

  // Calculate running balance
  let runningBalance = 0;
  const transactionsWithBalance = sortedTransactions.reverse().map(transaction => {
    const amountRSD = convertToRSD(transaction.amount, transaction.currency);
    const delta = transaction.type === 'income' ? amountRSD : -amountRSD;
    runningBalance += delta;
    
    return {
      ...transaction,
      amountRSD,
      delta,
      runningBalance
    };
  }).reverse();

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          Recent Activity
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Latest transactions with balance impact
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {transactionsWithBalance.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No transactions found</p>
          </div>
        ) : (
          transactionsWithBalance.map((transaction) => (
            <div 
              key={transaction.id}
              className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                {/* Transaction Direction Icon */}
                <div className={cn(
                  "p-2 rounded-full",
                  transaction.type === 'income' 
                    ? "bg-green-100 text-green-600" 
                    : "bg-red-100 text-red-600"
                )}>
                  {transaction.type === 'income' ? (
                    <ArrowUp className="h-4 w-4" />
                  ) : (
                    <ArrowDown className="h-4 w-4" />
                  )}
                </div>
                
                {/* Transaction Details */}
                <div className="min-w-0 flex-1 max-w-xs">
                  <div className="mb-1">
                    <p className="font-medium text-foreground truncate max-w-60" title={transaction.description || transaction.client || 'Transaction'}>
                      {transaction.description || transaction.client || 'Transaction'}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(transaction.date), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
              
              {/* Amount and Badge */}
              <div className="text-right">
                <div className="mb-1">
                  <Badge 
                    variant="outline" 
                    className={cn("text-xs mb-1", getCategoryColor(transaction.category, transaction.type))}
                  >
                    {transaction.category}
                  </Badge>
                </div>
                <div className="mb-1">
                  <span className={cn(
                    "font-semibold text-lg",
                    transaction.type === 'income' ? "text-green-600" : "text-red-600"
                  )}>
                    {transaction.type === 'income' ? '+' : '-'}
                    {transaction.amountRSD.toLocaleString('en-US', { maximumFractionDigits: 0 })} RSD
                  </span>
                </div>
                
                {/* Original currency if different */}
                {transaction.currency !== 'RSD' && (
                  <p className="text-xs text-muted-foreground">
                    {transaction.amount} {transaction.currency}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};