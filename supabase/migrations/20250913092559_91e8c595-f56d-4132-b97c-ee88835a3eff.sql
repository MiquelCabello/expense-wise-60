-- Fix infinite recursion in profiles RLS policies
-- Drop the problematic is_admin function and policies
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;

-- Create a security definer function to get current user role without RLS
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role AS $$
DECLARE
  user_role_value user_role;
BEGIN
  -- Get role directly from profiles table using auth.uid()
  SELECT role INTO user_role_value 
  FROM public.profiles 
  WHERE user_id = auth.uid();
  
  RETURN COALESCE(user_role_value, 'EMPLOYEE'::user_role);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- Drop existing problematic policies for profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can create profiles" ON public.profiles;

-- Create simpler RLS policies for profiles that don't cause recursion
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

-- Allow system to insert profiles (for new user trigger)
CREATE POLICY "System can insert profiles"
ON public.profiles FOR INSERT
WITH CHECK (true);

-- Now create a separate admin function that uses the security definer
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN public.get_current_user_role() = 'ADMIN';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- Re-create admin policies for other tables using the fixed function
DROP POLICY IF EXISTS "Admins can view all expenses" ON public.expenses;
DROP POLICY IF EXISTS "Admins can update all expenses" ON public.expenses;

CREATE POLICY "Admins can view all expenses"
ON public.expenses FOR SELECT
USING (public.is_admin() OR auth.uid() = employee_id);

CREATE POLICY "Admins can update all expenses"
ON public.expenses FOR UPDATE
USING (public.is_admin() OR (auth.uid() = employee_id AND status = 'PENDING'));

-- Fix audit logs policies
DROP POLICY IF EXISTS "Admins can view all audit logs" ON public.audit_logs;

CREATE POLICY "Admins can view all audit logs"
ON public.audit_logs FOR SELECT
USING (public.is_admin() OR auth.uid() = actor_user_id);

-- Fix files policies
DROP POLICY IF EXISTS "Admins can view all files" ON public.files;

CREATE POLICY "Admins can view all files"
ON public.files FOR SELECT
USING (public.is_admin() OR auth.uid() = uploaded_by);