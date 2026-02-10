import {
  Button,
  Heading,
  Hr,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';
import { BaseLayout } from './base-layout';

interface InquiryMessageEmailProps {
  recipientName: string;
  senderName: string;
  senderCompany?: string;
  listingTitle: string;
  messagePreview: string;
  inquiryUrl: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://cmm24.com';

export function InquiryMessageEmail({
  recipientName = 'Max',
  senderName = 'Hans Müller',
  senderCompany,
  listingTitle = 'Zeiss Contura 10/12/6',
  messagePreview = 'Vielen Dank für Ihr Interesse. Die Maschine ist noch verfügbar und kann besichtigt werden...',
  inquiryUrl = `${baseUrl}/seller/anfragen/123`,
}: InquiryMessageEmailProps) {
  const senderDisplay = senderCompany
    ? `${senderName} (${senderCompany})`
    : senderName;

  return (
    <BaseLayout preview={`Neue Nachricht von ${senderName} zu: ${listingTitle}`}>
      <Heading style={heading}>
        Neue Nachricht erhalten
      </Heading>

      <Text style={paragraph}>
        Hallo {recipientName},
      </Text>

      <Text style={paragraph}>
        <strong>{senderDisplay}</strong> hat Ihnen eine Nachricht zu <strong>{listingTitle}</strong> gesendet:
      </Text>

      {/* Nachrichten-Vorschau */}
      <Section style={messageBox}>
        <Text style={messageText}>
          {messagePreview}
          {messagePreview.length >= 200 && '...'}
        </Text>
      </Section>

      <Section style={buttonContainer}>
        <Button style={button} href={inquiryUrl}>
          Nachricht lesen & antworten
        </Button>
      </Section>

      <Hr style={hr} />

      <Text style={footerNote}>
        Diese Nachricht wurde über CMM24 gesendet. Antworten Sie direkt auf der Plattform, um den Gesprächsverlauf zu behalten.
      </Text>
    </BaseLayout>
  );
}

// Styles
const heading = {
  fontSize: '24px',
  fontWeight: '600' as const,
  color: '#1a1a1a',
  marginBottom: '24px',
};

const paragraph = {
  fontSize: '14px',
  lineHeight: '24px',
  color: '#484848',
  marginBottom: '16px',
};

const messageBox = {
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  border: '1px solid #e9ecef',
  padding: '16px 20px',
  marginBottom: '24px',
};

const messageText = {
  fontSize: '14px',
  lineHeight: '22px',
  color: '#333333',
  margin: '0',
  whiteSpace: 'pre-wrap' as const,
};

const buttonContainer = {
  textAlign: 'center' as const,
  marginBottom: '24px',
};

const button = {
  backgroundColor: '#0F172A',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '600' as const,
  textDecoration: 'none',
  textAlign: 'center' as const,
  padding: '12px 24px',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
};

const footerNote = {
  fontSize: '12px',
  lineHeight: '18px',
  color: '#8898aa',
  marginBottom: '0',
};
