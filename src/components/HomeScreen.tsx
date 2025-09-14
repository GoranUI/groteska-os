import { useState, useEffect, useCallback } from 'react';
import { PeriodFilter } from './PeriodFilter';
import { FxRateWidget } from './FxRateWidget';
import { FinancialKPIs } from './FinancialKPIs';
import { AccountsList } from './AccountsList';
import { CashFlowChart } from './CashFlowChart';
import { MoneyTables } from './MoneyTables';
import { QuickActions } from './QuickActions';
import { LoadingSkeleton } from './LoadingSkeleton';
import { AccountForm } from './AccountForm';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle, Loader2, TrendingUp, TrendingDown, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useExchangeRates } from '@/hooks/useExchangeRates';
import { 
  PeriodFilter as PeriodFilterType, 
  FinancialSummary, 
  FxRateResponse, 
  FxRateUpdate,
  Account,
  CashFlowItem
} from '@/types/finance';

interface HomeScreenProps {
  className?: string;
}

export const HomeScreen = ({ className }: HomeScreenProps) => {
  const [period, setPeriod] = useState<PeriodFilterType>({
    type: '30d',
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });
  
  const [data, setData] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [accounts, setAccounts] = useState<Account[]>(() => {
    // Load accounts from localStorage on component mount
    try {
      const saved = localStorage.getItem('user-accounts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  
  // Use the real exchange rate API
  const { rates, loading: ratesLoading, error: ratesError, lastUpdated: ratesLastUpdated, forceRefresh } = useExchangeRates();

  // Calculate totals from real accounts
  const calculateTotals = (accounts: Account[], fxRate: number) => {
    const totalRsd = accounts.reduce((total, account) => {
      if (account.currency === 'RSD') {
        return total + account.balance_available;
      } else {
        return total + (account.balance_available * fxRate);
      }
    }, 0);

    return {
      totalRsd,
      rsdAccount: accounts.find(acc => acc.currency === 'RSD') || { balance_available: 0, balance_pending: 0 },
      usdAccount: accounts.find(acc => acc.currency === 'USD') || { balance_available: 0, balance_pending: 0 }
    };
  };

  // Mock data for demonstration - will be replaced with real data
  const getMockData = (fxRate: number, userAccounts: Account[]): FinancialSummary => {
    const totals = calculateTotals(userAccounts, fxRate);
    
    return {
      accounts: userAccounts,
      kpis: {
        moneyInRsd: 45000,
        moneyOutRsd: 32000,
        netRsd: 13000,
        totalRsd: totals.totalRsd,
        fxRate: fxRate
      },
      topIn: [
        {
          id: '1',
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          direction: 'IN',
          amount: 25000,
          currency: 'RSD',
          amount_rsd: 25000,
          category: 'client-projects',
          counterparty: 'Acme Corp'
        },
        {
          id: '2',
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          direction: 'IN',
          amount: 20000,
          currency: 'RSD',
          amount_rsd: 20000,
          category: 'retainer-services',
          counterparty: 'Beta LLC'
        }
      ],
      topOut: [
        {
          id: '3',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          direction: 'OUT',
          amount: 15000,
          currency: 'RSD',
          amount_rsd: 15000,
          category: 'office-rent',
          counterparty: 'Office Space Ltd'
        },
        {
          id: '4',
          date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          direction: 'OUT',
          amount: 17000,
          currency: 'RSD',
          amount_rsd: 17000,
          category: 'equipment',
          counterparty: 'Tech Store'
        }
      ],
      chart: [
        {
          date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
          moneyIn: 10000,
          moneyOut: 8000,
          net: 2000
        },
        {
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          moneyIn: 15000,
          moneyOut: 12000,
          net: 3000
        },
        {
          date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          moneyIn: 8000,
          moneyOut: 17000,
          net: -9000
        },
        {
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          moneyIn: 20000,
          moneyOut: 10000,
          net: 10000
        },
        {
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          moneyIn: 12000,
          moneyOut: 15000,
          net: -3000
        },
        {
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          moneyIn: 25000,
          moneyOut: 8000,
          net: 17000
        }
      ]
    };
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call - in real implementation, this would fetch from your API
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Update mock data with current exchange rate and user accounts
      const updatedMockData = getMockData(rates.USD, accounts);
      
      setData(updatedMockData);
      setLastUpdated(new Date());
    } catch (err) {
      setError('Failed to load financial data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, [period, rates.USD, accounts]);

  const updateFxRate = useCallback(async (update: FxRateUpdate) => {
    try {
      // In a real implementation, this would call your API to update the rate
      console.log('Manual FX rate update:', update);
      
      // For now, we'll just refresh the rates
      await forceRefresh();
      
      // Recalculate totals with new rate
      if (data) {
        const updatedData = {
          ...data,
          kpis: {
            ...data.kpis,
            fxRate: update.rate,
            totalRsd: data.accounts.reduce((total, account) => {
              if (account.currency === 'RSD') {
                return total + account.balance_available;
              } else {
                return total + (account.balance_available * update.rate);
              }
            }, 0)
          }
        };
        setData(updatedData);
      }
    } catch (err) {
      console.error('Error updating FX rate:', err);
      throw err;
    }
  }, [data, forceRefresh]);

  // Save accounts to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('user-accounts', JSON.stringify(accounts));
    } catch (error) {
      console.error('Failed to save accounts to localStorage:', error);
    }
  }, [accounts]);

  useEffect(() => {
    fetchData();
  }, [fetchData, accounts]);

  const handlePeriodChange = (newPeriod: PeriodFilterType) => {
    setPeriod(newPeriod);
  };

  const handleRefresh = () => {
    fetchData();
    forceRefresh();
  };

  const handleImportStatement = () => {
    console.log('Import statement clicked');
    // TODO: Implement import functionality
  };

  const handleAddIncome = () => {
    console.log('Add income clicked');
    // TODO: Navigate to income form
  };

  const handleAddExpense = () => {
    console.log('Add expense clicked');
    // TODO: Navigate to expense form
  };

  const handleRefreshConnections = () => {
    console.log('Refresh connections clicked');
    // TODO: Implement bank connection refresh
  };

  const handleExportData = () => {
    console.log('Export data clicked');
    // TODO: Implement data export
  };

  // Account management functions
  const handleAddAccount = (accountData: Omit<Account, 'id'>) => {
    const newAccount: Account = {
      ...accountData,
      id: Date.now().toString(), // Simple ID generation
    };
    setAccounts(prev => [...prev, newAccount]);
  };

  const handleUpdateAccount = (id: string, updates: Partial<Account>) => {
    setAccounts(prev => prev.map(acc => 
      acc.id === id ? { ...acc, ...updates } : acc
    ));
  };

  const handleDeleteAccount = (id: string) => {
    setAccounts(prev => prev.filter(acc => acc.id !== id));
  };

  const handleClearAllAccounts = () => {
    setAccounts([]);
  };

  if (loading && !data) {
    return <LoadingSkeleton className={className} />;
  }

  if (error && !data) {
    return (
      <div className={cn('space-y-4', className)}>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              className="ml-2"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={cn('text-center py-8', className)}>
        <p className="text-muted-foreground">No financial data available</p>
      </div>
    );
  }

  const currentTotals = calculateTotals(accounts, rates.USD);
  const rsdAccount = currentTotals.rsdAccount;
  const usdAccount = currentTotals.usdAccount;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header with Period Filter and Refresh */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Financial Overview</h1>
            {!loading && data && (
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-xs font-medium">Live</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {lastUpdated && (
              <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
            )}
            {ratesLastUpdated && (
              <span>FX rates: {ratesLastUpdated.toLocaleTimeString()}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <PeriodFilter value={period} onChange={handlePeriodChange} />
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading || ratesLoading}
            className="relative"
          >
            <RefreshCw className={cn('h-4 w-4', (loading || ratesLoading) && 'animate-spin')} />
            {(loading || ratesLoading) && (
              <div className="absolute inset-0 rounded-md bg-primary/10" />
            )}
          </Button>
        </div>
      </div>

      {/* Error Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              className="ml-2"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      {ratesError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Exchange rate error: {ratesError}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={forceRefresh}
              className="ml-2"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry Rates
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* FX Rate Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <FxRateWidget
            rate={rates.USD}
            updatedAt={ratesLastUpdated?.toISOString() || new Date().toISOString()}
            source="provider"
            onRefresh={forceRefresh}
            onUpdate={updateFxRate}
            loading={ratesLoading}
            error={ratesError}
          />
        </div>
        
        {/* KPI Cards */}
        <div className="lg:col-span-3">
          <FinancialKPIs
            rsdAccount={rsdAccount}
            usdAccount={usdAccount}
            totalRsd={currentTotals.totalRsd}
            moneyIn={data.kpis.moneyInRsd}
            moneyOut={data.kpis.moneyOutRsd}
            netCashFlow={data.kpis.netRsd}
            fxRate={rates.USD}
          />
        </div>
      </div>

      {/* Accounts Management and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AccountForm
            accounts={accounts}
            onAddAccount={handleAddAccount}
            onUpdateAccount={handleUpdateAccount}
            onDeleteAccount={handleDeleteAccount}
            onClearAllAccounts={handleClearAllAccounts}
          />
        </div>
        <div className="lg:col-span-1">
          <QuickActions
            onImportStatement={handleImportStatement}
            onAddIncome={handleAddIncome}
            onAddExpense={handleAddExpense}
            onRefreshConnections={handleRefreshConnections}
            onExportData={handleExportData}
            loading={loading}
          />
        </div>
      </div>

      {/* Money In/Out Tables */}
      <MoneyTables
        moneyIn={data.topIn}
        moneyOut={data.topOut}
        onAddIncome={handleAddIncome}
        onAddExpense={handleAddExpense}
      />

      {/* Cash Flow Chart */}
      <CashFlowChart
        data={data.chart}
        period={period}
      />
    </div>
  );
};