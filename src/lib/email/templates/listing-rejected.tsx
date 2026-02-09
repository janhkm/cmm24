import {
  Button,
  Heading,
  Link,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';
import { BaseLayout } from './base-layout';

interface ListingRejectedEmailProps {
  sellerName: string;
  listingTitle: string;
  rejectionReason: string;
  listingEditUrl: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://cmm24.com';

export function ListingRejectedEmail({
  sellerName = 'Max',
  listingTitle = 'Zeiss Contura 10/12/6',
  rejectionReason = 'Bitte ergaenzen Sie weitere Details zur Maschine.',
  listingEditUrl = `${baseUrl}/seller/inserate/123`,
}: ListingRejectedEmailProps) {
  return (
    <BaseLayout preview={`Inserat abgelehnt: ${listingTitle}`}>
      <Heading style={heading}>
        Inserat nicht freigegeben
      </Heading>

      <Text style={paragraph}>
        Hallo {sellerName},
      </Text>

      <Text style={paragraph}>
        Ihr Inserat <strong>&quot;{listingTitle}&quot;</strong> konnte leider nicht freigegeben werden. 
        Bitte ueberarbeiten Sie es gemaess dem folgenden Hinweis und reichen Sie es erneut ein.
      </Text>

      <Section style={reasonBox}>
        <Text style={reasonLabel}>Grund der Ablehnung:</Text>
        <Text style={reasonText}>{rejectionReason}</Text>
      </Section>

      <Section style={tipsBox}>
        <Text style={tipsTitle}>Haeufige Gruende fuer Ablehnungen:</Text>
        <Text style={tipItem}>• Unvollstaendige Maschinenbeschreibung</Text>
        <Text style={tipItem}>• Fehlende oder unzureichende Bilder</Text>
        <Text style={tipItem}>• Fehlende technische Daten (Messbereich, Genauigkeit)</Text>
        <Text style={tipItem}>• Unrealistische Preisangabe</Text>
      </Section>

      <Section style={buttonContainer}>
        <Button style={button} href={listingEditUrl}>
          Inserat bearbeiten
        </Button>
      </Section>

      <Text style={paragraph}>
        Nach der Ueberarbeitung koennen Sie das Inserat erneut zur Pruefung einreichen. 
        Bei Fragen kontaktieren Sie uns gerne ueber das{' '}
        <Link href={`${baseUrl}/kontakt`} style={link}>Kontaktformular</Link>.
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

const reasonBox = {
  backgroundColor: '#fef2f2',
  borderRadius: '8px',
  padding: '16px 20px',
  margin: '24px 0',
  borderLeft: '4px solid #dc2626',
};

const reasonLabel = {
  fontSize: '12px',
  fontWeight: '600',
  color: '#991b1b',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0 0 8px',
};

const reasonText = {
  fontSize: '15px',
  lineHeight: '24px',
  color: '#991b1b',
  margin: '0',
};

const tipsBox = {
  backgroundColor: '#f6f9fc',
  borderRadius: '8px',
  padding: '16px 20px',
  margin: '24px 0',
};

const tipsTitle = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#1a1a1a',
  margin: '0 0 12px',
};

const tipItem = {
  fontSize: '14px',
  lineHeight: '22px',
  color: '#525f7f',
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
  textDecoration: 'none',
};

const signature = {
  fontSize: '15px',
  lineHeight: '24px',
  color: '#1a1a1a',
  fontWeight: '500',
  margin: '24px 0 0',
};

export default ListingRejectedEmail;
