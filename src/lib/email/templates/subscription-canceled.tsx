import {
  Button,
  Heading,
  Link,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';
import { BaseLayout } from './base-layout';

interface SubscriptionCanceledEmailProps {
  userName: string;
  planName: string;
  activeUntil: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://cmm24.com';

export function SubscriptionCanceledEmail({
  userName = 'Max',
  planName = 'Starter',
  activeUntil = '31.03.2026',
}: SubscriptionCanceledEmailProps) {
  return (
    <BaseLayout preview={`Ihre Kuendigung des ${planName}-Plans wurde bestaetigt`}>
      <Heading style={heading}>
        Kuendigung bestaetigt
      </Heading>

      <Text style={paragraph}>
        Hallo {userName},
      </Text>

      <Text style={paragraph}>
        wir bestaetigen die Kuendigung Ihres <strong>{planName}-Plans</strong>. 
        Sie koennen alle Funktionen Ihres Plans noch bis zum Ende der aktuellen 
        Abrechnungsperiode nutzen.
      </Text>

      <Section style={infoBox}>
        <Text style={infoLabel}>Aktiv bis</Text>
        <Text style={infoValue}>{activeUntil}</Text>
        <Text style={infoNote}>
          Danach wird Ihr Account automatisch auf den kostenlosen Free-Plan umgestellt.
        </Text>
      </Section>

      <Section style={impactBox}>
        <Text style={impactTitle}>Was aendert sich nach dem Wechsel auf Free?</Text>
        <Text style={impactItem}>• Maximal 1 aktives Inserat</Text>
        <Text style={impactItem}>• Keine Team-Mitglieder</Text>
        <Text style={impactItem}>• Basis-Statistiken</Text>
        <Text style={impactItem}>• Ueberzaehlige Inserate werden automatisch archiviert</Text>
      </Section>

      <Text style={paragraph}>
        Sie koennen Ihre Kuendigung jederzeit vor dem {activeUntil} rueckgaengig machen.
      </Text>

      <Section style={buttonContainer}>
        <Button style={button} href={`${baseUrl}/seller/abo`}>
          Kuendigung rueckgaengig machen
        </Button>
      </Section>

      <Text style={paragraph}>
        Wir wuerden uns freuen, Sie bald wieder als Premium-Nutzer begruessen zu duerfen. 
        Bei Fragen oder Feedback kontaktieren Sie uns gerne ueber das{' '}
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

const infoBox = {
  backgroundColor: '#f6f9fc',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const infoLabel = {
  fontSize: '12px',
  fontWeight: '600',
  color: '#666',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0 0 4px',
};

const infoValue = {
  fontSize: '24px',
  fontWeight: '700',
  color: '#1a1a1a',
  margin: '0 0 8px',
};

const infoNote = {
  fontSize: '13px',
  color: '#8898aa',
  margin: '0',
};

const impactBox = {
  backgroundColor: '#fff8e1',
  borderRadius: '8px',
  padding: '16px 20px',
  margin: '24px 0',
  borderLeft: '4px solid #f9a825',
};

const impactTitle = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#f57f17',
  margin: '0 0 12px',
};

const impactItem = {
  fontSize: '14px',
  lineHeight: '22px',
  color: '#795548',
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

export default SubscriptionCanceledEmail;
