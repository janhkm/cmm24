import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Widerrufsbelehrung | CMM24',
  description: 'Widerrufsbelehrung für CMM24 Abonnements. Informationen zu Ihrem 14-tägigen Widerrufsrecht.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function WiderrufsbelehrungPage() {
  return (
    <main className="container-page max-w-3xl py-12 md:py-16">
      {/* Breadcrumb */}
      <nav className="mb-8" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 text-sm text-muted-foreground">
          <li><Link href="/" className="hover:text-foreground">Startseite</Link></li>
          <li>/</li>
          <li className="text-foreground font-medium">Widerrufsbelehrung</li>
        </ol>
      </nav>

      <h1 className="text-3xl md:text-4xl font-bold mb-8">Widerrufsbelehrung</h1>
      
      <div className="prose prose-neutral max-w-none">
        <p className="lead text-lg text-muted-foreground mb-8">
          Verbraucher haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen 
          diesen Vertrag zu widerrufen.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">Widerrufsrecht</h2>
        <p className="text-muted-foreground mb-4">
          Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen 
          Vertrag zu widerrufen. Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag 
          des Vertragsabschlusses.
        </p>
        <p className="text-muted-foreground mb-4">
          Um Ihr Widerrufsrecht auszuüben, müssen Sie uns (CMM24 GmbH, Musterstraße 1, 
          80331 München, E-Mail: widerruf@cmm24.de) mittels einer eindeutigen Erklärung 
          (z.B. ein mit der Post versandter Brief oder E-Mail) über Ihren Entschluss, 
          diesen Vertrag zu widerrufen, informieren.
        </p>
        <p className="text-muted-foreground mb-4">
          Sie können dafür das beigefügte Muster-Widerrufsformular verwenden, das jedoch 
          nicht vorgeschrieben ist.
        </p>
        <p className="text-muted-foreground mb-4">
          Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung über 
          die Ausübung des Widerrufsrechts vor Ablauf der Widerrufsfrist absenden.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">Folgen des Widerrufs</h2>
        <p className="text-muted-foreground mb-4">
          Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir 
          von Ihnen erhalten haben, einschließlich der Lieferkosten (mit Ausnahme der 
          zusätzlichen Kosten, die sich daraus ergeben, dass Sie eine andere Art der 
          Lieferung als die von uns angebotene, günstigste Standardlieferung gewählt 
          haben), unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag 
          zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf dieses Vertrags 
          bei uns eingegangen ist.
        </p>
        <p className="text-muted-foreground mb-4">
          Für diese Rückzahlung verwenden wir dasselbe Zahlungsmittel, das Sie bei der 
          ursprünglichen Transaktion eingesetzt haben, es sei denn, mit Ihnen wurde 
          ausdrücklich etwas anderes vereinbart; in keinem Fall werden Ihnen wegen 
          dieser Rückzahlung Entgelte berechnet.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">Besondere Hinweise</h2>
        <p className="text-muted-foreground mb-4">
          Haben Sie verlangt, dass die Dienstleistungen während der Widerrufsfrist 
          beginnen sollen, so haben Sie uns einen angemessenen Betrag zu zahlen, der 
          dem Anteil der bis zu dem Zeitpunkt, zu dem Sie uns von der Ausübung des 
          Widerrufsrechts hinsichtlich dieses Vertrags unterrichten, bereits 
          erbrachten Dienstleistungen im Vergleich zum Gesamtumfang der im Vertrag 
          vorgesehenen Dienstleistungen entspricht.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">Ausschluss des Widerrufsrechts</h2>
        <p className="text-muted-foreground mb-4">
          Das Widerrufsrecht erlischt bei einem Vertrag zur Erbringung von 
          Dienstleistungen auch dann, wenn der Unternehmer die Dienstleistung 
          vollständig erbracht hat und mit der Ausführung der Dienstleistung erst 
          begonnen hat, nachdem der Verbraucher dazu seine ausdrückliche Zustimmung 
          gegeben hat und gleichzeitig seine Kenntnis davon bestätigt hat, dass er 
          sein Widerrufsrecht bei vollständiger Vertragserfüllung durch den 
          Unternehmer verliert.
        </p>

        <div className="bg-muted/50 rounded-lg p-6 mt-8">
          <h2 className="text-xl font-semibold mb-4">Muster-Widerrufsformular</h2>
          <p className="text-muted-foreground mb-4">
            (Wenn Sie den Vertrag widerrufen wollen, dann füllen Sie bitte dieses 
            Formular aus und senden Sie es zurück.)
          </p>
          <div className="bg-background rounded-lg p-4 text-sm">
            <p className="mb-2">An:</p>
            <p className="mb-2">CMM24 GmbH<br />Musterstraße 1<br />80331 München<br />E-Mail: widerruf@cmm24.de</p>
            <p className="mb-2">
              Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen 
              Vertrag über den Kauf der folgenden Waren (*) / die Erbringung der 
              folgenden Dienstleistung (*)
            </p>
            <p className="mb-2">Bestellt am (*) / erhalten am (*)</p>
            <p className="mb-2">Name des/der Verbraucher(s)</p>
            <p className="mb-2">Anschrift des/der Verbraucher(s)</p>
            <p className="mb-2">Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf Papier)</p>
            <p>Datum</p>
            <p className="text-xs text-muted-foreground mt-4">(*) Unzutreffendes streichen.</p>
          </div>
        </div>

        <h2 className="text-xl font-semibold mt-8 mb-4">Kontakt</h2>
        <p className="text-muted-foreground">
          Bei Fragen zum Widerruf erreichen Sie uns unter:{' '}
          <a href="mailto:widerruf@cmm24.de" className="text-primary hover:underline">
            widerruf@cmm24.de
          </a>
        </p>

        <p className="text-sm text-muted-foreground mt-8">
          Stand: Januar 2026
        </p>
      </div>
    </main>
  );
}
