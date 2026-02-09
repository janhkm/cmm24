import {
  Button,
  Heading,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';
import { BaseLayout } from './base-layout';

interface EmailVerificationProps {
  userName: string;
  verificationUrl: string;
}

export function EmailVerificationEmail({
  userName = 'Max',
  verificationUrl = 'https://cmm24.com/auth/callback?token=xxx',
}: EmailVerificationProps) {
  return (
    <BaseLayout preview="Bestätigen Sie Ihre E-Mail-Adresse für CMM24">
      <Heading style={heading}>
        E-Mail-Adresse bestätigen
      </Heading>
      
      <Text style={paragraph}>
        Hallo {userName},
      </Text>
      
      <Text style={paragraph}>
        bitte bestätigen Sie Ihre E-Mail-Adresse, um die Registrierung 
        bei CMM24 abzuschließen.
      </Text>

      <Section style={buttonContainer}>
        <Button style={button} href={verificationUrl}>
          E-Mail bestätigen
        </Button>
      </Section>

      <Text style={paragraph}>
        Oder kopieren Sie diesen Link in Ihren Browser:
      </Text>
      
      <Text style={codeBlock}>
        {verificationUrl}
      </Text>

      <Text style={paragraphSmall}>
        Dieser Link ist 24 Stunden gültig. Falls Sie sich nicht bei CMM24 
        registriert haben, können Sie diese E-Mail ignorieren.
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

const paragraphSmall = {
  fontSize: '13px',
  lineHeight: '20px',
  color: '#8898aa',
  margin: '24px 0 16px',
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

const signature = {
  fontSize: '15px',
  lineHeight: '24px',
  color: '#1a1a1a',
  fontWeight: '500',
  margin: '24px 0 0',
};

export default EmailVerificationEmail;
