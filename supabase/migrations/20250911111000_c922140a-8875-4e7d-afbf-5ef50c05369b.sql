-- ExpenseWise Database Schema
-- Creates complete database structure for expense management system

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enums
CREATE TYPE public.user_role AS ENUM ('ADMIN', 'APPROVER', 'EMPLOYEE');
CREATE TYPE public.user_status AS ENUM ('ACTIVE', 'INACTIVE');
CREATE TYPE public.expense_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE public.payment_method AS ENUM ('CARD', 'CASH', 'TRANSFER', 'OTHER');
CREATE TYPE public.expense_source AS ENUM ('MANUAL', 'AI_EXTRACTED');
CREATE TYPE public.document_type AS ENUM ('TICKET', 'INVOICE');
CREATE TYPE public.currency_type AS ENUM ('EUR', 'USD', 'GBP', 'CHF');

-- Users table (extending auth.users)
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'EMPLOYEE',
  department TEXT,
  region TEXT,
  status user_status NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Project codes table
CREATE TABLE public.project_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  status user_status NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  budget_monthly DECIMAL(12,2),
  status user_status NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Files table for receipt storage
CREATE TABLE public.files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  original_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  storage_key TEXT NOT NULL,
  checksum_sha256 TEXT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Expenses table
CREATE TABLE public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES auth.users(id),
  project_code_id UUID REFERENCES public.project_codes(id),
  category_id UUID NOT NULL REFERENCES public.categories(id),
  vendor TEXT NOT NULL,
  expense_date DATE NOT NULL,
  amount_net DECIMAL(12,2) NOT NULL CHECK (amount_net >= 0),
  tax_vat DECIMAL(12,2) DEFAULT 0 CHECK (tax_vat >= 0),
  amount_gross DECIMAL(12,2) NOT NULL CHECK (amount_gross >= 0),
  currency currency_type NOT NULL DEFAULT 'EUR',
  payment_method payment_method NOT NULL,
  status expense_status NOT NULL DEFAULT 'PENDING',
  approver_id UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  notes TEXT,
  receipt_file_id UUID REFERENCES public.files(id),
  source expense_source NOT NULL DEFAULT 'MANUAL',
  document_type document_type,
  iva_rate DECIMAL(5,2),
  hash_dedupe TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Audit log table
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_user_id UUID NOT NULL REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id UUID,
  metadata JSONB,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_expenses_employee_id_date ON public.expenses(employee_id, expense_date DESC);
CREATE INDEX idx_expenses_status_date ON public.expenses(status, expense_date DESC);
CREATE INDEX idx_expenses_category_date ON public.expenses(category_id, expense_date);
CREATE INDEX idx_expenses_project_date ON public.expenses(project_code_id, expense_date);
CREATE INDEX idx_expenses_hash_dedupe ON public.expenses(hash_dedupe);
CREATE INDEX idx_files_checksum ON public.files(checksum_sha256);
CREATE INDEX idx_audit_logs_actor_date ON public.audit_logs(actor_user_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" 
ON public.profiles FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() AND p.role = 'ADMIN'
  )
);

CREATE POLICY "Admins can create profiles" 
ON public.profiles FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() AND p.role = 'ADMIN'
  )
);

CREATE POLICY "Admins can update all profiles" 
ON public.profiles FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() AND p.role = 'ADMIN'
  )
);

-- RLS Policies for project codes (admin only)
CREATE POLICY "Everyone can view active project codes" 
ON public.project_codes FOR SELECT 
USING (status = 'ACTIVE');

CREATE POLICY "Admins can manage project codes" 
ON public.project_codes FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() AND p.role = 'ADMIN'
  )
);

-- RLS Policies for categories
CREATE POLICY "Everyone can view active categories" 
ON public.categories FOR SELECT 
USING (status = 'ACTIVE');

CREATE POLICY "Admins can manage categories" 
ON public.categories FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() AND p.role = 'ADMIN'
  )
);

-- RLS Policies for files
CREATE POLICY "Users can view files they uploaded" 
ON public.files FOR SELECT 
USING (auth.uid() = uploaded_by);

CREATE POLICY "Users can upload files" 
ON public.files FOR INSERT 
WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Admins can view all files" 
ON public.files FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() AND p.role IN ('ADMIN', 'APPROVER')
  )
);

-- RLS Policies for expenses
CREATE POLICY "Users can view their own expenses" 
ON public.expenses FOR SELECT 
USING (auth.uid() = employee_id);

CREATE POLICY "Users can create their own expenses" 
ON public.expenses FOR INSERT 
WITH CHECK (auth.uid() = employee_id);

CREATE POLICY "Users can update their pending expenses" 
ON public.expenses FOR UPDATE 
USING (auth.uid() = employee_id AND status = 'PENDING');

CREATE POLICY "Admins can view all expenses" 
ON public.expenses FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() AND p.role IN ('ADMIN', 'APPROVER')
  )
);

CREATE POLICY "Admins can update all expenses" 
ON public.expenses FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() AND p.role IN ('ADMIN', 'APPROVER')
  )
);

-- RLS Policies for audit logs
CREATE POLICY "Users can view their own audit logs" 
ON public.audit_logs FOR SELECT 
USING (auth.uid() = actor_user_id);

CREATE POLICY "Admins can view all audit logs" 
ON public.audit_logs FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() AND p.role = 'ADMIN'
  )
);

CREATE POLICY "Everyone can insert audit logs" 
ON public.audit_logs FOR INSERT 
WITH CHECK (auth.uid() = actor_user_id);

-- Functions for automatic updates
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_project_codes_updated_at
  BEFORE UPDATE ON public.project_codes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
    'EMPLOYEE'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert default categories
INSERT INTO public.categories (name) VALUES
  ('Viajes'),
  ('Dietas'),
  ('Transporte'),
  ('Alojamiento'),
  ('Material'),
  ('Software'),
  ('Otros');

-- Insert default project codes
INSERT INTO public.project_codes (code, name) VALUES
  ('PRJ-001', 'Proyecto General'),
  ('PRJ-CLIENTE-A', 'Cliente A - Desarrollo'),
  ('INT-OPS', 'Operaciones Internas');