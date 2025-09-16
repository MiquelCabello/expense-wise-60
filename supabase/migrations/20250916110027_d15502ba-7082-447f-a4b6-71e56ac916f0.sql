-- Fix infinite recursion in RLS policies permanently
-- This creates a clean, non-recursive approach

-- Drop ALL existing problematic policies that cause recursion
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles CASCADE;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles CASCADE;
DROP POLICY IF EXISTS "System can insert profiles" ON public.profiles CASCADE;

-- Drop the function that was causing issues
DROP FUNCTION IF EXISTS public.get_current_user_role() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;

-- Create a simple, secure function to check admin status using raw user metadata
CREATE OR REPLACE FUNCTION public.current_user_is_admin()
RETURNS boolean AS $$
BEGIN
  -- Check directly from auth.users metadata to avoid RLS recursion
  RETURN EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND (raw_user_meta_data->>'role' = 'ADMIN' OR 
         raw_user_meta_data->>'role' = 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = '';

-- Create simple, non-recursive RLS policies for profiles
CREATE POLICY "profiles_select_own" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "profiles_update_own" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "profiles_insert_system" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id OR public.current_user_is_admin());

-- Recreate clean policies for other tables
DROP POLICY IF EXISTS "Admins can view all expenses" ON public.expenses;
DROP POLICY IF EXISTS "Admins can update all expenses" ON public.expenses;

CREATE POLICY "expenses_select_policy"
ON public.expenses FOR SELECT
USING (
  auth.uid() = employee_id OR 
  public.current_user_is_admin()
);

CREATE POLICY "expenses_update_policy"
ON public.expenses FOR UPDATE
USING (
  (auth.uid() = employee_id AND status = 'PENDING') OR
  public.current_user_is_admin()
);

-- Fix audit logs policies
DROP POLICY IF EXISTS "Admins can view all audit logs" ON public.audit_logs;

CREATE POLICY "audit_logs_select_policy"
ON public.audit_logs FOR SELECT
USING (
  auth.uid() = actor_user_id OR
  public.current_user_is_admin()
);

-- Fix files policies  
DROP POLICY IF EXISTS "Admins can view all files" ON public.files;

CREATE POLICY "files_select_policy"
ON public.files FOR SELECT
USING (
  auth.uid() = uploaded_by OR
  public.current_user_is_admin()
);