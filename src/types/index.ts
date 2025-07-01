
export interface Client {
  id: string;
  name: string;
  email?: string;
  company?: string;
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
