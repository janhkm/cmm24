-- ============================================
-- CMM24 Migration: Add CRM to Business Plan
-- ============================================

-- Update Business Plan feature_flags to include CRM access
UPDATE plans
SET 
  feature_flags = '{
    "max_listings": 25,
    "max_images_per_listing": 20,
    "max_team_members": 5,
    "featured_per_month": 5,
    "statistics": true,
    "email_composer": true,
    "lead_pipeline": true,
    "auto_reply": true,
    "team_management": true,
    "api_access": true,
    "crm_access": true,
    "max_contacts": 500,
    "contact_export": true,
    "support_level": "4h"
  }',
  features = ARRAY[
    '25 Inserate',
    '20 Bilder pro Inserat',
    'Lead-Pipeline',
    'CRM & Kontaktverwaltung',
    'Auto-Reply',
    'Team-Management',
    'API-Zugang',
    '5 Featured Listings/Monat',
    '4h Priority Support'
  ]
WHERE slug = 'business';

-- Also update Free and Starter to explicitly have crm_access: false
UPDATE plans
SET feature_flags = feature_flags || '{"crm_access": false, "max_contacts": 0}'::jsonb
WHERE slug IN ('free', 'starter');
