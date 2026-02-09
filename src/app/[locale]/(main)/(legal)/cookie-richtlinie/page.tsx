import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Cookie-Richtlinie | CMM24',
  description: 'Informationen über die Verwendung von Cookies auf CMM24. Erfahren Sie, welche Cookies wir nutzen und wie Sie diese verwalten können.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function CookieRichtliniePage() {
  return (
    <main className="container-page max-w-3xl py-12 md:py-16">
      {/* Breadcrumb */}
      <nav className="mb-8" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 text-sm text-muted-foreground">
          <li><Link href="/" className="hover:text-foreground">Startseite</Link></li>
          <li>/</li>
          <li className="text-foreground font-medium">Cookie-Richtlinie</li>
        </ol>
      </nav>

      <h1 className="text-3xl md:text-4xl font-bold mb-8">Cookie-Richtlinie</h1>
      
      <div className="prose prose-neutral max-w-none">
        <p className="lead text-lg text-muted-foreground mb-8">
          Diese Cookie-Richtlinie erklärt, was Cookies sind und wie wir sie auf 
          CMM24.de verwenden.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">Was sind Cookies?</h2>
        <p className="text-muted-foreground mb-4">
          Cookies sind kleine Textdateien, die auf Ihrem Computer oder Mobilgerät 
          gespeichert werden, wenn Sie eine Website besuchen. Sie werden häufig 
          verwendet, um Websites funktionsfähig zu machen oder effizienter zu 
          gestalten, sowie um den Betreibern der Website Informationen zu liefern.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">Arten von Cookies, die wir verwenden</h2>

        <h3 className="text-lg font-semibold mt-6 mb-3">1. Notwendige Cookies</h3>
        <p className="text-muted-foreground mb-4">
          Diese Cookies sind für das Funktionieren der Website unbedingt erforderlich 
          und können in unseren Systemen nicht deaktiviert werden. Sie werden in der 
          Regel nur als Reaktion auf von Ihnen getätigte Aktionen gesetzt, die einer 
          Dienstanforderung entsprechen, wie etwa dem Festlegen Ihrer 
          Datenschutzeinstellungen, dem Anmelden oder dem Ausfüllen von Formularen.
        </p>
        <div className="bg-muted/50 rounded-lg p-4 mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 font-medium">Cookie</th>
                <th className="text-left py-2 font-medium">Zweck</th>
                <th className="text-left py-2 font-medium">Dauer</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-2 font-mono text-xs">sb-access-token</td>
                <td className="py-2 text-muted-foreground">Authentifizierung</td>
                <td className="py-2 text-muted-foreground">Session</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-mono text-xs">sb-refresh-token</td>
                <td className="py-2 text-muted-foreground">Authentifizierung</td>
                <td className="py-2 text-muted-foreground">7-30 Tage</td>
              </tr>
              <tr>
                <td className="py-2 font-mono text-xs">cookie-consent</td>
                <td className="py-2 text-muted-foreground">Speichert Ihre Cookie-Einstellungen</td>
                <td className="py-2 text-muted-foreground">1 Jahr</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-lg font-semibold mt-6 mb-3">2. Funktionale Cookies</h3>
        <p className="text-muted-foreground mb-4">
          Diese Cookies ermöglichen der Website, erweiterte Funktionalität und 
          Personalisierung bereitzustellen. Sie können von uns oder von 
          Drittanbietern gesetzt werden, deren Dienste wir auf unseren Seiten nutzen.
        </p>
        <div className="bg-muted/50 rounded-lg p-4 mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 font-medium">Cookie</th>
                <th className="text-left py-2 font-medium">Zweck</th>
                <th className="text-left py-2 font-medium">Dauer</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-2 font-mono text-xs">locale</td>
                <td className="py-2 text-muted-foreground">Speichert Ihre Spracheinstellung</td>
                <td className="py-2 text-muted-foreground">1 Jahr</td>
              </tr>
              <tr>
                <td className="py-2 font-mono text-xs">compare-items</td>
                <td className="py-2 text-muted-foreground">Speichert Vergleichsliste</td>
                <td className="py-2 text-muted-foreground">Session</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-lg font-semibold mt-6 mb-3">3. Analyse-Cookies</h3>
        <p className="text-muted-foreground mb-4">
          Wir verwenden Plausible Analytics, einen datenschutzfreundlichen 
          Analysedienst, der <strong>keine Cookies verwendet</strong> und keine 
          persönlichen Daten erfasst. Plausible ist vollständig DSGVO-konform und 
          erfordert keine Cookie-Einwilligung.
        </p>
        <p className="text-muted-foreground mb-4">
          Weitere Informationen finden Sie unter:{' '}
          <a 
            href="https://plausible.io/data-policy" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Plausible Datenschutz
          </a>
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">Cookies von Drittanbietern</h2>
        <p className="text-muted-foreground mb-4">
          Wir nutzen folgende Drittanbieter-Dienste, die möglicherweise Cookies setzen:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
          <li>
            <strong>Stripe</strong> – Für sichere Zahlungsabwicklung. 
            <a href="https://stripe.com/de/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1">
              Stripe Datenschutz
            </a>
          </li>
          <li>
            <strong>Mapbox</strong> – Für die Standortanzeige auf Karten.
            <a href="https://www.mapbox.com/legal/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1">
              Mapbox Datenschutz
            </a>
          </li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 mb-4">Wie Sie Cookies verwalten können</h2>
        <p className="text-muted-foreground mb-4">
          Sie können Ihre Cookie-Einstellungen jederzeit ändern. Die meisten Browser 
          ermöglichen es Ihnen, Cookies zu verwalten über die Browser-Einstellungen. 
          Hier sind Links zu den entsprechenden Anleitungen der gängigsten Browser:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
          <li>
            <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              Google Chrome
            </a>
          </li>
          <li>
            <a href="https://support.mozilla.org/de/kb/cookies-und-website-daten-in-firefox-loschen" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              Mozilla Firefox
            </a>
          </li>
          <li>
            <a href="https://support.apple.com/de-de/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              Apple Safari
            </a>
          </li>
          <li>
            <a href="https://support.microsoft.com/de-de/microsoft-edge/cookies-in-microsoft-edge-l%C3%B6schen-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              Microsoft Edge
            </a>
          </li>
        </ul>

        <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900 rounded-lg p-4 mt-6">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Hinweis:</strong> Das Deaktivieren von notwendigen Cookies kann 
            dazu führen, dass einige Funktionen der Website nicht mehr ordnungsgemäß 
            funktionieren.
          </p>
        </div>

        <h2 className="text-xl font-semibold mt-8 mb-4">Änderungen dieser Richtlinie</h2>
        <p className="text-muted-foreground mb-4">
          Wir können diese Cookie-Richtlinie von Zeit zu Zeit aktualisieren. Wir 
          empfehlen Ihnen, diese Seite regelmäßig zu besuchen, um über Änderungen 
          informiert zu bleiben.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">Kontakt</h2>
        <p className="text-muted-foreground">
          Bei Fragen zu unserer Cookie-Richtlinie kontaktieren Sie uns unter:{' '}
          <a href="mailto:datenschutz@cmm24.de" className="text-primary hover:underline">
            datenschutz@cmm24.de
          </a>
        </p>

        <p className="text-sm text-muted-foreground mt-8">
          Stand: Januar 2026
        </p>
      </div>
    </main>
  );
}
