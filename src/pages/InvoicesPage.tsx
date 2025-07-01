
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
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-600">Manage your invoices and billing</p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
        )}
      </div>

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
        />
      )}

      {viewingInvoice && (
        <InvoiceViewer
          invoice={viewingInvoice}
          onClose={() => setViewingInvoice(null)}
        />
      )}
    </div>
  );
};

export default InvoicesPage;
