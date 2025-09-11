// Database types for ExpenseWise application

export type UserRole = 'ADMIN' | 'APPROVER' | 'EMPLOYEE';
export type UserStatus = 'ACTIVE' | 'INACTIVE';
export type ExpenseStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type PaymentMethod = 'CARD' | 'CASH' | 'TRANSFER' | 'OTHER';
export type ExpenseSource = 'MANUAL' | 'AI_EXTRACTED';
export type DocumentType = 'TICKET' | 'INVOICE';
export type CurrencyType = 'EUR' | 'USD' | 'GBP' | 'CHF';

export interface Profile {
  id: string;
  user_id: string;
  email: string;
  name: string;
  role: UserRole;
  department?: string;
  region?: string;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

export interface ProjectCode {
  id: string;
  code: string;
  name: string;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  budget_monthly?: number;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

export interface File {
  id: string;
  original_name: string;
  mime_type: string;
  size_bytes: number;
  storage_key: string;
  checksum_sha256: string;
  uploaded_by: string;
  created_at: string;
}

export interface Expense {
  id: string;
  employee_id: string;
  project_code_id?: string;
  category_id: string;
  vendor: string;
  expense_date: string;
  amount_net: number;
  tax_vat?: number;
  amount_gross: number;
  currency: CurrencyType;
  payment_method: PaymentMethod;
  status: ExpenseStatus;
  approver_id?: string;
  approved_at?: string;
  rejection_reason?: string;
  notes?: string;
  receipt_file_id?: string;
  source: ExpenseSource;
  document_type?: DocumentType;
  iva_rate?: number;
  hash_dedupe?: string;
  created_at: string;
  updated_at: string;
  // Relations
  employee?: Profile;
  project_code?: ProjectCode;
  category?: Category;
  receipt_file?: File;
  approver?: Profile;
}

export interface AuditLog {
  id: string;
  actor_user_id: string;
  action: string;
  entity: string;
  entity_id?: string;
  metadata?: any;
  ip_address?: string;
  created_at: string;
  actor?: Profile;
}

// AI Extraction response types
export interface AIExtractionResponse {
  vendor: string;
  expense_date: string;
  amount_gross: number;
  tax_amount: number;
  amount_net: number;
  tax_rate: number;
  tax_label: 'VAT' | 'IVA' | 'GST' | 'NONE';
  currency: CurrencyType;
  document_country: string;
  vendor_vat_id?: string;
  category_suggestion: string;
  payment_method_guess: PaymentMethod;
  project_code_guess?: string;
  notes?: string;
}

// Dashboard analytics types
export interface DashboardKPIs {
  total_expenses: number;
  pending_expenses: number;
  top_category: string;
  daily_average: number;
}

export interface ExpensesByCategory {
  category: string;
  amount: number;
  count: number;
}

export interface ExpensesTrend {
  date: string;
  amount: number;
  count: number;
}