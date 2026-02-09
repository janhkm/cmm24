import {
  Button,
  Column,
  Heading,
  Img,
  Link,
  Row,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';
import { BaseLayout } from './base-layout';

interface InquiryConfirmationEmailProps {
  buyerName: string;
  listingTitle: string;
  listingPrice: string;
  listingImage?: string;
  listingUrl: string;
  sellerCompany: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://cmm24.com';

export function InquiryConfirmationEmail({
  buyerName = 'Hans',
  listingTitle = 'Zeiss Contura 10/12/6',
  listingPrice = '45.000 €',
  listingImage,
  listingUrl = `${baseUrl}/maschinen/zeiss-contura`,
  sellerCompany = 'Messtechnik Müller GmbH',
}: InquiryConfirmationEmailProps) {
  return (
    <BaseLayout preview={`Ihre Anfrage für: ${listingTitle}`}>
      <Heading style={heading}>
        Anfrage erfolgreich gesendet
      </Heading>
      
      <Text style={paragraph}>
        Hallo {buyerName},
      </Text>
      
      <Text style={paragraph}>
        vielen Dank für Ihre Anfrage! Der Verkäufer wurde benachrichtigt und 
        wird sich in Kürze bei Ihnen melden.
      </Text>

      {/* Listing Info */}
      <Section style={listingBox}>
        <Row>
          {listingImage && (
            <Column style={imageColumn}>
              <Img
                src={listingImage}
                width="100"
                height="75"
                alt={listingTitle}
                style={listingImageStyle}
              />
            </Column>
          )}
          <Column style={listingInfo}>
            <Text style={listingTitleStyle}>{listingTitle}</Text>
            <Text style={listingPriceStyle}>{listingPrice}</Text>
            <Text style={sellerInfo}>Verkäufer: {sellerCompany}</Text>
          </Column>
        </Row>
      </Section>

      <Section style={infoBox}>
        <Text style={infoTitle}>Was passiert als nächstes?</Text>
        <Text style={infoItem}>1. Der Verkäufer prüft Ihre Anfrage</Text>
        <Text style={infoItem}>2. Sie erhalten eine Antwort per E-Mail</Text>
        <Text style={infoItem}>3. Bei Interesse können Sie direkt Kontakt aufnehmen</Text>
      </Section>

      <Section style={buttonContainer}>
        <Button style={button} href={listingUrl}>
          Inserat ansehen
        </Button>
      </Section>

      <Text style={paragraph}>
        Suchen Sie nach weiteren Maschinen?{' '}
        <Link href={`${baseUrl}/maschinen`} style={link}>
          Alle Inserate durchsuchen →
        </Link>
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

const listingBox = {
  backgroundColor: '#f6f9fc',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 0',
};

const imageColumn = {
  width: '116px',
  verticalAlign: 'top' as const,
};

const listingImageStyle = {
  borderRadius: '6px',
  objectFit: 'cover' as const,
};

const listingInfo = {
  paddingLeft: '16px',
  verticalAlign: 'top' as const,
};

const listingTitleStyle = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#1a1a1a',
  margin: '0 0 4px',
};

const listingPriceStyle = {
  fontSize: '18px',
  fontWeight: '700',
  color: '#0f172a',
  margin: '0 0 4px',
};

const sellerInfo = {
  fontSize: '13px',
  color: '#8898aa',
  margin: '0',
};

const infoBox = {
  backgroundColor: '#e8f5e9',
  borderRadius: '8px',
  padding: '16px 20px',
  margin: '24px 0',
};

const infoTitle = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#2e7d32',
  margin: '0 0 12px',
};

const infoItem = {
  fontSize: '14px',
  lineHeight: '22px',
  color: '#1b5e20',
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

export default InquiryConfirmationEmail;
