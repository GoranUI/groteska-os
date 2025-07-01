
import jsPDF from 'jspdf';
import { Invoice } from '@/types';

export class PDFGenerator {
  static generateInvoicePDF(invoice: Invoice): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    let yPosition = 20;

    // Header
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Invoice Details
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Invoice #: ${invoice.invoiceNumber}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Date: ${new Date(invoice.invoiceDate).toLocaleDateString()}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Status: ${invoice.status.toUpperCase()}`, 20, yPosition);
    yPosition += 15;

    // Client Information
    doc.setFont('helvetica', 'bold');
    doc.text('Bill To:', 20, yPosition);
    yPosition += 7;
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.clientName, 20, yPosition);
    yPosition += 7;
    if (invoice.clientEmail) {
      doc.text(invoice.clientEmail, 20, yPosition);
      yPosition += 7;
    }
    if (invoice.clientAddress) {
      doc.text(invoice.clientAddress, 20, yPosition);
      yPosition += 7;
    }
    yPosition += 10;

    // Items Table Header
    doc.setFont('helvetica', 'bold');
    doc.text('Description', 20, yPosition);
    doc.text('Qty', 120, yPosition, { align: 'right' });
    doc.text('Unit Price', 150, yPosition, { align: 'right' });
    doc.text('Total', 180, yPosition, { align: 'right' });
    yPosition += 7;

    // Draw line under header
    doc.line(20, yPosition, 190, yPosition);
    yPosition += 7;

    // Items
    doc.setFont('helvetica', 'normal');
    invoice.items.forEach(item => {
      doc.text(item.description, 20, yPosition);
      doc.text(item.quantity.toString(), 120, yPosition, { align: 'right' });
      doc.text(`${item.unitPrice.toFixed(2)} ${invoice.currency}`, 150, yPosition, { align: 'right' });
      doc.text(`${item.totalPrice.toFixed(2)} ${invoice.currency}`, 180, yPosition, { align: 'right' });
      yPosition += 7;
    });

    yPosition += 10;

    // Totals
    doc.line(120, yPosition, 190, yPosition);
    yPosition += 7;
    
    doc.text('Subtotal:', 120, yPosition);
    doc.text(`${invoice.subtotal.toFixed(2)} ${invoice.currency}`, 180, yPosition, { align: 'right' });
    yPosition += 7;

    if (invoice.taxRate && invoice.taxRate > 0) {
      doc.text(`Tax (${invoice.taxRate}%):`, 120, yPosition);
      doc.text(`${invoice.taxAmount.toFixed(2)} ${invoice.currency}`, 180, yPosition, { align: 'right' });
      yPosition += 7;
    }

    doc.setFont('helvetica', 'bold');
    doc.text('Total:', 120, yPosition);
    doc.text(`${invoice.totalAmount.toFixed(2)} ${invoice.currency}`, 180, yPosition, { align: 'right' });

    // Notes
    if (invoice.notes) {
      yPosition += 20;
      doc.setFont('helvetica', 'bold');
      doc.text('Notes:', 20, yPosition);
      yPosition += 7;
      doc.setFont('helvetica', 'normal');
      const splitNotes = doc.splitTextToSize(invoice.notes, 170);
      doc.text(splitNotes, 20, yPosition);
    }

    // Save the PDF
    doc.save(`invoice-${invoice.invoiceNumber}.pdf`);
  }
}
