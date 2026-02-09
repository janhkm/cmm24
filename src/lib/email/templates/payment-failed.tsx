import {
  Button,
  Heading,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';
import { BaseLayout } from './base-layout';

interface PaymentFailedEmailProps {
  userName: string;
  planName: string;
  billingUrl: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://cmm24.com';

export function PaymentFailedEmail({
  userName = 'Max',
  planName = 'Starter',
  billingUrl = `${baseUrl}/seller/abo`,
}: PaymentFailedEmailProps) {
  return (
    <BaseLayout preview="Ihre Zahlung konnte nicht verarbeitet werden">
      <Section style={warningBanner}>
        <Text style={warningEmoji}>⚠️</Text>
        <Heading style={headingWarning}>
          Zahlung fehlgeschlagen
        </Heading>
      </Section>

      <Text style={paragraph}>
        Hallo {userName},
      </Text>

      <Text style={paragraph}>
        leider konnte Ihre letzte Zahlung fuer den <strong>{planName}-Plan</strong> nicht 
        verarbeitet werden. Bitte aktualisieren Sie Ihre Zahlungsmethode, damit Ihr 
        Abonnement aktiv bleibt.
      </Text>

      <Section style={alertBox}>
        <Text style={alertTitle}>Was passiert jetzt?</Text>
        <Text style={alertItem}>• Wir versuchen die Zahlung in den naechsten Tagen erneut</Text>
        <Text style={alertItem}>• Ihre Inserate bleiben vorerst aktiv</Text>
        <Text style={alertItem}>• Bei wiederholtem Fehlschlag wird Ihr Plan auf Free zurueckgestuft</Text>
      </Section>

      <Section style={buttonContainer}>
        <Button style={button} href={billingUrl}>
          Zahlungsmethode aktualisieren
        </Button>
      </Section>

      <Text style={paragraph}>
        Falls Sie Fragen haben oder Hilfe benoetigen, antworten Sie einfach auf diese E-Mail 
        oder kontaktieren Sie unseren Support.
      </Text>

      <Text style={signature}>
        Ihr CMM24-Team
      </Text>
    </BaseLayout>
  );
}

// Styles
const warningBanner = {
  textAlign: 'center' as const,
  marginBottom: '24px',
};

const warningEmoji = {
  fontSize: '48px',
  margin: '0 0 8px',
};

const headingWarning = {
  fontSize: '24px',
  fontWeight: '600',
  color: '#e65100',
  margin: '0',
};

const paragraph = {
  fontSize: '15px',
  lineHeight: '24px',
  color: '#525f7f',
  margin: '0 0 16px',
};

const alertBox = {
  backgroundColor: '#fff3e0',
  borderRadius: '8px',
  padding: '16px 20px',
  margin: '24px 0',
  borderLeft: '4px solid #e65100',
};

const alertTitle = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#e65100',
  margin: '0 0 12px',
};

const alertItem = {
  fontSize: '14px',
  lineHeight: '22px',
  color: '#bf360c',
  margin: '0 0 4px',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#e65100',
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

export default PaymentFailedEmail;
