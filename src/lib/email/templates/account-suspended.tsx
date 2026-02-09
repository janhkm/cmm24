import {
  Button,
  Heading,
  Link,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';
import { BaseLayout } from './base-layout';

interface AccountSuspendedEmailProps {
  userName: string;
  companyName: string;
  reason: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://cmm24.com';

export function AccountSuspendedEmail({
  userName = 'Max',
  companyName = 'Musterfirma GmbH',
  reason = 'Verstoss gegen die Nutzungsbedingungen.',
}: AccountSuspendedEmailProps) {
  return (
    <BaseLayout preview={`Ihr Account ${companyName} wurde gesperrt`}>
      <Section style={alertBanner}>
        <Text style={alertEmoji}>🔒</Text>
        <Heading style={headingAlert}>
          Account gesperrt
        </Heading>
      </Section>

      <Text style={paragraph}>
        Hallo {userName},
      </Text>

      <Text style={paragraph}>
        Ihr Verkaeufer-Account <strong>{companyName}</strong> auf CMM24 wurde gesperrt. 
        Alle Ihre aktiven Inserate wurden vorerst deaktiviert.
      </Text>

      <Section style={reasonBox}>
        <Text style={reasonLabel}>Grund der Sperrung:</Text>
        <Text style={reasonText}>{reason}</Text>
      </Section>

      <Section style={impactBox}>
        <Text style={impactTitle}>Auswirkungen der Sperrung:</Text>
        <Text style={impactItem}>• Alle aktiven Inserate wurden archiviert</Text>
        <Text style={impactItem}>• Neue Inserate koennen nicht erstellt werden</Text>
        <Text style={impactItem}>• Ihr Profil ist nicht mehr oeffentlich sichtbar</Text>
        <Text style={impactItem}>• Bestehende Anfragen bleiben erhalten</Text>
      </Section>

      <Text style={paragraph}>
        Wenn Sie der Meinung sind, dass es sich um einen Fehler handelt, oder wenn Sie 
        die Situation klaeren moechten, kontaktieren Sie bitte unseren Support.
      </Text>

      <Section style={buttonContainer}>
        <Button style={button} href={`${baseUrl}/kontakt`}>
          Support kontaktieren
        </Button>
      </Section>

      <Text style={paragraphSmall}>
        Sie koennen auch direkt an{' '}
        <Link href="mailto:support@cmm24.com" style={link}>support@cmm24.com</Link> schreiben.
      </Text>

      <Text style={signature}>
        Ihr CMM24-Team
      </Text>
    </BaseLayout>
  );
}

// Styles
const alertBanner = {
  textAlign: 'center' as const,
  marginBottom: '24px',
};

const alertEmoji = {
  fontSize: '48px',
  margin: '0 0 8px',
};

const headingAlert = {
  fontSize: '24px',
  fontWeight: '600',
  color: '#dc2626',
  margin: '0',
};

const paragraph = {
  fontSize: '15px',
  lineHeight: '24px',
  color: '#525f7f',
  margin: '0 0 16px',
};

const paragraphSmall = {
  fontSize: '13px',
  lineHeight: '20px',
  color: '#8898aa',
  margin: '0 0 16px',
  textAlign: 'center' as const,
};

const reasonBox = {
  backgroundColor: '#fef2f2',
  borderRadius: '8px',
  padding: '16px 20px',
  margin: '24px 0',
  borderLeft: '4px solid #dc2626',
};

const reasonLabel = {
  fontSize: '12px',
  fontWeight: '600',
  color: '#991b1b',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0 0 8px',
};

const reasonText = {
  fontSize: '15px',
  lineHeight: '24px',
  color: '#991b1b',
  margin: '0',
};

const impactBox = {
  backgroundColor: '#f6f9fc',
  borderRadius: '8px',
  padding: '16px 20px',
  margin: '24px 0',
};

const impactTitle = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#1a1a1a',
  margin: '0 0 12px',
};

const impactItem = {
  fontSize: '14px',
  lineHeight: '22px',
  color: '#525f7f',
  margin: '0 0 4px',
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

const link = {
  color: '#556cd6',
  textDecoration: 'none',
};

const signature = {
  fontSize: '15px',
  lineHeight: '24px',
  color: '#1a1a1a',
  fontWeight: '500',
  margin: '24px 0 0',
};

export default AccountSuspendedEmail;
