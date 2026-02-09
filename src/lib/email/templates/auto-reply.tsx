import {
  Heading,
  Hr,
  Link,
  Section,
  Text,
} from '@react-email/components';
import { BaseLayout } from './base-layout';

interface AutoReplyEmailProps {
  recipientName: string;
  message: string;
  listingTitle?: string;
  listingUrl?: string;
  companyName?: string;
}

export function AutoReplyEmail({
  recipientName,
  message,
  listingTitle,
  listingUrl,
  companyName,
}: AutoReplyEmailProps) {
  const preview = `Vielen Dank für Ihre Anfrage${listingTitle ? ` zu "${listingTitle}"` : ''}`;
  
  return (
    <BaseLayout preview={preview}>
      <Heading style={heading}>
        Vielen Dank für Ihre Anfrage
      </Heading>
      
      <Text style={paragraph}>
        Hallo {recipientName},
      </Text>
      
      {/* Main message - preserving line breaks */}
      <Section>
        {message.split('\n').map((line, i) => (
          <Text key={i} style={paragraph}>
            {line || '\u00A0'}
          </Text>
        ))}
      </Section>
      
      {/* Listing reference */}
      {listingTitle && (
        <Section style={listingBox}>
          <Text style={smallText}>
            Ihre Anfrage bezüglich:
          </Text>
          <Text style={listingTitleStyle}>
            {listingTitle}
          </Text>
          {listingUrl && (
            <Link
              href={listingUrl}
              style={link}
            >
              Inserat ansehen →
            </Link>
          )}
        </Section>
      )}
      
      <Hr style={hr} />
      
      <Text style={footer}>
        Diese Nachricht wurde automatisch versendet.
        {companyName && ` Im Auftrag von ${companyName}.`}
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
  margin: '4px 0',
};

const listingBox = {
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  padding: '16px',
  marginTop: '24px',
  marginBottom: '24px',
};

const smallText = {
  fontSize: '12px',
  color: '#666',
  margin: '0 0 8px',
};

const listingTitleStyle = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#1a1a1a',
  margin: '0 0 8px',
};

const link = {
  fontSize: '14px',
  color: '#2563eb',
  textDecoration: 'none',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '24px 0',
};

const footer = {
  fontSize: '12px',
  color: '#666',
};

export default AutoReplyEmail;
