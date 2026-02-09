import {
  Button,
  Heading,
  Link,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';
import { BaseLayout } from './base-layout';

interface WelcomeEmailProps {
  userName: string;
  companyName: string;
  loginUrl: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://cmm24.com';

export function WelcomeEmail({
  userName = 'Max',
  companyName = 'Musterfirma GmbH',
  loginUrl = `${baseUrl}/login`,
}: WelcomeEmailProps) {
  return (
    <BaseLayout preview={`Willkommen bei CMM24, ${userName}!`}>
      <Heading style={heading}>
        Willkommen bei CMM24!
      </Heading>
      
      <Text style={paragraph}>
        Hallo {userName},
      </Text>
      
      <Text style={paragraph}>
        vielen Dank für Ihre Registrierung bei CMM24 – dem führenden Marktplatz 
        für gebrauchte Koordinatenmessmaschinen. Ihr Verkäufer-Account für{' '}
        <strong>{companyName}</strong> wurde erfolgreich erstellt.
      </Text>

      <Section style={features}>
        <Text style={featureTitle}>Mit Ihrem Account können Sie:</Text>
        <Text style={featureItem}>✓ Inserate für Ihre Maschinen erstellen</Text>
        <Text style={featureItem}>✓ Anfragen von Interessenten verwalten</Text>
        <Text style={featureItem}>✓ Ihre Firmendaten und Ihr Profil pflegen</Text>
        <Text style={featureItem}>✓ Statistiken zu Ihren Inseraten einsehen</Text>
      </Section>

      <Section style={buttonContainer}>
        <Button style={button} href={loginUrl}>
          Zum Verkäufer-Dashboard
        </Button>
      </Section>

      <Text style={paragraph}>
        Falls Sie Fragen haben, antworten Sie einfach auf diese E-Mail oder 
        besuchen Sie unseren{' '}
        <Link href={`${baseUrl}/faq`} style={link}>FAQ-Bereich</Link>.
      </Text>

      <Text style={paragraph}>
        Viel Erfolg beim Verkaufen!
      </Text>

      <Text style={signature}>
        Ihr CMM24-Team
      </Text>
    </BaseLayout>
  );
}

// Styles
const heading = {
  fontSize: '24px',
  fontWeight: '600',
  color: '#1a1a1a',
  margin: '0 0 24px',
};

const paragraph = {
  fontSize: '15px',
  lineHeight: '24px',
  color: '#525f7f',
  margin: '0 0 16px',
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
  textDecoration: 'underline',
};

const signature = {
  fontSize: '15px',
  lineHeight: '24px',
  color: '#1a1a1a',
  fontWeight: '500',
  margin: '24px 0 0',
};

export default WelcomeEmail;
