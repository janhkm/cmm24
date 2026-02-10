import type { Metadata } from 'next';
import Link from 'next/link';
import { companyInfo } from '@/data/content/company';

export const metadata: Metadata = {
  title: 'Impressum | CMM24',
  description: 'Impressum und rechtliche Informationen von CMM24 – Ihr Marktplatz für gebrauchte Koordinatenmessmaschinen.',
  robots: 'noindex, follow',
};

export default function ImpressumPage() {
  return (
    <main className="container-page max-w-3xl py-12 md:py-16">
      <h1 className="text-3xl font-bold mb-8">Impressum</h1>
      
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Angaben gemäß § 5 TMG</h2>
          <address className="not-italic">
            <p className="font-semibold">{companyInfo.name}</p>
            <p>{companyInfo.street}</p>
            <p>{companyInfo.postalCode} {companyInfo.city}</p>
            <p>{companyInfo.country}</p>
          </address>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Vertreten durch</h2>
          <p>Geschäftsführer: {companyInfo.managingDirector}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Kontakt</h2>
          <p>Telefon: {companyInfo.phone}</p>
          {companyInfo.fax && <p>Telefax: {companyInfo.fax}</p>}
          <p>E-Mail: <a href={`mailto:${companyInfo.email}`} className="text-primary hover:underline">{companyInfo.email}</a></p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Registereintrag</h2>
          <p>Eintragung im Handelsregister</p>
          <p>Registergericht: {companyInfo.registerCourt}</p>
          <p>Registernummer: {companyInfo.registerNumber}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Umsatzsteuer-ID</h2>
          <p>Umsatzsteuer-Identifikationsnummer gemäß § 27a Umsatzsteuergesetz:</p>
          <p>{companyInfo.vatId}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Streitschlichtung</h2>
          <p>
            Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{' '}
            <a 
              href="https://ec.europa.eu/consumers/odr/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              https://ec.europa.eu/consumers/odr/
            </a>
          </p>
          <p className="mt-4">
            Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer 
            Verbraucherschlichtungsstelle teilzunehmen.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Haftung für Inhalte</h2>
          <p>
            Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach 
            den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter 
            jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen 
            oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
          </p>
          <p className="mt-4">
            Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen 
            Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt 
            der Kenntnis einer konkreten Rechtsverletzung möglich.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Haftung für Links</h2>
          <p>
            Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. 
            Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der 
            verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Urheberrecht</h2>
          <p>
            Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem 
            deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung 
            außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors 
            bzw. Erstellers.
          </p>
        </section>
      </div>

      <div className="mt-12 pt-8 border-t">
        <p className="text-sm text-muted-foreground">
          Siehe auch: <Link href="/datenschutz" className="text-primary hover:underline">Datenschutzerklärung</Link> | <Link href="/agb" className="text-primary hover:underline">AGB</Link>
        </p>
      </div>
    </main>
  );
}
