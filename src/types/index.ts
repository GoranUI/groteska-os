
export interface Client {
  id: string;
  name: string;
  email?: string;
  company?: string;
  address?: string;
  status: "active" | "inactive";
  createdAt: string;
}

export interface Income {
  id: string;
  amount: number;
  currency: "USD" | "EUR" | "RSD";
  client: string;
  clientId?: string;
  date: string;
  category: "full-time" | "one-time";
  description?: string;
}

export interface Expense {
  id: string;
  amount: number;
  currency: "USD" | "EUR" | "RSD";
  date: string;
  category: "Recurring" | "Food" | "Work Food" | "External Food" | "Transport" | "Holiday" | "Utilities" | "Software" | "Marketing" | "Office";
  description: string;
  isRecurring?: boolean;
  recurringFrequency?: "weekly" | "monthly" | "yearly";
}

export interface Savings {
  id: string;
  amount: number;
  currency: "USD" | "EUR" | "RSD";
  date: string;
  type: "deposit" | "withdrawal";
  description: string;
}

export interface InvoiceItem {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId?: string;
  clientName: string;
  clientEmail?: string;
  clientAddress?: string;
  invoiceDate: string;
  dueDate: string;
  status: "draft" | "sent" | "paid" | "overdue";
  billingType: "hourly" | "project";
  subtotal: number;
  taxRate?: number;
  taxAmount: number;
  totalAmount: number;
  currency: "USD" | "EUR" | "RSD";
  notes?: string;
  items: InvoiceItem[];
}

export interface UserProfile {
  id: string;
  full_name?: string;
  email?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}
