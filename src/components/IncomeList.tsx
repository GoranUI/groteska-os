
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Income } from "@/types";
import { CurrencyDollarIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Trash2, Edit } from "lucide-react";

interface IncomeListProps {
  incomes: Income[];
  onEdit: (income: Income) => void;
  onDelete: (id: string) => void;
}

export const IncomeList = ({ incomes, onEdit, onDelete }: IncomeListProps) => {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(new Set(incomes.map(income => income.id)));
    } else {
      setSelectedItems(new Set());
    }
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    const newSelection = new Set(selectedItems);
    if (checked) {
      newSelection.add(id);
    } else {
      newSelection.delete(id);
    }
    setSelectedItems(newSelection);
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedItems.size} income entries?`)) {
      selectedItems.forEach(id => onDelete(id));
      setSelectedItems(new Set());
    }
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-green-50 rounded-lg">
              <CurrencyDollarIcon className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">Income History</CardTitle>
              <p className="text-sm text-gray-600">{incomes.length} total entries</p>
            </div>
          </div>
          {selectedItems.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{selectedItems.size} selected</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkDelete}
                className="gap-2 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
                Delete Selected
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {incomes.length === 0 ? (
          <div className="text-center py-12">
            <CurrencyDollarIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No income recorded yet</h3>
            <p className="text-gray-600">Add your first income entry to get started</p>
          </div>
        ) : (
          <div className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedItems.size === incomes.length}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900">Date</TableHead>
                  <TableHead className="font-semibold text-gray-900">Client</TableHead>
                  <TableHead className="font-semibold text-gray-900">Amount</TableHead>
                  <TableHead className="font-semibold text-gray-900">Currency</TableHead>
                  <TableHead className="font-semibold text-gray-900">Status</TableHead>
                  <TableHead className="font-semibold text-gray-900">Category</TableHead>
                  <TableHead className="font-semibold text-gray-900 w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incomes.map((income) => (
                  <TableRow key={income.id} className="hover:bg-gray-50">
                    <TableCell>
                      <Checkbox
                        checked={selectedItems.has(income.id)}
                        onCheckedChange={(checked) => handleSelectItem(income.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell className="font-medium text-gray-900">
                      {new Date(income.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-gray-700">{income.client}</TableCell>
                    <TableCell className="font-semibold text-green-600">
                      {income.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-gray-300 text-gray-700">
                        {income.currency}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={income.status === 'paid' ? 'default' : 'secondary'}
                        className={income.status === 'paid' 
                          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                          : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                        }
                      >
                        {income.status === 'paid' ? 'Paid' : 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={income.category === 'main-bank' ? 'default' : 'secondary'}
                        className={
                          income.category === 'main-bank' 
                            ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                            : income.category === 'savings'
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : income.category === 'cash'
                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }
                      >
                        {income.category === 'main-bank' ? 'Main Bank Account' : 
                         income.category === 'one-time' ? 'One-time Project' : 
                         income.category.charAt(0).toUpperCase() + income.category.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(income)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(income.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
