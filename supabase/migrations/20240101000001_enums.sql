-- ============================================
-- CMM24 Migration: ENUMs
-- ============================================

-- Benutzerrollen
CREATE TYPE user_role AS ENUM ('user', 'admin', 'super_admin');

-- Listing-Status
CREATE TYPE listing_status AS ENUM ('draft', 'pending_review', 'active', 'sold', 'archived');

-- Listing-Zustand
CREATE TYPE listing_condition AS ENUM ('new', 'like_new', 'good', 'fair');

-- Maschinentyp/Kategorie
CREATE TYPE machine_category AS ENUM ('portal', 'cantilever', 'horizontal_arm', 'gantry', 'optical', 'other');

-- Medientyp
CREATE TYPE media_type AS ENUM ('image', 'video', 'document');

-- Anfrage-Status
CREATE TYPE inquiry_status AS ENUM ('new', 'contacted', 'offer_sent', 'won', 'lost');

-- Account-Status
CREATE TYPE account_status AS ENUM ('active', 'suspended');

-- Subscription-Status
CREATE TYPE subscription_status AS ENUM ('active', 'past_due', 'canceled', 'trialing');

-- Billing-Interval
CREATE TYPE billing_interval AS ENUM ('monthly', 'yearly');

-- Team-Rollen
CREATE TYPE team_role AS ENUM ('owner', 'admin', 'editor', 'viewer');

-- Report-Gründe
CREATE TYPE report_reason AS ENUM ('spam', 'fake', 'inappropriate', 'duplicate', 'other');

-- Report-Status
CREATE TYPE report_status AS ENUM ('pending', 'reviewed', 'resolved', 'dismissed');

-- Invoice-Status
CREATE TYPE invoice_status AS ENUM ('draft', 'open', 'paid', 'void', 'uncollectible');

-- Inquiry Source
CREATE TYPE inquiry_source AS ENUM ('listing', 'contact', 'api');
