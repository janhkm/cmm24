import type { Metadata } from 'next';
import Link from 'next/link';
import { companyInfo } from '@/data/mock-data';

export const metadata: Metadata = {
  title: 'Allgemeine Geschäftsbedingungen | CMM24',
  description: 'AGB der CMM24 GmbH – Nutzungsbedingungen für den Marktplatz für gebrauchte Koordinatenmessmaschinen.',
  robots: 'noindex, follow',
};

export default function AGBPage() {
  return (
    <main className="container-page max-w-3xl py-12 md:py-16">
      <h1 className="text-3xl font-bold mb-8">Allgemeine Geschäftsbedingungen</h1>
      
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <p className="text-muted-foreground mb-8">Stand: Januar 2026</p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">§ 1 Geltungsbereich</h2>
          <p>
            (1) Diese Allgemeinen Geschäftsbedingungen gelten für die Nutzung der Plattform CMM24 
            ({companyInfo.name}, {companyInfo.street}, {companyInfo.postalCode} {companyInfo.city}).
          </p>
          <p className="mt-4">
            (2) CMM24 ist ein B2B-Marktplatz, der Anbieter und Interessenten von gebrauchten 
            Koordinatenmessmaschinen zusammenbringt. CMM24 ist selbst nicht Partei der Kaufverträge.
          </p>
          <p className="mt-4">
            (3) Die Nutzung der Plattform richtet sich ausschließlich an Unternehmer im Sinne von 
            § 14 BGB.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">§ 2 Leistungen von CMM24</h2>
          <p>(1) CMM24 stellt eine Online-Plattform zur Verfügung, auf der:</p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>Verkäufer Inserate für gebrauchte Koordinatenmessmaschinen erstellen können</li>
            <li>Käufer nach passenden Maschinen suchen können</li>
            <li>Käufer Anfragen an Verkäufer senden können</li>
          </ul>
          <p className="mt-4">
            (2) CMM24 ist nicht Vertragspartner der zwischen Käufer und Verkäufer geschlossenen 
            Kaufverträge. Die Vertragsverhandlungen und der Vertragsschluss erfolgen direkt zwischen 
            den Parteien.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">§ 3 Registrierung und Nutzerkonto</h2>
          <p>
            (1) Für das Erstellen von Inseraten ist eine Registrierung erforderlich. Die Suche und 
            das Ansehen von Inseraten ist ohne Registrierung möglich.
          </p>
          <p className="mt-4">
            (2) Der Nutzer ist verpflichtet, bei der Registrierung wahrheitsgemäße Angaben zu machen 
            und diese aktuell zu halten.
          </p>
          <p className="mt-4">
            (3) Zugangsdaten sind vertraulich zu behandeln und vor dem Zugriff Dritter zu schützen.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">§ 4 Pflichten der Verkäufer</h2>
          <p>(1) Verkäufer verpflichten sich:</p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>Nur wahrheitsgemäße Angaben zu den angebotenen Maschinen zu machen</li>
            <li>Eigene Bilder der angebotenen Maschine zu verwenden</li>
            <li>Anfragen zeitnah zu beantworten (empfohlen: innerhalb von 48 Stunden)</li>
            <li>Inserate zu aktualisieren oder zu entfernen, wenn die Maschine verkauft ist</li>
          </ul>
          <p className="mt-4">
            (2) Es ist untersagt, irreführende oder falsche Angaben zu machen, insbesondere bezüglich 
            Zustand, Genauigkeit, Baujahr oder Preis.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">§ 5 Gebühren und Zahlungsbedingungen</h2>
          <p>
            (1) Die aktuellen Preise für die verschiedenen Verkäufer-Pläne sind auf der Preisseite 
            einsehbar.
          </p>
          <p className="mt-4">
            (2) Die Gebühren für kostenpflichtige Pläne werden monatlich oder jährlich im Voraus fällig.
          </p>
          <p className="mt-4">
            (3) Es werden keine Verkaufsprovisionen erhoben. Der Verkaufserlös verbleibt vollständig 
            beim Verkäufer.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">§ 6 Haftung</h2>
          <p>
            (1) CMM24 übernimmt keine Haftung für die Richtigkeit der von Verkäufern eingestellten 
            Inhalte.
          </p>
          <p className="mt-4">
            (2) CMM24 haftet nicht für Schäden, die aus Verträgen zwischen Käufern und Verkäufern 
            entstehen.
          </p>
          <p className="mt-4">
            (3) Die Haftung von CMM24 für eigene Pflichtverletzungen ist auf Vorsatz und grobe 
            Fahrlässigkeit beschränkt.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">§ 7 Inserat-Prüfung</h2>
          <p>
            (1) CMM24 prüft Inserate vor der Veröffentlichung auf Vollständigkeit und Plausibilität.
          </p>
          <p className="mt-4">
            (2) CMM24 behält sich das Recht vor, Inserate ohne Angabe von Gründen abzulehnen oder 
            zu entfernen, insbesondere bei Verstoß gegen diese AGB oder geltendes Recht.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">§ 8 Kündigung</h2>
          <p>
            (1) Der Free-Plan kann jederzeit ohne Einhaltung einer Frist gekündigt werden.
          </p>
          <p className="mt-4">
            (2) Kostenpflichtige Pläne können mit einer Frist von 30 Tagen zum Ende des 
            Abrechnungszeitraums gekündigt werden.
          </p>
          <p className="mt-4">
            (3) Das Recht zur außerordentlichen Kündigung aus wichtigem Grund bleibt unberührt.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">§ 9 Änderung der AGB</h2>
          <p>
            CMM24 behält sich vor, diese AGB zu ändern. Änderungen werden per E-Mail angekündigt 
            und gelten als genehmigt, wenn der Nutzer nicht innerhalb von 30 Tagen widerspricht.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">§ 10 Schlussbestimmungen</h2>
          <p>
            (1) Es gilt das Recht der Bundesrepublik Deutschland.
          </p>
          <p className="mt-4">
            (2) Gerichtsstand ist München, soweit gesetzlich zulässig.
          </p>
          <p className="mt-4">
            (3) Sollten einzelne Bestimmungen unwirksam sein, bleibt die Wirksamkeit der übrigen 
            Bestimmungen unberührt.
          </p>
        </section>
      </div>

      <div className="mt-12 pt-8 border-t">
        <p className="text-sm text-muted-foreground">
          Siehe auch: <Link href="/impressum" className="text-primary hover:underline">Impressum</Link> | <Link href="/datenschutz" className="text-primary hover:underline">Datenschutzerklärung</Link>
        </p>
      </div>
    </main>
  );
}
