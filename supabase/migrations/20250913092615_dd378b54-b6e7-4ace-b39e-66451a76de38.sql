-- Fix infinite recursion by creating proper security definer function
-- Drop the problematic is_admin function
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;

-- Create a security definer function to get current user role 
-- This bypasses RLS and prevents infinite recursion
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role AS $$
DECLARE
  user_role_value user_role;
BEGIN
  -- Use SECURITY DEFINER to bypass RLS when querying profiles
  SELECT role INTO user_role_value 
  FROM public.profiles 
  WHERE user_id = auth.uid();
  
  RETURN COALESCE(user_role_value, 'EMPLOYEE'::user_role);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- Create is_admin function that uses the security definer
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN public.get_current_user_role() = 'ADMIN';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;