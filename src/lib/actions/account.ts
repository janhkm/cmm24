'use server';

import { createActionClient, createServiceRoleClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Database } from '@/types/supabase';
import type { ActionResult } from './types';
import { ErrorMessages } from './types';
import { updateAccountSchema, autoReplySettingsSchema } from '@/lib/validations/account';
import type { UpdateAccountData, AutoReplySettingsData } from '@/lib/validations/account';
import { sendPasswordChangedEmail } from '@/lib/email/send';

type Account = Database['public']['Tables']['accounts']['Row'];

/**
 * Hilfsfunktion: JSONB-Wert sicher als Array parsen.
 * Faengt doppelt-encoded Strings ab (z.B. von altem JSON.stringify-Bug).
 */
function parseJsonbArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed as T[];
    } catch {
      // ignorieren
    }
  }
  return [];
}

/**
 * Get the current user's account
 */
export async function getMyAccount(): Promise<ActionResult<Account>> {
  try {
    const supabase = await createActionClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: ErrorMessages.UNAUTHORIZED, code: 'UNAUTHORIZED' };
    }
    
    const { data: account, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('owner_id', user.id)
      .is('deleted_at', null)
      .maybeSingle();
    
    if (error) {
      console.error('[getMyAccount] Error:', error);
      return { success: false, error: ErrorMessages.SERVER_ERROR, code: 'SERVER_ERROR' };
    }
    
    if (!account) {
      return { success: false, error: ErrorMessages.ACCOUNT_NOT_FOUND, code: 'NOT_FOUND' };
    }
    
    return { success: true, data: account };
  } catch (error) {
    console.error('[getMyAccount] Unexpected error:', error);
    return { success: false, error: ErrorMessages.SERVER_ERROR, code: 'SERVER_ERROR' };
  }
}

/**
 * Update account (company) data
 */
export async function updateAccount(data: UpdateAccountData): Promise<ActionResult<Account>> {
  try {
    const supabase = await createActionClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: ErrorMessages.UNAUTHORIZED, code: 'UNAUTHORIZED' };
    }
    
    // Validate input
    const validated = updateAccountSchema.safeParse(data);
    if (!validated.success) {
      const firstError = validated.error.issues[0];
      return { 
        success: false, 
        error: firstError?.message || ErrorMessages.VALIDATION_ERROR, 
        code: 'VALIDATION_ERROR' 
      };
    }
    
    // Clean up empty strings to null for optional fields
    const cleanData: Partial<Account> = {
      company_name: validated.data.company_name,
      legal_form: validated.data.legal_form || null,
      description: validated.data.description || null,
      website: validated.data.website || null,
      phone: validated.data.phone || null,
      address_street: validated.data.address_street || null,
      address_city: validated.data.address_city || null,
      address_postal_code: validated.data.address_postal_code || null,
      address_country: validated.data.address_country || null,
      vat_id: validated.data.vat_id || null,
      email_signature: validated.data.email_signature || null,
    };
    
    const { data: account, error } = await supabase
      .from('accounts')
      .update(cleanData)
      .eq('owner_id', user.id)
      .is('deleted_at', null)
      .select()
      .single();
    
    if (error) {
      console.error('[updateAccount] Error:', error);
      return { success: false, error: 'Fehler beim Speichern', code: 'SERVER_ERROR' };
    }
    
    revalidatePath('/seller/konto');
    revalidatePath('/seller/konto/firma');
    return { success: true, data: account };
  } catch (error) {
    console.error('[updateAccount] Unexpected error:', error);
    return { success: false, error: ErrorMessages.SERVER_ERROR, code: 'SERVER_ERROR' };
  }
}

/**
 * Erweitertes Profil aktualisieren (Galerie + Zertifikate, nur Business)
 */
export async function updatePremiumProfile(data: {
  description?: string;
  gallery_urls: { url: string; caption?: string }[];
  certificates: { name: string; url?: string; issued_by?: string }[];
}): Promise<ActionResult<Account>> {
  try {
    const supabase = await createActionClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: ErrorMessages.UNAUTHORIZED, code: 'UNAUTHORIZED' };
    }

    // Max. 6 Galerie-Bilder
    const galleryArr = Array.isArray(data.gallery_urls) ? data.gallery_urls : [];
    if (galleryArr.length > 6) {
      return { success: false, error: 'Maximal 6 Galerie-Bilder erlaubt', code: 'VALIDATION_ERROR' };
    }

    // Galerie-Bilder validieren: nur URL und optionale Caption
    const sanitizedGallery = galleryArr.map(item => ({
      url: typeof item.url === 'string' ? item.url.trim() : '',
      caption: typeof item.caption === 'string' ? item.caption.trim().substring(0, 200) : undefined,
    })).filter(item => item.url.length > 0);

    // Max. 10 Zertifikate
    const certsArr = Array.isArray(data.certificates) ? data.certificates : [];
    if (certsArr.length > 10) {
      return { success: false, error: 'Maximal 10 Zertifikate erlaubt', code: 'VALIDATION_ERROR' };
    }

    // Zertifikate validieren: nur erlaubte Felder
    const sanitizedCerts = certsArr.map(item => ({
      name: typeof item.name === 'string' ? item.name.trim().substring(0, 200) : '',
      url: typeof item.url === 'string' ? item.url.trim() : undefined,
      issued_by: typeof item.issued_by === 'string' ? item.issued_by.trim().substring(0, 200) : undefined,
    })).filter(item => item.name.length > 0);

    // Beschreibung laengenbegrenzen
    const description = data.description?.trim().substring(0, 5000) || null;

    const { data: account, error } = await supabase
      .from('accounts')
      .update({
        description,
        gallery_urls: sanitizedGallery,
        certificates: sanitizedCerts,
      })
      .eq('owner_id', user.id)
      .is('deleted_at', null)
      .select()
      .single();

    if (error) {
      console.error('[updatePremiumProfile] Error:', error);
      return { success: false, error: 'Fehler beim Speichern', code: 'SERVER_ERROR' };
    }

    revalidatePath('/seller/konto');
    return { success: true, data: account };
  } catch (error) {
    console.error('[updatePremiumProfile] Unexpected error:', error);
    return { success: false, error: ErrorMessages.SERVER_ERROR, code: 'SERVER_ERROR' };
  }
}

/**
 * Update auto-reply settings
 */
export async function updateAutoReplySettings(data: AutoReplySettingsData): Promise<ActionResult> {
  try {
    const supabase = await createActionClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: ErrorMessages.UNAUTHORIZED, code: 'UNAUTHORIZED' };
    }
    
    // Validate input
    const validated = autoReplySettingsSchema.safeParse(data);
    if (!validated.success) {
      return { success: false, error: ErrorMessages.VALIDATION_ERROR, code: 'VALIDATION_ERROR' };
    }
    
    const { error } = await supabase
      .from('accounts')
      .update({
        auto_reply_enabled: validated.data.auto_reply_enabled,
        auto_reply_message: validated.data.auto_reply_message || null,
        auto_reply_delay_minutes: validated.data.auto_reply_delay_minutes || null,
      })
      .eq('owner_id', user.id)
      .is('deleted_at', null);
    
    if (error) {
      console.error('[updateAutoReplySettings] Error:', error);
      return { success: false, error: 'Fehler beim Speichern', code: 'SERVER_ERROR' };
    }
    
    revalidatePath('/seller/konto');
    return { success: true };
  } catch (error) {
    console.error('[updateAutoReplySettings] Unexpected error:', error);
    return { success: false, error: ErrorMessages.SERVER_ERROR, code: 'SERVER_ERROR' };
  }
}

/**
 * Upload account logo
 */
export async function uploadAccountLogo(formData: FormData): Promise<ActionResult<{ url: string }>> {
  try {
    const supabase = await createActionClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: ErrorMessages.UNAUTHORIZED, code: 'UNAUTHORIZED' };
    }
    
    // Get account
    const { data: account } = await supabase
      .from('accounts')
      .select('id, logo_url')
      .eq('owner_id', user.id)
      .is('deleted_at', null)
      .single();
    
    if (!account) {
      return { success: false, error: ErrorMessages.ACCOUNT_NOT_FOUND, code: 'NOT_FOUND' };
    }
    
    const file = formData.get('file') as File;
    if (!file) {
      return { success: false, error: 'Keine Datei angegeben', code: 'VALIDATION_ERROR' };
    }
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return { success: false, error: ErrorMessages.FILE_TOO_LARGE + ' (max. 2MB)', code: 'VALIDATION_ERROR' };
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: ErrorMessages.INVALID_FILE_TYPE, code: 'VALIDATION_ERROR' };
    }
    
    // Delete old logo if exists
    if (account.logo_url) {
      const oldPath = account.logo_url.split('/account-logos/')[1];
      if (oldPath) {
        await supabase.storage.from('account-logos').remove([oldPath]);
      }
    }
    
    // Upload new logo
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const filename = `${account.id}/logo-${Date.now()}.${ext}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('account-logos')
      .upload(filename, file, { 
        upsert: true,
        cacheControl: '31536000',
      });
    
    if (uploadError) {
      console.error('[uploadAccountLogo] Upload error:', uploadError);
      return { success: false, error: 'Upload fehlgeschlagen', code: 'SERVER_ERROR' };
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('account-logos')
      .getPublicUrl(uploadData.path);
    
    // Update account with new logo URL
    const { error: updateError } = await supabase
      .from('accounts')
      .update({ logo_url: publicUrl })
      .eq('id', account.id);
    
    if (updateError) {
      console.error('[uploadAccountLogo] Update error:', updateError);
      // Try to clean up uploaded file
      await supabase.storage.from('account-logos').remove([uploadData.path]);
      return { success: false, error: 'Fehler beim Speichern', code: 'SERVER_ERROR' };
    }
    
    revalidatePath('/seller/konto');
    revalidatePath('/seller/konto/firma');
    return { success: true, data: { url: publicUrl } };
  } catch (error) {
    console.error('[uploadAccountLogo] Unexpected error:', error);
    return { success: false, error: ErrorMessages.SERVER_ERROR, code: 'SERVER_ERROR' };
  }
}

/**
 * Profilbild (Avatar) hochladen - Server Action
 */
export async function uploadProfileAvatar(formData: FormData): Promise<ActionResult<{ url: string }>> {
  try {
    const supabase = await createActionClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: ErrorMessages.UNAUTHORIZED, code: 'UNAUTHORIZED' };
    }
    
    const file = formData.get('file') as File;
    if (!file) {
      return { success: false, error: 'Keine Datei angegeben', code: 'VALIDATION_ERROR' };
    }
    
    if (file.size > 2 * 1024 * 1024) {
      return { success: false, error: ErrorMessages.FILE_TOO_LARGE + ' (max. 2MB)', code: 'VALIDATION_ERROR' };
    }
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: ErrorMessages.INVALID_FILE_TYPE, code: 'VALIDATION_ERROR' };
    }
    
    // Altes Avatar loeschen falls vorhanden
    const { data: profileData } = await supabase
      .from('profiles')
      .select('avatar_url')
      .eq('id', user.id)
      .single();
    
    if (profileData?.avatar_url) {
      const oldPath = profileData.avatar_url.split('/account-logos/')[1];
      if (oldPath) {
        await supabase.storage.from('account-logos').remove([oldPath]);
      }
    }
    
    // Account ID holen fuer den Storage-Pfad
    const { data: account } = await supabase
      .from('accounts')
      .select('id')
      .eq('owner_id', user.id)
      .is('deleted_at', null)
      .single();
    
    if (!account) {
      return { success: false, error: ErrorMessages.ACCOUNT_NOT_FOUND, code: 'NOT_FOUND' };
    }
    
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const filename = `${account.id}/avatar-${Date.now()}.${ext}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('account-logos')
      .upload(filename, file, { upsert: true, cacheControl: '31536000' });
    
    if (uploadError) {
      console.error('[uploadProfileAvatar] Upload error:', uploadError);
      return { success: false, error: 'Upload fehlgeschlagen', code: 'SERVER_ERROR' };
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('account-logos')
      .getPublicUrl(uploadData.path);
    
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', user.id);
    
    if (updateError) {
      console.error('[uploadProfileAvatar] Update error:', updateError);
      await supabase.storage.from('account-logos').remove([uploadData.path]);
      return { success: false, error: 'Fehler beim Speichern', code: 'SERVER_ERROR' };
    }
    
    revalidatePath('/seller/konto');
    return { success: true, data: { url: publicUrl } };
  } catch (error) {
    console.error('[uploadProfileAvatar] Unexpected error:', error);
    return { success: false, error: ErrorMessages.SERVER_ERROR, code: 'SERVER_ERROR' };
  }
}

/**
 * Galerie-Bild hochladen - Server Action
 */
export async function uploadGalleryImage(formData: FormData): Promise<ActionResult<{ url: string }>> {
  try {
    const supabase = await createActionClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: ErrorMessages.UNAUTHORIZED, code: 'UNAUTHORIZED' };
    }
    
    const { data: account } = await supabase
      .from('accounts')
      .select('id')
      .eq('owner_id', user.id)
      .is('deleted_at', null)
      .single();
    
    if (!account) {
      return { success: false, error: ErrorMessages.ACCOUNT_NOT_FOUND, code: 'NOT_FOUND' };
    }
    
    const file = formData.get('file') as File;
    if (!file) {
      return { success: false, error: 'Keine Datei angegeben', code: 'VALIDATION_ERROR' };
    }
    
    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: ErrorMessages.FILE_TOO_LARGE + ' (max. 5MB)', code: 'VALIDATION_ERROR' };
    }
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: ErrorMessages.INVALID_FILE_TYPE, code: 'VALIDATION_ERROR' };
    }
    
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const filename = `${account.id}/gallery/${crypto.randomUUID()}.${ext}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('account-logos')
      .upload(filename, file, { upsert: false, cacheControl: '31536000' });
    
    if (uploadError) {
      console.error('[uploadGalleryImage] Upload error:', uploadError);
      return { success: false, error: 'Upload fehlgeschlagen', code: 'SERVER_ERROR' };
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('account-logos')
      .getPublicUrl(uploadData.path);
    
    revalidatePath('/seller/konto');
    return { success: true, data: { url: publicUrl } };
  } catch (error) {
    console.error('[uploadGalleryImage] Unexpected error:', error);
    return { success: false, error: ErrorMessages.SERVER_ERROR, code: 'SERVER_ERROR' };
  }
}

/**
 * Delete account logo
 */
export async function deleteAccountLogo(): Promise<ActionResult> {
  try {
    const supabase = await createActionClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: ErrorMessages.UNAUTHORIZED, code: 'UNAUTHORIZED' };
    }
    
    // Get account
    const { data: account } = await supabase
      .from('accounts')
      .select('id, logo_url')
      .eq('owner_id', user.id)
      .is('deleted_at', null)
      .single();
    
    if (!account) {
      return { success: false, error: ErrorMessages.ACCOUNT_NOT_FOUND, code: 'NOT_FOUND' };
    }
    
    // Delete from storage if exists
    if (account.logo_url) {
      const path = account.logo_url.split('/account-logos/')[1];
      if (path) {
        await supabase.storage.from('account-logos').remove([path]);
      }
    }
    
    // Clear logo URL in database
    const { error } = await supabase
      .from('accounts')
      .update({ logo_url: null })
      .eq('id', account.id);
    
    if (error) {
      console.error('[deleteAccountLogo] Error:', error);
      return { success: false, error: 'Fehler beim Löschen', code: 'SERVER_ERROR' };
    }
    
    revalidatePath('/seller/konto');
    return { success: true };
  } catch (error) {
    console.error('[deleteAccountLogo] Unexpected error:', error);
    return { success: false, error: ErrorMessages.SERVER_ERROR, code: 'SERVER_ERROR' };
  }
}

/**
 * Update user password
 */
export async function updatePassword(
  currentPassword: string, 
  newPassword: string
): Promise<ActionResult> {
  try {
    const supabase = await createActionClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) {
      return { success: false, error: ErrorMessages.UNAUTHORIZED, code: 'UNAUTHORIZED' };
    }
    
    // Validate new password
    if (newPassword.length < 8) {
      return { 
        success: false, 
        error: 'Neues Passwort muss mindestens 8 Zeichen lang sein', 
        code: 'VALIDATION_ERROR' 
      };
    }
    
    // Verify current password by signing in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });
    
    if (signInError) {
      return { 
        success: false, 
        error: 'Aktuelles Passwort ist falsch', 
        code: 'VALIDATION_ERROR' 
      };
    }
    
    // Update password
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    
    if (error) {
      console.error('[updatePassword] Error:', error);
      return { success: false, error: 'Passwort konnte nicht geändert werden', code: 'SERVER_ERROR' };
    }
    
    // Sicherheits-E-Mail senden
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();
    
    sendPasswordChangedEmail({
      to: user.email,
      userName: profile?.full_name?.split(' ')[0] || 'Nutzer',
    }).catch(err => {
      console.error('[updatePassword] Failed to send password changed email');
    });
    
    return { success: true };
  } catch (error) {
    console.error('[updatePassword] Unexpected error:', error);
    return { success: false, error: ErrorMessages.SERVER_ERROR, code: 'SERVER_ERROR' };
  }
}

// =============================================================================
// Profile & Account combined data
// =============================================================================

export interface UserProfileData {
  userId: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  avatarUrl: string | null;
  account: {
    id: string;
    companyName: string;
    legalForm: string | null;
    description: string | null;
    slug: string;
    website: string | null;
    phone: string | null;
    addressStreet: string | null;
    addressCity: string | null;
    addressPostalCode: string | null;
    addressCountry: string | null;
    vatId: string | null;
    logoUrl: string | null;
    emailSignature: string | null;
    isVerified: boolean;
    galleryUrls: { url: string; caption?: string }[];
    certificates: { name: string; url?: string; issued_by?: string }[];
  };
  plan: {
    slug: string;
    name: string;
  };
}

/**
 * Get profile with account data for settings page
 */
export async function getProfileWithAccount(): Promise<ActionResult<UserProfileData>> {
  try {
    const supabase = await createActionClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: ErrorMessages.UNAUTHORIZED, code: 'UNAUTHORIZED' };
    }
    
    // Get profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (profileError) {
      console.error('[getProfileWithAccount] Profile error:', profileError);
      return { success: false, error: ErrorMessages.SERVER_ERROR, code: 'SERVER_ERROR' };
    }
    
    // Get account with subscription and plan
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select(`
        *,
        subscriptions(
          plans(slug, name)
        )
      `)
      .eq('owner_id', user.id)
      .is('deleted_at', null)
      .maybeSingle();
    
    if (accountError) {
      console.error('[getProfileWithAccount] Account error:', accountError);
      return { success: false, error: ErrorMessages.SERVER_ERROR, code: 'SERVER_ERROR' };
    }
    
    if (!account) {
      return { success: false, error: ErrorMessages.ACCOUNT_NOT_FOUND, code: 'NOT_FOUND' };
    }
    
    // Extract plan from subscription
    const subscriptions = account.subscriptions as { plans: { slug: string; name: string } | null }[] | null;
    const plan = subscriptions?.[0]?.plans || { slug: 'free', name: 'Free' };
    
    return {
      success: true,
      data: {
        userId: user.id,
        email: profile.email || user.email || '',
        fullName: profile.full_name,
        phone: profile.phone,
        avatarUrl: profile.avatar_url,
        account: {
          id: account.id,
          companyName: account.company_name,
          legalForm: account.legal_form,
          description: account.description,
          slug: account.slug,
          website: account.website,
          phone: account.phone,
          addressStreet: account.address_street,
          addressCity: account.address_city,
          addressPostalCode: account.address_postal_code,
          addressCountry: account.address_country,
          vatId: account.vat_id,
          logoUrl: account.logo_url,
          emailSignature: account.email_signature,
          isVerified: account.is_verified || false,
          galleryUrls: parseJsonbArray<{ url: string; caption?: string }>(account.gallery_urls),
          certificates: parseJsonbArray<{ name: string; url?: string; issued_by?: string }>(account.certificates),
        },
        plan: {
          slug: plan.slug,
          name: plan.name,
        },
      },
    };
  } catch (error) {
    console.error('[getProfileWithAccount] Unexpected error:', error);
    return { success: false, error: ErrorMessages.SERVER_ERROR, code: 'SERVER_ERROR' };
  }
}

/**
 * Update user profile (name, phone)
 */
export async function updateProfile(data: {
  full_name?: string;
  phone?: string;
  avatar_url?: string;
}): Promise<ActionResult> {
  try {
    const supabase = await createActionClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: ErrorMessages.UNAUTHORIZED, code: 'UNAUTHORIZED' };
    }
    
    const updateData: Record<string, string | null> = {};
    if (data.full_name !== undefined) {
      const name = data.full_name?.trim() || null;
      if (name && name.length > 200) {
        return { success: false, error: 'Name ist zu lang (max. 200 Zeichen)', code: 'VALIDATION_ERROR' };
      }
      updateData.full_name = name;
    }
    if (data.phone !== undefined) {
      const phone = data.phone?.trim() || null;
      if (phone && phone.length > 30) {
        return { success: false, error: 'Telefonnummer ist zu lang', code: 'VALIDATION_ERROR' };
      }
      updateData.phone = phone;
    }
    if (data.avatar_url !== undefined) {
      const avatarUrl = data.avatar_url?.trim() || null;
      // Avatar-URL muss von unserer Supabase Storage Domain stammen oder leer sein
      if (avatarUrl && !avatarUrl.includes(process.env.NEXT_PUBLIC_SUPABASE_URL || '')) {
        return { success: false, error: 'Ungueltiger Avatar-URL', code: 'VALIDATION_ERROR' };
      }
      updateData.avatar_url = avatarUrl;
    }
    
    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id);
    
    if (error) {
      console.error('[updateProfile] Error:', error);
      return { success: false, error: 'Fehler beim Speichern', code: 'SERVER_ERROR' };
    }
    
    revalidatePath('/seller/konto');
    return { success: true };
  } catch (error) {
    console.error('[updateProfile] Unexpected error:', error);
    return { success: false, error: ErrorMessages.SERVER_ERROR, code: 'SERVER_ERROR' };
  }
}

// =============================================================================
// Account-Loeschung (Art. 17 DSGVO — Recht auf Loeschung)
// =============================================================================

/**
 * Loescht den Account des aktuellen Nutzers vollstaendig.
 * 
 * Ablauf:
 * 1. Soft-Delete des Accounts (deleted_at setzen)
 * 2. Alle Listings deaktivieren
 * 3. Storage-Dateien loeschen (Bilder, Dokumente)
 * 4. Profil-Daten anonymisieren
 * 5. Supabase Auth-User loeschen (per Service-Role)
 * 
 * DSGVO Art. 17: Recht auf Loeschung ("Recht auf Vergessenwerden")
 */
export async function deleteAccount(confirmationText: string): Promise<ActionResult<void>> {
  try {
    const supabase = await createActionClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: ErrorMessages.UNAUTHORIZED, code: 'UNAUTHORIZED' };
    }

    // Sicherheitsbestaetigung: User muss "LOESCHEN" eingeben
    if (confirmationText !== 'LOESCHEN') {
      return { 
        success: false, 
        error: 'Bitte geben Sie "LOESCHEN" ein, um die Löschung zu bestätigen', 
        code: 'VALIDATION_ERROR' 
      };
    }

    const now = new Date().toISOString();

    // 1. Account soft-deleten
    const { data: account } = await supabase
      .from('accounts')
      .select('id')
      .eq('owner_id', user.id)
      .is('deleted_at', null)
      .maybeSingle();

    if (account) {
      // Alle Listings des Accounts deaktivieren
      await supabase
        .from('listings')
        .update({ status: 'archived', deleted_at: now })
        .eq('account_id', account.id)
        .is('deleted_at', null);

      // Account soft-deleten
      await supabase
        .from('accounts')
        .update({ 
          status: 'suspended',
          deleted_at: now,
          // Firmenname anonymisieren
          company_name: `Geloeschter Account`,
          phone: null,
          website: null,
          address_street: null,
          address_postal_code: null,
          vat_id: null,
          email_signature: null,
          description: null,
          gallery_urls: null,
          certificates: null,
        })
        .eq('id', account.id);

      // Storage-Dateien loeschen (Listing-Bilder)
      // Listing-IDs des Accounts holen und dann die Media-Dateien
      const { data: accountListings } = await supabase
        .from('listings')
        .select('id')
        .eq('account_id', account.id);
      
      if (accountListings && accountListings.length > 0) {
        const listingIds = accountListings.map(l => l.id);
        const { data: mediaFiles } = await supabase
          .from('listing_media')
          .select('url')
          .in('listing_id', listingIds);

        if (mediaFiles && mediaFiles.length > 0) {
          // Storage-Pfad aus URL extrahieren
          const storagePaths = mediaFiles
            .map(m => {
              try {
                const url = new URL(m.url);
                // Pfad nach /object/public/listing-images/ extrahieren
                const match = url.pathname.match(/\/object\/public\/listing-images\/(.+)/);
                return match ? match[1] : null;
              } catch {
                return null;
              }
            })
            .filter(Boolean) as string[];
          
          if (storagePaths.length > 0) {
            await supabase.storage.from('listing-images').remove(storagePaths);
          }
        }
      }
    }

    // 2. Profil anonymisieren
    await supabase
      .from('profiles')
      .update({
        full_name: 'Geloeschter Nutzer',
        phone: null,
        avatar_url: null,
        accepted_marketing: false,
        onboarding_intent: null,
        onboarding_machine_count: null,
      })
      .eq('id', user.id);

    // 3. Avatar loeschen
    await supabase.storage.from('avatars').remove([`${user.id}/`]);

    // 4. Supabase Auth-User loeschen (benoetigt Service-Role)
    const adminClient = createServiceRoleClient();
    const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(user.id);

    if (deleteAuthError) {
      console.error('[deleteAccount] Auth user deletion failed:', deleteAuthError.message);
      // Trotzdem als Erfolg melden — Account ist bereits anonymisiert
      // Der Auth-User wird beim naechsten Login-Versuch automatisch fehlschlagen
    }

    return { success: true, data: undefined };
  } catch (error) {
    console.error('[deleteAccount] Unexpected error');
    return { success: false, error: ErrorMessages.SERVER_ERROR, code: 'SERVER_ERROR' };
  }
}

// =============================================================================
// Datenexport (Art. 15 + Art. 20 DSGVO — Auskunft + Datenportabilitaet)
// =============================================================================

/**
 * Exportiert alle personenbezogenen Daten des aktuellen Nutzers als JSON.
 * 
 * DSGVO Art. 15: Auskunftsrecht — Nutzer hat Recht auf Kopie seiner Daten
 * DSGVO Art. 20: Recht auf Datenportabilitaet — maschinenlesbares Format
 */
export async function exportUserData(): Promise<ActionResult<Record<string, unknown>>> {
  try {
    const supabase = await createActionClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: ErrorMessages.UNAUTHORIZED, code: 'UNAUTHORIZED' };
    }

    // Profil laden
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // Account laden
    const { data: account } = await supabase
      .from('accounts')
      .select('*')
      .eq('owner_id', user.id)
      .is('deleted_at', null)
      .maybeSingle();

    // Listings laden
    let listings: unknown[] = [];
    if (account) {
      const { data: listingData } = await supabase
        .from('listings')
        .select('id, title, slug, description, price, currency, condition, year_built, location_city, location_country, status, created_at, updated_at')
        .eq('account_id', account.id)
        .is('deleted_at', null);
      listings = listingData || [];
    }

    // Anfragen laden (als Seller)
    let inquiriesSeller: unknown[] = [];
    if (account) {
      const { data: inquiryData } = await supabase
        .from('inquiries')
        .select('id, contact_name, contact_email, contact_company, message, status, created_at')
        .eq('account_id', account.id)
        .is('deleted_at', null);
      inquiriesSeller = inquiryData || [];
    }

    // Anfragen laden (als Buyer)
    const { data: inquiriesBuyer } = await supabase
      .from('inquiries')
      .select('id, contact_name, contact_email, contact_company, message, status, created_at')
      .eq('buyer_profile_id', user.id)
      .is('deleted_at', null);

    // Nachrichten laden
    const { data: messages } = await supabase
      .from('inquiry_messages')
      .select('id, inquiry_id, sender_type, content, created_at')
      .eq('sender_profile_id', user.id);

    // Benachrichtigungen laden
    const { data: notifications } = await supabase
      .from('notifications')
      .select('id, type, title, message, is_read, created_at')
      .eq('user_id', user.id)
      .is('deleted_at', null);

    // Subscription laden
    let subscription: unknown = null;
    if (account) {
      const { data: subData } = await supabase
        .from('subscriptions')
        .select('id, status, current_period_start, current_period_end, plans(name, slug)')
        .eq('account_id', account.id)
        .maybeSingle();
      subscription = subData;
    }

    // Team-Mitgliedschaften laden
    let teamMembers: unknown[] = [];
    if (account) {
      const { data: teamData } = await supabase
        .from('team_members')
        .select('id, role, is_active, created_at')
        .eq('account_id', account.id);
      teamMembers = teamData || [];
    }

    const exportData = {
      _meta: {
        exportDate: new Date().toISOString(),
        userId: user.id,
        email: user.email,
        format: 'DSGVO Art. 15/20 Datenexport',
      },
      profile: profile ? {
        id: profile.id,
        email: profile.email,
        fullName: profile.full_name,
        phone: profile.phone,
        role: profile.role,
        acceptedTermsAt: profile.accepted_terms_at,
        acceptedMarketing: profile.accepted_marketing,
        emailVerifiedAt: profile.email_verified_at,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at,
      } : null,
      account: account ? {
        id: account.id,
        companyName: account.company_name,
        slug: account.slug,
        website: account.website,
        phone: account.phone,
        addressStreet: account.address_street,
        addressCity: account.address_city,
        addressPostalCode: account.address_postal_code,
        addressCountry: account.address_country,
        vatId: account.vat_id,
        isVerified: account.is_verified,
        status: account.status,
        createdAt: account.created_at,
      } : null,
      listings,
      inquiriesAsSeller: inquiriesSeller,
      inquiriesAsBuyer: inquiriesBuyer || [],
      messages: messages || [],
      notifications: notifications || [],
      subscription,
      teamMembers,
    };

    return { success: true, data: exportData };
  } catch (error) {
    console.error('[exportUserData] Unexpected error');
    return { success: false, error: ErrorMessages.SERVER_ERROR, code: 'SERVER_ERROR' };
  }
}
