import {
  Heading,
  Hr,
  Section,
  Text,
} from '@react-email/components';
import { BaseLayout } from './base-layout';

interface ContactFormEmailProps {
  senderName: string;
  senderEmail: string;
  senderPhone?: string;
  senderCompany?: string;
  subject: string;
  message: string;
}

export function ContactFormEmail({
  senderName,
  senderEmail,
  senderPhone,
  senderCompany,
  subject,
  message,
}: ContactFormEmailProps) {
  const preview = `Neue Kontaktanfrage von ${senderName}: ${subject}`;
  
  return (
    <BaseLayout preview={preview}>
      <Heading style={heading}>
        Neue Kontaktanfrage
      </Heading>
      
      <Text style={paragraph}>
        Sie haben eine neue Nachricht über das Kontaktformular erhalten:
      </Text>
      
      {/* Sender Info */}
      <Section style={infoBox}>
        <Text style={infoLabel}>Von:</Text>
        <Text style={infoValue}>{senderName}</Text>
        
        <Text style={infoLabel}>E-Mail:</Text>
        <Text style={infoValue}>{senderEmail}</Text>
        
        {senderPhone && (
          <>
            <Text style={infoLabel}>Telefon:</Text>
            <Text style={infoValue}>{senderPhone}</Text>
          </>
        )}
        
        {senderCompany && (
          <>
            <Text style={infoLabel}>Firma:</Text>
            <Text style={infoValue}>{senderCompany}</Text>
          </>
        )}
        
        <Text style={infoLabel}>Betreff:</Text>
        <Text style={infoValue}>{subject}</Text>
      </Section>
      
      <Hr style={hr} />
      
      {/* Message */}
      <Section>
        <Text style={messageLabel}>Nachricht:</Text>
        {message.split('\n').map((line, i) => (
          <Text key={i} style={messageLine}>
            {line || '\u00A0'}
          </Text>
        ))}
      </Section>
      
      <Hr style={hr} />
      
      <Text style={footer}>
        Sie können direkt auf diese E-Mail antworten, um mit dem Absender in Kontakt zu treten.
      </Text>
    </BaseLayout>
  );
}

// Styles
const heading = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#1a1a1a',
  marginBottom: '24px',
};

const paragraph = {
  fontSize: '14px',
  lineHeight: '24px',
  color: '#333',
  margin: '0 0 16px',
};

const infoBox = {
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '24px',
};

const infoLabel = {
  fontSize: '12px',
  color: '#666',
  margin: '8px 0 0',
  fontWeight: '600',
};

const infoValue = {
  fontSize: '14px',
  color: '#1a1a1a',
  margin: '2px 0 8px',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '24px 0',
};

const messageLabel = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#333',
  margin: '0 0 12px',
};

const messageLine = {
  fontSize: '14px',
  lineHeight: '24px',
  color: '#333',
  margin: '4px 0',
};

const footer = {
  fontSize: '12px',
  color: '#666',
};

export default ContactFormEmail;
