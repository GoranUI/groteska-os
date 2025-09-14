// Financial data models for the Home screen

export interface Account {
  id: string;
  bank_name: string;
  type: 'CHECKING' | 'SAVINGS';
  account_number: string;
  currency: 'RSD' | 'USD';
  balance_available: number;
  balance_pending: number;
  last_txn_at: string;
}

export interface FxRate {
  pair: 'USD-RSD';
  rate: number;
  source: 'manual' | 'provider';
  updated_at: string;
}

export interface CashFlowItem {
  id: string;
  date: string;
  direction: 'IN' | 'OUT';
  amount: number;
  currency: 'RSD' | 'USD';
  amount_rsd: number;
  category: string;
  counterparty: string;
  source_id?: string;
}

export interface InvoiceReceipt {
  id: string;
  type: 'INVOICE' | 'BILL';
  status: 'PAID' | 'DUE' | 'OVERDUE';
  due_date: string;
  amount: number;
  currency: 'RSD' | 'USD';
  amount_rsd: number;
  counterparty: string;
}

export interface Settings {
  thresholds: {
    min_balance_rsd: number;
  };
  default_currency: 'RSD';
  locale: 'sr-RS';
}

export interface PeriodFilter {
  type: '7d' | '30d' | 'QTD' | 'YTD' | 'custom';
  from?: string;
  to?: string;
}

export interface FinancialSummary {
  accounts: Account[];
  kpis: {
    moneyInRsd: number;
    moneyOutRsd: number;
    netRsd: number;
    totalRsd: number;
    fxRate: number;
  };
  topIn: CashFlowItem[];
  topOut: CashFlowItem[];
  chart: {
    date: string;
    moneyIn: number;
    moneyOut: number;
    net: number;
  }[];
}

export interface FxRateResponse {
  rate: number;
  updated_at: string;
  source: 'manual' | 'provider';
}

export interface FxRateUpdate {
  rate: number;
  note?: string;
}

export interface CashFlowFilters {
  from: string;
  to: string;
  direction?: 'IN' | 'OUT';
  limit?: number;
}

export interface CashFlowEntry {
  date: string;
  direction: 'IN' | 'OUT';
  amount: number;
  currency: 'RSD' | 'USD';
  category: string;
  counterparty: string;
  note?: string;
}
