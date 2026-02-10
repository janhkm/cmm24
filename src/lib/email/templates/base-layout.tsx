import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface BaseLayoutProps {
  preview: string;
  children: React.ReactNode;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://cmm24.com';

export function BaseLayout({ preview, children }: BaseLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Link href={baseUrl}>
              <Img
                src={`${baseUrl}/logo.png`}
                width="120"
                height="40"
                alt="CMM24"
                style={logo}
              />
            </Link>
          </Section>

          {/* Content */}
          <Section style={content}>
            {children}
          </Section>

          {/* Footer */}
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerText}>
              CMM24 - Der Marktplatz für gebrauchte Koordinatenmessmaschinen
            </Text>
            <Text style={footerLinks}>
              <Link href={baseUrl} style={link}>Website</Link>
              {' • '}
              <Link href={`${baseUrl}/kontakt`} style={link}>Kontakt</Link>
              {' • '}
              <Link href={`${baseUrl}/datenschutz`} style={link}>Datenschutz</Link>
              {' • '}
              <Link href={`${baseUrl}/impressum`} style={link}>Impressum</Link>
            </Text>
            <Text style={unsubscribeText}>
              <Link href={`${baseUrl}/seller/konto?tab=privacy`} style={unsubscribeLink}>
                E-Mail-Einstellungen verwalten
              </Link>
              {' • '}
              Sie erhalten diese E-Mail, weil Sie ein CMM24-Konto besitzen.
            </Text>
            <Text style={footerAddress}>
              Kneissl Messtechnik GmbH • Mühlstr. 41 • 71229 Leonberg • Deutschland
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const header = {
  padding: '24px 32px',
  borderBottom: '1px solid #e6ebf1',
};

const logo = {
  margin: '0 auto',
};

const content = {
  padding: '32px',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
};

const footer = {
  padding: '0 32px',
};

const footerText = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  textAlign: 'center' as const,
  margin: '0 0 8px',
};

const footerLinks = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  textAlign: 'center' as const,
  margin: '0 0 8px',
};

const footerAddress = {
  color: '#8898aa',
  fontSize: '11px',
  lineHeight: '16px',
  textAlign: 'center' as const,
  margin: '16px 0 0',
};

const link = {
  color: '#556cd6',
  textDecoration: 'none',
};

const unsubscribeText = {
  color: '#aab7c4',
  fontSize: '11px',
  lineHeight: '16px',
  textAlign: 'center' as const,
  margin: '12px 0 0',
};

const unsubscribeLink = {
  color: '#556cd6',
  fontSize: '11px',
  textDecoration: 'underline',
};

export default BaseLayout;
