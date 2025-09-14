import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, ArrowDownRight, Plus, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { CashFlowItem } from '@/types/finance';

interface MoneyTablesProps {
  moneyIn: CashFlowItem[];
  moneyOut: CashFlowItem[];
  onAddIncome?: () => void;
  onAddExpense?: () => void;
  className?: string;
}

export const MoneyTables = ({ 
  moneyIn, 
  moneyOut, 
  onAddIncome, 
  onAddExpense, 
  className 
}: MoneyTablesProps) => {
  const formatCurrency = (amount: number, currency: 'RSD' | 'USD') => {
    return new Intl.NumberFormat('sr-RS', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('sr-RS', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'client-projects': 'bg-blue-100 text-blue-800 border-blue-200',
      'retainer-services': 'bg-green-100 text-green-800 border-green-200',
      'consulting': 'bg-purple-100 text-purple-800 border-purple-200',
      'product-sales': 'bg-orange-100 text-orange-800 border-orange-200',
      'licensing': 'bg-pink-100 text-pink-800 border-pink-200',
      'partnerships': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'office-rent': 'bg-red-100 text-red-800 border-red-200',
      'equipment': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'software-subscriptions': 'bg-cyan-100 text-cyan-800 border-cyan-200',
      'marketing-advertising': 'bg-rose-100 text-rose-800 border-rose-200',
      'professional-services': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'travel-client-meetings': 'bg-violet-100 text-violet-800 border-violet-200',
      'education-training': 'bg-amber-100 text-amber-800 border-amber-200',
      'insurance': 'bg-slate-100 text-slate-800 border-slate-200',
      'utilities': 'bg-teal-100 text-teal-800 border-teal-200',
      'office-supplies': 'bg-lime-100 text-lime-800 border-lime-200',
      'client-entertainment': 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200',
      'banking-fees': 'bg-gray-100 text-gray-800 border-gray-200',
      'taxes-compliance': 'bg-red-100 text-red-800 border-red-200',
      'other-business': 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatCategoryName = (category: string) => {
    return category.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const MoneyInTable = () => (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <ArrowUpRight className="h-4 w-4 text-green-600" />
          Money In
        </CardTitle>
        {onAddIncome && (
          <Button size="sm" onClick={onAddIncome} className="h-8 hover:scale-105 transition-transform duration-200">
            <Plus className="h-3 w-3 mr-1" />
            Add Income
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {moneyIn.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <ArrowUpRight className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No income recorded</p>
            <p className="text-sm">Add income to see it here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {moneyIn.slice(0, 10).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 hover:shadow-sm transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
                    <ArrowUpRight className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="space-y-1">
                    <div className="font-medium">{item.counterparty}</div>
                    <div className="flex items-center gap-2">
                      <Badge className={cn('text-xs', getCategoryColor(item.category))}>
                        {formatCategoryName(item.category)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(item.date), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-green-600">
                    {formatCurrency(item.amount, item.currency)}
                  </div>
                  {item.currency !== 'RSD' && (
                    <div className="text-xs text-muted-foreground">
                      ≈ {formatCurrency(item.amount_rsd, 'RSD')} RSD
                    </div>
                  )}
                </div>
              </div>
            ))}
            {moneyIn.length > 10 && (
              <div className="text-center pt-2">
                <Button variant="ghost" size="sm" className="text-xs">
                  View all {moneyIn.length} entries
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const MoneyOutTable = () => (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <ArrowDownRight className="h-4 w-4 text-red-600" />
          Money Out
        </CardTitle>
        {onAddExpense && (
          <Button size="sm" onClick={onAddExpense} className="h-8 hover:scale-105 transition-transform duration-200">
            <Plus className="h-3 w-3 mr-1" />
            Add Expense
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {moneyOut.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <ArrowDownRight className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No expenses recorded</p>
            <p className="text-sm">Add expenses to see them here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {moneyOut.slice(0, 10).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 hover:shadow-sm transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100">
                    <ArrowDownRight className="h-4 w-4 text-red-600" />
                  </div>
                  <div className="space-y-1">
                    <div className="font-medium">{item.counterparty}</div>
                    <div className="flex items-center gap-2">
                      <Badge className={cn('text-xs', getCategoryColor(item.category))}>
                        {formatCategoryName(item.category)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(item.date), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-red-600">
                    {formatCurrency(item.amount, item.currency)}
                  </div>
                  {item.currency !== 'RSD' && (
                    <div className="text-xs text-muted-foreground">
                      ≈ {formatCurrency(item.amount_rsd, 'RSD')} RSD
                    </div>
                  )}
                </div>
              </div>
            ))}
            {moneyOut.length > 10 && (
              <div className="text-center pt-2">
                <Button variant="ghost" size="sm" className="text-xs">
                  View all {moneyOut.length} entries
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className={cn('grid grid-cols-1 lg:grid-cols-2 gap-6', className)}>
      <MoneyInTable />
      <MoneyOutTable />
    </div>
  );
};
