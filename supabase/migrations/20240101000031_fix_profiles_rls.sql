-- =============================================
-- FIX: Profiles RLS - INSERT erlauben fuer eigenes Profil
-- Problem: upsert in signUp schlaegt fehl weil kein INSERT Policy
-- =============================================

-- User darf sein eigenes Profil erstellen (fuer Registrierung)
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
