export interface Client {
  id: string;
  company_name: string; // Company name (required)
  contact_person?: string; // Contact person (optional)
  email?: string;
  phone?: string;
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
  category: "client-projects" | "retainer-services" | "consulting" | "product-sales" | "licensing" | "partnerships" | "other-business";
  description?: string;
  status?: "paid" | "pending";
}

export interface Expense {
  id: string;
  amount: number;
  currency: "USD" | "EUR" | "RSD";
  date: string;
  category: "office-rent" | "equipment" | "software-subscriptions" | "marketing-advertising" | "professional-services" | "travel-client-meetings" | "education-training" | "insurance" | "utilities" | "office-supplies" | "client-entertainment" | "banking-fees" | "taxes-compliance" | "other-business";
  description: string;
  isRecurring?: boolean;
  recurringFrequency?: "weekly" | "monthly" | "yearly";
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


export interface TimeEntry {
  id: string;
  userId: string;
  projectId: string;
  taskId?: string | null;
  description?: string | null;
  startTime: string; // ISO string
  endTime?: string | null; // ISO string, null if running
  duration: number; // in seconds
  isBillable: boolean;
  createdAt: string;
  updatedAt: string;
}