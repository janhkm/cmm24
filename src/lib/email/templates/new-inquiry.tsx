import {
  Button,
  Column,
  Heading,
  Hr,
  Img,
  Link,
  Row,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';
import { BaseLayout } from './base-layout';

interface NewInquiryEmailProps {
  sellerName: string;
  listingTitle: string;
  listingPrice: string;
  listingImage?: string;
  listingUrl: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone?: string;
  buyerCompany?: string;
  message: string;
  inquiryUrl: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://cmm24.com';

export function NewInquiryEmail({
  sellerName = 'Max',
  listingTitle = 'Zeiss Contura 10/12/6',
  listingPrice = '45.000 €',
  listingImage,
  listingUrl = `${baseUrl}/maschinen/zeiss-contura`,
  buyerName = 'Hans Müller',
  buyerEmail = 'hans.mueller@beispiel.de',
  buyerPhone = '+49 123 456789',
  buyerCompany = 'Müller Messtechnik GmbH',
  message = 'Guten Tag, ich interessiere mich für diese Koordinatenmessmaschine. Ist sie noch verfügbar? Können Sie mir weitere Informationen zusenden?',
  inquiryUrl = `${baseUrl}/seller/anfragen/123`,
}: NewInquiryEmailProps) {
  return (
    <BaseLayout preview={`Neue Anfrage für: ${listingTitle}`}>
      <Heading style={heading}>
        Neue Anfrage erhalten!
      </Heading>
      
      <Text style={paragraph}>
        Hallo {sellerName},
      </Text>
      
      <Text style={paragraph}>
        Sie haben eine neue Anfrage für Ihr Inserat erhalten:
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
            <Link href={listingUrl} style={link}>Inserat ansehen →</Link>
          </Column>
        </Row>
      </Section>

      <Hr style={hr} />

      {/* Buyer Info */}
      <Section>
        <Text style={sectionTitle}>Anfrage von:</Text>
        <Text style={buyerInfo}>
          <strong>{buyerName}</strong>
          {buyerCompany && <><br />{buyerCompany}</>}
        </Text>
        <Text style={contactInfo}>
          ✉️ <Link href={`mailto:${buyerEmail}`} style={link}>{buyerEmail}</Link>
          {buyerPhone && <><br />📞 {buyerPhone}</>}
        </Text>
      </Section>

      <Hr style={hr} />

      {/* Message */}
      <Section>
        <Text style={sectionTitle}>Nachricht:</Text>
        <Text style={messageBox}>{message}</Text>
      </Section>

      <Section style={buttonContainer}>
        <Button style={button} href={inquiryUrl}>
          Anfrage beantworten
        </Button>
      </Section>

      <Text style={paragraphSmall}>
        Tipp: Reagieren Sie schnell auf Anfragen – das erhöht Ihre Chancen auf einen erfolgreichen Verkauf!
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

const listingBox = {
  backgroundColor: '#f6f9fc',
  borderRadius: '8px',
  padding: '16px',
  margin: '16px 0',
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
  margin: '0 0 8px',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '24px 0',
};

const sectionTitle = {
  fontSize: '13px',
  fontWeight: '600',
  color: '#8898aa',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0 0 8px',
};

const buyerInfo = {
  fontSize: '15px',
  lineHeight: '22px',
  color: '#1a1a1a',
  margin: '0 0 8px',
};

const contactInfo = {
  fontSize: '14px',
  lineHeight: '22px',
  color: '#525f7f',
  margin: '0',
};

const messageBox = {
  backgroundColor: '#f6f9fc',
  borderRadius: '8px',
  padding: '16px',
  fontSize: '14px',
  lineHeight: '22px',
  color: '#525f7f',
  margin: '0',
  whiteSpace: 'pre-wrap' as const,
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
  textDecoration: 'none',
};

const signature = {
  fontSize: '15px',
  lineHeight: '24px',
  color: '#1a1a1a',
  fontWeight: '500',
  margin: '24px 0 0',
};

export default NewInquiryEmail;
