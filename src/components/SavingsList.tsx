
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Savings } from "@/types";
import { PencilIcon, TrashIcon, ChartBarIcon } from "@heroicons/react/24/outline";

interface SavingsListProps {
  savings: Savings[];
  onEdit: (saving: Savings) => void;
  onDelete: (id: string) => void;
}

export const SavingsList = ({ savings, onEdit, onDelete }: SavingsListProps) => {
  // Sort savings by date (most recent first)
  const sortedSavings = [...savings].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (savings.length === 0) {
    return (
      <Card className="border-0 shadow-sm ring-1 ring-gray-200">
        <CardContent className="p-12 text-center">
          <ChartBarIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No savings entries yet</h3>
          <p className="text-gray-600">Start tracking your savings by adding your first deposit or withdrawal above.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm ring-1 ring-gray-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-900">Savings History</CardTitle>
        <p className="text-sm text-gray-600">{savings.length} total entries</p>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-gray-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold text-gray-900">Date</TableHead>
                <TableHead className="font-semibold text-gray-900">Type</TableHead>
                <TableHead className="font-semibold text-gray-900">Amount</TableHead>
                <TableHead className="font-semibold text-gray-900">Currency</TableHead>
                <TableHead className="font-semibold text-gray-900">Description</TableHead>
                <TableHead className="font-semibold text-gray-900">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedSavings.map((saving) => (
                <TableRow key={saving.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium text-gray-900">
                    {new Date(saving.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={saving.type === 'deposit' ? 'default' : 'destructive'}
                      className={saving.type === 'deposit' 
                        ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }
                    >
                      {saving.type}
                    </Badge>
                  </TableCell>
                  <TableCell className={`font-semibold ${saving.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
                    {saving.type === 'deposit' ? '+' : '-'}{saving.amount.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-gray-300 text-gray-700">
                      {saving.currency}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-700 max-w-xs truncate">
                    {saving.description || '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(saving)}
                        className="h-8 w-8 p-0 text-gray-400 hover:text-blue-600"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(saving.id)}
                        className="h-8 w-8 p-0 text-gray-400 hover:text-red-600"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
