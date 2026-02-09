# Auth – Logik & Schema-Anforderungen

## Übersicht der Seiten

| Seite | Pfad | Beschreibung |
|-------|------|--------------|
| Login | `/login` | Email/Passwort + Magic Link |
| Registrieren | `/registrieren` | Multi-Step Wizard mit Plan-Auswahl |
| Passwort vergessen | `/passwort-vergessen` | Reset-Link anfordern |
| Passwort reset | `/passwort-reset` | Neues Passwort setzen (mit Token) |
| Email bestätigen | `/email-bestaetigen` | Email-Verifizierung (mit Token) |

---

## 1. Login (`/login`)

### Funktionalität
- **Tab 1: Passwort-Login**
  - Email + Passwort eingeben
  - Redirect zu `/seller/dashboard` bei Erfolg
  
- **Tab 2: Magic Link**
  - Nur Email eingeben
  - Link per Email senden
  - Bestätigungsscreen nach Absenden

### Benötigte Supabase-Funktionen
```
supabase.auth.signInWithPassword({ email, password })
supabase.auth.signInWithOtp({ email })  // Magic Link
```

### Schema-Anforderungen
- **Keine zusätzlichen Tabellen** – nutzt `auth.users` von Supabase
- Nach Login: `profiles` Tabelle abfragen für User-Daten

---

## 2. Registrieren (`/registrieren`)

### Funktionalität (5-Step Wizard)

#### Step 1: Welcome
- `userIntent`: 'buy' | 'sell' | 'both'
- `machineCount`: '1' | '2-3' | '4-7' | '8+' (nur bei sell/both)

#### Step 2: Profile
- `name` (Pflicht)
- `company` (Pflicht)
- `email` (Pflicht)
- `password` (Pflicht, min. 8 Zeichen)
- `phone` (optional)
- `acceptedTerms` (Pflicht)
- `acceptedMarketing` (optional)

#### Step 3: Plan
- `selectedPlan`: 'free' | 'starter' | 'business'
- `billingInterval`: 'monthly' | 'yearly'

#### Step 4: Checkout (nur bei paid plans)
- Stripe Checkout
- Nach Erfolg → Step 5

#### Step 5: Success
- Bestätigung
- Hinweis auf Email-Verifizierung
- Links zu Dashboard / Erstes Inserat

### Benötigte Supabase-Funktionen
```
supabase.auth.signUp({ email, password, options: { data: { full_name, ... } } })
```

### Schema-Anforderungen

#### `profiles` (erstellt via Trigger nach auth.users Insert)
```sql
profiles
├── id (uuid, PK, = auth.users.id)
├── email (text)
├── full_name (text)
├── phone (text, nullable)
├── avatar_url (text, nullable)
├── role (enum: 'user', 'admin', 'super_admin') DEFAULT 'user'
├── accepted_terms_at (timestamptz)
├── accepted_marketing (boolean) DEFAULT false
├── onboarding_intent (text, nullable) -- 'buy', 'sell', 'both'
├── onboarding_machine_count (text, nullable)
├── email_verified_at (timestamptz, nullable)
├── created_at (timestamptz)
└── updated_at (timestamptz)
```

#### `accounts` (Firmen-Account, erstellt bei Registrierung)
```sql
accounts
├── id (uuid, PK)
├── owner_id (uuid, FK → profiles.id)
├── company_name (text)
├── slug (text, unique) -- generiert aus company_name
├── logo_url (text, nullable)
├── website (text, nullable)
├── phone (text, nullable)
├── address_street (text, nullable)
├── address_city (text, nullable)
├── address_postal_code (text, nullable)
├── address_country (text, nullable)
├── vat_id (text, nullable)
├── is_verified (boolean) DEFAULT false
├── status (enum: 'active', 'suspended') DEFAULT 'active'
├── suspended_reason (text, nullable)
├── created_at (timestamptz)
└── updated_at (timestamptz)
```

### Trigger/Functions benötigt
1. **Nach `auth.users` INSERT**: `profiles` Eintrag erstellen
2. **Nach `profiles` INSERT**: `accounts` Eintrag erstellen (wenn Firma angegeben)

---

## 3. Passwort vergessen (`/passwort-vergessen`)

### Funktionalität
- Email eingeben
- Reset-Link senden
- Bestätigungsscreen

### Benötigte Supabase-Funktionen
```
supabase.auth.resetPasswordForEmail(email, { redirectTo: '/passwort-reset' })
```

### Schema-Anforderungen
- Keine zusätzlichen Tabellen

---

## 4. Passwort reset (`/passwort-reset`)

### Funktionalität
- URL enthält `?token=...`
- Neues Passwort + Bestätigung eingeben
- Bei Erfolg: Redirect zu Login

### Benötigte Supabase-Funktionen
```
supabase.auth.updateUser({ password: newPassword })
```

### Schema-Anforderungen
- Keine zusätzlichen Tabellen

---

## 5. Email bestätigen (`/email-bestaetigen`)

### Funktionalität
- URL enthält `?token=...`
- Automatische Verifizierung
- States: loading → success | expired | error
- Bei expired: "Neuen Link senden" Button

### Benötigte Supabase-Funktionen
```
// Automatisch durch Supabase URL handling
// Nach Erfolg: profiles.email_verified_at setzen
```

### Schema-Anforderungen
- `profiles.email_verified_at` Feld updaten

---

## Zusammenfassung: Benötigte Tabellen für Auth

| Tabelle | Felder | Erstellt durch |
|---------|--------|----------------|
| `auth.users` | (Supabase managed) | Supabase Auth |
| `profiles` | id, email, full_name, phone, role, ... | Trigger nach auth.users |
| `accounts` | id, owner_id, company_name, slug, ... | Bei Registrierung |

## RLS Policies für Auth-Tabellen

### `profiles`
```sql
-- SELECT: Eigenes Profil oder Admin
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id OR is_admin());

-- UPDATE: Nur eigenes Profil
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

### `accounts`
```sql
-- SELECT: Eigener Account oder öffentlich (für Verkäufer-Info)
CREATE POLICY "Anyone can view accounts" ON accounts
  FOR SELECT USING (true);

-- UPDATE: Nur Owner
CREATE POLICY "Owner can update account" ON accounts
  FOR UPDATE USING (owner_id = auth.uid());
```
