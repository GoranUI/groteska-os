import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Wallet, DollarSign, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FinancialKPIsProps {
  rsdAccount: {
    available: number;
    pending: number;
  };
  usdAccount: {
    available: number;
    pending: number;
  };
  totalRsd: number;
  moneyIn: number;
  moneyOut: number;
  netCashFlow: number;
  fxRate: number;
  className?: string;
}

export const FinancialKPIs = ({
  rsdAccount,
  usdAccount,
  totalRsd,
  moneyIn,
  moneyOut,
  netCashFlow,
  fxRate,
  className
}: FinancialKPIsProps) => {
  const formatCurrency = (amount: number, currency: 'RSD' | 'USD' = 'RSD') => {
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

  const getNetCashFlowColor = () => {
    if (netCashFlow > 0) return 'text-green-600';
    if (netCashFlow < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getNetCashFlowIcon = () => {
    if (netCashFlow > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (netCashFlow < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-600" />;
  };

  const getNetCashFlowBgColor = () => {
    if (netCashFlow > 0) return 'bg-green-50 border-green-200';
    if (netCashFlow < 0) return 'bg-red-50 border-red-200';
    return 'bg-gray-50 border-gray-200';
  };

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4', className)}>
      {/* RSD Account */}
      <Card className="transition-all duration-200 hover:shadow-md hover:scale-[1.02]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">RSD Account</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="text-2xl font-bold">
              {formatCurrency(rsdAccount.available, 'RSD')}
            </div>
            <div className="text-xs text-muted-foreground">
              Available: {formatCurrency(rsdAccount.available, 'RSD')}
            </div>
            {rsdAccount.pending > 0 && (
              <div className="text-xs text-muted-foreground">
                Pending: {formatCurrency(rsdAccount.pending, 'RSD')}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* USD Account */}
      <Card className="transition-all duration-200 hover:shadow-md hover:scale-[1.02]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">USD Account</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="text-2xl font-bold">
              {formatCurrency(usdAccount.available, 'USD')}
            </div>
            <div className="text-xs text-muted-foreground">
              Available: {formatCurrency(usdAccount.available, 'USD')}
            </div>
            {usdAccount.pending > 0 && (
              <div className="text-xs text-muted-foreground">
                Pending: {formatCurrency(usdAccount.pending, 'USD')}
              </div>
            )}
            <div className="text-xs text-muted-foreground">
              ≈ {formatCurrency(usdAccount.available * fxRate, 'RSD')} RSD
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total in RSD */}
      <Card className="transition-all duration-200 hover:shadow-md hover:scale-[1.02]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total in RSD</CardTitle>
          <Badge variant="secondary" className="text-xs">
            Converted
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="text-2xl font-bold">
              {formatCurrency(totalRsd, 'RSD')}
            </div>
            <div className="text-xs text-muted-foreground">
              RSD: {formatCurrency(rsdAccount.available, 'RSD')}
            </div>
            <div className="text-xs text-muted-foreground">
              USD: {formatCurrency(usdAccount.available * fxRate, 'RSD')} RSD
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Money In */}
      <Card className="transition-all duration-200 hover:shadow-md hover:scale-[1.02]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Money In</CardTitle>
          <ArrowUpRight className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(moneyIn, 'RSD')}
          </div>
          <div className="text-xs text-muted-foreground">
            {formatAmount(moneyIn)} RSD
          </div>
        </CardContent>
      </Card>

      {/* Money Out */}
      <Card className="transition-all duration-200 hover:shadow-md hover:scale-[1.02]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Money Out</CardTitle>
          <ArrowDownRight className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(moneyOut, 'RSD')}
          </div>
          <div className="text-xs text-muted-foreground">
            {formatAmount(moneyOut)} RSD
          </div>
        </CardContent>
      </Card>

      {/* Net Cash Flow */}
      <Card className={cn('transition-all duration-200 hover:shadow-md', getNetCashFlowBgColor())}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Cash Flow</CardTitle>
          {getNetCashFlowIcon()}
        </CardHeader>
        <CardContent>
          <div className={cn('text-2xl font-bold transition-colors duration-200', getNetCashFlowColor())}>
            {formatCurrency(netCashFlow, 'RSD')}
          </div>
          <div className="text-xs text-muted-foreground">
            {formatAmount(netCashFlow)} RSD
          </div>
          <div className={cn('text-xs font-medium', getNetCashFlowColor())}>
            {netCashFlow > 0 ? 'Positive flow' : netCashFlow < 0 ? 'Negative flow' : 'Neutral'}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
