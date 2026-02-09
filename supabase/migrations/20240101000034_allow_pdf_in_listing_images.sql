-- =============================================
-- FIX: PDF-Upload im listing-images Bucket erlauben
--
-- Problem: Der Bucket listing-images erlaubt nur Bild-MIME-Types.
-- PDFs (Datenblätter, Kalibrierzertifikate) werden aber auch
-- dort hochgeladen und scheitern am MIME-Type-Check.
--
-- Lösung: application/pdf zu allowed_mime_types hinzufügen
-- und File-Size-Limit auf 20MB erhöhen (PDFs können größer sein).
-- =============================================

UPDATE storage.buckets
SET
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'],
  file_size_limit = 20971520  -- 20MB
WHERE id = 'listing-images';
