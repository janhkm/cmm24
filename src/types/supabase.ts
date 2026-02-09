export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      accounts: {
        Row: {
          address_city: string | null
          address_country: string | null
          address_postal_code: string | null
          address_street: string | null
          auto_reply_delay_minutes: number | null
          auto_reply_enabled: boolean | null
          auto_reply_message: string | null
          company_name: string
          created_at: string | null
          deleted_at: string | null
          description: string | null
          email_signature: string | null
          id: string
          is_verified: boolean | null
          legal_form: string | null
          logo_url: string | null
          owner_id: string
          phone: string | null
          slug: string
          status: Database["public"]["Enums"]["account_status"] | null
          stripe_customer_id: string | null
          suspended_reason: string | null
          updated_at: string | null
          vat_id: string | null
          website: string | null
        }
        Insert: {
          address_city?: string | null
          address_country?: string | null
          address_postal_code?: string | null
          address_street?: string | null
          auto_reply_delay_minutes?: number | null
          auto_reply_enabled?: boolean | null
          auto_reply_message?: string | null
          company_name: string
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          email_signature?: string | null
          id?: string
          is_verified?: boolean | null
          legal_form?: string | null
          logo_url?: string | null
          owner_id: string
          phone?: string | null
          slug: string
          status?: Database["public"]["Enums"]["account_status"] | null
          stripe_customer_id?: string | null
          suspended_reason?: string | null
          updated_at?: string | null
          vat_id?: string | null
          website?: string | null
        }
        Update: {
          address_city?: string | null
          address_country?: string | null
          address_postal_code?: string | null
          address_street?: string | null
          auto_reply_delay_minutes?: number | null
          auto_reply_enabled?: boolean | null
          auto_reply_message?: string | null
          company_name?: string
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          email_signature?: string | null
          id?: string
          is_verified?: boolean | null
          legal_form?: string | null
          logo_url?: string | null
          owner_id?: string
          phone?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["account_status"] | null
          stripe_customer_id?: string | null
          suspended_reason?: string | null
          updated_at?: string | null
          vat_id?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accounts_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      api_key_usage: {
        Row: {
          api_key_id: string
          created_at: string | null
          endpoint: string
          id: string
          ip_address: string | null
          method: string
          response_time_ms: number | null
          status_code: number | null
          user_agent: string | null
        }
        Insert: {
          api_key_id: string
          created_at?: string | null
          endpoint: string
          id?: string
          ip_address?: string | null
          method: string
          response_time_ms?: number | null
          status_code?: number | null
          user_agent?: string | null
        }
        Update: {
          api_key_id?: string
          created_at?: string | null
          endpoint?: string
          id?: string
          ip_address?: string | null
          method?: string
          response_time_ms?: number | null
          status_code?: number | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_key_usage_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
        ]
      }
      api_keys: {
        Row: {
          account_id: string
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          permissions: string[]
          revoked_at: string | null
          revoked_by: string | null
          scopes: string[] | null
          updated_at: string | null
        }
        Insert: {
          account_id: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name: string
          permissions?: string[]
          revoked_at?: string | null
          revoked_by?: string | null
          scopes?: string[] | null
          updated_at?: string | null
        }
        Update: {
          account_id?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          permissions?: string[]
          revoked_at?: string | null
          revoked_by?: string | null
          scopes?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_keys_revoked_by_fkey"
            columns: ["revoked_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          entity_id: string
          entity_type: string
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          performed_by: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          entity_id: string
          entity_type: string
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          performed_by?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          performed_by?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      auto_reply_queue: {
        Row: {
          account_id: string
          created_at: string | null
          error_message: string | null
          id: string
          inquiry_id: string
          listing_id: string | null
          listing_title: string | null
          recipient_email: string
          recipient_name: string
          scheduled_for: string
          sent_at: string | null
          status: string
        }
        Insert: {
          account_id: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          inquiry_id: string
          listing_id?: string | null
          listing_title?: string | null
          recipient_email: string
          recipient_name: string
          scheduled_for: string
          sent_at?: string | null
          status?: string
        }
        Update: {
          account_id?: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          inquiry_id?: string
          listing_id?: string | null
          listing_title?: string | null
          recipient_email?: string
          recipient_name?: string
          scheduled_for?: string
          sent_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "auto_reply_queue_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auto_reply_queue_inquiry_id_fkey"
            columns: ["inquiry_id"]
            isOneToOne: true
            referencedRelation: "inquiries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auto_reply_queue_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      auto_reply_settings: {
        Row: {
          account_id: string
          created_at: string | null
          delay_minutes: number | null
          id: string
          include_listing_details: boolean | null
          include_signature: boolean | null
          is_enabled: boolean | null
          last_sent_at: string | null
          message: string
          respect_working_hours: boolean | null
          signature: string | null
          subject: string
          total_sent: number | null
          updated_at: string | null
          working_days: number[] | null
          working_hours_end: string | null
          working_hours_start: string | null
        }
        Insert: {
          account_id: string
          created_at?: string | null
          delay_minutes?: number | null
          id?: string
          include_listing_details?: boolean | null
          include_signature?: boolean | null
          is_enabled?: boolean | null
          last_sent_at?: string | null
          message?: string
          respect_working_hours?: boolean | null
          signature?: string | null
          subject?: string
          total_sent?: number | null
          updated_at?: string | null
          working_days?: number[] | null
          working_hours_end?: string | null
          working_hours_start?: string | null
        }
        Update: {
          account_id?: string
          created_at?: string | null
          delay_minutes?: number | null
          id?: string
          include_listing_details?: boolean | null
          include_signature?: boolean | null
          is_enabled?: boolean | null
          last_sent_at?: string | null
          message?: string
          respect_working_hours?: boolean | null
          signature?: string | null
          subject?: string
          total_sent?: number | null
          updated_at?: string | null
          working_days?: number[] | null
          working_hours_end?: string | null
          working_hours_start?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "auto_reply_settings_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: true
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_activities: {
        Row: {
          account_id: string
          activity_type: Database["public"]["Enums"]["activity_type"]
          contact_id: string
          created_at: string | null
          description: string | null
          id: string
          inquiry_id: string | null
          metadata: Json | null
          title: string | null
          user_id: string | null
        }
        Insert: {
          account_id: string
          activity_type: Database["public"]["Enums"]["activity_type"]
          contact_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          inquiry_id?: string | null
          metadata?: Json | null
          title?: string | null
          user_id?: string | null
        }
        Update: {
          account_id?: string
          activity_type?: Database["public"]["Enums"]["activity_type"]
          contact_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          inquiry_id?: string | null
          metadata?: Json | null
          title?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_activities_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_activities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_activities_inquiry_id_fkey"
            columns: ["inquiry_id"]
            isOneToOne: false
            referencedRelation: "inquiries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          account_id: string
          address_city: string | null
          address_country: string | null
          address_postal_code: string | null
          address_street: string | null
          company_name: string | null
          created_at: string | null
          deleted_at: string | null
          email: string
          first_name: string | null
          id: string
          job_title: string | null
          last_contact_at: string | null
          last_name: string | null
          lead_score: number | null
          lead_status: Database["public"]["Enums"]["lead_status"] | null
          mobile: string | null
          next_follow_up: string | null
          notes: string | null
          phone: string | null
          source: string | null
          tags: string[] | null
          total_inquiries: number | null
          total_value: number | null
          updated_at: string | null
        }
        Insert: {
          account_id: string
          address_city?: string | null
          address_country?: string | null
          address_postal_code?: string | null
          address_street?: string | null
          company_name?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email: string
          first_name?: string | null
          id?: string
          job_title?: string | null
          last_contact_at?: string | null
          last_name?: string | null
          lead_score?: number | null
          lead_status?: Database["public"]["Enums"]["lead_status"] | null
          mobile?: string | null
          next_follow_up?: string | null
          notes?: string | null
          phone?: string | null
          source?: string | null
          tags?: string[] | null
          total_inquiries?: number | null
          total_value?: number | null
          updated_at?: string | null
        }
        Update: {
          account_id?: string
          address_city?: string | null
          address_country?: string | null
          address_postal_code?: string | null
          address_street?: string | null
          company_name?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          job_title?: string | null
          last_contact_at?: string | null
          last_name?: string | null
          lead_score?: number | null
          lead_status?: Database["public"]["Enums"]["lead_status"] | null
          mobile?: string | null
          next_follow_up?: string | null
          notes?: string | null
          phone?: string | null
          source?: string | null
          tags?: string[] | null
          total_inquiries?: number | null
          total_value?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      email_connections: {
        Row: {
          access_token: string | null
          account_id: string
          created_at: string | null
          display_name: string | null
          email: string
          id: string
          is_active: boolean | null
          last_sync_at: string | null
          provider: string
          provider_account_id: string | null
          refresh_token: string | null
          token_expires_at: string | null
          updated_at: string | null
        }
        Insert: {
          access_token?: string | null
          account_id: string
          created_at?: string | null
          display_name?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          provider: string
          provider_account_id?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
        }
        Update: {
          access_token?: string | null
          account_id?: string
          created_at?: string | null
          display_name?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          provider?: string
          provider_account_id?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_connections_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      synced_emails: {
        Row: {
          id: string
          account_id: string
          connection_id: string
          external_id: string
          thread_id: string | null
          folder: string
          from_name: string | null
          from_email: string
          to_addresses: Array<{ name: string; address: string }>
          cc_addresses: Array<{ name: string; address: string }> | null
          subject: string | null
          preview: string | null
          body_html: string | null
          body_text: string | null
          is_read: boolean
          is_starred: boolean
          has_attachments: boolean
          importance: string
          received_at: string
          inquiry_id: string | null
          raw_data: Record<string, unknown> | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          account_id: string
          connection_id: string
          external_id: string
          thread_id?: string | null
          folder?: string
          from_name?: string | null
          from_email: string
          to_addresses?: Array<{ name: string; address: string }>
          cc_addresses?: Array<{ name: string; address: string }> | null
          subject?: string | null
          preview?: string | null
          body_html?: string | null
          body_text?: string | null
          is_read?: boolean
          is_starred?: boolean
          has_attachments?: boolean
          importance?: string
          received_at: string
          inquiry_id?: string | null
          raw_data?: Record<string, unknown> | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          account_id?: string
          connection_id?: string
          external_id?: string
          thread_id?: string | null
          folder?: string
          from_name?: string | null
          from_email?: string
          to_addresses?: Array<{ name: string; address: string }>
          cc_addresses?: Array<{ name: string; address: string }> | null
          subject?: string | null
          preview?: string | null
          body_html?: string | null
          body_text?: string | null
          is_read?: boolean
          is_starred?: boolean
          has_attachments?: boolean
          importance?: string
          received_at?: string
          inquiry_id?: string | null
          raw_data?: Record<string, unknown> | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "synced_emails_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "synced_emails_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "email_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "synced_emails_inquiry_id_fkey"
            columns: ["inquiry_id"]
            isOneToOne: false
            referencedRelation: "inquiries"
            referencedColumns: ["id"]
          },
        ]
      }
      inquiries: {
        Row: {
          account_id: string
          auto_reply_sent_at: string | null
          buyer_profile_id: string | null
          contact_company: string | null
          contact_email: string
          contact_id: string | null
          contact_name: string
          contact_phone: string | null
          created_at: string | null
          deleted_at: string | null
          id: string
          listing_id: string
          lost_reason: string | null
          message: string
          notes: string | null
          source: Database["public"]["Enums"]["inquiry_source"] | null
          status: Database["public"]["Enums"]["inquiry_status"] | null
          updated_at: string | null
          value: number | null
        }
        Insert: {
          account_id: string
          auto_reply_sent_at?: string | null
          buyer_profile_id?: string | null
          contact_company?: string | null
          contact_email: string
          contact_id?: string | null
          contact_name: string
          contact_phone?: string | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          listing_id: string
          lost_reason?: string | null
          message: string
          notes?: string | null
          source?: Database["public"]["Enums"]["inquiry_source"] | null
          status?: Database["public"]["Enums"]["inquiry_status"] | null
          updated_at?: string | null
          value?: number | null
        }
        Update: {
          account_id?: string
          auto_reply_sent_at?: string | null
          buyer_profile_id?: string | null
          contact_company?: string | null
          contact_email?: string
          contact_id?: string | null
          contact_name?: string
          contact_phone?: string | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          listing_id?: string
          lost_reason?: string | null
          message?: string
          notes?: string | null
          source?: Database["public"]["Enums"]["inquiry_source"] | null
          status?: Database["public"]["Enums"]["inquiry_status"] | null
          updated_at?: string | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "inquiries_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_buyer_profile_id_fkey"
            columns: ["buyer_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          account_id: string
          amount: number
          created_at: string | null
          currency: string | null
          id: string
          paid_at: string | null
          pdf_url: string | null
          period_end: string | null
          period_start: string | null
          status: Database["public"]["Enums"]["invoice_status"] | null
          stripe_invoice_id: string | null
          subscription_id: string | null
        }
        Insert: {
          account_id: string
          amount: number
          created_at?: string | null
          currency?: string | null
          id?: string
          paid_at?: string | null
          pdf_url?: string | null
          period_end?: string | null
          period_start?: string | null
          status?: Database["public"]["Enums"]["invoice_status"] | null
          stripe_invoice_id?: string | null
          subscription_id?: string | null
        }
        Update: {
          account_id?: string
          amount?: number
          created_at?: string | null
          currency?: string | null
          id?: string
          paid_at?: string | null
          pdf_url?: string | null
          period_end?: string | null
          period_start?: string | null
          status?: Database["public"]["Enums"]["invoice_status"] | null
          stripe_invoice_id?: string | null
          subscription_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_media: {
        Row: {
          created_at: string | null
          filename: string
          id: string
          is_primary: boolean | null
          listing_id: string
          mime_type: string | null
          size_bytes: number | null
          sort_order: number | null
          thumbnail_url: string | null
          type: Database["public"]["Enums"]["media_type"]
          updated_at: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          filename: string
          id?: string
          is_primary?: boolean | null
          listing_id: string
          mime_type?: string | null
          size_bytes?: number | null
          sort_order?: number | null
          thumbnail_url?: string | null
          type: Database["public"]["Enums"]["media_type"]
          updated_at?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          filename?: string
          id?: string
          is_primary?: boolean | null
          listing_id?: string
          mime_type?: string | null
          size_bytes?: number | null
          sort_order?: number | null
          thumbnail_url?: string | null
          type?: Database["public"]["Enums"]["media_type"]
          updated_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "listing_media_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          account_id: string
          accuracy_um: string | null
          condition: Database["public"]["Enums"]["listing_condition"]
          controller: string | null
          created_at: string | null
          currency: string | null
          deleted_at: string | null
          description: string
          featured: boolean | null
          featured_until: string | null
          id: string
          latitude: number | null
          location_city: string
          location_country: string
          location_postal_code: string
          longitude: number | null
          manufacturer_id: string
          measuring_range_x: number | null
          measuring_range_y: number | null
          measuring_range_z: number | null
          meta_description: string | null
          meta_title: string | null
          model_id: string | null
          model_name_custom: string | null
          price: number
          price_negotiable: boolean | null
          probe_system: string | null
          published_at: string | null
          rejected_at: string | null
          rejected_by: string | null
          rejection_reason: string | null
          search_vector: unknown
          slug: string
          software: string | null
          sold_at: string | null
          status: Database["public"]["Enums"]["listing_status"] | null
          title: string
          updated_at: string | null
          views_count: number | null
          year_built: number
        }
        Insert: {
          account_id: string
          accuracy_um?: string | null
          condition: Database["public"]["Enums"]["listing_condition"]
          controller?: string | null
          created_at?: string | null
          currency?: string | null
          deleted_at?: string | null
          description: string
          featured?: boolean | null
          featured_until?: string | null
          id?: string
          latitude?: number | null
          location_city: string
          location_country: string
          location_postal_code: string
          longitude?: number | null
          manufacturer_id: string
          measuring_range_x?: number | null
          measuring_range_y?: number | null
          measuring_range_z?: number | null
          meta_description?: string | null
          meta_title?: string | null
          model_id?: string | null
          model_name_custom?: string | null
          price: number
          price_negotiable?: boolean | null
          probe_system?: string | null
          published_at?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          search_vector?: unknown
          slug: string
          software?: string | null
          sold_at?: string | null
          status?: Database["public"]["Enums"]["listing_status"] | null
          title: string
          updated_at?: string | null
          views_count?: number | null
          year_built: number
        }
        Update: {
          account_id?: string
          accuracy_um?: string | null
          condition?: Database["public"]["Enums"]["listing_condition"]
          controller?: string | null
          created_at?: string | null
          currency?: string | null
          deleted_at?: string | null
          description?: string
          featured?: boolean | null
          featured_until?: string | null
          id?: string
          latitude?: number | null
          location_city?: string
          location_country?: string
          location_postal_code?: string
          longitude?: number | null
          manufacturer_id?: string
          measuring_range_x?: number | null
          measuring_range_y?: number | null
          measuring_range_z?: number | null
          meta_description?: string | null
          meta_title?: string | null
          model_id?: string | null
          model_name_custom?: string | null
          price?: number
          price_negotiable?: boolean | null
          probe_system?: string | null
          published_at?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          search_vector?: unknown
          slug?: string
          software?: string | null
          sold_at?: string | null
          status?: Database["public"]["Enums"]["listing_status"] | null
          title?: string
          updated_at?: string | null
          views_count?: number | null
          year_built?: number
        }
        Relationships: [
          {
            foreignKeyName: "listings_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_manufacturer_id_fkey"
            columns: ["manufacturer_id"]
            isOneToOne: false
            referencedRelation: "manufacturers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_rejected_by_fkey"
            columns: ["rejected_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      manufacturers: {
        Row: {
          country: string | null
          created_at: string | null
          description: string | null
          id: string
          logo_url: string | null
          name: string
          slug: string
          updated_at: string | null
          website: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          name: string
          slug: string
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          slug?: string
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      models: {
        Row: {
          category: Database["public"]["Enums"]["machine_category"] | null
          created_at: string | null
          id: string
          manufacturer_id: string
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          category?: Database["public"]["Enums"]["machine_category"] | null
          created_at?: string | null
          id?: string
          manufacturer_id: string
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["machine_category"] | null
          created_at?: string | null
          id?: string
          manufacturer_id?: string
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "models_manufacturer_id_fkey"
            columns: ["manufacturer_id"]
            isOneToOne: false
            referencedRelation: "manufacturers"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          id: string
          inquiry_id: string | null
          is_read: boolean | null
          link: string | null
          listing_id: string | null
          message: string
          metadata: Json | null
          read_at: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          inquiry_id?: string | null
          is_read?: boolean | null
          link?: string | null
          listing_id?: string | null
          message: string
          metadata?: Json | null
          read_at?: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          inquiry_id?: string | null
          is_read?: boolean | null
          link?: string | null
          listing_id?: string | null
          message?: string
          metadata?: Json | null
          read_at?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_inquiry_id_fkey"
            columns: ["inquiry_id"]
            isOneToOne: false
            referencedRelation: "inquiries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          created_at: string | null
          description: string | null
          feature_flags: Json
          features: string[] | null
          id: string
          is_active: boolean | null
          launch_price_monthly: number | null
          launch_price_yearly: number | null
          listing_limit: number
          name: string
          price_monthly: number
          price_yearly: number
          slug: string
          sort_order: number | null
          stripe_price_id_monthly: string | null
          stripe_price_id_yearly: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          feature_flags?: Json
          features?: string[] | null
          id?: string
          is_active?: boolean | null
          launch_price_monthly?: number | null
          launch_price_yearly?: number | null
          listing_limit: number
          name: string
          price_monthly: number
          price_yearly: number
          slug: string
          sort_order?: number | null
          stripe_price_id_monthly?: string | null
          stripe_price_id_yearly?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          feature_flags?: Json
          features?: string[] | null
          id?: string
          is_active?: boolean | null
          launch_price_monthly?: number | null
          launch_price_yearly?: number | null
          listing_limit?: number
          name?: string
          price_monthly?: number
          price_yearly?: number
          slug?: string
          sort_order?: number | null
          stripe_price_id_monthly?: string | null
          stripe_price_id_yearly?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          accepted_marketing: boolean | null
          accepted_terms_at: string | null
          avatar_url: string | null
          created_at: string | null
          email: string
          email_verified_at: string | null
          full_name: string
          id: string
          onboarding_intent: string | null
          onboarding_machine_count: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
        }
        Insert: {
          accepted_marketing?: boolean | null
          accepted_terms_at?: string | null
          avatar_url?: string | null
          created_at?: string | null
          email: string
          email_verified_at?: string | null
          full_name: string
          id: string
          onboarding_intent?: string | null
          onboarding_machine_count?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Update: {
          accepted_marketing?: boolean | null
          accepted_terms_at?: string | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          email_verified_at?: string | null
          full_name?: string
          id?: string
          onboarding_intent?: string | null
          onboarding_machine_count?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      reports: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          description: string | null
          id: string
          listing_id: string
          reason: Database["public"]["Enums"]["report_reason"]
          reporter_email: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["report_status"] | null
          updated_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          listing_id: string
          reason: Database["public"]["Enums"]["report_reason"]
          reporter_email: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["report_status"] | null
          updated_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          listing_id?: string
          reason?: Database["public"]["Enums"]["report_reason"]
          reporter_email?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["report_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      stripe_events: {
        Row: {
          id: string
          processed_at: string | null
          stripe_event_id: string
          type: string
        }
        Insert: {
          id?: string
          processed_at?: string | null
          stripe_event_id: string
          type: string
        }
        Update: {
          id?: string
          processed_at?: string | null
          stripe_event_id?: string
          type?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          account_id: string
          billing_interval:
            | Database["public"]["Enums"]["billing_interval"]
            | null
          cancel_at_period_end: boolean | null
          canceled_at: string | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          is_early_adopter: boolean | null
          plan_id: string
          status: Database["public"]["Enums"]["subscription_status"] | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string | null
        }
        Insert: {
          account_id: string
          billing_interval?:
            | Database["public"]["Enums"]["billing_interval"]
            | null
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          is_early_adopter?: boolean | null
          plan_id: string
          status?: Database["public"]["Enums"]["subscription_status"] | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
        }
        Update: {
          account_id?: string
          billing_interval?:
            | Database["public"]["Enums"]["billing_interval"]
            | null
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          is_early_adopter?: boolean | null
          plan_id?: string
          status?: Database["public"]["Enums"]["subscription_status"] | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: true
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      team_invitations: {
        Row: {
          accepted_at: string | null
          account_id: string
          created_at: string | null
          email: string
          expires_at: string
          id: string
          role: Database["public"]["Enums"]["team_role"] | null
          token: string
        }
        Insert: {
          accepted_at?: string | null
          account_id: string
          created_at?: string | null
          email: string
          expires_at: string
          id?: string
          role?: Database["public"]["Enums"]["team_role"] | null
          token: string
        }
        Update: {
          accepted_at?: string | null
          account_id?: string
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          role?: Database["public"]["Enums"]["team_role"] | null
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_invitations_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          accepted_at: string | null
          account_id: string
          created_at: string | null
          id: string
          invited_at: string | null
          invited_by: string | null
          is_active: boolean | null
          profile_id: string
          role: Database["public"]["Enums"]["team_role"] | null
          updated_at: string | null
        }
        Insert: {
          accepted_at?: string | null
          account_id: string
          created_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          is_active?: boolean | null
          profile_id: string
          role?: Database["public"]["Enums"]["team_role"] | null
          updated_at?: string | null
        }
        Update: {
          accepted_at?: string | null
          account_id?: string
          created_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          is_active?: boolean | null
          profile_id?: string
          role?: Database["public"]["Enums"]["team_role"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_members_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_listing: { Args: { p_listing_id: string }; Returns: undefined }
      can_create_listing: { Args: { p_account_id: string }; Returns: boolean }
      create_notification: {
        Args: {
          p_inquiry_id?: string
          p_link?: string
          p_listing_id?: string
          p_message: string
          p_metadata?: Json
          p_title: string
          p_type: Database["public"]["Enums"]["notification_type"]
          p_user_id: string
        }
        Returns: string
      }
      create_user_account: {
        Args: {
          p_company_name: string
          p_phone?: string
          p_slug?: string
          p_user_id: string
        }
        Returns: string
      }
      deactivate_excess_team_members: {
        Args: { p_account_id: string; p_max_members: number }
        Returns: number
      }
      find_or_create_contact: {
        Args: {
          p_account_id: string
          p_company_name?: string
          p_email: string
          p_first_name?: string
          p_last_name?: string
          p_phone?: string
          p_source?: string
        }
        Returns: string
      }
      get_listing_count: { Args: { p_account_id: string }; Returns: number }
      get_my_account_id: { Args: never; Returns: string }
      get_my_plan_slug: { Args: never; Returns: string }
      get_pending_auto_replies: {
        Args: { p_limit?: number }
        Returns: {
          account_id: string
          include_listing_details: boolean
          include_signature: boolean
          inquiry_id: string
          listing_id: string
          listing_title: string
          message: string
          queue_id: string
          recipient_email: string
          recipient_name: string
          signature: string
          subject: string
        }[]
      }
      increment_view_count: {
        Args: { p_listing_id: string }
        Returns: undefined
      }
      is_admin: { Args: never; Returns: boolean }
      is_super_admin: { Args: never; Returns: boolean }
      link_inquiries_to_buyer: {
        Args: { p_email: string; p_profile_id: string }
        Returns: number
      }
      mark_auto_reply_sent: {
        Args: {
          p_error_message?: string
          p_queue_id: string
          p_success: boolean
        }
        Returns: undefined
      }
      process_auto_reply_queue_cron: { Args: never; Returns: undefined }
      reactivate_account: { Args: { p_account_id: string }; Returns: undefined }
      reject_listing: {
        Args: { p_listing_id: string; p_reason: string }
        Returns: undefined
      }
      restore_listing: { Args: { p_listing_id: string }; Returns: boolean }
      search_listings: {
        Args: {
          p_condition?: string
          p_country?: string
          p_featured?: boolean
          p_limit?: number
          p_manufacturer_id?: string
          p_offset?: number
          p_price_max?: number
          p_price_min?: number
          p_search_term?: string
          p_sort_by?: string
          p_year_max?: number
          p_year_min?: number
        }
        Returns: {
          account_id: string
          accuracy_um: string
          condition: string
          controller: string
          created_at: string
          currency: string
          description: string
          featured: boolean
          id: string
          location_city: string
          location_country: string
          location_postal_code: string
          manufacturer_id: string
          measuring_range_x: number
          measuring_range_y: number
          measuring_range_z: number
          price: number
          price_negotiable: boolean
          probe_system: string
          published_at: string
          search_rank: number
          slug: string
          software: string
          status: string
          title: string
          total_count: number
          updated_at: string
          views_count: number
          year_built: number
        }[]
      }
      soft_delete_listing: {
        Args: { p_listing_id: string }
        Returns: undefined
      }
      suspend_account: {
        Args: { p_account_id: string; p_reason: string }
        Returns: undefined
      }
    }
    Enums: {
      account_status: "active" | "suspended"
      activity_type:
        | "note"
        | "call"
        | "email_sent"
        | "email_received"
        | "meeting"
        | "inquiry"
        | "status_change"
      billing_interval: "monthly" | "yearly"
      inquiry_source: "listing" | "contact" | "api"
      inquiry_status: "new" | "contacted" | "offer_sent" | "won" | "lost"
      invoice_status: "draft" | "open" | "paid" | "void" | "uncollectible"
      lead_status:
        | "new"
        | "contacted"
        | "qualified"
        | "negotiation"
        | "won"
        | "lost"
      listing_condition: "new" | "like_new" | "good" | "fair"
      listing_status:
        | "draft"
        | "pending_review"
        | "active"
        | "sold"
        | "archived"
      machine_category:
        | "portal"
        | "cantilever"
        | "horizontal_arm"
        | "gantry"
        | "optical"
        | "other"
      media_type: "image" | "video" | "document"
      notification_type:
        | "new_inquiry"
        | "inquiry_replied"
        | "listing_approved"
        | "listing_rejected"
        | "listing_expiring"
        | "subscription_renewed"
        | "subscription_expiring"
        | "payment_failed"
        | "welcome"
        | "system"
      report_reason: "spam" | "fake" | "inappropriate" | "duplicate" | "other"
      report_status: "pending" | "reviewed" | "resolved" | "dismissed"
      subscription_status: "active" | "past_due" | "canceled" | "trialing"
      team_role: "owner" | "admin" | "editor" | "viewer"
      user_role: "user" | "admin" | "super_admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      account_status: ["active", "suspended"],
      activity_type: [
        "note",
        "call",
        "email_sent",
        "email_received",
        "meeting",
        "inquiry",
        "status_change",
      ],
      billing_interval: ["monthly", "yearly"],
      inquiry_source: ["listing", "contact", "api"],
      inquiry_status: ["new", "contacted", "offer_sent", "won", "lost"],
      invoice_status: ["draft", "open", "paid", "void", "uncollectible"],
      lead_status: [
        "new",
        "contacted",
        "qualified",
        "negotiation",
        "won",
        "lost",
      ],
      listing_condition: ["new", "like_new", "good", "fair"],
      listing_status: ["draft", "pending_review", "active", "sold", "archived"],
      machine_category: [
        "portal",
        "cantilever",
        "horizontal_arm",
        "gantry",
        "optical",
        "other",
      ],
      media_type: ["image", "video", "document"],
      notification_type: [
        "new_inquiry",
        "inquiry_replied",
        "listing_approved",
        "listing_rejected",
        "listing_expiring",
        "subscription_renewed",
        "subscription_expiring",
        "payment_failed",
        "welcome",
        "system",
      ],
      report_reason: ["spam", "fake", "inappropriate", "duplicate", "other"],
      report_status: ["pending", "reviewed", "resolved", "dismissed"],
      subscription_status: ["active", "past_due", "canceled", "trialing"],
      team_role: ["owner", "admin", "editor", "viewer"],
      user_role: ["user", "admin", "super_admin"],
    },
  },
} as const
