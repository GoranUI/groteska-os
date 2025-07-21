
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { InvoiceForm } from "@/components/InvoiceForm";
import { InvoiceList } from "@/components/InvoiceList";
import { InvoiceViewer } from "@/components/InvoiceViewer";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useInvoiceData } from "@/hooks/data/useInvoiceData";
import { Invoice } from "@/types";

const InvoicesPage = () => {
  const { clients, projects, subTasks } = useSupabaseData();
  const { invoices, loading, addInvoice, updateInvoice, deleteInvoice, generateInvoiceNumber } = useInvoiceData();
  const [showForm, setShowForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);

  const handleSubmit = async (invoiceData: Omit<Invoice, 'id'>) => {
    if (editingInvoice) {
      await updateInvoice(editingInvoice.id, invoiceData);
      setEditingInvoice(null);
    } else {
      await addInvoice(invoiceData);
    }
    setShowForm(false);
  };

  const handleEdit = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      await deleteInvoice(id);
    }
  };

  const handleUpdateStatus = async (id: string, status: "sent" | "paid") => {
    await updateInvoice(id, { status });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingInvoice(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading invoices...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto p-4 lg:p-8 space-y-8">
        {/* Enhanced Header */}
        <div className="text-center space-y-4 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="p-3 bg-info/10 rounded-2xl">
              <svg className="h-8 w-8 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-info via-info-light to-info bg-clip-text text-transparent">
              Invoices
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Manage your invoices and billing with professional templates
          </p>
          
          {/* Action Buttons */}
          {!showForm && (
            <div className="flex items-center justify-center gap-3 mt-6">
              <Button onClick={() => setShowForm(true)} className="btn-primary">
                <Plus className="h-4 w-4 mr-2" />
                Create Invoice
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-8">
          {showForm ? (
            <InvoiceForm
              clients={clients}
              projects={projects}
              subTasks={subTasks}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              initialInvoice={editingInvoice || undefined}
              generateInvoiceNumber={generateInvoiceNumber}
            />
          ) : (
            <InvoiceList
              invoices={invoices}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={setViewingInvoice}
              onUpdateStatus={handleUpdateStatus}
            />
          )}

          {viewingInvoice && (
            <InvoiceViewer
              invoice={viewingInvoice}
              onClose={() => setViewingInvoice(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoicesPage;
