-- Configure Supabase Storage for ExpenseWise
-- Create storage buckets and policies for file uploads

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES 
  (
    'receipts', 
    'receipts', 
    false, 
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
  )
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage policies for receipts bucket
-- Users can upload their own files
CREATE POLICY "users_can_upload_receipts" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'receipts' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can view their own files
CREATE POLICY "users_can_view_own_receipts" 
ON storage.objects FOR SELECT 
USING (
  bucket_id = 'receipts' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Admins can view all files
CREATE POLICY "admins_can_view_all_receipts" 
ON storage.objects FOR SELECT 
USING (
  bucket_id = 'receipts' AND 
  public.current_user_is_admin()
);

-- Users can update their own files
CREATE POLICY "users_can_update_own_receipts" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'receipts' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own files
CREATE POLICY "users_can_delete_own_receipts" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'receipts' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);