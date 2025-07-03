
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableFooter } from "@/components/ui/table-footer";
import { FileText, Edit, Trash2, Eye, Download, Send, CheckCircle } from "lucide-react";
import { Invoice } from "@/types";
import { PDFGenerator } from "@/utils/pdfGenerator";

interface InvoiceListProps {
  invoices: Invoice[];
  onEdit: (invoice: Invoice) => void;
  onDelete: (id: string) => void;
  onView: (invoice: Invoice) => void;
  onUpdateStatus?: (id: string, status: "sent" | "paid") => void;
}

export const InvoiceList = ({ invoices, onEdit, onDelete, onView, onUpdateStatus }: InvoiceListProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Pagination logic
  const totalItems = invoices.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = invoices.slice(startIndex, endIndex);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 hover:bg-green-200 border-green-200';
      case 'sent':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 hover:bg-red-200 border-red-200';
      case 'draft':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200';
    }
  };

  const handleDownloadPDF = (invoice: Invoice) => {
    PDFGenerator.generateInvoicePDF(invoice);
  };

  const handleMarkAsSent = (invoice: Invoice) => {
    onUpdateStatus?.(invoice.id, 'sent');
  };

  const handleMarkAsPaid = (invoice: Invoice) => {
    onUpdateStatus?.(invoice.id, 'paid');
  };

  const getStatusActions = (invoice: Invoice) => {
    const actions = [];
    
    if (invoice.status === 'draft') {
      actions.push(
        <Button
          key="mark-sent"
          variant="ghost"
          size="sm"
          onClick={() => handleMarkAsSent(invoice)}
          className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700"
          title="Mark as sent"
        >
          <Send className="h-4 w-4" />
        </Button>
      );
    }
    
    if (invoice.status === 'sent') {
      actions.push(
        <Button
          key="mark-paid"
          variant="ghost"
          size="sm"
          onClick={() => handleMarkAsPaid(invoice)}
          className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
          title="Mark as paid"
        >
          <CheckCircle className="h-4 w-4" />
        </Button>
      );
    }
    
    return actions;
  };

  return (
    <Card className="border-0 shadow-sm ring-1 ring-gray-200">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-blue-50 rounded-lg">
            <FileText className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">Invoices</CardTitle>
            <p className="text-sm text-gray-600">{invoices.length} total invoices</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {invoices.length === 0 ? (
          <div className="text-center py-12 px-6">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices yet</h3>
            <p className="text-gray-600">Create your first invoice to get started</p>
          </div>
        ) : (
          <>
            <div className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold text-gray-900">Invoice #</TableHead>
                    <TableHead className="font-semibold text-gray-900">Client</TableHead>
                    <TableHead className="font-semibold text-gray-900">Date</TableHead>
                    <TableHead className="font-semibold text-gray-900">Due Date</TableHead>
                    <TableHead className="font-semibold text-gray-900">Status</TableHead>
                    <TableHead className="font-semibold text-gray-900">Amount</TableHead>
                    <TableHead className="font-semibold text-gray-900">Currency</TableHead>
                    <TableHead className="font-semibold text-gray-900">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentItems.map((invoice) => (
                    <TableRow key={invoice.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium text-gray-900">
                        {invoice.invoiceNumber}
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {invoice.clientName}
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {new Date(invoice.invoiceDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {new Date(invoice.dueDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={`text-xs font-medium border ${getStatusColor(invoice.status)} px-2 py-1`}
                        >
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold text-gray-900">
                        {invoice.totalAmount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-gray-300 text-gray-700">
                          {invoice.currency}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onView(invoice)}
                            className="h-8 w-8 p-0"
                            title="View invoice"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadPDF(invoice)}
                            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700"
                            title="Download PDF"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          {getStatusActions(invoice)}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(invoice)}
                            className="h-8 w-8 p-0"
                            title="Edit invoice"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(invoice.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            title="Delete invoice"
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
