import {
  Heading,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';
import { BaseLayout } from './base-layout';

interface ContactFormConfirmationEmailProps {
  senderName: string;
  subject: string;
  message: string;
}

export function ContactFormConfirmationEmail({
  senderName = 'Max',
  subject = 'Allgemeine Anfrage',
  message = 'Meine Nachricht...',
}: ContactFormConfirmationEmailProps) {
  return (
    <BaseLayout preview="Wir haben Ihre Nachricht erhalten">
      <Heading style={heading}>
        Nachricht erhalten
      </Heading>

      <Text style={paragraph}>
        Hallo {senderName},
      </Text>

      <Text style={paragraph}>
        vielen Dank fuer Ihre Nachricht! Wir haben Ihre Anfrage erhalten und werden uns 
        schnellstmoeglich bei Ihnen melden. In der Regel antworten wir innerhalb von 24 Stunden 
        an Werktagen.
      </Text>

      <Section style={messageBox}>
        <Text style={messageLabel}>Ihre Nachricht:</Text>
        <Text style={messageSubject}>{subject}</Text>
        <Text style={messageText}>{message}</Text>
      </Section>

      <Text style={paragraph}>
        Falls Sie in der Zwischenzeit weitere Fragen haben, antworten Sie einfach auf diese E-Mail.
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

const messageBox = {
  backgroundColor: '#f6f9fc',
  borderRadius: '8px',
  padding: '16px 20px',
  margin: '24px 0',
};

const messageLabel = {
  fontSize: '12px',
  fontWeight: '600',
  color: '#666',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0 0 8px',
};

const messageSubject = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#1a1a1a',
  margin: '0 0 8px',
};

const messageText = {
  fontSize: '14px',
  lineHeight: '22px',
  color: '#525f7f',
  margin: '0',
  whiteSpace: 'pre-wrap' as const,
};

const signature = {
  fontSize: '15px',
  lineHeight: '24px',
  color: '#1a1a1a',
  fontWeight: '500',
  margin: '24px 0 0',
};

export default ContactFormConfirmationEmail;
