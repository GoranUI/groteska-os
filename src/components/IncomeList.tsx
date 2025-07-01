
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, Edit, Trash2 } from "lucide-react";
import { Income } from "@/types";

interface IncomeListProps {
  incomes: Income[];
  onEdit: (income: Income) => void;
  onDelete: (id: string) => void;
}

export const IncomeList = ({ incomes, onEdit, onDelete }: IncomeListProps) => {
  return (
    <Card className="border-0 shadow-sm ring-1 ring-gray-200">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-green-50 rounded-lg">
            <DollarSign className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">Income History</CardTitle>
            <p className="text-sm text-gray-600">{incomes.length} total entries (all paid)</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {incomes.length === 0 ? (
          <div className="text-center py-12">
            <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No income recorded yet</h3>
            <p className="text-gray-600">Add your first income entry to get started</p>
          </div>
        ) : (
          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold text-gray-900">Date</TableHead>
                  <TableHead className="font-semibold text-gray-900">Client</TableHead>
                  <TableHead className="font-semibold text-gray-900">Amount</TableHead>
                  <TableHead className="font-semibold text-gray-900">Currency</TableHead>
                  <TableHead className="font-semibold text-gray-900">Category</TableHead>
                  <TableHead className="font-semibold text-gray-900">Description</TableHead>
                  <TableHead className="font-semibold text-gray-900">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incomes.map((income) => (
                  <TableRow key={income.id} className="hover:bg-gray-50">
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
                        variant={income.category === 'full-time' ? 'default' : 'secondary'}
                        className={income.category === 'full-time' 
                          ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' 
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }
                      >
                        {income.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-700 max-w-xs truncate">
                      {income.description || "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
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
