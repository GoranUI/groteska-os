
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Invoice, InvoiceItem } from '@/types';
import { useToast } from '@/hooks/use-toast';

const transformInvoice = (dbInvoice: any, items: any[]): Invoice => ({
  id: dbInvoice.id,
  invoiceNumber: dbInvoice.invoice_number,
  clientId: dbInvoice.client_id,
  clientName: dbInvoice.client_name,
  clientEmail: dbInvoice.client_email,
  clientAddress: dbInvoice.client_address,
  invoiceDate: dbInvoice.invoice_date,
  dueDate: dbInvoice.due_date,
  status: dbInvoice.status as "draft" | "sent" | "paid" | "overdue",
  subtotal: Number(dbInvoice.subtotal),
  taxRate: Number(dbInvoice.tax_rate || 0),
  taxAmount: Number(dbInvoice.tax_amount),
  totalAmount: Number(dbInvoice.total_amount),
  currency: dbInvoice.currency as "USD" | "EUR" | "RSD",
  notes: dbInvoice.notes,
  items: items.map(item => ({
    id: item.id,
    description: item.description,
    quantity: Number(item.quantity),
    unitPrice: Number(item.unit_price),
    totalPrice: Number(item.total_price),
  })),
});

export const useInvoiceData = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Fetch invoices with their items
      const { data: invoicesData, error: invoicesError } = await supabase
        .from('invoices')
        .select(`
          *,
          invoice_items (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (invoicesError) throw invoicesError;

      const transformedInvoices = (invoicesData || []).map(invoice => 
        transformInvoice(invoice, invoice.invoice_items || [])
      );

      setInvoices(transformedInvoices);
    } catch (error: any) {
      toast({
        title: "Error fetching invoices",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const generateInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const timestamp = Date.now().toString().slice(-4);
    return `INV-${year}${month}-${timestamp}`;
  };

  const addInvoice = useCallback(async (invoice: Omit<Invoice, 'id'>) => {
    if (!user) return;

    try {
      // Calculate totals
      const subtotal = invoice.items.reduce((sum, item) => sum + item.totalPrice, 0);
      const taxAmount = subtotal * (invoice.taxRate / 100);
      const totalAmount = subtotal + taxAmount;

      // Insert invoice
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .insert([{
          user_id: user.id,
          invoice_number: invoice.invoiceNumber || generateInvoiceNumber(),
          client_id: invoice.clientId,
          client_name: invoice.clientName,
          client_email: invoice.clientEmail,
          client_address: invoice.clientAddress,
          invoice_date: invoice.invoiceDate,
          due_date: invoice.dueDate,
          status: invoice.status,
          subtotal,
          tax_rate: invoice.taxRate,
          tax_amount: taxAmount,
          total_amount: totalAmount,
          currency: invoice.currency,
          notes: invoice.notes,
        }])
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Insert invoice items
      if (invoice.items.length > 0) {
        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(
            invoice.items.map(item => ({
              invoice_id: invoiceData.id,
              description: item.description,
              quantity: item.quantity,
              unit_price: item.unitPrice,
              total_price: item.totalPrice,
            }))
          );

        if (itemsError) throw itemsError;
      }

      await fetchInvoices();
      toast({
        title: "Invoice created",
        description: "Invoice has been created successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error creating invoice",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [user, toast, fetchInvoices]);

  const updateInvoice = useCallback(async (id: string, updates: Partial<Invoice>) => {
    try {
      const { error } = await supabase
        .from('invoices')
        .update({
          client_name: updates.clientName,
          client_email: updates.clientEmail,
          client_address: updates.clientAddress,
          invoice_date: updates.invoiceDate,
          due_date: updates.dueDate,
          status: updates.status,
          tax_rate: updates.taxRate,
          currency: updates.currency,
          notes: updates.notes,
        })
        .eq('id', id);

      if (error) throw error;

      await fetchInvoices();
      toast({
        title: "Invoice updated",
        description: "Invoice has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error updating invoice",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [toast, fetchInvoices]);

  const deleteInvoice = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setInvoices(prev => prev.filter(invoice => invoice.id !== id));
      toast({
        title: "Invoice deleted",
        description: "Invoice has been deleted successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting invoice",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [toast]);

  return {
    invoices,
    loading,
    fetchInvoices,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    generateInvoiceNumber,
  };
};
