-- ============================================
-- CMM24 Migration: Storage Buckets
-- ============================================

-- =============================================
-- BUCKETS
-- =============================================

-- Listing Media (öffentlich)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'listing-media',
  'listing-media',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
);

-- Account Logos (öffentlich)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'account-logos',
  'account-logos',
  true,
  2097152, -- 2MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
);

-- Profile Avatars (öffentlich)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-avatars',
  'profile-avatars',
  true,
  2097152, -- 2MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- Documents (privat)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false,
  10485760, -- 10MB
  ARRAY['application/pdf']
);

-- =============================================
-- STORAGE POLICIES
-- =============================================

-- Listing Media: Public read
CREATE POLICY "Public read listing media"
ON storage.objects FOR SELECT
USING (bucket_id = 'listing-media');

-- Listing Media: Authenticated users can upload to their account folder
CREATE POLICY "Account owners can upload listing media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'listing-media' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM accounts WHERE owner_id = auth.uid()
  )
);

-- Listing Media: Account owners can delete their own media
CREATE POLICY "Account owners can delete own listing media"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'listing-media' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM accounts WHERE owner_id = auth.uid()
  )
);

-- Account Logos: Public read
CREATE POLICY "Public read account logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'account-logos');

-- Account Logos: Account owners can upload
CREATE POLICY "Account owners can upload logo"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'account-logos' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM accounts WHERE owner_id = auth.uid()
  )
);

-- Account Logos: Account owners can delete
CREATE POLICY "Account owners can delete logo"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'account-logos' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM accounts WHERE owner_id = auth.uid()
  )
);

-- Profile Avatars: Public read
CREATE POLICY "Public read profile avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-avatars');

-- Profile Avatars: Users can upload their own avatar
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profile-avatars' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Profile Avatars: Users can delete their own avatar
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'profile-avatars' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Documents: Private - only account owners can access
CREATE POLICY "Account owners can access own documents"
ON storage.objects FOR ALL
USING (
  bucket_id = 'documents' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM accounts WHERE owner_id = auth.uid()
  )
);
