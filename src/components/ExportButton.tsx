
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataExportService } from "@/utils/dataExport";
import { Income, Expense, Client, Savings } from "@/types";

interface ExportButtonProps {
  incomes?: Income[];
  expenses?: Expense[];
  clients?: Client[];
  savings?: Savings[];
  type?: 'all' | 'incomes' | 'expenses' | 'clients' | 'savings';
}

export const ExportButton = ({ 
  incomes = [], 
  expenses = [], 
  clients = [], 
  savings = [], 
  type = 'all' 
}: ExportButtonProps) => {
  const handleExport = (exportType: string) => {
    switch (exportType) {
      case 'incomes':
        DataExportService.exportIncomes(incomes);
        break;
      case 'expenses':
        DataExportService.exportExpenses(expenses);
        break;
      case 'clients':
        DataExportService.exportClients(clients);
        break;
      case 'savings':
        DataExportService.exportSavings(savings);
        break;
    }
  };

  if (type !== 'all') {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => handleExport(type)}
        className="gap-2"
      >
        <Download className="h-4 w-4" />
        Export {type.charAt(0).toUpperCase() + type.slice(1)}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Export Data
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport('incomes')}>
          Export Incomes
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('expenses')}>
          Export Expenses
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('clients')}>
          Export Clients
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('savings')}>
          Export Savings
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
