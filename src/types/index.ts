
export interface Client {
  id: string;
  name: string;
  email?: string;
  company?: string;
  address?: string;
  status: "active" | "inactive";
  createdAt: string;
}

export interface Project {
  id: string;
  clientId: string;
  name: string;
  description?: string;
  status: "negotiation" | "pending" | "in_progress" | "waiting_on_client" | "done" | "canceled";
  priority: "low" | "medium" | "high" | "urgent";
  startDate?: string;
  endDate?: string;
  budget?: number;
  billingType: "fixed" | "hourly";
  hourlyRate?: number;
  currency: "USD" | "EUR" | "RSD";
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubTask {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  amount: number;
  hours?: number;
  currency: "USD" | "EUR" | "RSD";
  status: "pending" | "paid";
  dueDate?: string;
  completedAt?: string;
  invoiceId?: string;
  incomeId?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Income {
  id: string;
  amount: number;
  currency: "USD" | "EUR" | "RSD";
  client: string;
  clientId?: string | null;
  projectId?: string | null;
  subTaskId?: string | null;
  date: string;
  category: "full-time" | "one-time";
  description?: string;
  status?: "paid" | "pending";
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
