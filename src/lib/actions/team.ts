'use server';

import { createActionClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { ActionResult } from './types';
import { sendTeamInvitationEmail, sendTeamMemberJoinedEmail } from '@/lib/email/send';

// =============================================================================
// Types
// =============================================================================

export type TeamRole = 'owner' | 'admin' | 'editor' | 'viewer';

export interface TeamMember {
  id: string;
  profileId: string;
  accountId: string;
  role: TeamRole;
  isActive: boolean;
  createdAt: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
}

export interface TeamInvitation {
  id: string;
  accountId: string;
  email: string;
  role: TeamRole;
  token: string;
  expiresAt: string;
  acceptedAt: string | null;
  createdAt: string;
}

// =============================================================================
// Helper: Get current user and account
// =============================================================================

async function getCurrentUserAccount() {
  const supabase = await createActionClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  const { data: account } = await supabase
    .from('accounts')
    .select('id, owner_id, company_name')
    .eq('owner_id', user.id)
    .is('deleted_at', null)
    .maybeSingle();
  
  if (!account) return null;
  
  // Check team membership role
  const { data: teamMember } = await supabase
    .from('team_members')
    .select('role')
    .eq('account_id', account.id)
    .eq('profile_id', user.id)
    .maybeSingle();
  
  return {
    userId: user.id,
    accountId: account.id,
    companyName: account.company_name,
    isOwner: account.owner_id === user.id,
    role: (teamMember?.role as TeamRole) || 'owner',
  };
}

// =============================================================================
// Get Team Members
// =============================================================================

export async function getTeamMembers(): Promise<ActionResult<TeamMember[]>> {
  try {
    const userAccount = await getCurrentUserAccount();
    if (!userAccount) {
      return { success: false, error: 'Nicht angemeldet' };
    }
    
    const supabase = await createActionClient();
    
    // Get team members without join
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('account_id', userAccount.accountId)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('[getTeamMembers] Error:', error);
      return { success: false, error: 'Fehler beim Laden des Teams' };
    }
    
    // Get profile data separately for all team members
    const profileIds = (data || []).map(m => m.profile_id).filter(Boolean);
    const { data: profiles } = profileIds.length > 0 
      ? await supabase.from('profiles').select('id, email, full_name, avatar_url').in('id', profileIds)
      : { data: [] };
    
    const profileMap = new Map((profiles || []).map(p => [p.id, p]));
    
    const members: TeamMember[] = (data || []).map(m => {
      const profile = profileMap.get(m.profile_id);
      return {
        id: m.id,
        profileId: m.profile_id,
        accountId: m.account_id,
        role: (m.role as TeamRole) || 'viewer',
        isActive: m.is_active ?? true,
        createdAt: m.created_at || '',
        email: profile?.email || '',
        fullName: profile?.full_name ?? null,
        avatarUrl: profile?.avatar_url ?? null,
      };
    });
    
    return { success: true, data: members };
  } catch (error) {
    console.error('[getTeamMembers] Unexpected error:', error);
    return { success: false, error: 'Unerwarteter Fehler' };
  }
}

// =============================================================================
// Get Team Invitations
// =============================================================================

export async function getTeamInvitations(): Promise<ActionResult<TeamInvitation[]>> {
  try {
    const userAccount = await getCurrentUserAccount();
    if (!userAccount) {
      return { success: false, error: 'Nicht angemeldet' };
    }
    
    if (!['owner', 'admin'].includes(userAccount.role)) {
      return { success: false, error: 'Keine Berechtigung' };
    }
    
    const supabase = await createActionClient();
    
    const { data, error } = await supabase
      .from('team_invitations')
      .select('*')
      .eq('account_id', userAccount.accountId)
      .is('accepted_at', null)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('[getTeamInvitations] Error:', error);
      return { success: true, data: [] }; // Return empty on error
    }
    
    const invitations: TeamInvitation[] = (data || []).map(i => ({
      id: i.id,
      accountId: i.account_id,
      email: i.email,
      role: (i.role as TeamRole) || 'viewer',
      token: i.token,
      expiresAt: i.expires_at,
      acceptedAt: i.accepted_at,
      createdAt: i.created_at || '',
    }));
    
    return { success: true, data: invitations };
  } catch (error) {
    console.error('[getTeamInvitations] Unexpected error:', error);
    return { success: false, error: 'Unerwarteter Fehler' };
  }
}

// =============================================================================
// Invite Team Member
// =============================================================================

export async function inviteTeamMember(params: {
  email: string;
  role: 'admin' | 'editor' | 'viewer';
}): Promise<ActionResult<TeamInvitation>> {
  try {
    const userAccount = await getCurrentUserAccount();
    if (!userAccount) {
      return { success: false, error: 'Nicht angemeldet' };
    }
    
    if (!['owner', 'admin'].includes(userAccount.role)) {
      return { success: false, error: 'Keine Berechtigung' };
    }
    
    if (!params.email || !params.email.includes('@')) {
      return { success: false, error: 'Ungültige E-Mail-Adresse' };
    }
    
    const supabase = await createActionClient();
    
    // Check for existing pending invitation
    const { data: existingInvitation } = await supabase
      .from('team_invitations')
      .select('id')
      .eq('account_id', userAccount.accountId)
      .eq('email', params.email)
      .is('accepted_at', null)
      .maybeSingle();
    
    if (existingInvitation) {
      return { success: false, error: 'Eine Einladung wurde bereits an diese E-Mail gesendet' };
    }
    
    // Generate token and expiration
    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    // Create invitation
    const { data: invitation, error } = await supabase
      .from('team_invitations')
      .insert({
        account_id: userAccount.accountId,
        email: params.email,
        role: params.role,
        token,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();
    
    if (error) {
      console.error('[inviteTeamMember] Error:', error);
      return { success: false, error: 'Fehler beim Erstellen der Einladung' };
    }
    
    // Get inviter's name for the email
    const { data: inviterProfile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', userAccount.userId)
      .single();
    
    // Send invitation email
    const emailResult = await sendTeamInvitationEmail({
      to: params.email,
      companyName: userAccount.companyName,
      inviterName: inviterProfile?.full_name || null,
      role: params.role,
      inviteToken: token,
    });
    
    if (!emailResult.success) {
      console.warn('[inviteTeamMember] Email failed:', emailResult.error);
      // Don't fail the invitation if email fails - the invite is still valid
    }
    
    revalidatePath('/seller/team');
    
    return {
      success: true,
      data: {
        id: invitation.id,
        accountId: invitation.account_id,
        email: invitation.email,
        role: (invitation.role as TeamRole) || 'viewer',
        token: invitation.token,
        expiresAt: invitation.expires_at,
        acceptedAt: invitation.accepted_at,
        createdAt: invitation.created_at || '',
      },
    };
  } catch (error) {
    console.error('[inviteTeamMember] Unexpected error:', error);
    return { success: false, error: 'Unerwarteter Fehler' };
  }
}

// =============================================================================
// Cancel Invitation
// =============================================================================

export async function cancelInvitation(invitationId: string): Promise<ActionResult<void>> {
  try {
    const userAccount = await getCurrentUserAccount();
    if (!userAccount) {
      return { success: false, error: 'Nicht angemeldet' };
    }
    
    if (!['owner', 'admin'].includes(userAccount.role)) {
      return { success: false, error: 'Keine Berechtigung' };
    }
    
    const supabase = await createActionClient();
    
    const { error } = await supabase
      .from('team_invitations')
      .delete()
      .eq('id', invitationId)
      .eq('account_id', userAccount.accountId);
    
    if (error) {
      console.error('[cancelInvitation] Error:', error);
      return { success: false, error: 'Fehler beim Stornieren der Einladung' };
    }
    
    revalidatePath('/seller/team');
    return { success: true, data: undefined };
  } catch (error) {
    console.error('[cancelInvitation] Unexpected error:', error);
    return { success: false, error: 'Unerwarteter Fehler' };
  }
}

// =============================================================================
// Remove Team Member
// =============================================================================

export async function removeTeamMember(memberId: string): Promise<ActionResult<void>> {
  try {
    const userAccount = await getCurrentUserAccount();
    if (!userAccount) {
      return { success: false, error: 'Nicht angemeldet' };
    }
    
    if (!userAccount.isOwner) {
      return { success: false, error: 'Nur der Inhaber kann Teammitglieder entfernen' };
    }
    
    const supabase = await createActionClient();
    
    // Check if not removing the owner
    const { data: member } = await supabase
      .from('team_members')
      .select('role')
      .eq('id', memberId)
      .single();
    
    if (member?.role === 'owner') {
      return { success: false, error: 'Der Inhaber kann nicht entfernt werden' };
    }
    
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', memberId)
      .eq('account_id', userAccount.accountId);
    
    if (error) {
      console.error('[removeTeamMember] Error:', error);
      return { success: false, error: 'Fehler beim Entfernen des Teammitglieds' };
    }
    
    revalidatePath('/seller/team');
    return { success: true, data: undefined };
  } catch (error) {
    console.error('[removeTeamMember] Unexpected error:', error);
    return { success: false, error: 'Unerwarteter Fehler' };
  }
}

// =============================================================================
// Get Invitation by Token
// =============================================================================

export async function getInvitationByToken(token: string): Promise<ActionResult<{
  email: string;
  companyName: string;
  role: string;
  isExpired: boolean;
  isAccepted: boolean;
}>> {
  try {
    const supabase = await createActionClient();
    
    const { data: invitation, error } = await supabase
      .from('team_invitations')
      .select(`
        email,
        role,
        expires_at,
        accepted_at,
        accounts (
          company_name
        )
      `)
      .eq('token', token)
      .single();
    
    if (error || !invitation) {
      return { success: false, error: 'Einladung nicht gefunden oder ungültig' };
    }
    
    const account = invitation.accounts as { company_name: string } | null;
    const expiresAt = new Date(invitation.expires_at);
    const isExpired = expiresAt < new Date();
    const isAccepted = !!invitation.accepted_at;
    
    return {
      success: true,
      data: {
        email: invitation.email,
        companyName: account?.company_name || 'Unbekannt',
        role: invitation.role || 'viewer',
        isExpired,
        isAccepted,
      },
    };
  } catch (error) {
    console.error('[getInvitationByToken] Unexpected error:', error);
    return { success: false, error: 'Unerwarteter Fehler' };
  }
}

// =============================================================================
// Accept Team Invitation
// =============================================================================

export async function acceptTeamInvitation(token: string): Promise<ActionResult<void>> {
  try {
    const supabase = await createActionClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Bitte melden Sie sich an' };
    }
    
    // Get the invitation
    const { data: invitation, error: invError } = await supabase
      .from('team_invitations')
      .select('*')
      .eq('token', token)
      .single();
    
    if (invError || !invitation) {
      return { success: false, error: 'Einladung nicht gefunden' };
    }
    
    // Check if expired
    if (new Date(invitation.expires_at) < new Date()) {
      return { success: false, error: 'Diese Einladung ist abgelaufen' };
    }
    
    // Check if already accepted
    if (invitation.accepted_at) {
      return { success: false, error: 'Diese Einladung wurde bereits angenommen' };
    }
    
    // Check if user is already a team member
    const { data: existingMember } = await supabase
      .from('team_members')
      .select('id')
      .eq('account_id', invitation.account_id)
      .eq('profile_id', user.id)
      .maybeSingle();
    
    if (existingMember) {
      // Mark invitation as accepted anyway
      await supabase
        .from('team_invitations')
        .update({ accepted_at: new Date().toISOString() })
        .eq('id', invitation.id);
      
      return { success: false, error: 'Sie sind bereits Mitglied dieses Teams' };
    }
    
    // Add user as team member
    const { error: memberError } = await supabase
      .from('team_members')
      .insert({
        account_id: invitation.account_id,
        profile_id: user.id,
        role: invitation.role || 'viewer',
        invited_at: invitation.created_at,
        accepted_at: new Date().toISOString(),
      });
    
    if (memberError) {
      console.error('[acceptTeamInvitation] Member insert error:', memberError);
      return { success: false, error: 'Fehler beim Beitreten des Teams' };
    }
    
    // Mark invitation as accepted
    await supabase
      .from('team_invitations')
      .update({ accepted_at: new Date().toISOString() })
      .eq('id', invitation.id);
    
    // Owner per E-Mail benachrichtigen
    const { data: accountWithOwner } = await supabase
      .from('accounts')
      .select('owner_id, company_name, profiles!accounts_owner_id_fkey(email, full_name)')
      .eq('id', invitation.account_id)
      .single();
    
    if (accountWithOwner) {
      const ownerProfile = accountWithOwner.profiles as { email: string; full_name: string | null } | null;
      
      // Neues Mitglied-Profil laden
      const { data: memberProfile } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', user.id)
        .single();
      
      if (ownerProfile?.email) {
        sendTeamMemberJoinedEmail({
          to: ownerProfile.email,
          ownerName: ownerProfile.full_name?.split(' ')[0] || 'Nutzer',
          memberName: memberProfile?.full_name || invitation.email,
          memberEmail: memberProfile?.email || invitation.email,
          role: invitation.role || 'viewer',
          companyName: accountWithOwner.company_name,
        }).catch(err => {
          console.error('[acceptTeamInvitation] Failed to send joined email:', err);
        });
      }
    }
    
    revalidatePath('/seller/team');
    return { success: true, data: undefined };
  } catch (error) {
    console.error('[acceptTeamInvitation] Unexpected error:', error);
    return { success: false, error: 'Unerwarteter Fehler' };
  }
}

// =============================================================================
// Update Team Member Role
// =============================================================================

export async function updateTeamMemberRole(
  memberId: string,
  role: 'admin' | 'editor' | 'viewer'
): Promise<ActionResult<void>> {
  try {
    const userAccount = await getCurrentUserAccount();
    if (!userAccount) {
      return { success: false, error: 'Nicht angemeldet' };
    }
    
    if (!userAccount.isOwner) {
      return { success: false, error: 'Nur der Inhaber kann Rollen ändern' };
    }
    
    const supabase = await createActionClient();
    
    // Check if not changing owner role
    const { data: member } = await supabase
      .from('team_members')
      .select('role')
      .eq('id', memberId)
      .single();
    
    if (member?.role === 'owner') {
      return { success: false, error: 'Die Rolle des Inhabers kann nicht geändert werden' };
    }
    
    const { error } = await supabase
      .from('team_members')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', memberId)
      .eq('account_id', userAccount.accountId);
    
    if (error) {
      console.error('[updateTeamMemberRole] Error:', error);
      return { success: false, error: 'Fehler beim Ändern der Rolle' };
    }
    
    revalidatePath('/seller/team');
    return { success: true, data: undefined };
  } catch (error) {
    console.error('[updateTeamMemberRole] Unexpected error:', error);
    return { success: false, error: 'Unerwarteter Fehler' };
  }
}
