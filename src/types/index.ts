// Listing Types
export type ListingStatus = 'draft' | 'pending_review' | 'active' | 'sold' | 'archived';
export type ListingCondition = 'new' | 'like_new' | 'good' | 'fair';
export type MachineCategory = 'portal' | 'cantilever' | 'horizontal_arm' | 'gantry' | 'optical' | 'other';

export interface Manufacturer {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  country?: string;
  listingCount?: number;
}

export interface Model {
  id: string;
  manufacturerId: string;
  name: string;
  slug: string;
  category: MachineCategory;
}

export interface ListingMedia {
  id: string;
  listingId: string;
  type: 'image' | 'video' | 'document';
  url: string;
  thumbnailUrl?: string;
  filename: string;
  sortOrder: number;
  isPrimary: boolean;
}

export interface Listing {
  id: string;
  accountId: string;
  manufacturerId: string;
  modelId?: string;
  manufacturer: Manufacturer;
  model?: Model;
  title: string;
  slug: string;
  description: string;
  price: number;
  priceNegotiable: boolean;
  currency: string;
  yearBuilt: number;
  condition: ListingCondition;
  measuringRangeX: number;
  measuringRangeY: number;
  measuringRangeZ: number;
  accuracyUm?: string;
  software?: string;
  controller?: string;
  probeSystem?: string;
  locationCountry: string;
  locationCity: string;
  locationPostalCode: string;
  status: ListingStatus;
  featured: boolean;
  viewsCount: number;
  publishedAt?: string;
  soldAt?: string;
  createdAt: string;
  updatedAt: string;
  media: ListingMedia[];
  seller?: Seller;
}

// Seller/Account Types
export interface Seller {
  id: string;
  companyName: string;
  slug: string;
  logoUrl?: string;
  website?: string;
  phone?: string;
  addressCity: string;
  addressCountry: string;
  isVerified: boolean;
  listingCount: number;
  responseTime?: string;
  memberSince: string;
}

// Inquiry Types
export type InquiryStatus = 'new' | 'contacted' | 'offer_sent' | 'won' | 'lost';

export interface Inquiry {
  id: string;
  listingId: string;
  listing?: Listing;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  contactCompany?: string;
  message: string;
  status: InquiryStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Subscription Types
export type PlanSlug = 'free' | 'starter' | 'business';
export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'trialing';

// Plan Feature Flags
export interface PlanFeatures {
  maxListings: number; // -1 = unlimited
  maxDrafts: number; // -1 = unlimited
  hasStatistics: boolean;
  hasStatisticsExport: boolean;
  hasLeadManagement: boolean;
  hasLeadPipeline: boolean;
  hasEmailComposer: boolean; // In-App E-Mail versenden
  hasAutoReply: boolean; // Automatische Antwort auf Anfragen
  hasBulkActions: boolean; // Mehrere Inserate gleichzeitig bearbeiten
  hasFeaturedListings: number; // per month, 0 = none
  hasPriorityPlacement: boolean; // Höhere Platzierung in Suche
  hasVerifiedBadge: boolean;
  hasPrioritySupport: boolean;
  hasApiAccess: boolean;
  maxTeamMembers: number;
}

export interface Plan {
  id: string;
  name: string;
  slug: PlanSlug;
  listingLimit: number;
  priceMonthly: number; // in cents (regular price)
  priceYearly: number; // in cents per year (regular price)
  launchPriceMonthly?: number; // in cents (early adopter price)
  launchPriceYearly?: number; // in cents per year (early adopter price)
  extraListingPriceMonthly?: number; // in cents per extra listing
  extraListingPriceYearly?: number; // in cents per extra listing (yearly)
  features: string[]; // Display features for UI
  featureFlags: PlanFeatures; // Actual feature flags
  description: string; // Short description
  highlighted?: boolean; // Show as recommended
}

export interface Subscription {
  id: string;
  accountId: string;
  planId: string;
  plan: Plan;
  status: SubscriptionStatus;
  billingInterval: 'monthly' | 'yearly';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

// User Types
export type UserRole = 'user' | 'admin' | 'super_admin';

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  role: UserRole;
}

// Filter Types
export interface ListingFilters {
  query?: string; // Text search
  manufacturers?: string[];
  categories?: MachineCategory[];
  priceMin?: number;
  priceMax?: number;
  yearMin?: number;
  yearMax?: number;
  measuringRangeXMin?: number;
  measuringRangeXMax?: number;
  measuringRangeYMin?: number;
  measuringRangeYMax?: number;
  measuringRangeZMin?: number;
  measuringRangeZMax?: number;
  countries?: string[];
  condition?: ListingCondition[];
  search?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'date_desc' | 'date_asc' | 'year_asc' | 'year_desc' | 'relevance';
}

// Compare Types
export interface CompareState {
  items: string[]; // listing IDs
  maxItems: number;
}

// Navigation Types
export interface NavItem {
  title: string;
  href: string;
  description?: string;
  children?: NavItem[];
}

// Form Types
export interface ListingFormData {
  // Step 1: Basic Info
  manufacturerId: string;
  modelId?: string;
  modelNameCustom?: string;
  title: string;
  yearBuilt: number;
  condition: ListingCondition;
  price: number;
  priceNegotiable: boolean;
  
  // Step 2: Technical Data
  measuringRangeX: number;
  measuringRangeY: number;
  measuringRangeZ: number;
  accuracyUm?: string;
  software?: string;
  controller?: string;
  probeSystem?: string;
  
  // Step 3: Location
  locationCountry: string;
  locationCity: string;
  locationPostalCode: string;
  
  // Step 4: Description
  description: string;
  
  // Step 5: Media (handled separately)
}

export interface InquiryFormData {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message: string;
}

// Category Types for SEO Pages
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  longDescription?: string;
  icon?: string;
  listingCount: number;
  image?: string;
}

// Glossary Types
export interface GlossaryEntry {
  id: string;
  term: string;
  slug: string;
  shortDefinition: string;
  fullDefinition: string;
  relatedTerms?: string[];
  seeAlso?: string[];
}

// Article/Ratgeber Types
export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: 'kaufratgeber' | 'vergleich' | 'technik' | 'markt';
  author: {
    name: string;
    role: string;
    avatar?: string;
  };
  publishedAt: string;
  updatedAt: string;
  readingTime: number;
  image?: string;
  tags?: string[];
}

// FAQ Types
export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQCategory {
  title: string;
  items: FAQItem[];
}

// Team Member for About Page
export interface TeamMember {
  name: string;
  role: string;
  bio: string;
  image?: string;
  linkedin?: string;
}
