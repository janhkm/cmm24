import {
  Button,
  Heading,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';
import { BaseLayout } from './base-layout';

interface AccountVerifiedEmailProps {
  userName: string;
  companyName: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://cmm24.com';

export function AccountVerifiedEmail({
  userName = 'Max',
  companyName = 'Musterfirma GmbH',
}: AccountVerifiedEmailProps) {
  return (
    <BaseLayout preview={`${companyName} wurde verifiziert!`}>
      <Section style={successBanner}>
        <Text style={successEmoji}>✅</Text>
        <Heading style={headingSuccess}>
          Account verifiziert!
        </Heading>
      </Section>

      <Text style={paragraph}>
        Hallo {userName},
      </Text>

      <Text style={paragraph}>
        Ihr Verkaeufer-Account <strong>{companyName}</strong> wurde erfolgreich verifiziert. 
        Ihr Profil und Ihre Inserate zeigen jetzt das Vertrauenssiegel an.
      </Text>

      <Section style={benefitsBox}>
        <Text style={benefitsTitle}>Vorteile der Verifizierung:</Text>
        <Text style={benefitItem}>✓ Vertrauenssiegel auf Ihrem Profil und Inseraten</Text>
        <Text style={benefitItem}>✓ Hoehere Sichtbarkeit in den Suchergebnissen</Text>
        <Text style={benefitItem}>✓ Mehr Vertrauen bei potenziellen Kaeufern</Text>
        <Text style={benefitItem}>✓ Erhoehte Glaubwuerdigkeit Ihres Unternehmens</Text>
      </Section>

      <Section style={buttonContainer}>
        <Button style={button} href={`${baseUrl}/seller/dashboard`}>
          Zum Dashboard
        </Button>
      </Section>

      <Text style={paragraph}>
        Vielen Dank, dass Sie CMM24 nutzen. Wir wuenschen Ihnen viel Erfolg!
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

const benefitsBox = {
  backgroundColor: '#e8f5e9',
  borderRadius: '8px',
  padding: '20px 24px',
  margin: '24px 0',
  borderLeft: '4px solid #2e7d32',
};

const benefitsTitle = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#1b5e20',
  margin: '0 0 12px',
};

const benefitItem = {
  fontSize: '14px',
  lineHeight: '22px',
  color: '#2e7d32',
  margin: '0 0 4px',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#2e7d32',
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

export default AccountVerifiedEmail;
