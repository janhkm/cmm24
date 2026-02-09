import {
  Button,
  Heading,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';
import { BaseLayout } from './base-layout';

interface UpgradeConfirmationEmailProps {
  userName: string;
  planName: string;
  interval: string;
  dashboardUrl: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://cmm24.com';

export function UpgradeConfirmationEmail({
  userName = 'Max',
  planName = 'Starter',
  interval = 'monatlich',
  dashboardUrl = `${baseUrl}/seller/dashboard`,
}: UpgradeConfirmationEmailProps) {
  return (
    <BaseLayout preview={`Ihr Upgrade auf ${planName} war erfolgreich!`}>
      <Section style={successBanner}>
        <Text style={successEmoji}>🚀</Text>
        <Heading style={headingSuccess}>
          Upgrade erfolgreich!
        </Heading>
      </Section>

      <Text style={paragraph}>
        Hallo {userName},
      </Text>

      <Text style={paragraph}>
        vielen Dank fuer Ihr Upgrade! Ihr Abonnement wurde erfolgreich auf den{' '}
        <strong>{planName}-Plan</strong> ({interval}) umgestellt.
      </Text>

      <Section style={planBox}>
        <Text style={planLabel}>Ihr aktueller Plan</Text>
        <Text style={planValue}>{planName}</Text>
        <Text style={planInterval}>Abrechnung: {interval}</Text>
      </Section>

      <Section style={features}>
        <Text style={featureTitle}>Was ist neu fuer Sie:</Text>
        {planName === 'Starter' && (
          <>
            <Text style={featureItem}>✓ Bis zu 5 aktive Inserate</Text>
            <Text style={featureItem}>✓ Bis zu 2 Team-Mitglieder</Text>
            <Text style={featureItem}>✓ Erweiterte Statistiken</Text>
            <Text style={featureItem}>✓ Hervorgehobene Inserate</Text>
          </>
        )}
        {planName === 'Business' && (
          <>
            <Text style={featureItem}>✓ Unbegrenzte Inserate</Text>
            <Text style={featureItem}>✓ Unbegrenzte Team-Mitglieder</Text>
            <Text style={featureItem}>✓ CRM & Kontaktverwaltung</Text>
            <Text style={featureItem}>✓ Auto-Reply auf Anfragen</Text>
            <Text style={featureItem}>✓ API-Zugang</Text>
            <Text style={featureItem}>✓ Premium-Support</Text>
          </>
        )}
      </Section>

      <Section style={buttonContainer}>
        <Button style={button} href={dashboardUrl}>
          Zum Dashboard
        </Button>
      </Section>

      <Text style={paragraph}>
        Ihre Rechnungen finden Sie jederzeit unter{' '}
        <a href={`${baseUrl}/seller/rechnungen`} style={link}>Rechnungen</a>.
        Bei Fragen zu Ihrem Abo koennen Sie sich jederzeit an uns wenden.
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

const planBox = {
  backgroundColor: '#f0f9ff',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
  borderLeft: '4px solid #0066cc',
  textAlign: 'center' as const,
};

const planLabel = {
  fontSize: '12px',
  color: '#666',
  margin: '0 0 4px',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
};

const planValue = {
  fontSize: '28px',
  fontWeight: '700',
  color: '#0066cc',
  margin: '0 0 4px',
};

const planInterval = {
  fontSize: '14px',
  color: '#666',
  margin: '0',
};

const features = {
  backgroundColor: '#f6f9fc',
  borderRadius: '8px',
  padding: '20px 24px',
  margin: '24px 0',
};

const featureTitle = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#1a1a1a',
  margin: '0 0 12px',
};

const featureItem = {
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

export default UpgradeConfirmationEmail;
