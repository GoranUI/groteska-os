import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Upload, 
  Plus, 
  Minus, 
  RefreshCw, 
  FileText, 
  DollarSign, 
  CreditCard,
  Download
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickActionsProps {
  onImportStatement?: () => void;
  onAddIncome?: () => void;
  onAddExpense?: () => void;
  onRefreshConnections?: () => void;
  onExportData?: () => void;
  loading?: boolean;
  className?: string;
}

export const QuickActions = ({
  onImportStatement,
  onAddIncome,
  onAddExpense,
  onRefreshConnections,
  onExportData,
  loading = false,
  className
}: QuickActionsProps) => {
  const actions = [
    {
      id: 'import',
      label: 'Import Statement',
      description: 'Upload bank statement CSV',
      icon: Upload,
      onClick: onImportStatement,
      variant: 'default' as const,
      disabled: loading
    },
    {
      id: 'income',
      label: 'Add Income',
      description: 'Record new income',
      icon: Plus,
      onClick: onAddIncome,
      variant: 'default' as const,
      disabled: loading
    },
    {
      id: 'expense',
      label: 'Add Expense',
      description: 'Record new expense',
      icon: Minus,
      onClick: onAddExpense,
      variant: 'outline' as const,
      disabled: loading
    },
    {
      id: 'refresh',
      label: 'Refresh Connections',
      description: 'Sync bank accounts',
      icon: RefreshCw,
      onClick: onRefreshConnections,
      variant: 'outline' as const,
      disabled: loading
    },
    {
      id: 'export',
      label: 'Export Data',
      description: 'Download financial data',
      icon: Download,
      onClick: onExportData,
      variant: 'outline' as const,
      disabled: loading
    }
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.id}
                variant={action.variant}
                onClick={action.onClick}
                disabled={action.disabled || !action.onClick}
                className={cn(
                  'w-full h-auto p-4 flex items-center space-x-3 text-left justify-start',
                  action.variant === 'default' && 'bg-primary text-primary-foreground hover:bg-primary/90',
                  action.variant === 'outline' && 'border hover:bg-muted',
                  action.disabled && 'opacity-50 cursor-not-allowed'
                )}
              >
                <Icon className={cn(
                  'h-5 w-5 flex-shrink-0',
                  action.id === 'refresh' && loading && 'animate-spin'
                )} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{action.label}</div>
                  <div className="text-xs opacity-80 truncate">{action.description}</div>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
