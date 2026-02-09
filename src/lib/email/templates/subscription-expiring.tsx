import {
  Button,
  Heading,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';
import { BaseLayout } from './base-layout';

interface SubscriptionExpiringEmailProps {
  userName: string;
  planName: string;
  daysLeft: number;
  expiresAt: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://cmm24.com';

export function SubscriptionExpiringEmail({
  userName = 'Max',
  planName = 'Starter',
  daysLeft = 7,
  expiresAt = '31.03.2026',
}: SubscriptionExpiringEmailProps) {
  return (
    <BaseLayout preview={`Ihr ${planName}-Plan laeuft in ${daysLeft} Tagen ab`}>
      <Section style={warningBanner}>
        <Text style={warningEmoji}>⏰</Text>
        <Heading style={headingWarning}>
          Abo laeuft bald ab
        </Heading>
      </Section>

      <Text style={paragraph}>
        Hallo {userName},
      </Text>

      <Text style={paragraph}>
        Ihr <strong>{planName}-Plan</strong> laeuft in <strong>{daysLeft} Tagen</strong> ab 
        (am {expiresAt}). Nach Ablauf wird Ihr Account auf den kostenlosen Free-Plan umgestellt.
      </Text>

      <Section style={infoBox}>
        <Text style={infoLabel}>Plan laeuft ab am</Text>
        <Text style={infoValue}>{expiresAt}</Text>
        <Text style={infoDays}>Noch {daysLeft} Tage</Text>
      </Section>

      <Text style={paragraph}>
        Um alle Funktionen Ihres {planName}-Plans weiterhin nutzen zu koennen, 
        erneuern Sie Ihr Abonnement rechtzeitig.
      </Text>

      <Section style={buttonContainer}>
        <Button style={button} href={`${baseUrl}/seller/abo`}>
          Abo verlaengern
        </Button>
      </Section>

      <Text style={signature}>
        Ihr CMM24-Team
      </Text>
    </BaseLayout>
  );
}

// Styles
const warningBanner = {
  textAlign: 'center' as const,
  marginBottom: '24px',
};

const warningEmoji = {
  fontSize: '48px',
  margin: '0 0 8px',
};

const headingWarning = {
  fontSize: '24px',
  fontWeight: '600',
  color: '#e65100',
  margin: '0',
};

const paragraph = {
  fontSize: '15px',
  lineHeight: '24px',
  color: '#525f7f',
  margin: '0 0 16px',
};

const infoBox = {
  backgroundColor: '#fff3e0',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
  textAlign: 'center' as const,
  borderLeft: '4px solid #e65100',
};

const infoLabel = {
  fontSize: '12px',
  fontWeight: '600',
  color: '#e65100',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0 0 4px',
};

const infoValue = {
  fontSize: '24px',
  fontWeight: '700',
  color: '#bf360c',
  margin: '0 0 4px',
};

const infoDays = {
  fontSize: '14px',
  color: '#e65100',
  fontWeight: '600',
  margin: '0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#e65100',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '15px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
};

const signature = {
  fontSize: '15px',
  lineHeight: '24px',
  color: '#1a1a1a',
  fontWeight: '500',
  margin: '24px 0 0',
};

export default SubscriptionExpiringEmail;
