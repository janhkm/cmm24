import type { Metadata } from 'next';
import Link from 'next/link';
import { companyInfo } from '@/data/content/company';

export const metadata: Metadata = {
  title: 'Datenschutzerklärung | CMM24',
  description: 'Datenschutzerklärung von CMM24 – Informationen zur Verarbeitung Ihrer personenbezogenen Daten gemäß DSGVO.',
  robots: 'noindex, follow',
};

export default function DatenschutzPage() {
  return (
    <main className="container-page max-w-3xl py-12 md:py-16">
      <h1 className="text-3xl font-bold mb-8">Datenschutzerklärung</h1>
      
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <p className="text-muted-foreground mb-8">Stand: Februar 2026</p>

        {/* ==================== 1. Verantwortlicher ==================== */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">1. Verantwortlicher</h2>
          <p>Verantwortlicher im Sinne der Datenschutz-Grundverordnung (DSGVO) und anderer nationaler Datenschutzgesetze sowie sonstiger datenschutzrechtlicher Bestimmungen ist:</p>
          <address className="not-italic mt-4">
            <p className="font-semibold">{companyInfo.name}</p>
            <p>{companyInfo.street}</p>
            <p>{companyInfo.postalCode} {companyInfo.city}</p>
            <p>{companyInfo.country}</p>
            <p className="mt-2">Geschäftsführer: {companyInfo.managingDirector}</p>
            <p>E-Mail: <a href={`mailto:${companyInfo.email}`} className="text-primary hover:underline">{companyInfo.email}</a></p>
            <p>Telefon: {companyInfo.phone}</p>
          </address>
        </section>

        {/* ==================== 1a. Datenschutzbeauftragter ==================== */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">1a. Datenschutzbeauftragter</h2>
          <p>
            Für Fragen zum Datenschutz und zur Ausübung Ihrer Rechte als betroffene Person 
            können Sie sich jederzeit an unseren Datenschutzbeauftragten wenden:
          </p>
          <address className="not-italic mt-4">
            <p>E-Mail: <a href="mailto:datenschutz@cmm24.de" className="text-primary hover:underline">datenschutz@cmm24.de</a></p>
            <p className="mt-2">{companyInfo.name}</p>
            <p>z. Hd. Datenschutzbeauftragter</p>
            <p>{companyInfo.street}</p>
            <p>{companyInfo.postalCode} {companyInfo.city}</p>
          </address>
        </section>

        {/* ==================== 2. Übersicht der Verarbeitungen ==================== */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">2. Übersicht der Verarbeitungen</h2>
          <p>
            CMM24 ist eine B2B-Plattform für den Handel mit gebrauchten Koordinatenmessmaschinen (KMM). 
            Die Plattform richtet sich an gewerbliche Nutzer im gesamten Europäischen Wirtschaftsraum (EWR) 
            und umfasst zwei Nutzergruppen:
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li><strong>Käufer (Buyer):</strong> Nutzer, die Maschinen suchen, vergleichen und Anfragen an Verkäufer senden.</li>
            <li><strong>Verkäufer (Seller):</strong> Unternehmen, die Maschinen inserieren, Anfragen verwalten und über kostenpflichtige Abonnements erweiterte Funktionen nutzen.</li>
          </ul>
          <p className="mt-4">
            Diese Datenschutzerklärung gilt für alle Nutzer der Plattform unabhängig von ihrem Sitzstaat 
            innerhalb des EWR. Die nachfolgende Übersicht fasst die Arten der verarbeiteten Daten und die 
            Zwecke ihrer Verarbeitung zusammen und verweist auf die betroffenen Personen.
          </p>
        </section>

        {/* ==================== 3. Rechtsgrundlagen ==================== */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">3. Rechtsgrundlagen der Verarbeitung</h2>
          <p>Im Folgenden erhalten Sie eine Übersicht der Rechtsgrundlagen der DSGVO, auf deren Basis wir personenbezogene Daten verarbeiten:</p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li><strong>Einwilligung (Art. 6 Abs. 1 lit. a DSGVO):</strong> Die betroffene Person hat ihre Einwilligung in die Verarbeitung der sie betreffenden personenbezogenen Daten für einen oder mehrere bestimmte Zwecke gegeben (z.&nbsp;B. Newsletter, Analytics).</li>
            <li><strong>Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO):</strong> Die Verarbeitung ist für die Erfüllung eines Vertrags, dessen Vertragspartei die betroffene Person ist, oder zur Durchführung vorvertraglicher Maßnahmen erforderlich (z.&nbsp;B. Registrierung, Inserat-Erstellung, Abonnement-Verwaltung).</li>
            <li><strong>Rechtliche Verpflichtung (Art. 6 Abs. 1 lit. c DSGVO):</strong> Die Verarbeitung ist zur Erfüllung einer rechtlichen Verpflichtung erforderlich, der der Verantwortliche unterliegt (z.&nbsp;B. steuerliche Aufbewahrungspflichten für Rechnungen).</li>
            <li><strong>Berechtigtes Interesse (Art. 6 Abs. 1 lit. f DSGVO):</strong> Die Verarbeitung ist zur Wahrung berechtigter Interessen des Verantwortlichen oder eines Dritten erforderlich, sofern nicht die Interessen oder Grundrechte der betroffenen Person überwiegen (z.&nbsp;B. Betrugsprävention, Sicherheit, Analyse).</li>
          </ul>
        </section>

        {/* ==================== 4. Ihre Rechte ==================== */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">4. Rechte der betroffenen Personen</h2>
          <p>Ihnen stehen als betroffene Person nach der DSGVO verschiedene Rechte zu:</p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li><strong>Auskunftsrecht (Art. 15 DSGVO):</strong> Sie haben das Recht, eine Bestätigung darüber zu verlangen, ob betreffende Daten verarbeitet werden, und auf Auskunft über diese Daten sowie auf weitere Informationen und Kopie der Daten.</li>
            <li><strong>Recht auf Berichtigung (Art. 16 DSGVO):</strong> Sie haben das Recht, die Vervollständigung der Sie betreffenden Daten oder die Berichtigung der Sie betreffenden unrichtigen Daten zu verlangen.</li>
            <li><strong>Recht auf Löschung (Art. 17 DSGVO):</strong> Sie haben das Recht zu verlangen, dass betreffende Daten unverzüglich gelöscht werden. Alternativ können Sie nach Art. 18 DSGVO eine Einschränkung der Datenverarbeitung verlangen.</li>
            <li><strong>Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO):</strong> Sie haben das Recht, die Einschränkung der Verarbeitung Ihrer Daten zu verlangen, wenn eine der in Art. 18 DSGVO genannten Voraussetzungen gegeben ist.</li>
            <li><strong>Recht auf Datenübertragbarkeit (Art. 20 DSGVO):</strong> Sie haben das Recht, die Sie betreffenden Daten, die Sie uns bereitgestellt haben, in einem strukturierten, gängigen und maschinenlesbaren Format zu erhalten.</li>
            <li><strong>Widerspruchsrecht (Art. 21 DSGVO):</strong> Sie haben das Recht, aus Gründen, die sich aus Ihrer besonderen Situation ergeben, jederzeit gegen die Verarbeitung der Sie betreffenden personenbezogenen Daten Widerspruch einzulegen. Dies gilt auch für ein auf diese Bestimmungen gestütztes Profiling.</li>
            <li><strong>Widerrufsrecht bei Einwilligung (Art. 7 Abs. 3 DSGVO):</strong> Sie haben das Recht, erteilte Einwilligungen jederzeit mit Wirkung für die Zukunft zu widerrufen.</li>
            <li><strong>Beschwerderecht (Art. 77 DSGVO):</strong> Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde über die Verarbeitung Ihrer personenbezogenen Daten zu beschweren.</li>
          </ul>
          <p className="mt-4">
            Zur Ausübung Ihrer Rechte wenden Sie sich bitte an unseren Datenschutzbeauftragten 
            unter <a href="mailto:datenschutz@cmm24.de" className="text-primary hover:underline">datenschutz@cmm24.de</a> oder 
            an <a href={`mailto:${companyInfo.email}`} className="text-primary hover:underline">{companyInfo.email}</a>. 
            Wir werden Ihre Anfrage unverzüglich, spätestens jedoch innerhalb eines Monats bearbeiten 
            (Art. 12 Abs. 3 DSGVO). In komplexen Fällen kann die Frist um weitere zwei Monate 
            verlängert werden, worüber wir Sie rechtzeitig informieren.
          </p>
        </section>

        {/* ==================== 5. SSL/TLS ==================== */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">5. SSL-/TLS-Verschlüsselung</h2>
          <p>
            Diese Website nutzt aus Sicherheitsgründen und zum Schutz der Übertragung vertraulicher Inhalte 
            eine SSL-/TLS-Verschlüsselung. Eine verschlüsselte Verbindung erkennen Sie daran, dass die 
            Adresszeile des Browsers von &quot;http://&quot; auf &quot;https://&quot; wechselt und an dem Schloss-Symbol 
            in Ihrer Browserzeile. Wenn die SSL-/TLS-Verschlüsselung aktiviert ist, können die Daten, 
            die Sie an uns übermitteln, nicht von Dritten mitgelesen werden.
          </p>
        </section>

        {/* ==================== 6. Hosting ==================== */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">6. Hosting und Infrastruktur</h2>
          
          <h3 className="text-lg font-medium mt-6 mb-3">6.1 Vercel (Website-Hosting)</h3>
          <p>
            Unsere Website wird bei Vercel Inc. (340 S Lemon Ave #4133, Walnut, CA 91789, USA) gehostet. 
            Vercel verarbeitet zum Zweck der Bereitstellung der Website technisch notwendige Daten wie 
            IP-Adressen, Browsertyp, Betriebssystem und Zugriffszeiten. Vercel ist nach dem 
            EU-US Data Privacy Framework zertifiziert und gewährleistet damit ein angemessenes Datenschutzniveau.
          </p>
          <p className="mt-2">
            Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einer zuverlässigen Bereitstellung der Website).
          </p>
          <p className="mt-2">
            Weitere Informationen: <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Vercel Datenschutzerklärung</a>
          </p>

          <h3 className="text-lg font-medium mt-6 mb-3">6.2 Supabase (Datenbank und Authentifizierung)</h3>
          <p>
            Für die Datenspeicherung und Nutzerverwaltung nutzen wir Supabase Inc. (970 Toa Payoh North #07-04, Singapore 318992). 
            Supabase speichert und verarbeitet sämtliche Nutzerdaten, Inserate, Anfragen und weitere plattformbezogene Daten 
            in einer PostgreSQL-Datenbank. Die Datenbank ist durch Row Level Security (RLS) geschützt, sodass Nutzer nur auf 
            ihre eigenen Daten zugreifen können. Supabase verarbeitet zudem Authentifizierungsdaten (E-Mail, Passwort-Hashes, 
            Session-Tokens). Es werden Standardvertragsklauseln (SCC) als Schutzmaßnahmen für die Datenübermittlung eingesetzt.
          </p>
          <p className="mt-2">
            Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) und Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an sicherer Datenspeicherung).
          </p>
          <p className="mt-2">
            Weitere Informationen: <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Supabase Datenschutzerklärung</a>
          </p>

          <h3 className="text-lg font-medium mt-6 mb-3">6.3 Supabase Storage (Dateispeicherung)</h3>
          <p>
            Für die Speicherung von hochgeladenen Dateien (Maschinenbilder, Dokumente, Firmenlogos, Profilbilder) 
            nutzen wir den integrierten Speicherdienst von Supabase. Hochgeladene Bilder werden serverseitig optimiert 
            (Konvertierung zu WebP, Erstellung von Thumbnails). Folgende Speicherbereiche werden genutzt:
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li><strong>Inserat-Medien:</strong> Bilder (JPEG, PNG, WebP, max. 10 MB) und Dokumente (PDF, max. 20 MB) zu Inseraten</li>
            <li><strong>Firmenlogos:</strong> Logos der Verkäufer-Unternehmen (JPEG, PNG, WebP, SVG, max. 2 MB)</li>
            <li><strong>Profilbilder:</strong> Avatare der Nutzer (JPEG, PNG, WebP, max. 2 MB)</li>
            <li><strong>Dokumente:</strong> Nicht-öffentliche PDF-Dokumente (max. 10 MB)</li>
          </ul>
          <p className="mt-2">
            Die Zugriffskontrolle erfolgt über RLS-Policies. Öffentliche Bilder (Inserate, Logos) sind für alle einsehbar, 
            private Dokumente nur für den jeweiligen Eigentümer.
          </p>
        </section>

        {/* ==================== 7. Cookies ==================== */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">7. Cookies und lokale Speicherung</h2>
          <p>
            Cookies sind kleine Textdateien, die auf Ihrem Endgerät gespeichert werden. Wir setzen Cookies 
            und vergleichbare Technologien ein, um unsere Website funktional zu gestalten.
          </p>

          <h3 className="text-lg font-medium mt-6 mb-3">7.1 Technisch notwendige Cookies</h3>
          <p>
            Diese Cookies sind für den Betrieb der Website zwingend erforderlich und können nicht deaktiviert werden:
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li><strong>Supabase Auth-Token:</strong> Session-Cookie zur Authentifizierung eingeloggter Nutzer. Enthält einen verschlüsselten JWT-Token. Eigenschaften: httpOnly, secure (in Production), sameSite: lax.</li>
            <li><strong>PKCE Code Verifier:</strong> Kurzlebiges Cookie für den sicheren Authentifizierungsablauf (Proof Key for Code Exchange).</li>
          </ul>
          <p className="mt-2">
            Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse am funktionsfähigen Betrieb der Website) 
            bzw. § 25 Abs. 2 Nr. 2 TDDDG (technisch erforderlich).
          </p>

          <h3 className="text-lg font-medium mt-6 mb-3">7.2 Funktionale Cookies</h3>
          <p>
            Diese Cookies ermöglichen erweiterte Funktionalitäten und werden nur mit Ihrer Einwilligung gesetzt:
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li><strong>Cookie-Consent-Einstellung:</strong> Speicherung Ihrer Cookie-Präferenzen im LocalStorage (Schlüssel: cmm24-cookie-consent).</li>
            <li><strong>Vergleichsliste:</strong> Speicherung der ausgewählten Maschinen-IDs für den Vergleich im LocalStorage.</li>
          </ul>
          <p className="mt-2">
            Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO (Einwilligung).
          </p>

          <h3 className="text-lg font-medium mt-6 mb-3">7.3 Analyse-Cookies</h3>
          <p>
            Analyse-Cookies werden nur mit Ihrer ausdrücklichen Einwilligung über unser Cookie-Banner gesetzt. 
            Näheres hierzu finden Sie im Abschnitt &quot;Analyse-Tools und Fehlerüberwachung&quot;.
          </p>
          <p className="mt-2">
            Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO (Einwilligung).
          </p>

          <h3 className="text-lg font-medium mt-6 mb-3">7.4 Cookie-Einstellungen verwalten</h3>
          <p>
            Sie können Ihre Cookie-Einstellungen jederzeit über das Cookie-Banner anpassen, das Sie über den 
            Link im Footer der Website erreichen. Darüber hinaus können Sie Cookies in Ihren Browser-Einstellungen 
            verwalten oder löschen.
          </p>
        </section>

        {/* ==================== 8. Server-Log-Dateien ==================== */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">8. Server-Log-Dateien</h2>
          <p>
            Der Hosting-Provider (Vercel) erhebt und speichert automatisch Informationen in sogenannten Server-Log-Dateien, 
            die Ihr Browser automatisch an uns übermittelt:
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>Browsertyp und -version</li>
            <li>Verwendetes Betriebssystem</li>
            <li>Referrer-URL (zuvor besuchte Seite)</li>
            <li>Hostname des zugreifenden Rechners</li>
            <li>IP-Adresse</li>
            <li>Uhrzeit der Serveranfrage</li>
          </ul>
          <p className="mt-4">
            Eine Zusammenführung dieser Daten mit anderen Datenquellen wird nicht vorgenommen. 
            Die Erfassung dieser Daten erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO. 
            Der Websitebetreiber hat ein berechtigtes Interesse an der technisch fehlerfreien Darstellung 
            und Optimierung seiner Website.
          </p>
        </section>

        {/* ==================== 9. Registrierung ==================== */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">9. Registrierung und Nutzerkonto</h2>
          
          <h3 className="text-lg font-medium mt-6 mb-3">9.1 Registrierung als Käufer (Buyer)</h3>
          <p>Käufer können sich kostenlos registrieren. Bei der Registrierung erheben wir:</p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>Vollständiger Name (Pflichtfeld)</li>
            <li>E-Mail-Adresse (Pflichtfeld)</li>
            <li>Passwort (Pflichtfeld, wird als Hash gespeichert, nie im Klartext)</li>
            <li>Akzeptanz der AGB und Datenschutzerklärung (Pflichtfeld, mit Zeitstempel)</li>
            <li>Marketing-Einwilligung (optional)</li>
            <li>Nutzungsabsicht (Kauf/Verkauf)</li>
          </ul>
          <p className="mt-4">
            Nach der Registrierung erhalten Sie eine Bestätigungs-E-Mail zur Verifizierung Ihrer E-Mail-Adresse. 
            Ohne Verifizierung ist die Nutzung bestimmter Funktionen eingeschränkt.
          </p>

          <h3 className="text-lg font-medium mt-6 mb-3">9.2 Registrierung als Verkäufer (Seller)</h3>
          <p>Zusätzlich zu den unter 9.1 genannten Daten erheben wir bei Verkäufern:</p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>Firmenname (Pflichtfeld)</li>
            <li>Telefonnummer (optional)</li>
            <li>Geschätzte Maschinenanzahl (für die Planempfehlung)</li>
            <li>Gewünschter Abonnement-Plan (Free, Starter, Business)</li>
            <li>Abrechnungsintervall (monatlich/jährlich)</li>
          </ul>
          <p className="mt-4">
            Für Verkäufer wird automatisch ein Firmen-Account erstellt. Bei der Wahl eines kostenpflichtigen 
            Plans werden Sie zur Zahlungsabwicklung an Stripe weitergeleitet (siehe Abschnitt &quot;Zahlungsabwicklung&quot;).
          </p>

          <h3 className="text-lg font-medium mt-6 mb-3">9.3 Nutzer-Profildaten</h3>
          <p>In Ihrem Nutzerprofil werden folgende Daten gespeichert und können von Ihnen bearbeitet werden:</p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>Vollständiger Name</li>
            <li>E-Mail-Adresse (nicht änderbar, dient als Login-Kennung)</li>
            <li>Telefonnummer (optional)</li>
            <li>Profilbild/Avatar (optional)</li>
            <li>Rolle (Nutzer/Admin)</li>
            <li>E-Mail-Verifizierungsstatus</li>
          </ul>

          <h3 className="text-lg font-medium mt-6 mb-3">9.4 Anmeldung (Login)</h3>
          <p>Für die Anmeldung bieten wir zwei Methoden an:</p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li><strong>E-Mail und Passwort:</strong> Klassischer Login mit E-Mail-Adresse und Passwort.</li>
            <li><strong>Magic Link:</strong> Passwortloser Login per Einmal-Link, der an Ihre E-Mail-Adresse gesendet wird.</li>
          </ul>
          <p className="mt-4">
            Die Session-Verwaltung erfolgt über verschlüsselte JWT-Tokens in httpOnly-Cookies. 
            Sessions werden automatisch verlängert, solange Sie aktiv sind.
          </p>

          <h3 className="text-lg font-medium mt-6 mb-3">9.5 Passwort-Wiederherstellung</h3>
          <p>
            Bei der Passwort-Wiederherstellung wird ein zeitlich begrenzter Reset-Link an Ihre registrierte 
            E-Mail-Adresse gesendet. Es werden keine Passwörter im Klartext übermittelt. 
            Zur Missbrauchsprävention ist die Anzahl der Anfragen begrenzt (3 pro Stunde).
          </p>
          <p className="mt-2">
            Rechtsgrundlage für die Registrierung und Kontoverwaltung: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung).
          </p>
        </section>

        {/* ==================== 10. Käufer-Funktionen ==================== */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">10. Datenverarbeitung für Käufer (Buyer)</h2>

          <h3 className="text-lg font-medium mt-6 mb-3">10.1 Maschinensuche und -vergleich</h3>
          <p>
            Bei der Nutzung der Suchfunktion und des Maschinenvergleichs werden keine personenbezogenen Daten 
            gespeichert. Die Vergleichsliste wird ausschließlich lokal in Ihrem Browser (LocalStorage) gespeichert 
            und ist für uns nicht einsehbar.
          </p>

          <h3 className="text-lg font-medium mt-6 mb-3">10.2 Anfragen an Verkäufer</h3>
          <p>
            Wenn Sie eine Anfrage zu einer Maschine an einen Verkäufer senden, erheben wir folgende Daten:
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>Name (Pflichtfeld)</li>
            <li>E-Mail-Adresse (Pflichtfeld)</li>
            <li>Telefonnummer (optional)</li>
            <li>Firmenname (optional)</li>
            <li>Nachricht (Pflichtfeld)</li>
          </ul>
          <p className="mt-4">
            <strong>Wichtig:</strong> Ihre Kontaktdaten (Name, E-Mail, ggf. Telefon und Firma) sowie Ihre Nachricht 
            werden an den jeweiligen Verkäufer weitergeleitet, damit dieser Ihre Anfrage bearbeiten kann. 
            Sie werden vor dem Absenden ausdrücklich über diese Datenweitergabe informiert und müssen dieser 
            per Checkbox zustimmen.
          </p>
          <p className="mt-2">
            Sind Sie als Käufer eingeloggt, wird Ihre Anfrage automatisch mit Ihrem Profil verknüpft, 
            sodass Sie den Status Ihrer Anfragen im Käufer-Dashboard einsehen können.
          </p>
          <p className="mt-2">
            Der Verkäufer kann Ihre Anfrage in seinem Dashboard verwalten, statusbezogen nachverfolgen 
            und interne Notizen hinzufügen. Diese internen Notizen sind für Sie nicht sichtbar.
          </p>
          <p className="mt-2">
            Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (vorvertragliche Maßnahmen) und Art. 6 Abs. 1 lit. a DSGVO 
            (Einwilligung in die Datenweitergabe an den Verkäufer).
          </p>

          <h3 className="text-lg font-medium mt-6 mb-3">10.3 Käufer-Dashboard</h3>
          <p>
            Eingeloggte Käufer haben Zugang zu einem Dashboard, das folgende Daten anzeigt:
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>Übersicht der eigenen Anfragen (Gesamt, Offen, Beantwortet)</li>
            <li>Detailansicht einzelner Anfragen mit Status</li>
            <li>Profil- und Kontoeinstellungen</li>
          </ul>
          <p className="mt-2">
            Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung).
          </p>
        </section>

        {/* ==================== 11. Verkäufer-Funktionen ==================== */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">11. Datenverarbeitung für Verkäufer (Seller)</h2>

          <h3 className="text-lg font-medium mt-6 mb-3">11.1 Firmenprofil und Account</h3>
          <p>Verkäufer verwalten ein Firmenprofil mit folgenden Daten:</p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>Firmenname (Pflichtfeld)</li>
            <li>Rechtsform (GmbH, AG, KG, OHG, Einzelunternehmen, GbR, UG, Sonstige)</li>
            <li>Geschäftsadresse (Straße, PLZ, Stadt, Land)</li>
            <li>USt-IdNr. (optional)</li>
            <li>Website (optional)</li>
            <li>Telefonnummer (optional)</li>
            <li>Firmenbeschreibung (optional, max. 1.000 Zeichen)</li>
            <li>Firmenlogo (optional, max. 2 MB)</li>
            <li>E-Mail-Signatur für automatische E-Mails (optional)</li>
          </ul>
          <p className="mt-2">
            Diese Daten werden teilweise öffentlich angezeigt (Firmenname, Logo, Standort) und 
            teilweise nur intern genutzt (USt-IdNr., vollständige Adresse für Rechnungen).
          </p>
          <p className="mt-2">
            Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung).
          </p>

          <h3 className="text-lg font-medium mt-6 mb-3">11.2 Inserate (Listings)</h3>
          <p>Beim Erstellen und Verwalten von Inseraten werden folgende Daten verarbeitet:</p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li><strong>Stammdaten:</strong> Hersteller, Modell, Titel, Baujahr, Zustand, Preis, Verhandelbarkeit</li>
            <li><strong>Technische Daten:</strong> Messbereich (X/Y/Z), Genauigkeit (MPEE), Software, Steuerung, Tastsystem</li>
            <li><strong>Standort:</strong> Land, Stadt, PLZ (ggf. Koordinaten für Kartenanzeige)</li>
            <li><strong>Beschreibung:</strong> Freitextbeschreibung der Maschine (50–5.000 Zeichen)</li>
            <li><strong>Medien:</strong> Bilder (JPEG, PNG, WebP, max. 10 MB pro Bild) und Dokumente (PDF, max. 20 MB)</li>
          </ul>
          <p className="mt-2">
            Inserate durchlaufen einen Prüfungsprozess (Draft → In Prüfung → Aktiv/Abgelehnt). 
            Aktive Inserate sind öffentlich einsehbar. Bilder werden serverseitig optimiert und in verschiedenen 
            Größen gespeichert (Original, Medium, Thumbnail).
          </p>
          <p className="mt-2">
            Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung).
          </p>

          <h3 className="text-lg font-medium mt-6 mb-3">11.3 Anfragen-Management</h3>
          <p>Verkäufer können eingehende Anfragen über folgende Funktionen verwalten:</p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li><strong>Anfragen-Übersicht:</strong> Alle eingehenden Anfragen mit Kontaktdaten des Käufers, verknüpftem Inserat und Status</li>
            <li><strong>Status-Verwaltung:</strong> Anfragen als Neu, Kontaktiert, Angebot gesendet, Gewonnen oder Verloren markieren</li>
            <li><strong>Interne Notizen:</strong> Freitext-Notizen zu jeder Anfrage (nur für den Verkäufer sichtbar)</li>
            <li><strong>Pipeline-Ansicht (Business-Plan):</strong> Kanban-Board zur visuellen Verwaltung von Anfragen mit Drag-&amp;-Drop</li>
          </ul>
          <p className="mt-2">
            Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) und Art. 6 Abs. 1 lit. f DSGVO 
            (berechtigtes Interesse an effizienter Anfragenverwaltung).
          </p>

          <h3 className="text-lg font-medium mt-6 mb-3">11.4 CRM – Kontaktverwaltung (Business-Plan)</h3>
          <p>Verkäufer im Business-Plan können eine Kontaktverwaltung (CRM) nutzen, in der folgende Daten gespeichert werden:</p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>Vorname und Nachname</li>
            <li>E-Mail-Adresse</li>
            <li>Telefon- und Mobilnummer</li>
            <li>Firmenname und Position</li>
            <li>Geschäftsadresse</li>
            <li>Tags und Kategorisierung</li>
            <li>Lead-Score und Lead-Status</li>
            <li>Notizen und Aktivitätsprotokoll (Anrufe, E-Mails, Meetings, Statusänderungen)</li>
            <li>Verknüpfung mit Anfragen und deren Wert</li>
          </ul>
          <p className="mt-2">
            <strong>Hinweis:</strong> Die hier gespeicherten personenbezogenen Daten unterliegen der Verantwortung des 
            jeweiligen Verkäufers als eigenständiger Verantwortlicher im Sinne der DSGVO. CMM24 stellt 
            lediglich die technische Infrastruktur bereit.
          </p>
          <p className="mt-2">
            Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) und Art. 6 Abs. 1 lit. f DSGVO 
            (berechtigtes Interesse an der Geschäftsanbahnung).
          </p>

          <h3 className="text-lg font-medium mt-6 mb-3">11.5 E-Mail-Integration (Starter-/Business-Plan)</h3>
          <p>Verkäufer können ihr E-Mail-Konto (Microsoft Outlook/Gmail) mit CMM24 verknüpfen. Dabei werden verarbeitet:</p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li><strong>Verbindungsdaten:</strong> E-Mail-Provider, E-Mail-Adresse, verschlüsselte Access- und Refresh-Tokens (OAuth 2.0)</li>
            <li><strong>Synchronisierte E-Mails:</strong> Absender, Empfänger, CC-Adressen, Betreff, E-Mail-Inhalt (Text und HTML), Zeitstempel, Ordnerzuordnung</li>
            <li><strong>Verknüpfungen:</strong> Zuordnung von E-Mails zu Anfragen und Kontakten</li>
          </ul>
          <p className="mt-2">
            Die OAuth-Tokens werden verschlüsselt in der Datenbank gespeichert und dienen ausschließlich der 
            E-Mail-Synchronisation. Sie können die Verknüpfung jederzeit aufheben, wodurch alle synchronisierten 
            E-Mails und Tokens gelöscht werden.
          </p>
          <p className="mt-2">
            Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO (Einwilligung durch aktive Verknüpfung).
          </p>

          <h3 className="text-lg font-medium mt-6 mb-3">11.6 Auto-Reply (Business-Plan)</h3>
          <p>Verkäufer im Business-Plan können automatische Antworten auf eingehende Anfragen konfigurieren:</p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>Betreff und Nachrichtentext der automatischen Antwort</li>
            <li>Zeitliche Verzögerung (0–60 Minuten)</li>
            <li>Arbeitszeiten und -tage für den Versand</li>
            <li>Optionale Anhänge: Inserat-Details und/oder Signatur</li>
          </ul>
          <p className="mt-2">
            Automatische Antworten werden über eine Warteschlange verarbeitet. Die E-Mail-Adresse und der Name 
            des Anfragenden werden für den automatischen Versand verwendet.
          </p>
          <p className="mt-2">
            Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung).
          </p>

          <h3 className="text-lg font-medium mt-6 mb-3">11.7 Team-Verwaltung (Business-Plan)</h3>
          <p>Verkäufer im Business-Plan können Teammitglieder einladen und verwalten:</p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li><strong>Einladung:</strong> E-Mail-Adresse und zugewiesene Rolle (Admin, Editor, Viewer)</li>
            <li><strong>Mitgliederverwaltung:</strong> Rollen ändern, Mitglieder deaktivieren/entfernen</li>
            <li><strong>Einladungs-Token:</strong> Zeitlich begrenzte Einladungslinks mit Ablaufdatum</li>
          </ul>
          <p className="mt-2">
            Teammitglieder erhalten je nach Rolle Zugriff auf verschiedene Bereiche des Verkäufer-Dashboards. 
            Die Rollenvergabe bestimmt, welche Daten eingesehen und bearbeitet werden können.
          </p>
          <p className="mt-2">
            Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung).
          </p>

          <h3 className="text-lg font-medium mt-6 mb-3">11.8 Statistiken und Auswertungen (Starter-/Business-Plan)</h3>
          <p>Verkäufer erhalten Zugang zu Statistiken über ihre Inserate:</p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>Gesamtaufrufe und Aufrufe pro Inserat</li>
            <li>Anzahl der Anfragen und Anfragen pro Inserat</li>
            <li>Konversionsrate (Verhältnis Anfragen zu Aufrufen)</li>
            <li>Zeitliche Auswertung (7/30/90/365 Tage)</li>
          </ul>
          <p className="mt-2">
            Die Aufrufe werden anonymisiert gezählt (Visitor-Hash ohne Rückschlussmöglichkeit auf den Besucher). 
            Es werden keine IP-Adressen oder personenbezogenen Daten der Besucher gespeichert.
          </p>
          <p className="mt-2">
            Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) und Art. 6 Abs. 1 lit. f DSGVO 
            (berechtigtes Interesse an Nutzungsauswertung).
          </p>

          <h3 className="text-lg font-medium mt-6 mb-3">11.9 API-Zugang (Business-Plan)</h3>
          <p>Verkäufer im Business-Plan können über eine API auf ihre Daten zugreifen:</p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li><strong>API-Schlüssel:</strong> Name, Berechtigungen (Lesen/Schreiben/Löschen), Ablaufdatum</li>
            <li><strong>Nutzungsprotokoll:</strong> Aufgerufene Endpunkte, HTTP-Methode, Statuscode, Antwortzeit, IP-Adresse, User-Agent</li>
          </ul>
          <p className="mt-2">
            API-Schlüssel werden gehasht gespeichert (nur der Präfix ist sichtbar). Der vollständige Schlüssel 
            wird nur einmal bei der Erstellung angezeigt. API-Zugriffe unterliegen einem Rate-Limit von 
            1.000 Anfragen pro Stunde.
          </p>
          <p className="mt-2">
            Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung).
          </p>
        </section>

        {/* ==================== 12. Kontaktformular ==================== */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">12. Kontaktformular und Kommunikation</h2>
          <p>
            Wenn Sie uns über das Kontaktformular kontaktieren, erheben wir:
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>Name (Pflichtfeld)</li>
            <li>E-Mail-Adresse (Pflichtfeld)</li>
            <li>Telefonnummer (optional)</li>
            <li>Firmenname (optional)</li>
            <li>Betreff (Auswahlfeld: Allgemein, Verkauf, Technisch, Abo, Partner, Presse, Sonstiges)</li>
            <li>Nachricht (Pflichtfeld, mind. 10 Zeichen)</li>
          </ul>
          <p className="mt-4">
            Die Daten werden zur Bearbeitung Ihrer Anfrage an unsere Support-E-Mail-Adresse weitergeleitet. 
            Sie erhalten eine automatische Bestätigungs-E-Mail. Die Anfrage ist auf 3 pro Stunde begrenzt 
            (Rate-Limiting zur Missbrauchsprävention).
          </p>
          <p className="mt-2">
            Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (vorvertragliche Maßnahmen) bzw. Art. 6 Abs. 1 lit. f DSGVO 
            (berechtigtes Interesse an der Beantwortung von Anfragen).
          </p>
        </section>

        {/* ==================== 13. Zahlungsabwicklung ==================== */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">13. Zahlungsabwicklung</h2>
          <p>
            Für die Zahlungsabwicklung der kostenpflichtigen Abonnements (Starter- und Business-Plan) 
            nutzen wir den Zahlungsdienstleister Stripe (Stripe Payments Europe, Ltd., 1 Grand Canal Street Lower, 
            Grand Canal Dock, Dublin, D02 H210, Irland).
          </p>

          <h3 className="text-lg font-medium mt-6 mb-3">13.1 An Stripe übermittelte Daten</h3>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>E-Mail-Adresse</li>
            <li>Name und Firmenname</li>
            <li>Rechnungsadresse</li>
            <li>USt-IdNr. (sofern angegeben)</li>
            <li>Zahlungsinformationen (Kreditkarte, SEPA-Lastschrift)</li>
            <li>Abonnement-Details (Plan, Intervall, Preis)</li>
          </ul>

          <h3 className="text-lg font-medium mt-6 mb-3">13.2 Von Stripe verarbeitete Daten</h3>
          <p>
            Stripe verarbeitet Ihre Zahlungsdaten direkt – wir haben <strong>keinen Zugriff</strong> auf 
            vollständige Kreditkartennummern oder Bankdaten. Bei uns werden lediglich gespeichert:
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>Stripe Customer ID (eindeutige Kennung)</li>
            <li>Stripe Subscription ID</li>
            <li>Rechnungen: Rechnungsnummer, Betrag, Währung, Status, Zeitraum, PDF-Link</li>
          </ul>

          <h3 className="text-lg font-medium mt-6 mb-3">13.3 Stripe Webhooks</h3>
          <p>
            Stripe übermittelt uns per Webhook-Benachrichtigungen über Zahlungsereignisse 
            (z.&nbsp;B. erfolgreiche Zahlung, Abonnement-Kündigung, fehlgeschlagene Zahlung). 
            Diese Ereignisse werden protokolliert und zur Aktualisierung des Abonnement-Status verwendet.
          </p>

          <h3 className="text-lg font-medium mt-6 mb-3">13.4 Stripe Customer Portal</h3>
          <p>
            Über das Stripe Customer Portal können Sie Ihre Zahlungsmethode verwalten, Rechnungen einsehen 
            und Ihr Abonnement kündigen. Die Verarbeitung erfolgt direkt bei Stripe.
          </p>
          <p className="mt-4">
            Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung).
          </p>
          <p className="mt-2">
            Datenschutzhinweise von Stripe:{' '}
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

        {/* ==================== 14. E-Mail-Versand ==================== */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">14. E-Mail-Versand</h2>
          <p>
            Für den Versand von System- und Transaktions-E-Mails nutzen wir den Dienst Resend 
            (Resend Inc., 2261 Market Street #5039, San Francisco, CA 94114, USA).
          </p>
          <p className="mt-4">
            Folgende E-Mail-Typen werden versendet:
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li><strong>Authentifizierung:</strong> Willkommens-E-Mail, E-Mail-Verifizierung, Passwort-Reset, Magic Links</li>
            <li><strong>Anfragen:</strong> Benachrichtigung an Verkäufer bei neuer Anfrage, Bestätigung an Käufer</li>
            <li><strong>Kontakt:</strong> Weiterleitung von Kontaktanfragen, Bestätigung an Absender</li>
            <li><strong>Team:</strong> Einladungs-E-Mails an Teammitglieder</li>
            <li><strong>Abonnement:</strong> Upgrade-Bestätigung, Zahlungsfehlschlag, Kündigung, Ablaufwarnung</li>
            <li><strong>Inserate:</strong> Freischaltung, Ablehnung mit Begründung</li>
            <li><strong>Account:</strong> Kontosperrung, Kontoverifizierung</li>
            <li><strong>Auto-Reply:</strong> Automatische Antworten auf Anfragen (wenn vom Verkäufer konfiguriert)</li>
          </ul>
          <p className="mt-4">
            An Resend werden E-Mail-Adressen der Empfänger sowie die E-Mail-Inhalte übermittelt. 
            Es werden keine Tracking-Pixel oder E-Mail-Öffnungsraten erfasst.
          </p>
          <p className="mt-2">
            Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) und Art. 6 Abs. 1 lit. f DSGVO 
            (berechtigtes Interesse an der Kommunikation mit Nutzern).
          </p>
          <p className="mt-2">
            Weitere Informationen: <a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Resend Datenschutzerklärung</a>
          </p>
        </section>

        {/* ==================== 15. Analyse-Tools ==================== */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">15. Analyse-Tools und Fehlerüberwachung</h2>

          <h3 className="text-lg font-medium mt-6 mb-3">15.1 Sentry (Fehlerüberwachung)</h3>
          <p>
            Wir nutzen Sentry (Functional Software, Inc., 132 Hawthorne Street, San Francisco, CA 94107, USA) 
            zur Erkennung und Behebung von technischen Fehlern. Sentry wird <strong>nur mit Ihrer Einwilligung</strong> 
            (Analytics-Cookies im Cookie-Banner) aktiviert.
          </p>
          <p className="mt-4">Von Sentry erfasste Daten:</p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>Fehlermeldungen und Stack Traces</li>
            <li>Browser, Betriebssystem, Gerätetyp</li>
            <li>Performance-Metriken (Abtastrate: 10 % der Seitenaufrufe)</li>
            <li>Session Replays bei Fehlern (anonymisiert, Abtastrate: 1 %, bei Fehlern 100 %)</li>
          </ul>
          <p className="mt-2">
            Es werden <strong>keine</strong> personenbezogenen Daten wie E-Mail-Adressen oder Nutzernamen an Sentry übermittelt. 
            Sentry ist unter dem EU-US Data Privacy Framework zertifiziert.
          </p>
          <p className="mt-2">
            Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO (Einwilligung).
          </p>
          <p className="mt-2">
            Weitere Informationen: <a href="https://sentry.io/privacy/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Sentry Datenschutzerklärung</a>
          </p>

          <h3 className="text-lg font-medium mt-6 mb-3">15.2 Inserat-Aufrufe (View-Tracking)</h3>
          <p>
            Zur Bereitstellung von Statistiken für Verkäufer zählen wir die Aufrufe einzelner Inserate. 
            Dies geschieht über einen anonymisierten Visitor-Hash, der <strong>keine Rückschlüsse</strong> auf 
            Ihre Person zulässt. Es werden weder IP-Adressen noch andere personenbezogene Daten gespeichert. 
            Die Zählung wird pro Besucher und Tag dedupliziert.
          </p>
          <p className="mt-2">
            Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Bereitstellung 
            von Nutzungsstatistiken für Verkäufer).
          </p>
        </section>

        {/* ==================== 16. Sicherheitsmaßnahmen ==================== */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">16. Sicherheitsmaßnahmen</h2>
          <p>
            Wir treffen nach Maßgabe der gesetzlichen Vorgaben unter Berücksichtigung des Stands der Technik 
            geeignete technische und organisatorische Maßnahmen, um ein dem Risiko angemessenes Schutzniveau 
            zu gewährleisten:
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li><strong>Verschlüsselung:</strong> Alle Datenübertragungen erfolgen über SSL/TLS-verschlüsselte Verbindungen.</li>
            <li><strong>Passwort-Sicherheit:</strong> Passwörter werden ausschließlich als kryptografische Hashes gespeichert. Klartext-Passwörter werden zu keinem Zeitpunkt in unserer Datenbank gespeichert.</li>
            <li><strong>Row Level Security (RLS):</strong> Die Datenbank ist durch granulare Zugriffsregeln geschützt, die sicherstellen, dass Nutzer nur auf ihre eigenen Daten zugreifen können.</li>
            <li><strong>Rate Limiting:</strong> Kritische Endpunkte (Login, Registrierung, Anfragen, Passwort-Reset) sind durch Ratenbegrenzungen gegen Missbrauch geschützt.</li>
            <li><strong>Input-Validierung:</strong> Sämtliche Eingaben werden serverseitig validiert und gegen Cross-Site-Scripting (XSS) geschützt.</li>
            <li><strong>Token-Verschlüsselung:</strong> E-Mail-Integration-Tokens (OAuth Access/Refresh-Tokens) werden verschlüsselt in der Datenbank gespeichert.</li>
            <li><strong>API-Schlüssel-Hashing:</strong> API-Schlüssel werden gehasht gespeichert; nur der Präfix ist sichtbar.</li>
            <li><strong>Soft-Delete:</strong> Gelöschte Daten werden zunächst als gelöscht markiert (Soft-Delete), sodass eine Wiederherstellung innerhalb eines definierten Zeitraums möglich ist.</li>
            <li><strong>Audit-Logging:</strong> Sicherheitsrelevante Aktionen werden protokolliert, einschließlich IP-Adresse, User-Agent und ausführender Nutzer.</li>
            <li><strong>PKCE:</strong> Die Authentifizierung nutzt Proof Key for Code Exchange für erhöhte Sicherheit.</li>
          </ul>
        </section>

        {/* ==================== 17. Rate Limiting ==================== */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">17. Missbrauchsprävention und Rate Limiting</h2>
          <p>
            Zum Schutz vor Missbrauch, Spam und Brute-Force-Angriffen setzen wir ein Rate-Limiting-System ein, 
            das über Upstash Redis (Upstash Inc.) betrieben wird. Dabei wird Ihre IP-Adresse als Kennung verwendet, 
            um die Anzahl der Anfragen pro Aktion und Zeitraum zu begrenzen:
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>Login: max. 5 Versuche pro 15 Minuten</li>
            <li>Registrierung: max. 3 pro Stunde</li>
            <li>Passwort-Reset: max. 3 pro Stunde</li>
            <li>Anfrage senden: max. 5 pro Minute</li>
            <li>Inserat erstellen: max. 10 pro Stunde</li>
            <li>Bild-Upload: max. 50 pro Stunde</li>
            <li>Kontaktformular: max. 3 pro Stunde</li>
            <li>API-Zugriff: max. 1.000 pro Stunde</li>
          </ul>
          <p className="mt-4">
            Die IP-Adresse wird temporär bei Upstash Redis gespeichert und automatisch nach Ablauf 
            des Rate-Limit-Fensters gelöscht. Es findet keine Langzeitspeicherung der IP-Adressen statt.
          </p>
          <p className="mt-2">
            Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Sicherheit und 
            Verfügbarkeit der Plattform).
          </p>
          <p className="mt-2">
            Weitere Informationen: <a href="https://upstash.com/trust/privacy.html" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Upstash Datenschutzerklärung</a>
          </p>
        </section>

        {/* ==================== 18. Audit-Logging ==================== */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">18. Audit-Logging und Protokollierung</h2>
          <p>
            Zur Gewährleistung der Sicherheit und Nachvollziehbarkeit werden sicherheitsrelevante 
            Aktionen in einem Audit-Log protokolliert:
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>Art der Aktion (z.&nbsp;B. Erstellen, Bearbeiten, Löschen)</li>
            <li>Betroffene Entität (Typ und ID)</li>
            <li>Alte und neue Werte bei Änderungen</li>
            <li>Ausführender Nutzer</li>
            <li>IP-Adresse und User-Agent</li>
            <li>Zeitstempel</li>
          </ul>
          <p className="mt-2">
            Die Audit-Logs dienen der Fehlersuche, Sicherheitsüberprüfung und der Erfüllung gesetzlicher 
            Dokumentationspflichten. Der Zugriff auf Audit-Logs ist auf Administratoren beschränkt.
          </p>
          <p className="mt-2">
            Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Sicherheit und 
            Nachvollziehbarkeit) und Art. 6 Abs. 1 lit. c DSGVO (rechtliche Verpflichtung).
          </p>
        </section>

        {/* ==================== 19. Benachrichtigungen ==================== */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">19. Benachrichtigungen</h2>
          <p>
            Registrierte Nutzer erhalten Benachrichtigungen zu relevanten Ereignissen. 
            Folgende Benachrichtigungstypen existieren:
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>Neue Anfrage eingegangen</li>
            <li>Anfrage beantwortet</li>
            <li>Inserat freigeschaltet/abgelehnt</li>
            <li>Inserat läuft ab</li>
            <li>Abonnement erneuert/läuft ab</li>
            <li>Zahlung fehlgeschlagen</li>
            <li>Systemmitteilungen</li>
          </ul>
          <p className="mt-2">
            Benachrichtigungen werden in der Datenbank gespeichert und können vom Nutzer als gelesen markiert werden. 
            Die E-Mail-Benachrichtigungseinstellungen können in den Kontoeinstellungen angepasst werden.
          </p>
          <p className="mt-2">
            Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung).
          </p>
        </section>

        {/* ==================== 20. Meldungen ==================== */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">20. Meldung von Inseraten</h2>
          <p>
            Nutzer können problematische Inserate melden. Bei einer Meldung werden folgende Daten erfasst:
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>E-Mail-Adresse des Meldenden</li>
            <li>Meldegrund (Spam, Fälschung, Unangemessen, Duplikat, Sonstiges)</li>
            <li>Beschreibung des Problems</li>
            <li>Betroffenes Inserat</li>
          </ul>
          <p className="mt-2">
            Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Qualitätssicherung 
            und dem Schutz vor rechtswidrigen Inhalten).
          </p>
        </section>

        {/* ==================== 21. Drittländer ==================== */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">21. Datenübermittlung in Drittländer</h2>
          <p>
            Im Rahmen unserer Datenverarbeitung werden Daten an folgende Dienstleister in Drittländern 
            (außerhalb des Europäischen Wirtschaftsraums) übermittelt:
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>
              <strong>Vercel Inc.</strong> (USA) – Website-Hosting. 
              Schutzmaßnahme: EU-US Data Privacy Framework.
            </li>
            <li>
              <strong>Supabase Inc.</strong> (Singapur) – Datenbank und Authentifizierung. 
              Schutzmaßnahme: Standardvertragsklauseln (SCC) gemäß Art. 46 Abs. 2 lit. c DSGVO.
            </li>
            <li>
              <strong>Stripe Payments Europe, Ltd.</strong> (Irland/USA) – Zahlungsabwicklung. 
              Stripe Europe verarbeitet Daten innerhalb der EU. Bei Datenübermittlung in die USA: EU-US Data Privacy Framework.
            </li>
            <li>
              <strong>Resend Inc.</strong> (USA) – E-Mail-Versand. 
              Schutzmaßnahme: Standardvertragsklauseln (SCC).
            </li>
            <li>
              <strong>Functional Software, Inc. (Sentry)</strong> (USA) – Fehlerüberwachung (nur mit Einwilligung). 
              Schutzmaßnahme: EU-US Data Privacy Framework.
            </li>
            <li>
              <strong>Upstash Inc.</strong> (USA) – Rate Limiting. 
              Schutzmaßnahme: Standardvertragsklauseln (SCC). Es werden nur temporäre, nicht-personenbezogene Daten gespeichert.
            </li>
            <li>
              <strong>Microsoft Corporation</strong> (USA) – E-Mail-Integration (Outlook, nur bei aktiver Verknüpfung durch Verkäufer). 
              Schutzmaßnahme: EU-US Data Privacy Framework.
            </li>
          </ul>
        </section>

        {/* ==================== 22. Speicherdauer ==================== */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">22. Speicherdauer und Löschung</h2>
          <p>
            Wir speichern personenbezogene Daten nur so lange, wie es für den jeweiligen Zweck erforderlich 
            ist oder gesetzliche Aufbewahrungspflichten bestehen:
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li><strong>Nutzerprofile:</strong> Bis zur Löschung des Kontos durch den Nutzer oder bis zur Kündigung des Vertragsverhältnisses.</li>
            <li><strong>Firmen-Accounts:</strong> Bis zur Löschung durch den Inhaber. Soft-Delete mit anschließender endgültiger Löschung nach 30 Tagen.</li>
            <li><strong>Inserate:</strong> Aktive Inserate bleiben öffentlich, solange sie nicht vom Verkäufer archiviert, gelöscht oder als verkauft markiert werden. Soft-Delete mit anschließender endgültiger Löschung nach 30 Tagen.</li>
            <li><strong>Anfragen:</strong> Bis zur Löschung durch den Verkäufer oder Kontolöschung. Soft-Delete mit anschließender endgültiger Löschung nach 30 Tagen.</li>
            <li><strong>CRM-Kontakte:</strong> Bis zur Löschung durch den Verkäufer oder Kontolöschung.</li>
            <li><strong>Rechnungen und Zahlungsdaten:</strong> 10 Jahre (steuerliche Aufbewahrungspflicht gemäß § 147 AO, § 257 HGB).</li>
            <li><strong>Audit-Logs:</strong> 2 Jahre (berechtigtes Interesse an der Nachvollziehbarkeit).</li>
            <li><strong>E-Mail-Synchronisation:</strong> Bis zur Trennung der E-Mail-Verbindung durch den Verkäufer. Tokens und synchronisierte E-Mails werden sofort gelöscht.</li>
            <li><strong>Team-Einladungen:</strong> Ausstehende Einladungen verfallen nach dem eingestellten Ablaufdatum.</li>
            <li><strong>API-Schlüssel:</strong> Bis zur Widerrufung oder zum Ablaufdatum.</li>
            <li><strong>Rate-Limiting-Daten:</strong> Automatische Löschung nach Ablauf des Zeitfensters (Sekunden bis Stunden).</li>
            <li><strong>Kontaktformular-Anfragen:</strong> 6 Monate nach Abschluss der Bearbeitung.</li>
          </ul>
          <p className="mt-4">
            Nach Ablauf der jeweiligen Speicherdauer oder bei Wegfall des Verarbeitungszwecks werden die Daten 
            gelöscht oder anonymisiert, sofern keine gesetzlichen Aufbewahrungspflichten entgegenstehen.
          </p>
        </section>

        {/* ==================== 23. Auftragsverarbeitung ==================== */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">23. Auftragsverarbeitung</h2>
          <p>
            Wir haben mit allen Dienstleistern, die in unserem Auftrag personenbezogene Daten verarbeiten, 
            Auftragsverarbeitungsverträge (AVV) gemäß Art. 28 DSGVO abgeschlossen. Dies betrifft insbesondere:
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>Vercel Inc. (Hosting)</li>
            <li>Supabase Inc. (Datenbank, Authentifizierung, Speicher)</li>
            <li>Stripe Payments Europe, Ltd. (Zahlungsabwicklung)</li>
            <li>Resend Inc. (E-Mail-Versand)</li>
            <li>Functional Software, Inc. / Sentry (Fehlerüberwachung)</li>
            <li>Upstash Inc. (Rate Limiting)</li>
          </ul>
        </section>

        {/* ==================== 24. Gemeinsame Verantwortlichkeit ==================== */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">24. Gemeinsame Verantwortlichkeit und Verkäufer als Verantwortliche</h2>
          <p>
            Verkäufer, die über CMM24 Anfragen von Käufern erhalten und deren Kontaktdaten für eigene 
            geschäftliche Zwecke verwenden (z.&nbsp;B. über die CRM-Funktion, E-Mail-Integration oder 
            direkte Kontaktaufnahme), sind für die weitere Verarbeitung dieser Daten selbst verantwortlich 
            im Sinne der DSGVO.
          </p>
          <p className="mt-4">
            CMM24 stellt die technische Infrastruktur bereit und ist für die Datenverarbeitung auf der 
            Plattform verantwortlich. Die Weitergabe der Kontaktdaten an den Verkäufer erfolgt aufgrund der 
            ausdrücklichen Einwilligung des Käufers (Art. 6 Abs. 1 lit. a DSGVO).
          </p>
          <p className="mt-4">
            Verkäufer sind verpflichtet, die ihnen übermittelten personenbezogenen Daten der Käufer 
            im Einklang mit der DSGVO zu verarbeiten und eigene Datenschutzhinweise bereitzuhalten.
          </p>
        </section>

        {/* ==================== 25. Minderjährige ==================== */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">25. Minderjährigenschutz</h2>
          <p>
            Unser Angebot richtet sich ausschließlich an Gewerbetreibende und Unternehmen (B2B). 
            Eine Nutzung durch Minderjährige (Personen unter 18 Jahren) ist nicht vorgesehen. 
            Wir erheben wissentlich keine personenbezogenen Daten von Minderjährigen.
          </p>
        </section>

        {/* ==================== 26. Änderungen ==================== */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">26. Änderung dieser Datenschutzerklärung</h2>
          <p>
            Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit sie stets den aktuellen 
            rechtlichen Anforderungen entspricht oder um Änderungen unserer Leistungen in der 
            Datenschutzerklärung umzusetzen. Für Ihren erneuten Besuch gilt dann die neue Datenschutzerklärung. 
            Bei wesentlichen Änderungen informieren wir registrierte Nutzer per E-Mail.
          </p>
        </section>

        {/* ==================== 27. Zuständige Aufsichtsbehörde ==================== */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">27. Zuständige Aufsichtsbehörden</h2>
          <p>
            Sollten Sie der Ansicht sein, dass die Verarbeitung Ihrer personenbezogenen Daten gegen 
            Datenschutzrecht verstößt, haben Sie gemäß Art. 77 DSGVO das Recht, sich bei einer 
            Datenschutz-Aufsichtsbehörde zu beschweren.
          </p>
          
          <h3 className="text-lg font-medium mt-6 mb-3">27.1 Federführende Aufsichtsbehörde</h3>
          <p>
            Die für CMM24 zuständige federführende Aufsichtsbehörde (Lead Supervisory Authority) 
            gemäß Art. 56 DSGVO ist:
          </p>
          <address className="not-italic mt-4">
            <p className="font-semibold">Der Landesbeauftragte für den Datenschutz und die Informationsfreiheit Baden-Württemberg</p>
            <p>Lautenschlagerstraße 20</p>
            <p>70173 Stuttgart</p>
            <p>Telefon: +49 711 615541-0</p>
            <p>E-Mail: <a href="mailto:poststelle@lfdi.bwl.de" className="text-primary hover:underline">poststelle@lfdi.bwl.de</a></p>
            <p>Website: <a href="https://www.baden-wuerttemberg.datenschutz.de" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.baden-wuerttemberg.datenschutz.de</a></p>
          </address>

          <h3 className="text-lg font-medium mt-6 mb-3">27.2 Ihr Recht auf Beschwerde bei Ihrer lokalen Aufsichtsbehörde</h3>
          <p>
            Unabhängig von der federführenden Aufsichtsbehörde haben Sie als betroffene Person das Recht, 
            sich bei der <strong>Aufsichtsbehörde Ihres Wohnsitz- oder Aufenthaltsmitgliedstaats</strong> oder 
            des Orts des mutmaßlichen Verstoßes zu beschweren (Art. 77 Abs. 1 DSGVO). 
            Eine Liste aller Datenschutz-Aufsichtsbehörden im Europäischen Wirtschaftsraum finden Sie auf 
            der Website des Europäischen Datenschutzausschusses (EDPB):{' '}
            <a 
              href="https://edpb.europa.eu/about-edpb/about-edpb/members_de" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-primary hover:underline"
            >
              edpb.europa.eu/about-edpb/about-edpb/members_de
            </a>
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
