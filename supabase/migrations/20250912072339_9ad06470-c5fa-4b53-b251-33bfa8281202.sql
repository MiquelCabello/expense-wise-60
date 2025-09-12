-- Fix RLS policies without duplicates and create security definer functions

-- Create security definer function to get current user role (to avoid recursion)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Drop all problematic policies first
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can create profiles" ON public.profiles; 
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can manage project codes" ON public.project_codes;
DROP POLICY IF EXISTS "Admins can view all expenses" ON public.expenses;
DROP POLICY IF EXISTS "Admins can update all expenses" ON public.expenses;
DROP POLICY IF EXISTS "Admins can view all files" ON public.files;
DROP POLICY IF EXISTS "Admins can view all audit logs" ON public.audit_logs;

-- Create new non-recursive policies for profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles 
FOR SELECT USING (public.get_current_user_role() = 'ADMIN');

CREATE POLICY "Admins can create profiles" ON public.profiles 
FOR INSERT WITH CHECK (public.get_current_user_role() = 'ADMIN');

CREATE POLICY "Admins can update all profiles" ON public.profiles 
FOR UPDATE USING (public.get_current_user_role() = 'ADMIN');

-- Simplify other table policies
CREATE POLICY "Admins can manage categories" ON public.categories 
FOR ALL USING (public.get_current_user_role() = 'ADMIN');

CREATE POLICY "Admins can manage project codes" ON public.project_codes 
FOR ALL USING (public.get_current_user_role() = 'ADMIN');

CREATE POLICY "Admins can view all expenses" ON public.expenses 
FOR SELECT USING (public.get_current_user_role() IN ('ADMIN', 'APPROVER'));

CREATE POLICY "Admins can update all expenses" ON public.expenses 
FOR UPDATE USING (public.get_current_user_role() IN ('ADMIN', 'APPROVER'));

CREATE POLICY "Admins can view all files" ON public.files 
FOR SELECT USING (public.get_current_user_role() IN ('ADMIN', 'APPROVER'));

CREATE POLICY "Admins can view all audit logs" ON public.audit_logs 
FOR SELECT USING (public.get_current_user_role() = 'ADMIN');