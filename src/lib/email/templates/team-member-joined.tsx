import {
  Button,
  Heading,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';
import { BaseLayout } from './base-layout';

interface TeamMemberJoinedEmailProps {
  ownerName: string;
  memberName: string;
  memberEmail: string;
  role: string;
  companyName: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://cmm24.com';

const roleLabels: Record<string, string> = {
  admin: 'Administrator',
  editor: 'Bearbeiter',
  viewer: 'Betrachter',
};

export function TeamMemberJoinedEmail({
  ownerName = 'Max',
  memberName = 'Anna Mueller',
  memberEmail = 'anna@beispiel.de',
  role = 'editor',
  companyName = 'Musterfirma GmbH',
}: TeamMemberJoinedEmailProps) {
  const roleLabel = roleLabels[role] || role;

  return (
    <BaseLayout preview={`${memberName} ist Ihrem Team beigetreten`}>
      <Section style={successBanner}>
        <Text style={successEmoji}>👋</Text>
        <Heading style={headingSuccess}>
          Neues Team-Mitglied!
        </Heading>
      </Section>

      <Text style={paragraph}>
        Hallo {ownerName},
      </Text>

      <Text style={paragraph}>
        <strong>{memberName}</strong> hat die Einladung angenommen und ist jetzt 
        Mitglied im Team von <strong>{companyName}</strong>.
      </Text>

      <Section style={memberBox}>
        <Text style={memberName_}>{memberName}</Text>
        <Text style={memberEmail_}>{memberEmail}</Text>
        <Text style={memberRole}>Rolle: {roleLabel}</Text>
      </Section>

      <Section style={buttonContainer}>
        <Button style={button} href={`${baseUrl}/seller/team`}>
          Team verwalten
        </Button>
      </Section>

      <Text style={paragraph}>
        Sie koennen die Rolle und Berechtigungen dieses Mitglieds jederzeit in den 
        Team-Einstellungen anpassen.
      </Text>

      <Text style={signature}>
        Ihr CMM24-Team
      </Text>
    </BaseLayout>
  );
}

// Styles
const successBanner = {
  textAlign: 'center' as const,
  marginBottom: '24px',
};

const successEmoji = {
  fontSize: '48px',
  margin: '0 0 8px',
};

const headingSuccess = {
  fontSize: '24px',
  fontWeight: '600',
  color: '#2e7d32',
  margin: '0',
};

const paragraph = {
  fontSize: '15px',
  lineHeight: '24px',
  color: '#525f7f',
  margin: '0 0 16px',
};

const memberBox = {
  backgroundColor: '#f0f9ff',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
  textAlign: 'center' as const,
  borderLeft: '4px solid #0066cc',
};

const memberName_ = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#1a1a1a',
  margin: '0 0 4px',
};

const memberEmail_ = {
  fontSize: '14px',
  color: '#525f7f',
  margin: '0 0 8px',
};

const memberRole = {
  fontSize: '13px',
  fontWeight: '600',
  color: '#0066cc',
  margin: '0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#0f172a',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '15px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
};

const signature = {
  fontSize: '15px',
  lineHeight: '24px',
  color: '#1a1a1a',
  fontWeight: '500',
  margin: '24px 0 0',
};

export default TeamMemberJoinedEmail;
