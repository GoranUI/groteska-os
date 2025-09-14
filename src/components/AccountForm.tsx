import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit3, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Account } from '@/types/finance';

interface AccountFormProps {
  accounts: Account[];
  onAddAccount: (account: Omit<Account, 'id'>) => void;
  onUpdateAccount: (id: string, account: Partial<Account>) => void;
  onDeleteAccount: (id: string) => void;
  onClearAllAccounts?: () => void;
  className?: string;
}

export const AccountForm = ({ 
  accounts, 
  onAddAccount, 
  onUpdateAccount, 
  onDeleteAccount, 
  onClearAllAccounts,
  className 
}: AccountFormProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [formData, setFormData] = useState({
    bank_name: '',
    type: 'CHECKING' as 'CHECKING' | 'SAVINGS',
    account_number: '',
    currency: 'RSD' as 'RSD' | 'USD',
    balance_available: 0,
    balance_pending: 0,
  });

  const resetForm = () => {
    setFormData({
      bank_name: '',
      type: 'CHECKING',
      account_number: '',
      currency: 'RSD',
      balance_available: 0,
      balance_pending: 0,
    });
    setEditingAccount(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingAccount) {
      onUpdateAccount(editingAccount.id, formData);
    } else {
      onAddAccount({
        ...formData,
        last_txn_at: new Date().toISOString()
      });
    }
    
    resetForm();
    setIsDialogOpen(false);
  };

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    setFormData({
      bank_name: account.bank_name,
      type: account.type,
      account_number: account.account_number,
      currency: account.currency,
      balance_available: account.balance_available,
      balance_pending: account.balance_pending,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Da li ste sigurni da želite da obrišete ovaj račun?')) {
      onDeleteAccount(id);
    }
  };

  const formatCurrency = (amount: number, currency: 'RSD' | 'USD') => {
    return new Intl.NumberFormat('sr-RS', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };


  return (
    <div className={className}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="text-sm font-medium">My Bank Accounts</CardTitle>
          <div className="flex items-center gap-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
            <div className="flex gap-2">
              {accounts.length > 0 && onClearAllAccounts && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (window.confirm('Da li ste sigurni da želite da obrišete sve račune?')) {
                      onClearAllAccounts();
                    }
                  }}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                            Clear All
                </Button>
              )}
              <Button size="sm" onClick={resetForm} data-testid="add-account-button">
                <Plus className="h-3 w-3 mr-1" />
                Add Account
              </Button>
            </div>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingAccount ? 'Edit Account' : 'Add New Account'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bank_name">Bank Name</Label>
                    <Input
                      id="bank_name"
                      value={formData.bank_name}
                      onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                      placeholder="e.g. Chase Bank, Bank of America..."
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="type">Account Type</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value: 'CHECKING' | 'SAVINGS') => 
                          setFormData({ ...formData, type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CHECKING">Checking Account</SelectItem>
                          <SelectItem value="SAVINGS">Savings Account</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
                      <Select
                        value={formData.currency}
                        onValueChange={(value: 'RSD' | 'USD') => 
                          setFormData({ ...formData, currency: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="RSD">RSD</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="account_number">Account Number</Label>
                    <Input
                      id="account_number"
                      value={formData.account_number}
                      onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                      placeholder="e.g. 1234567890123456"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter the full account number
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="balance_available">Available Balance</Label>
                      <Input
                        id="balance_available"
                        type="number"
                        step="0.01"
                        value={formData.balance_available}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          balance_available: parseFloat(e.target.value) || 0 
                        })}
                        placeholder="0.00"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="balance_pending">Pending Balance</Label>
                      <Input
                        id="balance_pending"
                        type="number"
                        step="0.01"
                        value={formData.balance_pending}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          balance_pending: parseFloat(e.target.value) || 0 
                        })}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsDialogOpen(false);
                        resetForm();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingAccount ? 'Save Changes' : 'Add Account'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        
        <CardContent>
          {accounts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No accounts added</p>
              <p className="text-sm">Add your bank accounts to see balances</p>
            </div>
          ) : (
            <div className="space-y-4">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
                      {account.type === 'CHECKING' ? '🏦' : '💰'}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{account.bank_name}</span>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {account.type === 'CHECKING' ? 'Checking' : 'Savings'}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {account.account_number}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Last transaction: {new Date(account.last_txn_at).toLocaleDateString('en-US')}
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
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(account)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(account.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
