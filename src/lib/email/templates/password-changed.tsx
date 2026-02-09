import {
  Button,
  Heading,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';
import { BaseLayout } from './base-layout';

interface PasswordChangedEmailProps {
  userName: string;
  changeDate: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://cmm24.com';

export function PasswordChangedEmail({
  userName = 'Max',
  changeDate = new Date().toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }),
}: PasswordChangedEmailProps) {
  return (
    <BaseLayout preview="Ihr Passwort wurde geaendert">
      <Heading style={heading}>
        Passwort geaendert
      </Heading>

      <Text style={paragraph}>
        Hallo {userName},
      </Text>

      <Text style={paragraph}>
        Ihr Passwort fuer Ihren CMM24-Account wurde soeben erfolgreich geaendert.
      </Text>

      <Section style={infoBox}>
        <Text style={infoLabel}>Zeitpunkt der Aenderung:</Text>
        <Text style={infoValue}>{changeDate}</Text>
      </Section>

      <Section style={alertBox}>
        <Text style={alertTitle}>Nicht Sie?</Text>
        <Text style={alertText}>
          Wenn Sie diese Aenderung nicht vorgenommen haben, setzen Sie bitte sofort 
          Ihr Passwort zurueck und kontaktieren Sie unseren Support.
        </Text>
      </Section>

      <Section style={buttonContainer}>
        <Button style={button} href={`${baseUrl}/login`}>
          Passwort zuruecksetzen
        </Button>
      </Section>

      <Text style={paragraph}>
        Falls Sie Ihr Passwort selbst geaendert haben, koennen Sie diese E-Mail ignorieren.
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

const infoBox = {
  backgroundColor: '#f6f9fc',
  borderRadius: '8px',
  padding: '16px 20px',
  margin: '24px 0',
};

const infoLabel = {
  fontSize: '12px',
  fontWeight: '600',
  color: '#666',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0 0 4px',
};

const infoValue = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#1a1a1a',
  margin: '0',
};

const alertBox = {
  backgroundColor: '#fef2f2',
  borderRadius: '8px',
  padding: '16px 20px',
  margin: '24px 0',
  borderLeft: '4px solid #dc2626',
};

const alertTitle = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#991b1b',
  margin: '0 0 8px',
};

const alertText = {
  fontSize: '14px',
  lineHeight: '22px',
  color: '#991b1b',
  margin: '0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#dc2626',
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

export default PasswordChangedEmail;
