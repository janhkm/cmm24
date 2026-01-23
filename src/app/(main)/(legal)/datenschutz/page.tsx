import type { Metadata } from 'next';
import Link from 'next/link';
import { companyInfo } from '@/data/mock-data';

export const metadata: Metadata = {
  title: 'Datenschutzerklärung | CMM24',
  description: 'Datenschutzerklärung der CMM24 GmbH – Informationen zur Verarbeitung Ihrer personenbezogenen Daten gemäß DSGVO.',
  robots: 'noindex, follow',
};

export default function DatenschutzPage() {
  return (
    <main className="container-page max-w-3xl py-12 md:py-16">
      <h1 className="text-3xl font-bold mb-8">Datenschutzerklärung</h1>
      
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <p className="text-muted-foreground mb-8">Stand: Januar 2026</p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">1. Verantwortlicher</h2>
          <p>Verantwortlicher für die Datenverarbeitung auf dieser Website ist:</p>
          <address className="not-italic mt-4">
            <p className="font-semibold">{companyInfo.name}</p>
            <p>{companyInfo.street}</p>
            <p>{companyInfo.postalCode} {companyInfo.city}</p>
            <p>E-Mail: <a href={`mailto:${companyInfo.email}`} className="text-primary hover:underline">{companyInfo.email}</a></p>
          </address>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">2. Ihre Rechte</h2>
          <p>Sie haben jederzeit das Recht:</p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>Auskunft über Ihre gespeicherten Daten zu erhalten (Art. 15 DSGVO)</li>
            <li>Berichtigung unrichtiger Daten zu verlangen (Art. 16 DSGVO)</li>
            <li>Löschung Ihrer Daten zu verlangen (Art. 17 DSGVO)</li>
            <li>Einschränkung der Verarbeitung zu verlangen (Art. 18 DSGVO)</li>
            <li>Datenübertragbarkeit zu verlangen (Art. 20 DSGVO)</li>
            <li>Der Verarbeitung zu widersprechen (Art. 21 DSGVO)</li>
            <li>Sich bei einer Aufsichtsbehörde zu beschweren (Art. 77 DSGVO)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">3. Datenerfassung auf dieser Website</h2>
          
          <h3 className="text-lg font-medium mt-6 mb-3">Cookies</h3>
          <p>
            Wir verwenden Cookies, um unsere Website funktional zu gestalten. Cookies sind kleine Textdateien, 
            die auf Ihrem Gerät gespeichert werden.
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li><strong>Notwendige Cookies:</strong> Erforderlich für die Grundfunktionen der Website (z.B. Session-Cookies)</li>
            <li><strong>Analytische Cookies:</strong> Helfen uns zu verstehen, wie Besucher die Website nutzen (Plausible Analytics)</li>
          </ul>

          <h3 className="text-lg font-medium mt-6 mb-3">Server-Log-Dateien</h3>
          <p>
            Der Provider der Seiten erhebt und speichert automatisch Informationen in Server-Log-Dateien, 
            die Ihr Browser automatisch übermittelt:
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>Browsertyp und -version</li>
            <li>Verwendetes Betriebssystem</li>
            <li>Referrer URL</li>
            <li>Uhrzeit der Serveranfrage</li>
            <li>IP-Adresse (anonymisiert)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">4. Registrierung und Nutzerkonto</h2>
          <p>
            Bei der Registrierung für ein Nutzerkonto erheben wir folgende Daten:
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>E-Mail-Adresse (Pflicht)</li>
            <li>Name (Pflicht)</li>
            <li>Firmenname (optional)</li>
            <li>Telefonnummer (optional)</li>
            <li>Adresse (bei Verkäufern)</li>
          </ul>
          <p className="mt-4">
            Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung).
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">5. Kontaktformular und Anfragen</h2>
          <p>
            Wenn Sie uns per Kontaktformular oder E-Mail kontaktieren, werden Ihre Angaben zur Bearbeitung 
            der Anfrage und für mögliche Anschlussfragen gespeichert. Diese Daten geben wir nicht ohne 
            Ihre Einwilligung weiter.
          </p>
          <p className="mt-4">
            Bei Anfragen an Verkäufer werden Ihre Kontaktdaten an den jeweiligen Verkäufer weitergeleitet, 
            damit dieser Ihre Anfrage beantworten kann.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">6. Zahlungsabwicklung</h2>
          <p>
            Für die Zahlungsabwicklung nutzen wir Stripe (Stripe Payments Europe, Ltd.). Bei Zahlungen 
            werden Ihre Zahlungsdaten direkt von Stripe verarbeitet. Wir haben keinen Zugriff auf 
            vollständige Kreditkartennummern.
          </p>
          <p className="mt-4">
            Datenschutzhinweise von Stripe: {' '}
            <a 
              href="https://stripe.com/de/privacy" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              stripe.com/de/privacy
            </a>
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">7. Analyse-Tools</h2>
          <h3 className="text-lg font-medium mt-6 mb-3">Plausible Analytics</h3>
          <p>
            Wir nutzen Plausible Analytics, einen datenschutzfreundlichen Analysedienst. Plausible 
            verwendet keine Cookies und sammelt keine personenbezogenen Daten. Die Daten werden in 
            der EU gespeichert.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">8. Hosting</h2>
          <p>
            Diese Website wird bei Vercel Inc. gehostet. Vercel kann technische Daten wie IP-Adressen 
            verarbeiten, um die Website bereitzustellen. Vercel ist nach dem EU-US Data Privacy Framework 
            zertifiziert.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">9. Speicherdauer</h2>
          <p>
            Personenbezogene Daten werden gelöscht, sobald der Zweck der Verarbeitung entfällt und keine 
            gesetzlichen Aufbewahrungsfristen mehr bestehen. Für Buchungsunterlagen beträgt die 
            Aufbewahrungsfrist 10 Jahre.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">10. SSL/TLS-Verschlüsselung</h2>
          <p>
            Diese Website nutzt aus Sicherheitsgründen eine SSL/TLS-Verschlüsselung. Eine verschlüsselte 
            Verbindung erkennen Sie an dem Schloss-Symbol in der Browserzeile und an &quot;https://&quot; in der URL.
          </p>
        </section>
      </div>

      <div className="mt-12 pt-8 border-t">
        <p className="text-sm text-muted-foreground">
          Siehe auch: <Link href="/impressum" className="text-primary hover:underline">Impressum</Link> | <Link href="/agb" className="text-primary hover:underline">AGB</Link>
        </p>
      </div>
    </main>
  );
}
