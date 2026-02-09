import type { Metadata } from 'next';
import Link from 'next/link';
import { companyInfo } from '@/data/content/company';

export const metadata: Metadata = {
  title: 'Allgemeine Geschäftsbedingungen | CMM24',
  description: 'AGB der CMM24 GmbH – Nutzungsbedingungen für den Marktplatz für gebrauchte Koordinatenmessmaschinen.',
  robots: 'noindex, follow',
};

export default function AGBPage() {
  return (
    <main className="container-page max-w-3xl py-12 md:py-16">
      <h1 className="text-3xl font-bold mb-8">Allgemeine Geschäftsbedingungen (AGB)</h1>
      
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <p className="text-muted-foreground mb-8">Stand: Februar 2026</p>

        {/* ==================== § 1 Geltungsbereich ==================== */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">§ 1 Geltungsbereich und Vertragsgegenstand</h2>
          <p>
            (1) Diese Allgemeinen Geschäftsbedingungen (nachfolgend &quot;AGB&quot;) regeln die Nutzung der 
            Online-Plattform CMM24 (nachfolgend &quot;Plattform&quot;), die von der {companyInfo.name}, 
            {companyInfo.street}, {companyInfo.postalCode} {companyInfo.city} (nachfolgend &quot;CMM24&quot;, &quot;wir&quot; 
            oder &quot;uns&quot;) betrieben wird.
          </p>
          <p className="mt-4">
            (2) Die Plattform ist ein B2B-Marktplatz, der als <strong>reines Vermittlungsportal</strong> den 
            Handel mit gebrauchten Koordinatenmessmaschinen (KMM) und verwandter Messtechnik erleichtert. 
            CMM24 bringt Verkäufer und Käufer zusammen, ist jedoch <strong>zu keinem Zeitpunkt 
            Vertragspartei</strong> der zwischen den Nutzern geschlossenen Kauf-, Miet- oder sonstigen Verträge. 
            CMM24 ist ein Online-Vermittlungsdienst im Sinne der Verordnung (EU) 2019/1150 
            (Platform-to-Business-Verordnung, nachfolgend &quot;P2B-Verordnung&quot;).
          </p>
          <p className="mt-4">
            (3) Die Plattform richtet sich ausschließlich an Unternehmer im Sinne von § 14 BGB 
            bzw. gewerbliche Nutzer im Sinne von Art. 2 Nr. 1 der P2B-Verordnung, 
            d.&nbsp;h. natürliche oder juristische Personen oder rechtsfähige Personengesellschaften, die bei 
            Abschluss eines Rechtsgeschäfts in Ausübung ihrer gewerblichen oder selbständigen beruflichen 
            Tätigkeit handeln. Die Nutzung durch Verbraucher im Sinne von § 13 BGB ist ausgeschlossen.
          </p>
          <p className="mt-4">
            (4) Diese AGB gelten für alle Nutzer der Plattform, unabhängig davon, ob sie als Käufer 
            (nachfolgend &quot;Buyer&quot;) oder als Verkäufer (nachfolgend &quot;Seller&quot;) auftreten. 
            Ergänzende Bestimmungen für Seller finden sich in den §§ 8–16 dieser AGB.
          </p>
          <p className="mt-4">
            (5) Entgegenstehende oder von diesen AGB abweichende Bedingungen des Nutzers erkennen wir nicht 
            an, es sei denn, wir hätten ihrer Geltung ausdrücklich schriftlich zugestimmt.
          </p>
          <p className="mt-4">
            (6) Diese AGB sind in deutscher Sprache verfasst. Sofern CMM24 eine englische Übersetzung 
            bereitstellt, ist im Zweifel die deutsche Fassung maßgeblich.
          </p>
        </section>

        {/* ==================== § 2 Begriffsbestimmungen ==================== */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">§ 2 Begriffsbestimmungen</h2>
          <p>Im Sinne dieser AGB gelten die folgenden Begriffsbestimmungen:</p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li><strong>Plattform:</strong> Die unter der Domain cmm24.de erreichbare Online-Plattform einschließlich aller Unterseiten, Funktionen und der über die Plattform bereitgestellten API.</li>
            <li><strong>Nutzer:</strong> Jede natürliche oder juristische Person, die die Plattform nutzt, unabhängig davon, ob ein Nutzerkonto besteht.</li>
            <li><strong>Buyer (Käufer):</strong> Ein Nutzer, der die Plattform nutzt, um Maschinen zu suchen, zu vergleichen und Anfragen an Seller zu senden.</li>
            <li><strong>Seller (Verkäufer):</strong> Ein registrierter gewerblicher Nutzer im Sinne der P2B-Verordnung, der über einen Firmen-Account Inserate für Maschinen auf der Plattform einstellt.</li>
            <li><strong>Inserat (Listing):</strong> Eine von einem Seller erstellte Angebotsbeschreibung einer Maschine auf der Plattform.</li>
            <li><strong>Anfrage (Inquiry):</strong> Eine von einem Buyer an einen Seller gerichtete Kontaktanfrage bezüglich eines Inserats.</li>
            <li><strong>Abonnement (Plan):</strong> Ein kostenpflichtiger oder kostenloser Nutzungsvertrag zwischen einem Seller und CMM24 über die Nutzung der Plattform-Funktionen.</li>
            <li><strong>Firmen-Account:</strong> Das Konto eines Sellers, unter dem Inserate, Anfragen, Teammitglieder und weitere geschäftsbezogene Daten verwaltet werden.</li>
            <li><strong>Ranking:</strong> Die relative Reihenfolge, in der Inserate in den Suchergebnissen, Kategorieseiten oder auf der Startseite der Plattform dargestellt werden.</li>
          </ul>
        </section>

        {/* ==================== § 3 Rolle von CMM24 ==================== */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">§ 3 Rolle von CMM24 als Vermittlungsplattform</h2>
          <p>
            (1) CMM24 ist ausschließlich Betreiber einer Vermittlungsplattform und Online-Vermittlungsdienst 
            im Sinne der P2B-Verordnung. CMM24 tritt 
            <strong> weder als Käufer noch als Verkäufer</strong> von Maschinen auf und wird zu keinem 
            Zeitpunkt Vertragspartei der zwischen Buyer und Seller geschlossenen Verträge.
          </p>
          <p className="mt-4">
            (2) CMM24 schuldet den Nutzern ausschließlich die Bereitstellung und den Betrieb der Plattform. 
            CMM24 übernimmt <strong>keine Gewähr</strong> für:
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>die Richtigkeit, Vollständigkeit oder Aktualität der von Sellern eingestellten Inserate und Angaben;</li>
            <li>die Qualität, Sicherheit, Rechtmäßigkeit oder Verfügbarkeit der angebotenen Maschinen;</li>
            <li>die Fähigkeit der Seller, die angebotenen Maschinen zu verkaufen oder zu liefern;</li>
            <li>die Fähigkeit oder Absicht der Buyer, den Kaufpreis zu zahlen;</li>
            <li>das Zustandekommen oder die ordnungsgemäße Durchführung von Verträgen zwischen Nutzern;</li>
            <li>die Identität, Bonität oder Zuverlässigkeit der Nutzer.</li>
          </ul>
          <p className="mt-4">
            (3) Sämtliche Vertragsverhandlungen, Vertragsschlüsse, Lieferungen, Zahlungen, Gewährleistungs- 
            und Haftungsansprüche sowie sonstige Rechte und Pflichten bestehen ausschließlich zwischen den 
            jeweiligen Buyer und Seller. CMM24 ist für deren Erfüllung nicht verantwortlich.
          </p>
          <p className="mt-4">
            (4) CMM24 führt keine inhaltliche Prüfung der Inserate auf sachliche Richtigkeit durch. 
            Die Prüfung vor Veröffentlichung beschränkt sich auf die Einhaltung der formalen Anforderungen 
            (Vollständigkeit der Pflichtangaben) und die Prüfung auf offensichtliche Verstöße gegen diese AGB 
            oder geltendes Recht.
          </p>
          <p className="mt-4">
            (5) CMM24 vermittelt keine konkreten Geschäfte und erteilt keine Empfehlungen oder Ratschläge 
            zu einzelnen Maschinen oder Transaktionen. Informationen im Ratgeber- und Glossarbereich der 
            Plattform dienen ausschließlich der allgemeinen Information und stellen keine Beratung dar.
          </p>
        </section>

        {/* ==================== § 4 Registrierung ==================== */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">§ 4 Registrierung und Nutzerkonto</h2>
          <p>
            (1) Bestimmte Funktionen der Plattform – insbesondere das Senden von Anfragen mit 
            Statusverfolgung (Buyer) und das Erstellen von Inseraten (Seller) – setzen eine 
            Registrierung voraus. Die Suche, das Ansehen von Inseraten und der Maschinenvergleich 
            sind ohne Registrierung möglich.
          </p>
          <p className="mt-4">
            (2) Die Registrierung erfolgt durch Ausfüllen des Registrierungsformulars und Akzeptanz 
            dieser AGB sowie der <Link href="/datenschutz" className="text-primary hover:underline">Datenschutzerklärung</Link>. 
            Ein Anspruch auf Registrierung besteht nicht. CMM24 behält sich vor, Registrierungen 
            abzulehnen, sofern sachliche Gründe vorliegen (z.&nbsp;B. unvollständige Angaben, 
            Verdacht auf Missbrauch, fehlende Unternehmereigenschaft).
          </p>
          <p className="mt-4">
            (3) Bei der Registrierung als Buyer sind anzugeben: vollständiger Name und E-Mail-Adresse. 
            Bei der Registrierung als Seller sind zusätzlich anzugeben: Firmenname und ggf. weitere 
            Unternehmensangaben.
          </p>
          <p className="mt-4">
            (4) Der Nutzer ist verpflichtet, bei der Registrierung wahrheitsgemäße und vollständige 
            Angaben zu machen und diese bei Änderungen unverzüglich zu aktualisieren. CMM24 ist berechtigt, 
            die Richtigkeit der Angaben zu überprüfen und bei Falschangaben das Nutzerkonto zu sperren.
          </p>
          <p className="mt-4">
            (5) Die E-Mail-Adresse muss verifiziert werden. Ohne Verifizierung ist die Nutzung 
            bestimmter Funktionen (insbesondere das Erstellen von Inseraten) eingeschränkt.
          </p>
          <p className="mt-4">
            (6) Jeder Nutzer darf nur ein Nutzerkonto betreiben. Das Nutzerkonto ist nicht übertragbar.
          </p>
          <p className="mt-4">
            (7) Der Nutzer ist für die Geheimhaltung seiner Zugangsdaten selbst verantwortlich und hat diese 
            vor dem Zugriff Dritter zu schützen. Der Nutzer haftet für sämtliche Aktivitäten, die unter 
            seinem Nutzerkonto vorgenommen werden, es sei denn, er hat den unbefugten Zugriff nicht zu 
            vertreten.
          </p>
          <p className="mt-4">
            (8) Bei Verdacht auf einen unbefugten Zugriff auf das Nutzerkonto hat der Nutzer CMM24 
            unverzüglich unter <a href={`mailto:${companyInfo.email}`} className="text-primary hover:underline">{companyInfo.email}</a> zu 
            informieren und sein Passwort zu ändern.
          </p>
        </section>

        {/* ==================== § 5 Allgemeine Nutzungsbedingungen ==================== */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">§ 5 Allgemeine Nutzungsbedingungen und Inhaltsbeschränkungen</h2>
          <p>
            (1) Die Nutzung der Plattform ist ausschließlich zu den in diesen AGB beschriebenen Zwecken 
            gestattet. Jede anderweitige Nutzung – insbesondere die systematische Erfassung, Extraktion 
            oder Vervielfältigung von Inhalten (Scraping, Data Mining) – ist ohne ausdrückliche schriftliche 
            Genehmigung von CMM24 untersagt.
          </p>
          <p className="mt-4">
            (2) Den Nutzern ist es insbesondere untersagt:
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>falsche, irreführende, diskriminierende oder rechtswidrige Inhalte auf der Plattform einzustellen;</li>
            <li>Rechte Dritter, insbesondere Urheber-, Marken- oder Persönlichkeitsrechte, zu verletzen;</li>
            <li>die Plattform für den Vertrieb von Waren oder Dienstleistungen zu nutzen, die nicht in den Bereich der Koordinatenmesstechnik und verwandter Messtechnik fallen;</li>
            <li>Spam, Schadsoftware oder andere unerwünschte Inhalte über die Plattform zu verbreiten;</li>
            <li>die technische Infrastruktur der Plattform zu manipulieren, zu überlasten oder Sicherheitsmechanismen zu umgehen;</li>
            <li>automatisierte Systeme (Bots, Crawler, Scraper) ohne ausdrückliche Genehmigung von CMM24 einzusetzen;</li>
            <li>die auf der Plattform erhaltenen Kontaktdaten anderer Nutzer für Zwecke außerhalb der konkreten Geschäftsanbahnung zu nutzen, insbesondere für unaufgeforderte Werbung;</li>
            <li>gefälschte Nutzerkonten zu erstellen oder Nutzerdaten anderer Personen zu verwenden;</li>
            <li>die Plattform zur Geldwäsche, zum Betrug oder für andere illegale Zwecke zu nutzen.</li>
          </ul>
          <p className="mt-4">
            (3) CMM24 setzt zur Durchsetzung dieser Inhaltsbeschränkungen manuelle Prüfverfahren ein. 
            Es werden <strong>keine</strong> automatisierten Entscheidungsverfahren oder algorithmischen 
            Moderationssysteme eingesetzt, die ohne menschliche Überprüfung Inhalte entfernen oder 
            Nutzerkonten sperren. Sämtliche Moderationsentscheidungen werden von Mitarbeitern von CMM24 getroffen.
          </p>
          <p className="mt-4">
            (4) CMM24 ist berechtigt, bei Verstößen gegen diese Nutzungsbedingungen Maßnahmen gemäß 
            § 18 (Einschränkung, Sperrung und Kündigung) zu ergreifen. Weitergehende Ansprüche bleiben vorbehalten.
          </p>
        </section>

        {/* ==================== § 6 Buyer-Bestimmungen ==================== */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">§ 6 Besondere Bestimmungen für Buyer</h2>
          <p>
            (1) Buyer können die Plattform nutzen, um:
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>Inserate für Koordinatenmessmaschinen zu suchen und zu filtern;</li>
            <li>Detailinformationen zu Inseraten einzusehen;</li>
            <li>Maschinen miteinander zu vergleichen (max. 3 Maschinen gleichzeitig);</li>
            <li>Anfragen an Seller zu senden;</li>
            <li>nach Registrierung den Status ihrer Anfragen im Buyer-Dashboard zu verfolgen.</li>
          </ul>
          <p className="mt-4">
            (2) Beim Senden einer Anfrage stimmt der Buyer ausdrücklich zu, dass seine angegebenen 
            Kontaktdaten (Name, E-Mail-Adresse, ggf. Telefonnummer und Firmenname) sowie die Nachricht 
            an den jeweiligen Seller weitergeleitet werden. Der Seller ist für die weitere Verarbeitung 
            dieser Daten eigenverantwortlich.
          </p>
          <p className="mt-4">
            (3) Der Buyer nimmt zur Kenntnis, dass CMM24 <strong>keine Garantie</strong> für die 
            Beantwortung von Anfragen durch den Seller übernimmt. CMM24 empfiehlt Sellern, Anfragen 
            innerhalb von 48 Stunden zu beantworten, kann dies jedoch nicht garantieren.
          </p>
          <p className="mt-4">
            (4) Die Nutzung der Plattform als Buyer ist kostenfrei. Es fallen keine Gebühren für die 
            Suche, den Vergleich oder das Senden von Anfragen an.
          </p>
          <p className="mt-4">
            (5) Die von Sellern eingestellten Preisangaben sind als Richtwerte zu verstehen und stellen 
            kein verbindliches Angebot im Sinne von § 145 BGB dar. Die Preisverhandlung und 
            Preisfindung obliegen ausschließlich den Vertragsparteien (Buyer und Seller).
          </p>
          <p className="mt-4">
            (6) CMM24 empfiehlt Buyern dringend, vor dem Abschluss eines Kaufvertrags die Maschine 
            persönlich zu besichtigen, den Zustand zu prüfen und gegebenenfalls einen unabhängigen 
            Sachverständigen hinzuzuziehen. CMM24 übernimmt keinerlei Haftung für Mängel, Abweichungen 
            oder sonstige Eigenschaften der angebotenen Maschinen.
          </p>
        </section>

        {/* ==================== § 7 Anfragen ==================== */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">§ 7 Anfragen und Kontaktaufnahme</h2>
          <p>
            (1) Anfragen können sowohl von registrierten als auch von nicht registrierten Nutzern 
            gesendet werden. Die Angabe von Name und E-Mail-Adresse ist Pflicht.
          </p>
          <p className="mt-4">
            (2) Der Nutzer versichert, dass die in der Anfrage gemachten Angaben wahrheitsgemäß sind 
            und ein echtes Kaufinteresse besteht. Das massenhafte Versenden von Anfragen ohne Kaufabsicht 
            (Spam) ist untersagt.
          </p>
          <p className="mt-4">
            (3) Zur Missbrauchsprävention setzt CMM24 Mechanismen zur Begrenzung der Anfragen ein 
            (Rate Limiting). CMM24 behält sich vor, bei Verdacht auf Missbrauch den Zugang zur 
            Anfragefunktion einzuschränken.
          </p>
          <p className="mt-4">
            (4) CMM24 sendet dem Buyer eine Bestätigungs-E-Mail über den Eingang der Anfrage. 
            Der Seller erhält eine Benachrichtigung über die eingegangene Anfrage. CMM24 hat keinen 
            Einfluss auf die weitere Kommunikation zwischen den Parteien.
          </p>
          <p className="mt-4">
            (5) Über das Kontaktformular der Plattform können Nutzer allgemeine Anfragen an CMM24 
            richten. Anfragen, die sich auf einzelne Maschinen oder Transaktionen beziehen, werden 
            an den zuständigen Seller weitergeleitet.
          </p>
        </section>

        {/* ==================== § 8 Seller-Registrierung ==================== */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">§ 8 Besondere Bestimmungen für Seller – Registrierung und Firmen-Account</h2>
          <p>
            (1) Für die Nutzung der Seller-Funktionen ist die Erstellung eines Firmen-Accounts 
            erforderlich. Der Firmen-Account wird im Rahmen der Seller-Registrierung automatisch erstellt.
          </p>
          <p className="mt-4">
            (2) Der Seller verpflichtet sich, wahrheitsgemäße und vollständige Unternehmensangaben 
            zu machen, insbesondere:
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>vollständiger Firmenname und Rechtsform;</li>
            <li>vollständige Geschäftsadresse;</li>
            <li>Umsatzsteuer-Identifikationsnummer (sofern vorhanden);</li>
            <li>Kontaktdaten (Telefon, E-Mail, Website).</li>
          </ul>
          <p className="mt-4">
            (3) CMM24 behält sich vor, die Identität und Unternehmensangaben des Sellers zu überprüfen 
            und gegebenenfalls Nachweise zu verlangen. Bis zur abgeschlossenen Prüfung kann die 
            Veröffentlichung von Inseraten eingeschränkt sein.
          </p>
          <p className="mt-4">
            (4) Der Inhaber des Firmen-Accounts (Owner) kann Teammitglieder einladen und ihnen 
            verschiedene Berechtigungsrollen zuweisen (Admin, Editor, Viewer). Der Owner haftet 
            für alle Handlungen, die über seinen Firmen-Account vorgenommen werden, unabhängig davon, 
            welches Teammitglied die Handlung ausgeführt hat.
          </p>
        </section>

        {/* ==================== § 9 Abonnements ==================== */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">§ 9 Abonnements und Pläne</h2>
          <p>
            (1) CMM24 bietet Sellern verschiedene Abonnement-Pläne an, die sich im Umfang der 
            verfügbaren Funktionen und der Anzahl der Inserate unterscheiden:
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li><strong>Free-Plan:</strong> Kostenloser Basisplan mit eingeschränktem Funktionsumfang und begrenzter Inseratanzahl.</li>
            <li><strong>Starter-Plan:</strong> Kostenpflichtiger Plan mit erweiterten Funktionen (Statistiken, E-Mail-Composer, Featured-Inserate).</li>
            <li><strong>Business-Plan:</strong> Kostenpflichtiger Plan mit vollem Funktionsumfang (Lead-Pipeline, CRM, Team-Verwaltung, API-Zugang, Auto-Reply, Bulk-Aktionen).</li>
          </ul>
          <p className="mt-4">
            (2) Die aktuellen Preise und Leistungsumfänge der Pläne sind auf der Plattform einsehbar. 
            Alle Preise verstehen sich als Nettopreise zuzüglich der jeweils gültigen gesetzlichen 
            Umsatzsteuer.
          </p>
          <p className="mt-4">
            (3) Mit der Wahl eines kostenpflichtigen Plans kommt zwischen dem Seller und CMM24 ein 
            Abonnementvertrag zustande. Der Vertrag beginnt mit der erfolgreichen Zahlungsabwicklung 
            und läuft für den gewählten Abrechnungszeitraum (monatlich oder jährlich).
          </p>
          <p className="mt-4">
            (4) Das Abonnement verlängert sich automatisch um den jeweils gewählten Abrechnungszeitraum, 
            sofern es nicht rechtzeitig gekündigt wird (siehe § 15).
          </p>
          <p className="mt-4">
            (5) Ein Wechsel zu einem höherwertigen Plan (Upgrade) ist jederzeit möglich. 
            Bereits gezahlte Beträge werden anteilig verrechnet. Ein Wechsel zu einem niedrigerwertigen 
            Plan (Downgrade) wird zum Ende des aktuellen Abrechnungszeitraums wirksam.
          </p>
          <p className="mt-4">
            (6) CMM24 kann zeitlich befristete Sonderkonditionen und Angebote (z.&nbsp;B. Early Adopter-Preise) 
            anbieten. Sonderkonditionen gelten nur für den jeweils angegebenen Zeitraum und 
            werden im Anschluss durch die regulären Preise ersetzt. Über Preisanpassungen werden 
            bestehende Kunden mindestens 30 Tage vorab per E-Mail informiert.
          </p>
          <p className="mt-4">
            (7) CMM24 behält sich das Recht vor, die Leistungsumfänge der Pläne, die Preise oder 
            die Planstruktur zu ändern. Bestehende Abonnements werden zu den zum Zeitpunkt des 
            Vertragsschlusses geltenden Konditionen fortgeführt, bis der Abrechnungszeitraum endet. 
            Bei wesentlichen Änderungen hat der Seller ein Sonderkündigungsrecht.
          </p>
        </section>

        {/* ==================== § 10 Zahlung ==================== */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">§ 10 Zahlungsbedingungen</h2>
          <p>
            (1) Die Gebühren für kostenpflichtige Pläne sind im Voraus zu zahlen, entweder monatlich 
            oder jährlich, je nach gewähltem Abrechnungszeitraum.
          </p>
          <p className="mt-4">
            (2) Die Zahlungsabwicklung erfolgt über den Zahlungsdienstleister Stripe. 
            Es stehen die von Stripe unterstützten Zahlungsmethoden zur Verfügung (insbesondere 
            Kreditkarte und SEPA-Lastschrift). CMM24 speichert keine vollständigen Zahlungsdaten; 
            die Verarbeitung erfolgt direkt über Stripe.
          </p>
          <p className="mt-4">
            (3) CMM24 erhebt <strong>keine Verkaufsprovisionen</strong> auf Transaktionen zwischen 
            Buyer und Seller. Der gesamte Verkaufserlös verbleibt beim Seller.
          </p>
          <p className="mt-4">
            (4) Rechnungen werden automatisch erstellt und sind im Seller-Dashboard unter &quot;Rechnungen&quot; 
            einsehbar und als PDF herunterladbar. Rechnungen werden zudem per E-Mail an die hinterlegte 
            E-Mail-Adresse versendet.
          </p>
          <p className="mt-4">
            (5) Bei Zahlungsverzug ist CMM24 berechtigt, den Zugang zu den kostenpflichtigen Funktionen 
            einzuschränken oder zu sperren, bis der ausstehende Betrag beglichen ist. 
            Bereits veröffentlichte Inserate können in diesem Fall deaktiviert werden.
          </p>
          <p className="mt-4">
            (6) Im Falle fehlgeschlagener Zahlungen benachrichtigt CMM24 den Seller per E-Mail 
            und gewährt eine angemessene Frist zur Aktualisierung der Zahlungsmethode. Nach fruchtlosem 
            Ablauf der Frist kann CMM24 das Abonnement auf den Free-Plan herabstufen.
          </p>
          <p className="mt-4">
            (7) Der Seller kann seine Zahlungsmethode und Rechnungsdaten jederzeit über das 
            Stripe-Kundenportal verwalten, das über das Seller-Dashboard erreichbar ist.
          </p>
          <p className="mt-4">
            (8) <strong>Umsatzsteuer bei EU-grenzüberschreitenden Leistungen:</strong> Bei Sellern 
            mit Sitz in einem anderen EU-Mitgliedstaat, die über eine gültige 
            Umsatzsteuer-Identifikationsnummer (USt-IdNr.) verfügen, erfolgt die Abrechnung im 
            Reverse-Charge-Verfahren gemäß Art. 196 der Mehrwertsteuer-Richtlinie (2006/112/EG). 
            Die Umsatzsteuer wird in diesem Fall nicht von CMM24 ausgewiesen; der Seller schuldet die 
            Umsatzsteuer in seinem Sitzstaat. Die Gültigkeit der USt-IdNr. wird über das VIES-System 
            der Europäischen Kommission geprüft. Seller ohne gültige USt-IdNr. erhalten Rechnungen mit 
            deutscher Umsatzsteuer (derzeit 19 %).
          </p>
        </section>

        {/* ==================== § 11 Ranking und Sichtbarkeit ==================== */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">§ 11 Ranking, Sichtbarkeit und differenzierte Behandlung</h2>
          <p className="italic text-muted-foreground mb-4">
            (Transparenzhinweis gemäß Art. 5 und Art. 7 der Verordnung (EU) 2019/1150 – P2B-Verordnung)
          </p>

          <h3 className="text-lg font-medium mt-6 mb-3">11.1 Ranking-Parameter</h3>
          <p>
            (1) Die Darstellung und Reihenfolge von Inseraten in den Suchergebnissen, auf Kategorieseiten 
            und auf der Startseite der Plattform wird durch folgende Hauptparameter bestimmt:
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li><strong>Relevanz zum Suchbegriff:</strong> Übereinstimmung des Suchbegriffs mit Titel, Hersteller, Modell, Beschreibung und technischen Daten des Inserats (Volltextsuche).</li>
            <li><strong>Aktualität:</strong> Neuere Inserate werden bei gleicher Relevanz tendenziell höher eingestuft.</li>
            <li><strong>Vollständigkeit:</strong> Inserate mit vollständigeren Angaben (Bilder, technische Daten, Beschreibung) können bevorzugt dargestellt werden.</li>
            <li><strong>Featured-Status:</strong> Inserate, die vom Seller als &quot;Featured&quot; markiert wurden (abhängig vom Abonnement-Plan), werden in Suchergebnissen und auf der Startseite hervorgehoben dargestellt (siehe Abs. 2).</li>
          </ul>
          <p className="mt-4">
            (2) Nutzer können die Sortierung der Suchergebnisse manuell anpassen. Folgende 
            Sortieroptionen stehen zur Verfügung: Relevanz, Neueste zuerst, Preis aufsteigend, 
            Preis absteigend.
          </p>
          <p className="mt-4">
            (3) CMM24 verwendet <strong>keine</strong> personalisierten Ranking-Algorithmen, die auf dem 
            Verhalten oder den Daten einzelner Nutzer basieren. Alle Nutzer sehen bei gleichen 
            Suchparametern und Sortiereinstellungen dieselben Ergebnisse.
          </p>

          <h3 className="text-lg font-medium mt-6 mb-3">11.2 Differenzierte Behandlung – Featured-Inserate</h3>
          <p>
            (1) Seller mit kostenpflichtigen Plänen (Starter, Business) können eine begrenzte Anzahl 
            ihrer Inserate als &quot;Featured&quot; markieren. Featured-Inserate erhalten folgende 
            Sichtbarkeitsvorteile gegenüber regulären Inseraten:
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>Hervorgehobene Darstellung in Suchergebnissen durch ein visuelles Kennzeichen (&quot;Featured&quot;-Badge);</li>
            <li>Bevorzugte Platzierung auf der Startseite der Plattform;</li>
            <li>Höhere Position in der Standardsortierung (bei gleicher Relevanz).</li>
          </ul>
          <p className="mt-4">
            (2) Featured-Inserate sind für Nutzer stets als solche erkennbar gekennzeichnet. 
            Das monatliche Kontingent für Featured-Inserate unterscheidet sich je nach Plan:
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>Free-Plan: keine Featured-Inserate;</li>
            <li>Starter-Plan: 1 Featured-Inserat pro Monat;</li>
            <li>Business-Plan: 5 Featured-Inserate pro Monat.</li>
          </ul>
          <p className="mt-4">
            (3) Über die Featured-Funktion hinaus erfolgt <strong>keine</strong> differenzierte Behandlung 
            von Sellern basierend auf dem gewählten Plan hinsichtlich der Sichtbarkeit oder Platzierung 
            ihrer Inserate in den Suchergebnissen.
          </p>

          <h3 className="text-lg font-medium mt-6 mb-3">11.3 Zugang zu Daten</h3>
          <p>
            (1) Seller haben über ihr Dashboard Zugang zu folgenden Daten, die im Rahmen der 
            Plattformnutzung generiert werden:
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>Aufrufe ihrer Inserate (anonymisiert, keine personenbezogenen Daten der Besucher);</li>
            <li>Eingehende Anfragen mit Kontaktdaten des Buyers;</li>
            <li>Konversionsraten (Verhältnis Aufrufe zu Anfragen).</li>
          </ul>
          <p className="mt-4">
            (2) CMM24 nutzt aggregierte, anonymisierte Plattformdaten (z.&nbsp;B. Gesamtzahl der Inserate, 
            durchschnittliche Preise, populäre Hersteller) für eigene Zwecke wie Marktanalysen und 
            die Weiterentwicklung der Plattform. Es werden dabei keine individuellen Seller-Daten 
            an Dritte weitergegeben.
          </p>
        </section>

        {/* ==================== § 12 Inserate ==================== */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">§ 12 Inserate</h2>
          <p>
            (1) Die Anzahl der gleichzeitig aktiven Inserate ist durch den jeweils gewählten Plan begrenzt. 
            Inserate, die das Kontingent überschreiten, können nicht veröffentlicht werden.
          </p>
          <p className="mt-4">
            (2) Der Seller verpflichtet sich bei der Erstellung von Inseraten zu folgenden Grundsätzen:
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>Sämtliche Angaben (Hersteller, Modell, Baujahr, Zustand, Preis, technische Daten, Standort, Beschreibung) müssen wahrheitsgemäß, vollständig und aktuell sein.</li>
            <li>Es dürfen nur eigene Bilder der tatsächlich angebotenen Maschine verwendet werden. Stock-Fotos, Bilder aus dem Internet oder Bilder fremder Maschinen sind untersagt.</li>
            <li>Die Beschreibung muss den tatsächlichen Zustand der Maschine sachlich und korrekt wiedergeben, einschließlich etwaiger Mängel oder Einschränkungen.</li>
            <li>Der angegebene Preis muss dem tatsächlich geforderten Preis entsprechen. Lockangebote mit unrealistisch niedrigen Preisen sind untersagt.</li>
            <li>Hochgeladene Dokumente (z.&nbsp;B. Kalibrierprotokolle, Datenblätter) müssen authentisch sein und dürfen nicht manipuliert oder gefälscht sein.</li>
          </ul>
          <p className="mt-4">
            (3) Inserate durchlaufen vor der Veröffentlichung einen Prüfungsprozess. CMM24 prüft 
            Inserate auf formale Vollständigkeit und offensichtliche Verstöße gegen diese AGB. 
            Eine Garantie für die Richtigkeit der Inhalte wird durch die Freischaltung nicht übernommen.
          </p>
          <p className="mt-4">
            (4) Der Seller ist verpflichtet, ein Inserat unverzüglich als verkauft zu markieren 
            oder zu entfernen, sobald die angebotene Maschine nicht mehr verfügbar ist.
          </p>
          <p className="mt-4">
            (5) CMM24 ist berechtigt, Inserate für die öffentliche Darstellung zu optimieren 
            (z.&nbsp;B. Bildkomprimierung, Formatierung), ohne den inhaltlichen Kern zu verändern.
          </p>
          <p className="mt-4">
            (6) Featured-Inserate (hervorgehobene Inserate) können je nach Plan gegen Anrechnung 
            auf das monatliche Featured-Kontingent aktiviert werden. Die Bedingungen sind in § 11.2 geregelt.
          </p>
        </section>

        {/* ==================== § 13 Pflichten Seller ==================== */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">§ 13 Pflichten der Seller</h2>
          <p>
            (1) Seller verpflichten sich, sämtliche auf der Plattform eingestellten Inhalte 
            (Inserate, Bilder, Dokumente, Beschreibungen) im Einklang mit geltendem Recht, 
            diesen AGB und den guten Sitten zu gestalten.
          </p>
          <p className="mt-4">
            (2) Seller sind insbesondere verpflichtet:
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>Anfragen von Buyern zeitnah zu bearbeiten (empfohlen: innerhalb von 48 Stunden);</li>
            <li>die im Inserat gemachten Angaben bei Änderungen (z.&nbsp;B. Preisänderung, Zustandsänderung) unverzüglich zu aktualisieren;</li>
            <li>die von Buyern über die Plattform erhaltenen personenbezogenen Daten (Name, E-Mail, Telefon, Firma) ausschließlich für die Bearbeitung der jeweiligen Anfrage und die damit verbundene Geschäftsanbahnung zu verwenden;</li>
            <li>die Bestimmungen der DSGVO bei der Verarbeitung der erhaltenen Buyer-Daten einzuhalten;</li>
            <li>keine Maschinen anzubieten, die Gegenstand von Rechtsstreitigkeiten, Pfandrechten oder sonstigen Belastungen sind, ohne dies im Inserat offenzulegen;</li>
            <li>im Falle der Nutzung der E-Mail-Integration, API oder CRM-Funktionen diese ausschließlich für die bestimmungsgemäße Nutzung im Rahmen der Plattform zu verwenden.</li>
          </ul>
          <p className="mt-4">
            (3) Der Seller stellt CMM24 von sämtlichen Ansprüchen Dritter frei, die aufgrund von 
            Inhalten oder Handlungen des Sellers auf der Plattform geltend gemacht werden. 
            Dies umfasst insbesondere Ansprüche aus Urheberrechtsverletzungen, Wettbewerbsrecht, 
            Markenrecht oder falschen Angaben in Inseraten.
          </p>
        </section>

        {/* ==================== § 14 Geistiges Eigentum ==================== */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">§ 14 Geistiges Eigentum und Nutzungsrechte</h2>
          <p>
            (1) Alle Rechte an der Plattform, ihrem Design, ihrer Software und den von CMM24 erstellten 
            Inhalten (Texte, Grafiken, Logos, Ratgeber-Artikel, Glossar-Einträge) stehen CMM24 zu. 
            Eine Vervielfältigung, Verbreitung oder öffentliche Zugänglichmachung bedarf der 
            vorherigen schriftlichen Zustimmung von CMM24.
          </p>
          <p className="mt-4">
            (2) Der Seller räumt CMM24 mit dem Einstellen eines Inserats ein einfaches, nicht 
            ausschließliches, zeitlich auf die Dauer der Veröffentlichung beschränktes Nutzungsrecht 
            an den eingestellten Inhalten (Texte, Bilder, Dokumente) ein. Dieses Nutzungsrecht umfasst 
            das Recht, die Inhalte auf der Plattform öffentlich zugänglich zu machen, zu speichern, 
            technisch zu verarbeiten (z.&nbsp;B. Bildoptimierung, Thumbnail-Erstellung) und in Suchergebnissen 
            darzustellen.
          </p>
          <p className="mt-4">
            (3) Das Nutzungsrecht nach Abs. 2 erlischt mit der Entfernung des Inserats durch den 
            Seller oder CMM24, spätestens jedoch mit der Beendigung des Nutzungsvertrags. CMM24 ist 
            berechtigt, bereits gecachte oder archivierte Versionen für einen angemessenen Zeitraum 
            vorzuhalten.
          </p>
          <p className="mt-4">
            (4) Der Seller gewährleistet, dass er über sämtliche erforderlichen Rechte an den 
            eingestellten Inhalten verfügt und dass die Inhalte keine Rechte Dritter verletzen.
          </p>
        </section>

        {/* ==================== § 15 Kündigung ==================== */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">§ 15 Vertragslaufzeit und Kündigung</h2>
          <p>
            (1) <strong>Buyer-Konto:</strong> Das Nutzungsverhältnis als Buyer besteht auf unbestimmte 
            Zeit und kann jederzeit durch den Buyer ohne Einhaltung einer Kündigungsfrist beendet werden. 
            Die Löschung des Kontos kann über die Kontoeinstellungen oder per E-Mail 
            an <a href={`mailto:${companyInfo.email}`} className="text-primary hover:underline">{companyInfo.email}</a> veranlasst werden.
          </p>
          <p className="mt-4">
            (2) <strong>Seller – Free-Plan:</strong> Der Free-Plan kann jederzeit ohne Einhaltung 
            einer Kündigungsfrist gekündigt werden.
          </p>
          <p className="mt-4">
            (3) <strong>Seller – kostenpflichtige Pläne:</strong> Kostenpflichtige Abonnements 
            können jederzeit zum Ende des aktuellen Abrechnungszeitraums gekündigt werden. 
            Die Kündigung kann über das Seller-Dashboard (Bereich &quot;Abo &amp; Abrechnung&quot;) 
            oder das Stripe-Kundenportal erfolgen. Nach der Kündigung bleibt der Zugang zu den 
            kostenpflichtigen Funktionen bis zum Ende des bezahlten Zeitraums bestehen.
          </p>
          <p className="mt-4">
            (4) <strong>Wirkung der Kündigung bei Sellern:</strong> Mit Wirksamwerden der Kündigung 
            eines kostenpflichtigen Plans werden:
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>Inserate, die das Kontingent des Free-Plans überschreiten, automatisch deaktiviert (nicht gelöscht);</li>
            <li>Funktionen, die dem gekündigten Plan vorbehalten sind (z.&nbsp;B. Pipeline, CRM, API, Team-Verwaltung), deaktiviert;</li>
            <li>bestehende Daten (Inserate, Anfragen, Kontakte) bleiben gespeichert und werden nicht gelöscht.</li>
          </ul>
          <p className="mt-4">
            (5) <strong>Außerordentliche Kündigung:</strong> Das Recht zur außerordentlichen Kündigung 
            aus wichtigem Grund bleibt für beide Seiten unberührt. Ein wichtiger Grund für CMM24 liegt 
            insbesondere vor, wenn:
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>der Nutzer wiederholt oder schwerwiegend gegen diese AGB verstößt;</li>
            <li>der Nutzer falsche Angaben bei der Registrierung gemacht hat;</li>
            <li>der Nutzer betrügerische Handlungen vornimmt oder Dritte über die Plattform schädigt;</li>
            <li>der Seller trotz Mahnung mit der Zahlung in Verzug ist;</li>
            <li>ein Insolvenzverfahren über das Vermögen des Nutzers eröffnet oder die Eröffnung mangels Masse abgelehnt wird.</li>
          </ul>
          <p className="mt-4">
            (6) <strong>Kontolöschung:</strong> Bei endgültiger Kontolöschung werden die personenbezogenen 
            Daten des Nutzers gemäß den Bestimmungen der <Link href="/datenschutz" className="text-primary hover:underline">Datenschutzerklärung</Link> gelöscht. 
            Daten, die aufgrund gesetzlicher Aufbewahrungspflichten aufbewahrt werden müssen 
            (insbesondere Rechnungsdaten), werden für die Dauer der gesetzlichen Frist gesperrt 
            und anschließend gelöscht.
          </p>
        </section>

        {/* ==================== § 16 API-Nutzung ==================== */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">§ 16 API-Nutzung</h2>
          <p>
            (1) Seller im Business-Plan erhalten Zugang zu einer API-Schnittstelle, über die 
            Inserate, Anfragen und Statistiken programmgesteuert abgerufen und verwaltet werden können.
          </p>
          <p className="mt-4">
            (2) API-Schlüssel sind vertraulich zu behandeln und dürfen nicht an Dritte weitergegeben 
            werden. Der Seller haftet für alle Aktionen, die über seine API-Schlüssel ausgeführt werden.
          </p>
          <p className="mt-4">
            (3) Die API-Nutzung unterliegt einem Rate Limit von 1.000 Anfragen pro Stunde. 
            Bei Überschreitung werden Anfragen temporär abgelehnt.
          </p>
          <p className="mt-4">
            (4) CMM24 behält sich vor, die API-Spezifikation zu ändern oder zu erweitern. 
            Über wesentliche Änderungen werden Seller mit angemessener Vorlaufzeit informiert.
          </p>
          <p className="mt-4">
            (5) Die Nutzung der API zum systematischen Abruf von Daten anderer Nutzer, zum 
            Aufbau konkurrierender Dienste oder für Zwecke, die den bestimmungsgemäßen Gebrauch 
            der Plattform überschreiten, ist untersagt.
          </p>
        </section>

        {/* ==================== § 17 Verfügbarkeit ==================== */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">§ 17 Verfügbarkeit der Plattform</h2>
          <p>
            (1) CMM24 bemüht sich um eine möglichst unterbrechungsfreie Verfügbarkeit der Plattform. 
            Eine Verfügbarkeit von 100 % kann technisch nicht gewährleistet werden.
          </p>
          <p className="mt-4">
            (2) CMM24 ist berechtigt, die Plattform vorübergehend einzuschränken oder außer Betrieb 
            zu nehmen, insbesondere für Wartungsarbeiten, Sicherheitsupdates oder technische Änderungen. 
            Geplante Wartungsarbeiten werden nach Möglichkeit vorab angekündigt und in Zeiten geringer 
            Nutzung gelegt.
          </p>
          <p className="mt-4">
            (3) Ansprüche des Nutzers wegen vorübergehender Nichtverfügbarkeit der Plattform sind 
            ausgeschlossen, es sei denn, die Nichtverfügbarkeit beruht auf Vorsatz oder grober 
            Fahrlässigkeit von CMM24.
          </p>
          <p className="mt-4">
            (4) Im Falle einer dauerhaften Einstellung der Plattform werden Seller mit einer Frist 
            von mindestens 90 Tagen vorab informiert. Bereits gezahlte Beträge für nicht genutzte 
            Zeiträume werden anteilig erstattet.
          </p>
        </section>

        {/* ==================== § 18 Einschränkung, Sperrung, Kündigung ==================== */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">§ 18 Einschränkung, Sperrung und Kündigung durch CMM24</h2>
          <p className="italic text-muted-foreground mb-4">
            (Transparenzhinweis gemäß Art. 4 der Verordnung (EU) 2019/1150 – P2B-Verordnung 
            und Art. 17 der Verordnung (EU) 2022/2065 – Digital Services Act)
          </p>
          <p>
            (1) CMM24 kann die Nutzung der Plattform durch einen Seller einschränken, den Zugang 
            sperren oder den Vertrag kündigen, wenn:
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>der Seller gegen diese AGB oder geltendes Recht verstößt;</li>
            <li>der Seller falsche oder irreführende Angaben in Inseraten oder bei der Registrierung macht;</li>
            <li>berechtigte Meldungen anderer Nutzer vorliegen;</li>
            <li>der Seller wiederholt oder schwerwiegend gegen die Inhaltsvorgaben (§ 5) verstößt;</li>
            <li>ein sonstiger wichtiger Grund im Sinne von § 15 Abs. 5 vorliegt.</li>
          </ul>
          <p className="mt-4">
            (2) <strong>Begründungspflicht:</strong> Jede Entscheidung über die Einschränkung, 
            Sperrung oder Kündigung wird dem betroffenen Seller <strong>vor oder zum Zeitpunkt des 
            Wirksamwerdens</strong> der Maßnahme unter Angabe folgender Informationen mitgeteilt:
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>die konkreten Tatsachen und Umstände, die zu der Entscheidung geführt haben;</li>
            <li>die anwendbare Bestimmung dieser AGB oder der gesetzlichen Grundlage;</li>
            <li>die verfügbaren Rechtsbehelfe, insbesondere das interne Beschwerdemanagement (§ 19) und die Mediation (§ 20).</li>
          </ul>
          <p className="mt-4">
            (3) <strong>Frist:</strong> Sofern nicht eine unmittelbare Gefahr für die Plattform, 
            andere Nutzer oder ein Verstoß gegen geltendes Recht vorliegt, wird dem Seller vor der 
            Durchsetzung der Maßnahme eine angemessene Frist (in der Regel 14 Tage) zur Stellungnahme 
            und Abhilfe eingeräumt.
          </p>
          <p className="mt-4">
            (4) <strong>Ablehnung von Inseraten:</strong> Wird ein Inserat im Rahmen des 
            Prüfungsprozesses abgelehnt, erhält der Seller eine E-Mail-Benachrichtigung mit Angabe 
            des Ablehnungsgrunds. Der Seller hat die Möglichkeit, das Inserat zu überarbeiten und 
            erneut zur Prüfung einzureichen oder über das Beschwerdemanagement (§ 19) Einspruch zu erheben.
          </p>
          <p className="mt-4">
            (5) <strong>Sofortige Maßnahmen:</strong> Bei schwerwiegenden Verstößen – insbesondere 
            bei strafbaren Handlungen, Betrug, Identitätsdiebstahl oder einer unmittelbaren Gefährdung 
            anderer Nutzer – kann CMM24 sofortige Maßnahmen ohne vorherige Frist ergreifen. 
            Die Begründung wird in diesem Fall unverzüglich nach Durchführung der Maßnahme übermittelt.
          </p>
        </section>

        {/* ==================== § 19 Beschwerdemanagement ==================== */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">§ 19 Internes Beschwerdemanagement</h2>
          <p className="italic text-muted-foreground mb-4">
            (gemäß Art. 11 der Verordnung (EU) 2019/1150 – P2B-Verordnung)
          </p>
          <p>
            (1) CMM24 stellt Sellern ein kostenloses internes Beschwerdemanagementsystem zur Verfügung. 
            Seller können Beschwerden einreichen in Bezug auf:
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>die Ablehnung, Deaktivierung oder Entfernung von Inseraten;</li>
            <li>die Einschränkung, Sperrung oder Kündigung ihres Firmen-Accounts;</li>
            <li>die Nichteinhaltung von Verpflichtungen durch CMM24, die sich aus diesen AGB oder der P2B-Verordnung ergeben;</li>
            <li>technische Probleme, die die Nutzung der Plattform erheblich beeinträchtigen;</li>
            <li>Fragen zum Ranking und zur Sichtbarkeit ihrer Inserate.</li>
          </ul>
          <p className="mt-4">
            (2) <strong>Einreichung:</strong> Beschwerden können per E-Mail an {' '}
            <a href={`mailto:${companyInfo.email}`} className="text-primary hover:underline">{companyInfo.email}</a> eingereicht 
            werden. Die Beschwerde soll den Sachverhalt, die betroffene Maßnahme und das gewünschte 
            Ergebnis klar beschreiben.
          </p>
          <p className="mt-4">
            (3) <strong>Bearbeitungsfrist:</strong> CMM24 bestätigt den Eingang der Beschwerde 
            innerhalb von 3 Werktagen und bemüht sich, die Beschwerde innerhalb von 15 Werktagen 
            abschließend zu bearbeiten. Bei komplexen Sachverhalten informiert CMM24 den Seller 
            über den Bearbeitungsstand und die voraussichtliche Dauer.
          </p>
          <p className="mt-4">
            (4) <strong>Ergebnis:</strong> CMM24 teilt dem Seller das Ergebnis der Prüfung in 
            Textform (E-Mail) mit. Die Mitteilung enthält eine Begründung sowie Hinweise auf 
            weitere Rechtsbehelfe (insbesondere Mediation gemäß § 20).
          </p>
          <p className="mt-4">
            (5) Das Beschwerdemanagement wird von qualifizierten Mitarbeitern von CMM24 bearbeitet. 
            CMM24 veröffentlicht jährlich Informationen über die Funktionsweise und Wirksamkeit 
            des Beschwerdemanagementsystems.
          </p>
        </section>

        {/* ==================== § 20 Mediation ==================== */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">§ 20 Mediation</h2>
          <p className="italic text-muted-foreground mb-4">
            (gemäß Art. 12 der Verordnung (EU) 2019/1150 – P2B-Verordnung)
          </p>
          <p>
            (1) Kann eine Streitigkeit zwischen einem Seller und CMM24 nicht über das interne 
            Beschwerdemanagement (§ 19) beigelegt werden, sind beide Parteien bereit, eine 
            Beilegung im Wege der Mediation zu versuchen.
          </p>
          <p className="mt-4">
            (2) CMM24 benennt die folgenden Mediationsstellen, die für eine außergerichtliche 
            Streitbeilegung zur Verfügung stehen:
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>
              <strong>Centre for Effective Dispute Resolution (CEDR)</strong><br />
              70 Fleet Street, London EC4Y 1EU, Vereinigtes Königreich<br />
              Website: <a href="https://www.cedr.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.cedr.com</a>
            </li>
            <li>
              <strong>Mediationsstelle der Industrie- und Handelskammer für München und Oberbayern</strong><br />
              Max-Joseph-Straße 2, 80333 München, Deutschland<br />
              Website: <a href="https://www.ihk-muenchen.de" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.ihk-muenchen.de</a>
            </li>
          </ul>
          <p className="mt-4">
            (3) Die Mediatoren sind unabhängig und unparteiisch. Die Kosten der Mediation werden 
            von den Parteien grundsätzlich zu gleichen Teilen getragen, sofern keine abweichende 
            Vereinbarung getroffen wird. CMM24 trägt in jedem Fall einen angemessenen Anteil der 
            Mediationskosten unter Berücksichtigung der Umstände des Einzelfalls.
          </p>
          <p className="mt-4">
            (4) Die Mediation ist freiwillig. Beide Parteien bemühen sich nach Treu und Glauben 
            um eine einvernehmliche Lösung. Das Recht, den ordentlichen Rechtsweg zu beschreiten, 
            bleibt unberührt.
          </p>
        </section>

        {/* ==================== § 21 Meldung rechtswidriger Inhalte ==================== */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">§ 21 Meldung rechtswidriger Inhalte</h2>
          <p className="italic text-muted-foreground mb-4">
            (Notice-and-Action-Verfahren gemäß Art. 16 der Verordnung (EU) 2022/2065 – Digital Services Act)
          </p>
          <p>
            (1) Jeder Nutzer oder Dritte kann CMM24 auf Inhalte hinweisen, die nach seiner Auffassung 
            rechtswidrig sind oder gegen diese AGB verstoßen. Meldungen müssen folgende Angaben enthalten:
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>eine hinreichend substantiierte Begründung, warum der gemeldete Inhalt rechtswidrig ist oder gegen die AGB verstößt;</li>
            <li>einen eindeutigen Hinweis auf den genauen elektronischen Standort des Inhalts (URL oder Inserat-ID);</li>
            <li>den Namen und die E-Mail-Adresse des Meldenden;</li>
            <li>eine Erklärung, dass der Meldende in gutem Glauben handelt und die Angaben zutreffend sind.</li>
          </ul>
          <p className="mt-4">
            (2) <strong>Meldewege:</strong> Meldungen können eingereicht werden über:
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>die Meldefunktion auf der Plattform (Report-Button am Inserat);</li>
            <li>E-Mail an <a href={`mailto:${companyInfo.email}`} className="text-primary hover:underline">{companyInfo.email}</a>.</li>
          </ul>
          <p className="mt-4">
            (3) <strong>Bearbeitung:</strong> CMM24 bearbeitet Meldungen zeitnah, sorgfältig, 
            nicht-willkürlich und objektiv. CMM24 bestätigt dem Meldenden den Eingang der Meldung 
            und informiert ihn über die getroffene Entscheidung.
          </p>
          <p className="mt-4">
            (4) <strong>Entscheidung:</strong> Stellt CMM24 fest, dass ein gemeldeter Inhalt 
            rechtswidrig ist oder gegen die AGB verstößt, wird der Inhalt entfernt oder der Zugang 
            eingeschränkt. Der betroffene Seller wird unter Angabe der Gründe informiert und auf 
            die Möglichkeit der Beschwerde (§ 19) und Mediation (§ 20) hingewiesen.
          </p>
          <p className="mt-4">
            (5) <strong>Missbrauch:</strong> Missbräuchliche oder offensichtlich unbegründete 
            Meldungen sind untersagt. CMM24 kann bei wiederholtem Missbrauch des Meldeverfahrens 
            die Bearbeitung von Meldungen des betreffenden Meldenden aussetzen.
          </p>
        </section>

        {/* ==================== § 22 Kontaktstelle DSA ==================== */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">§ 22 Kontaktstelle und Zustellungsbevollmächtigter</h2>
          <p className="italic text-muted-foreground mb-4">
            (gemäß Art. 12 und Art. 13 der Verordnung (EU) 2022/2065 – Digital Services Act)
          </p>
          <p>
            (1) <strong>Zentrale Kontaktstelle</strong> für Behörden der EU-Mitgliedstaaten, die 
            Europäische Kommission, das Gremium für digitale Dienste und Nutzer ist:
          </p>
          <address className="not-italic mt-4 mb-4">
            <p className="font-semibold">{companyInfo.name}</p>
            <p>E-Mail: <a href={`mailto:${companyInfo.email}`} className="text-primary hover:underline">{companyInfo.email}</a></p>
            <p>Telefon: {companyInfo.phone}</p>
            <p>Sprachen: Deutsch, Englisch</p>
          </address>
          <p className="mt-4">
            (2) Anfragen in deutscher oder englischer Sprache werden bearbeitet. Die Kontaktstelle 
            ist während der üblichen Geschäftszeiten (Montag–Freitag, 9:00–17:00 Uhr MEZ) erreichbar.
          </p>
        </section>

        {/* ==================== § 23 Haftung ==================== */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">§ 23 Haftung</h2>
          <p>
            (1) CMM24 haftet unbeschränkt für Schäden aus der Verletzung des Lebens, des Körpers 
            oder der Gesundheit, die auf einer vorsätzlichen oder fahrlässigen Pflichtverletzung 
            von CMM24, seiner gesetzlichen Vertreter oder Erfüllungsgehilfen beruhen.
          </p>
          <p className="mt-4">
            (2) CMM24 haftet unbeschränkt für sonstige Schäden, die auf einer vorsätzlichen oder 
            grob fahrlässigen Pflichtverletzung von CMM24, seiner gesetzlichen Vertreter oder 
            Erfüllungsgehilfen beruhen.
          </p>
          <p className="mt-4">
            (3) Bei der Verletzung wesentlicher Vertragspflichten (Kardinalpflichten) durch einfache 
            Fahrlässigkeit ist die Haftung von CMM24 auf den vertragstypischen, vorhersehbaren 
            Schaden begrenzt. Wesentliche Vertragspflichten sind Pflichten, deren Erfüllung die 
            ordnungsgemäße Durchführung des Vertrags überhaupt erst ermöglicht und auf deren 
            Einhaltung der Vertragspartner regelmäßig vertrauen darf.
          </p>
          <p className="mt-4">
            (4) Im Übrigen ist die Haftung von CMM24 für einfache Fahrlässigkeit ausgeschlossen.
          </p>
          <p className="mt-4">
            (5) CMM24 haftet <strong>nicht</strong> für:
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>Schäden, die aus Verträgen zwischen Buyern und Sellern entstehen;</li>
            <li>die Richtigkeit, Vollständigkeit oder Aktualität der von Sellern eingestellten Inhalte;</li>
            <li>Mängel, Defekte, fehlerhafte Beschreibungen oder sonstige Eigenschaften der auf der Plattform angebotenen Maschinen;</li>
            <li>die Nichterreichbarkeit von Sellern oder die Nichtbeantwortung von Anfragen;</li>
            <li>Schäden durch Handlungen oder Unterlassungen anderer Nutzer;</li>
            <li>den Verlust von Daten, sofern der Nutzer seine Daten nicht in zumutbarem Umfang gesichert hat;</li>
            <li>Schäden durch höhere Gewalt, Stromausfälle, Störungen des Internets oder sonstige Umstände, die außerhalb des Einflussbereichs von CMM24 liegen.</li>
          </ul>
          <p className="mt-4">
            (6) Die Haftungsbeschränkungen gelten auch zugunsten der gesetzlichen Vertreter, 
            Erfüllungsgehilfen und Mitarbeiter von CMM24.
          </p>
          <p className="mt-4">
            (7) Die Haftung nach dem Produkthaftungsgesetz bleibt unberührt.
          </p>
        </section>

        {/* ==================== § 24 Datenschutz ==================== */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">§ 24 Datenschutz</h2>
          <p>
            (1) Die Verarbeitung personenbezogener Daten durch CMM24 richtet sich nach der 
            <Link href="/datenschutz" className="text-primary hover:underline"> Datenschutzerklärung</Link>, 
            die Bestandteil dieser AGB ist.
          </p>
          <p className="mt-4">
            (2) Seller, die über die Plattform personenbezogene Daten von Buyern erhalten 
            (insbesondere Name, E-Mail, Telefon, Firma über die Anfragefunktion), sind für die 
            weitere Verarbeitung dieser Daten als eigenständige Verantwortliche im Sinne der DSGVO 
            verantwortlich. Der Seller verpflichtet sich, diese Daten ausschließlich im Rahmen der 
            konkreten Geschäftsanbahnung zu verwenden und die datenschutzrechtlichen Bestimmungen 
            einzuhalten.
          </p>
          <p className="mt-4">
            (3) Es ist dem Seller untersagt, die über die Plattform erhaltenen Buyer-Daten:
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>an Dritte weiterzugeben (es sei denn, dies ist zur Vertragserfüllung erforderlich);</li>
            <li>für unaufgeforderte Werbung (Spam) zu verwenden;</li>
            <li>für Zwecke außerhalb der konkreten Anfrage zu nutzen.</li>
          </ul>
        </section>

        {/* ==================== § 25 Freistellung ==================== */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">§ 25 Freistellung</h2>
          <p>
            (1) Der Nutzer stellt CMM24, dessen gesetzliche Vertreter, Erfüllungsgehilfen und 
            Mitarbeiter von sämtlichen Ansprüchen Dritter frei, die aufgrund von Inhalten, 
            Handlungen oder Unterlassungen des Nutzers auf der Plattform geltend gemacht werden.
          </p>
          <p className="mt-4">
            (2) Der Nutzer übernimmt die Kosten der Rechtsverteidigung von CMM24, einschließlich 
            sämtlicher Gerichts- und Anwaltskosten in gesetzlicher Höhe. Dies gilt nicht, wenn 
            die Rechtsverletzung nicht vom Nutzer zu vertreten ist.
          </p>
          <p className="mt-4">
            (3) Der Nutzer ist verpflichtet, CMM24 im Falle einer Inanspruchnahme durch Dritte 
            unverzüglich, wahrheitsgemäß und vollständig alle Informationen zur Verfügung zu stellen, 
            die für die Prüfung der Ansprüche und die Verteidigung erforderlich sind.
          </p>
        </section>

        {/* ==================== § 26 Änderung der AGB ==================== */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">§ 26 Änderung der AGB</h2>
          <p>
            (1) CMM24 behält sich vor, diese AGB mit Wirkung für die Zukunft zu ändern, soweit 
            dies unter Berücksichtigung der Interessen von CMM24 für den Nutzer zumutbar ist. 
            Dies ist insbesondere der Fall bei Änderungen der Rechtslage, Änderungen der 
            Plattform-Funktionalität oder Schließung von Regelungslücken.
          </p>
          <p className="mt-4">
            (2) Über Änderungen wird CMM24 den Nutzer mindestens 15 Tage vor dem geplanten 
            Inkrafttreten per E-Mail an die hinterlegte E-Mail-Adresse informieren 
            (Art. 3 Abs. 2 P2B-Verordnung). Die Änderungen werden klar kenntlich gemacht.
          </p>
          <p className="mt-4">
            (3) Die Frist nach Abs. 2 verlängert sich auf 30 Tage, wenn die Änderungen erhebliche 
            Auswirkungen auf die Nutzung der Plattform durch den Seller haben, insbesondere bei:
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>Änderungen der Ranking-Parameter (§ 11);</li>
            <li>wesentlichen Änderungen der Leistungsumfänge der Pläne;</li>
            <li>Änderungen der Preisstruktur;</li>
            <li>Einführung neuer Gründe für Einschränkung oder Sperrung.</li>
          </ul>
          <p className="mt-4">
            (4) Widerspricht der Nutzer den geänderten AGB nicht innerhalb der jeweiligen Frist 
            in Textform (E-Mail an {companyInfo.email}), gelten die geänderten AGB als angenommen. 
            CMM24 wird in der Änderungsmitteilung auf das Widerspruchsrecht und die Folgen des 
            Schweigens besonders hinweisen.
          </p>
          <p className="mt-4">
            (5) Widerspricht der Nutzer den geänderten AGB, besteht der Vertrag zu den bisherigen 
            Bedingungen fort. CMM24 behält sich in diesem Fall das Recht zur ordentlichen Kündigung 
            zum nächstmöglichen Zeitpunkt vor.
          </p>
        </section>

        {/* ==================== § 27 Schlussbestimmungen ==================== */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">§ 27 Schlussbestimmungen</h2>
          <p>
            (1) <strong>Anwendbares Recht:</strong> Es gilt das Recht der Bundesrepublik Deutschland 
            unter Ausschluss des UN-Kaufrechts (CISG). Zwingende Vorschriften des Staates, in dem 
            der Nutzer seinen gewöhnlichen Aufenthalt hat, bleiben gemäß Art. 3 Abs. 3 der 
            Verordnung (EG) Nr. 593/2008 (Rom I) unberührt.
          </p>
          <p className="mt-4">
            (2) <strong>Gerichtsstand:</strong> Ausschließlicher Gerichtsstand für alle Streitigkeiten 
            aus oder im Zusammenhang mit diesen AGB ist München, soweit der Nutzer Kaufmann, 
            juristische Person des öffentlichen Rechts oder öffentlich-rechtliches Sondervermögen ist 
            oder keinen allgemeinen Gerichtsstand in Deutschland hat. Dieser Gerichtsstand gilt 
            vorbehaltlich zwingender Zuständigkeitsregelungen des EU-Rechts, insbesondere der 
            Verordnung (EU) Nr. 1215/2012 (Brüssel Ia-Verordnung).
          </p>
          <p className="mt-4">
            (3) <strong>Streitbeilegung:</strong> CMM24 ist weder bereit noch verpflichtet, an 
            Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen. 
            Da sich die Plattform ausschließlich an Unternehmer richtet, findet die 
            Verbraucherstreitbeilegung keine Anwendung. Für Streitigkeiten mit Sellern steht 
            das Mediationsverfahren gemäß § 20 zur Verfügung.
          </p>
          <p className="mt-4">
            (4) <strong>Schriftformklausel:</strong> Änderungen und Ergänzungen dieser AGB bedürfen 
            der Textform (E-Mail genügt). Dies gilt auch für die Aufhebung dieser Schriftformklausel.
          </p>
          <p className="mt-4">
            (5) <strong>Salvatorische Klausel:</strong> Sollten einzelne Bestimmungen dieser AGB 
            ganz oder teilweise unwirksam oder undurchführbar sein oder werden, so wird dadurch die 
            Wirksamkeit der übrigen Bestimmungen nicht berührt. An die Stelle der unwirksamen oder 
            undurchführbaren Bestimmung tritt diejenige wirksame und durchführbare Regelung, deren 
            Wirkungen der wirtschaftlichen Zielsetzung am nächsten kommen, die die Vertragsparteien 
            mit der unwirksamen oder undurchführbaren Bestimmung verfolgt haben.
          </p>
          <p className="mt-4">
            (6) <strong>Vertragssprache:</strong> Die Vertragssprache ist Deutsch. Im Falle von 
            Übersetzungen ist die deutsche Fassung maßgeblich.
          </p>
          <p className="mt-4">
            (7) <strong>Abtretung:</strong> Die Abtretung von Rechten und Pflichten aus dem 
            Nutzungsverhältnis durch den Nutzer bedarf der vorherigen schriftlichen Zustimmung 
            von CMM24.
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
