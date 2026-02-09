import {
  Button,
  Heading,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';
import { BaseLayout } from './base-layout';

interface PasswordResetEmailProps {
  userName: string;
  resetUrl: string;
}

export function PasswordResetEmail({
  userName = 'Max',
  resetUrl = 'https://cmm24.com/passwort-reset?token=xxx',
}: PasswordResetEmailProps) {
  return (
    <BaseLayout preview="Passwort zurücksetzen für CMM24">
      <Heading style={heading}>
        Passwort zurücksetzen
      </Heading>
      
      <Text style={paragraph}>
        Hallo {userName},
      </Text>
      
      <Text style={paragraph}>
        Sie haben angefordert, Ihr Passwort für Ihren CMM24-Account zurückzusetzen.
        Klicken Sie auf den Button unten, um ein neues Passwort zu erstellen.
      </Text>

      <Section style={buttonContainer}>
        <Button style={button} href={resetUrl}>
          Neues Passwort erstellen
        </Button>
      </Section>

      <Text style={paragraph}>
        Oder kopieren Sie diesen Link in Ihren Browser:
      </Text>
      
      <Text style={codeBlock}>
        {resetUrl}
      </Text>

      <Section style={warningBox}>
        <Text style={warningText}>
          ⚠️ Dieser Link ist nur 1 Stunde gültig. Falls Sie kein neues Passwort 
          angefordert haben, ignorieren Sie diese E-Mail – Ihr Passwort bleibt unverändert.
        </Text>
      </Section>

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

const codeBlock = {
  backgroundColor: '#f6f9fc',
  borderRadius: '4px',
  padding: '12px 16px',
  fontSize: '12px',
  fontFamily: 'monospace',
  color: '#525f7f',
  wordBreak: 'break-all' as const,
  margin: '0 0 16px',
};

const warningBox = {
  backgroundColor: '#fff8e1',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 0',
};

const warningText = {
  fontSize: '13px',
  lineHeight: '20px',
  color: '#f57c00',
  margin: '0',
};

const signature = {
  fontSize: '15px',
  lineHeight: '24px',
  color: '#1a1a1a',
  fontWeight: '500',
  margin: '24px 0 0',
};

export default PasswordResetEmail;
