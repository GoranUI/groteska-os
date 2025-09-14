import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Banknote, CreditCard, Clock, Eye, EyeOff } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Account } from '@/types/finance';

interface AccountsListProps {
  accounts: Account[];
  fxRate: number;
  className?: string;
}

export const AccountsList = ({ accounts, fxRate, className }: AccountsListProps) => {
  const [showNumbers, setShowNumbers] = useState(false);

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

  const getAccountIcon = (type: 'CHECKING' | 'SAVINGS') => {
    return type === 'CHECKING' ? <CreditCard className="h-4 w-4" /> : <Banknote className="h-4 w-4" />;
  };

  const getAccountTypeColor = (type: 'CHECKING' | 'SAVINGS') => {
    return type === 'CHECKING' 
      ? 'bg-blue-100 text-blue-800 border-blue-200'
      : 'bg-green-100 text-green-800 border-green-200';
  };

  const maskAccountNumber = (number: string) => {
    if (showNumbers) return number;
    return number.replace(/\d(?=\d{4})/g, '*');
  };

  const getLastTransactionText = (lastTxnAt: string) => {
    const date = new Date(lastTxnAt);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return format(date, 'MMM dd, yyyy');
  };

  if (accounts.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Bank Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Banknote className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No bank accounts connected</p>
            <p className="text-sm">Connect your accounts to see balances</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-sm font-medium">Bank Accounts</CardTitle>
        <button
          onClick={() => setShowNumbers(!showNumbers)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {showNumbers ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
          {showNumbers ? 'Hide' : 'Show'} numbers
        </button>
      </CardHeader>
      <CardContent className="space-y-4">
        {accounts.map((account) => (
          <div
            key={account.id}
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
                {getAccountIcon(account.type)}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{account.bank_name}</span>
                  <Badge className={cn('text-xs', getAccountTypeColor(account.type))}>
                    {account.type}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {maskAccountNumber(account.number_mask)}
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>Last transaction: {getLastTransactionText(account.last_txn_at)}</span>
                </div>
              </div>
            </div>
            
            <div className="text-right space-y-1">
              <div className="font-medium">
                {formatCurrency(account.balance_available, account.currency)}
              </div>
              <div className="text-sm text-muted-foreground">
                Available
              </div>
              {account.balance_pending > 0 && (
                <div className="text-sm text-muted-foreground">
                  Pending: {formatCurrency(account.balance_pending, account.currency)}
                </div>
              )}
              {account.currency === 'USD' && (
                <div className="text-xs text-muted-foreground">
                  ≈ {formatCurrency(account.balance_available * fxRate, 'RSD')} RSD
                </div>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
