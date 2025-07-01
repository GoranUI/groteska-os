
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Invoice } from "@/types";
import { FileText, X } from "lucide-react";

interface InvoiceViewerProps {
  invoice: Invoice;
  onClose: () => void;
}

export const InvoiceViewer = ({ invoice, onClose }: InvoiceViewerProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <Card className="border-0 shadow-xl">
          <CardHeader className="pb-4 relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="absolute right-4 top-4 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  Invoice {invoice.invoiceNumber}
                </CardTitle>
                <Badge className={getStatusColor(invoice.status)}>
                  {invoice.status}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Invoice Header */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Invoice Details</h3>
                <div className="space-y-1">
                  <p><span className="font-medium">Invoice Number:</span> {invoice.invoiceNumber}</p>
                  <p><span className="font-medium">Invoice Date:</span> {new Date(invoice.invoiceDate).toLocaleDateString()}</p>
                  <p><span className="font-medium">Due Date:</span> {new Date(invoice.dueDate).toLocaleDateString()}</p>
                  <p><span className="font-medium">Currency:</span> {invoice.currency}</p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Client Information</h3>
                <div className="space-y-1">
                  <p><span className="font-medium">Name:</span> {invoice.clientName}</p>
                  {invoice.clientEmail && (
                    <p><span className="font-medium">Email:</span> {invoice.clientEmail}</p>
                  )}
                  {invoice.clientAddress && (
                    <p><span className="font-medium">Address:</span> {invoice.clientAddress}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Invoice Items */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Items</h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-900">Description</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-900">Qty</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-900">Unit Price</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-900">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {invoice.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 text-gray-900">{item.description}</td>
                        <td className="px-4 py-3 text-right text-gray-700">{item.quantity}</td>
                        <td className="px-4 py-3 text-right text-gray-700">
                          {item.unitPrice.toFixed(2)} {invoice.currency}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-gray-900">
                          {item.totalPrice.toFixed(2)} {invoice.currency}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Invoice Totals */}
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-700">Subtotal:</span>
                  <span className="font-medium">{invoice.subtotal.toFixed(2)} {invoice.currency}</span>
                </div>
                {invoice.taxRate > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-700">Tax ({invoice.taxRate}%):</span>
                    <span className="font-medium">{invoice.taxAmount.toFixed(2)} {invoice.currency}</span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-2 text-lg font-semibold">
                  <span>Total:</span>
                  <span>{invoice.totalAmount.toFixed(2)} {invoice.currency}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Notes</h3>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{invoice.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
