-- Fix RLS policies causing infinite recursion and relationship issues

-- Drop problematic policies first
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can create profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Create simplified, non-recursive policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

-- Allow service role to manage profiles (for admin functions)
CREATE POLICY "Service role can manage profiles"
ON public.profiles FOR ALL
USING (current_setting('role') = 'service_role');

-- Fix the RLS policies that might be causing recursion in other tables
-- Update categories policies to be simpler
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
CREATE POLICY "Authenticated users can view categories" ON public.categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Service role can manage categories" ON public.categories FOR ALL USING (current_setting('role') = 'service_role');

-- Update project_codes policies
DROP POLICY IF EXISTS "Admins can manage project codes" ON public.project_codes;
CREATE POLICY "Authenticated users can view project codes" ON public.project_codes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Service role can manage project codes" ON public.project_codes FOR ALL USING (current_setting('role') = 'service_role');

-- Update expenses policies to be simpler and avoid recursion
DROP POLICY IF EXISTS "Admins can view all expenses" ON public.expenses;
DROP POLICY IF EXISTS "Admins can update all expenses" ON public.expenses;

CREATE POLICY "Users can view their own expenses"
ON public.expenses FOR SELECT
USING (auth.uid() = employee_id);

CREATE POLICY "Users can create their own expenses"
ON public.expenses FOR INSERT
WITH CHECK (auth.uid() = employee_id);

CREATE POLICY "Users can update their pending expenses"
ON public.expenses FOR UPDATE
USING (auth.uid() = employee_id AND status = 'PENDING');

-- Service role can manage all expenses (for admin functions)
CREATE POLICY "Service role can manage expenses"
ON public.expenses FOR ALL
USING (current_setting('role') = 'service_role');

-- Update files policies
DROP POLICY IF EXISTS "Admins can view all files" ON public.files;
CREATE POLICY "Service role can manage files" ON public.files FOR ALL USING (current_setting('role') = 'service_role');

-- Update audit_logs policies  
DROP POLICY IF EXISTS "Admins can view all audit logs" ON public.audit_logs;
CREATE POLICY "Service role can manage audit logs" ON public.audit_logs FOR ALL USING (current_setting('role') = 'service_role');