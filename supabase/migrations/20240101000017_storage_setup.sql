-- =============================================
-- SUPABASE STORAGE SETUP FOR LISTING IMAGES
-- =============================================

-- Create storage bucket for listing images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'listing-images',
  'listing-images',
  true,
  10485760, -- 10MB max file size
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Create storage bucket for account logos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'account-logos',
  'account-logos',
  true,
  5242880, -- 5MB max file size
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Create storage bucket for manufacturer logos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'manufacturer-logos',
  'manufacturer-logos',
  true,
  5242880, -- 5MB max file size
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- =============================================
-- STORAGE POLICIES FOR listing-images BUCKET
-- =============================================

-- Allow public read access to listing images
CREATE POLICY "Public can view listing images"
ON storage.objects FOR SELECT
USING (bucket_id = 'listing-images');

-- Allow authenticated users to upload images to their own listing folders
CREATE POLICY "Users can upload listing images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'listing-images'
  AND auth.role() = 'authenticated'
  AND (
    -- Check if user owns the account that owns the listing
    EXISTS (
      SELECT 1 FROM accounts a
      WHERE a.owner_id = auth.uid()
      AND (storage.foldername(name))[1] = a.id::text
    )
    OR
    -- Or user is admin
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('admin', 'super_admin')
    )
  )
);

-- Allow users to update their own listing images
CREATE POLICY "Users can update their listing images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'listing-images'
  AND auth.role() = 'authenticated'
  AND (
    EXISTS (
      SELECT 1 FROM accounts a
      WHERE a.owner_id = auth.uid()
      AND (storage.foldername(name))[1] = a.id::text
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('admin', 'super_admin')
    )
  )
);

-- Allow users to delete their own listing images
CREATE POLICY "Users can delete their listing images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'listing-images'
  AND auth.role() = 'authenticated'
  AND (
    EXISTS (
      SELECT 1 FROM accounts a
      WHERE a.owner_id = auth.uid()
      AND (storage.foldername(name))[1] = a.id::text
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('admin', 'super_admin')
    )
  )
);

-- =============================================
-- STORAGE POLICIES FOR account-logos BUCKET
-- =============================================

-- Allow public read access to account logos
CREATE POLICY "Public can view account logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'account-logos');

-- Allow users to upload their own account logo
CREATE POLICY "Users can upload account logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'account-logos'
  AND auth.role() = 'authenticated'
  AND (
    EXISTS (
      SELECT 1 FROM accounts a
      WHERE a.owner_id = auth.uid()
      AND (storage.foldername(name))[1] = a.id::text
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('admin', 'super_admin')
    )
  )
);

-- Allow users to update their own account logo
CREATE POLICY "Users can update account logos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'account-logos'
  AND auth.role() = 'authenticated'
  AND (
    EXISTS (
      SELECT 1 FROM accounts a
      WHERE a.owner_id = auth.uid()
      AND (storage.foldername(name))[1] = a.id::text
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('admin', 'super_admin')
    )
  )
);

-- Allow users to delete their own account logo
CREATE POLICY "Users can delete account logos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'account-logos'
  AND auth.role() = 'authenticated'
  AND (
    EXISTS (
      SELECT 1 FROM accounts a
      WHERE a.owner_id = auth.uid()
      AND (storage.foldername(name))[1] = a.id::text
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('admin', 'super_admin')
    )
  )
);

-- =============================================
-- STORAGE POLICIES FOR manufacturer-logos BUCKET
-- =============================================

-- Allow public read access to manufacturer logos
CREATE POLICY "Public can view manufacturer logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'manufacturer-logos');

-- Only admins can manage manufacturer logos
CREATE POLICY "Admins can manage manufacturer logos"
ON storage.objects FOR ALL
USING (
  bucket_id = 'manufacturer-logos'
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
    AND p.role IN ('admin', 'super_admin')
  )
);
