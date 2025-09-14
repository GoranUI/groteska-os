
import { Income, Expense, Client } from '@/types';

export class DataExportService {
  static exportToCSV(data: any[], filename: string) {
    if (data.length === 0) {
      console.warn('No data to export');
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Escape commas and quotes
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  static exportIncomes(incomes: Income[]) {
    const exportData = incomes.map(income => ({
      Date: income.date,
      Client: income.client,
      Amount: income.amount,
      Currency: income.currency,
      Category: income.category,
      Description: income.description || ''
    }));
    
    this.exportToCSV(exportData, `incomes-${new Date().toISOString().split('T')[0]}`);
  }

  static exportExpenses(expenses: Expense[]) {
    const exportData = expenses.map(expense => ({
      Date: expense.date,
      Description: expense.description,
      Amount: expense.amount,
      Currency: expense.currency,
      Category: expense.category,
      Recurring: expense.isRecurring ? 'Yes' : 'No',
      Frequency: expense.recurringFrequency || ''
    }));
    
    this.exportToCSV(exportData, `expenses-${new Date().toISOString().split('T')[0]}`);
  }

  static exportClients(clients: Client[]) {
    const exportData = clients.map(client => ({
      Name: client.name,
      Email: client.email || '',
      Company: client.company || '',
      Status: client.status,
      'Created At': client.createdAt
    }));
    
    this.exportToCSV(exportData, `clients-${new Date().toISOString().split('T')[0]}`);
  }

}
