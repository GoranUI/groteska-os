
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableFooter } from "@/components/ui/table-footer";
import { PiggyBank, Edit, Trash2 } from "lucide-react";
import { Savings } from "@/types";

interface SavingsListProps {
  savings: Savings[];
  onEdit: (savings: Savings) => void;
  onDelete: (id: string) => void;
}

export const SavingsList = ({ savings, onEdit, onDelete }: SavingsListProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Pagination logic
  const totalItems = savings.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = savings.slice(startIndex, endIndex);

  const formatCurrency = (amount: number, currency: string) => {
    return `${amount.toLocaleString()} ${currency}`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  const getTypeBadgeColor = (type: string) => {
    return type === 'deposit' 
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-red-100 text-red-800 border-red-200';
  };

  const formatType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <Card className="border-0 shadow-sm ring-1 ring-gray-200">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-green-50 rounded-lg">
            <PiggyBank className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">Savings History</CardTitle>
            <p className="text-sm text-gray-600">{savings.length} total entries</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {savings.length === 0 ? (
          <div className="text-center py-12 px-6">
            <PiggyBank className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No savings recorded yet</h3>
            <p className="text-gray-600">Add your first savings entry to get started</p>
          </div>
        ) : (
          <>
            <div className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold text-gray-900">Date</TableHead>
                    <TableHead className="font-semibold text-gray-900">Type</TableHead>
                    <TableHead className="font-semibold text-gray-900">Description</TableHead>
                    <TableHead className="font-semibold text-gray-900">Amount</TableHead>
                    <TableHead className="font-semibold text-gray-900">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentItems.map((savings) => (
                    <TableRow key={savings.id} className="hover:bg-gray-50">
                      <TableCell className="text-gray-700">
                        {formatDate(savings.date)}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={`text-xs font-medium border ${getTypeBadgeColor(savings.type)} px-2 py-1`}
                        >
                          {formatType(savings.type)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {savings.description}
                      </TableCell>
                      <TableCell className={`font-semibold ${savings.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
                        {savings.type === 'withdrawal' ? '-' : '+'}{formatCurrency(savings.amount, savings.currency)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(savings)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(savings.id)}
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
            
            <TableFooter
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              totalItems={totalItems}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
              startIndex={startIndex}
              endIndex={endIndex}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
};
