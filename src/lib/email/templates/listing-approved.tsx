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

interface ListingApprovedEmailProps {
  sellerName: string;
  listingTitle: string;
  listingPrice: string;
  listingImage?: string;
  listingUrl: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://cmm24.com';

export function ListingApprovedEmail({
  sellerName = 'Max',
  listingTitle = 'Zeiss Contura 10/12/6',
  listingPrice = '45.000 €',
  listingImage,
  listingUrl = `${baseUrl}/maschinen/zeiss-contura`,
}: ListingApprovedEmailProps) {
  return (
    <BaseLayout preview={`Ihr Inserat ist online: ${listingTitle}`}>
      <Section style={successBanner}>
        <Text style={successEmoji}>🎉</Text>
        <Heading style={headingSuccess}>
          Ihr Inserat ist online!
        </Heading>
      </Section>
      
      <Text style={paragraph}>
        Hallo {sellerName},
      </Text>
      
      <Text style={paragraph}>
        tolle Neuigkeiten! Ihr Inserat wurde geprüft und freigeschaltet. 
        Es ist jetzt für alle Interessenten sichtbar.
      </Text>

      {/* Listing Info */}
      <Section style={listingBox}>
        <Row>
          {listingImage && (
            <Column style={imageColumn}>
              <Img
                src={listingImage}
                width="120"
                height="90"
                alt={listingTitle}
                style={listingImageStyle}
              />
            </Column>
          )}
          <Column style={listingInfo}>
            <Text style={listingTitleStyle}>{listingTitle}</Text>
            <Text style={listingPriceStyle}>{listingPrice}</Text>
            <Link href={listingUrl} style={link}>Inserat ansehen →</Link>
          </Column>
        </Row>
      </Section>

      <Section style={tipsBox}>
        <Text style={tipsTitle}>💡 Tipps für mehr Erfolg</Text>
        <Text style={tipItem}>• Reagieren Sie schnell auf Anfragen</Text>
        <Text style={tipItem}>• Halten Sie Ihre Kontaktdaten aktuell</Text>
        <Text style={tipItem}>• Fügen Sie weitere Bilder hinzu, falls vorhanden</Text>
        <Text style={tipItem}>• Teilen Sie das Inserat in Ihrem Netzwerk</Text>
      </Section>

      <Section style={buttonContainer}>
        <Button style={button} href={listingUrl}>
          Inserat ansehen
        </Button>
      </Section>

      <Text style={paragraph}>
        Sie können Ihr Inserat jederzeit im{' '}
        <Link href={`${baseUrl}/seller/inserate`} style={link}>
          Verkäufer-Dashboard
        </Link>{' '}
        bearbeiten.
      </Text>

      <Text style={signature}>
        Ihr CMM24-Team
      </Text>
    </BaseLayout>
  );
}

// Styles
const successBanner = {
  textAlign: 'center' as const,
  marginBottom: '24px',
};

const successEmoji = {
  fontSize: '48px',
  margin: '0 0 8px',
};

const headingSuccess = {
  fontSize: '24px',
  fontWeight: '600',
  color: '#2e7d32',
  margin: '0',
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
  width: '136px',
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
  fontSize: '20px',
  fontWeight: '700',
  color: '#0f172a',
  margin: '0 0 8px',
};

const tipsBox = {
  backgroundColor: '#e3f2fd',
  borderRadius: '8px',
  padding: '16px 20px',
  margin: '24px 0',
};

const tipsTitle = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#1565c0',
  margin: '0 0 12px',
};

const tipItem = {
  fontSize: '14px',
  lineHeight: '22px',
  color: '#0d47a1',
  margin: '0 0 4px',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#2e7d32',
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
  textDecoration: 'none',
};

const signature = {
  fontSize: '15px',
  lineHeight: '24px',
  color: '#1a1a1a',
  fontWeight: '500',
  margin: '24px 0 0',
};

export default ListingApprovedEmail;
