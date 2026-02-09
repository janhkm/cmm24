import {
  Button,
  Heading,
  Hr,
  Section,
  Text,
} from '@react-email/components';
import { BaseLayout } from './base-layout';

interface TeamInvitationEmailProps {
  inviteeName: string;
  companyName: string;
  inviterName: string | null;
  role: string;
  inviteUrl: string;
  expiresInDays: number;
}

const roleLabels: Record<string, string> = {
  admin: 'Administrator',
  editor: 'Bearbeiter',
  viewer: 'Betrachter',
};

export function TeamInvitationEmail({
  inviteeName,
  companyName,
  inviterName,
  role,
  inviteUrl,
  expiresInDays,
}: TeamInvitationEmailProps) {
  const preview = `Sie wurden eingeladen, dem Team von ${companyName} beizutreten`;
  const roleLabel = roleLabels[role] || role;
  
  return (
    <BaseLayout preview={preview}>
      <Heading style={heading}>
        Team-Einladung
      </Heading>
      
      <Text style={paragraph}>
        Hallo{inviteeName ? ` ${inviteeName}` : ''},
      </Text>
      
      <Text style={paragraph}>
        {inviterName ? `${inviterName} hat` : 'Sie wurden'} Sie eingeladen, dem Team von{' '}
        <strong>{companyName}</strong> auf CMM24 beizutreten.
      </Text>
      
      {/* Role Info */}
      <Section style={infoBox}>
        <Text style={infoLabel}>Ihre Rolle:</Text>
        <Text style={infoValue}>{roleLabel}</Text>
        <Text style={roleDescription}>
          {role === 'admin' && 'Als Administrator können Sie Inserate verwalten, Anfragen bearbeiten und weitere Teammitglieder einladen.'}
          {role === 'editor' && 'Als Bearbeiter können Sie Inserate erstellen und bearbeiten sowie Anfragen bearbeiten.'}
          {role === 'viewer' && 'Als Betrachter können Sie Inserate und Anfragen einsehen, aber nicht bearbeiten.'}
        </Text>
      </Section>
      
      {/* CTA Button */}
      <Section style={buttonSection}>
        <Button style={button} href={inviteUrl}>
          Einladung annehmen
        </Button>
      </Section>
      
      <Hr style={hr} />
      
      <Text style={footer}>
        Diese Einladung ist {expiresInDays} Tage gültig. Falls Sie diese Einladung nicht erwartet haben, 
        können Sie diese E-Mail ignorieren.
      </Text>
      
      <Text style={footerLink}>
        Falls der Button nicht funktioniert, kopieren Sie diesen Link in Ihren Browser:{' '}
        <a href={inviteUrl} style={link}>{inviteUrl}</a>
      </Text>
    </BaseLayout>
  );
}

// Styles
const heading = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#1a1a1a',
  marginBottom: '24px',
};

const paragraph = {
  fontSize: '14px',
  lineHeight: '24px',
  color: '#333',
  margin: '0 0 16px',
};

const infoBox = {
  backgroundColor: '#f0f9ff',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '24px',
  borderLeft: '4px solid #0066cc',
};

const infoLabel = {
  fontSize: '12px',
  color: '#666',
  margin: '0 0 4px',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
};

const infoValue = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#0066cc',
  margin: '0 0 8px',
};

const roleDescription = {
  fontSize: '13px',
  color: '#666',
  margin: '0',
  lineHeight: '20px',
};

const buttonSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#0066cc',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '24px 0',
};

const footer = {
  fontSize: '12px',
  color: '#666',
  lineHeight: '20px',
};

const footerLink = {
  fontSize: '11px',
  color: '#999',
  lineHeight: '18px',
  wordBreak: 'break-all' as const,
};

const link = {
  color: '#0066cc',
};

export default TeamInvitationEmail;
