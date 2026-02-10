import type { Listing } from '@/types';

/**
 * Generate PDF content for a listing
 * This creates an HTML representation that can be printed or converted to PDF
 */
export function generateListingPdfContent(listing: Listing): string {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: listing.currency,
      minimumFractionDigits: 0,
    }).format(price / 100);
  };

  const conditionLabels: Record<string, string> = {
    new: 'Neu',
    like_new: 'Wie neu',
    good: 'Gut',
    fair: 'Akzeptabel',
  };

  const currentDate = new Date().toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return `
    <!DOCTYPE html>
    <html lang="de">
    <head>
      <meta charset="UTF-8">
      <title>${listing.manufacturer.name} ${listing.title} - CMM24</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.5;
          color: #1a1a1a;
          padding: 40px;
          max-width: 800px;
          margin: 0 auto;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #1e90e6;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #1e90e6;
        }
        .logo span {
          color: #1a1a1a;
        }
        .date {
          color: #666;
          font-size: 12px;
        }
        .title-section {
          margin-bottom: 30px;
        }
        .manufacturer {
          color: #666;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 5px;
        }
        h1 {
          font-size: 28px;
          margin-bottom: 10px;
        }
        .price {
          font-size: 32px;
          font-weight: bold;
          color: #1e90e6;
        }
        .price-note {
          font-size: 14px;
          color: #666;
        }
        .image-section {
          margin-bottom: 30px;
        }
        .main-image {
          width: 100%;
          max-height: 300px;
          object-fit: cover;
          border-radius: 8px;
        }
        .specs-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          margin-bottom: 30px;
        }
        .spec-card {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
        }
        .spec-card h3 {
          font-size: 12px;
          color: #666;
          text-transform: uppercase;
          margin-bottom: 5px;
        }
        .spec-card p {
          font-size: 16px;
          font-weight: 600;
        }
        .section {
          margin-bottom: 30px;
        }
        .section h2 {
          font-size: 18px;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 1px solid #e5e5e5;
        }
        .description {
          white-space: pre-wrap;
          color: #444;
        }
        .seller-card {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
        }
        .seller-name {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 5px;
        }
        .seller-location {
          color: #666;
          font-size: 14px;
        }
        .verified {
          display: inline-block;
          background: #10b981;
          color: white;
          font-size: 12px;
          padding: 2px 8px;
          border-radius: 4px;
          margin-left: 10px;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e5e5;
          text-align: center;
          color: #666;
          font-size: 12px;
        }
        .footer a {
          color: #1e90e6;
          text-decoration: none;
        }
        @media print {
          body {
            padding: 20px;
          }
          .no-print {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">CMM<span>24</span></div>
        <div class="date">Stand: ${currentDate}</div>
      </div>

      <div class="title-section">
        <div class="manufacturer">${listing.manufacturer.name}</div>
        <h1>${listing.title}</h1>
        <div class="price">
          ${listing.price ? formatPrice(listing.price) : 'VB'}
          ${listing.price && listing.priceNegotiable ? '<span class="price-note"> (VB)</span>' : ''}
        </div>
      </div>

      ${listing.media[0] ? `
        <div class="image-section">
          <img src="${listing.media[0].url}" alt="${listing.title}" class="main-image">
        </div>
      ` : ''}

      <div class="specs-grid">
        <div class="spec-card">
          <h3>Baujahr</h3>
          <p>${listing.yearBuilt}</p>
        </div>
        <div class="spec-card">
          <h3>Zustand</h3>
          <p>${conditionLabels[listing.condition]}</p>
        </div>
        <div class="spec-card">
          <h3>Messbereich</h3>
          <p>${listing.measuringRangeX} × ${listing.measuringRangeY} × ${listing.measuringRangeZ} mm</p>
        </div>
        <div class="spec-card">
          <h3>Genauigkeit</h3>
          <p>${listing.accuracyUm || '-'}</p>
        </div>
        ${listing.software ? `
          <div class="spec-card">
            <h3>Software</h3>
            <p>${listing.software}</p>
          </div>
        ` : ''}
        ${listing.controller ? `
          <div class="spec-card">
            <h3>Steuerung</h3>
            <p>${listing.controller}</p>
          </div>
        ` : ''}
        ${listing.probeSystem ? `
          <div class="spec-card">
            <h3>Tastsystem</h3>
            <p>${listing.probeSystem}</p>
          </div>
        ` : ''}
        <div class="spec-card">
          <h3>Standort</h3>
          <p>${listing.locationCity}, ${listing.locationCountry}</p>
        </div>
      </div>

      <div class="section">
        <h2>Beschreibung</h2>
        <p class="description">${listing.description}</p>
      </div>

      ${listing.seller ? `
        <div class="section">
          <h2>Verkäufer</h2>
          <div class="seller-card">
            <div class="seller-name">
              ${listing.seller.companyName}
              ${listing.seller.isVerified ? '<span class="verified">✓ Verifiziert</span>' : ''}
            </div>
            <div class="seller-location">${listing.seller.addressCity}, ${listing.seller.addressCountry}</div>
          </div>
        </div>
      ` : ''}

      <div class="footer">
        <p>Dieses Angebot wurde erstellt auf <a href="https://cmm24.com">CMM24.de</a></p>
        <p>Der führende Marktplatz für gebrauchte Koordinatenmessmaschinen</p>
        <p style="margin-top: 10px;">Angebots-ID: CMM24-${listing.id}</p>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate PDF content for comparison
 */
export function generateComparisonPdfContent(listings: Listing[]): string {
  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(price / 100);
  };

  const conditionLabels: Record<string, string> = {
    new: 'Neu',
    like_new: 'Wie neu',
    good: 'Gut',
    fair: 'Akzeptabel',
  };

  const currentDate = new Date().toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const specs = [
    { key: 'price', label: 'Preis', format: (l: Listing) => (l.price ? formatPrice(l.price, l.currency) + (l.priceNegotiable ? ' (VB)' : '') : 'VB') },
    { key: 'yearBuilt', label: 'Baujahr', format: (l: Listing) => l.yearBuilt.toString() },
    { key: 'condition', label: 'Zustand', format: (l: Listing) => conditionLabels[l.condition] },
    { key: 'measuringRange', label: 'Messbereich', format: (l: Listing) => `${l.measuringRangeX} × ${l.measuringRangeY} × ${l.measuringRangeZ} mm` },
    { key: 'accuracy', label: 'Genauigkeit', format: (l: Listing) => l.accuracyUm || '-' },
    { key: 'software', label: 'Software', format: (l: Listing) => l.software || '-' },
    { key: 'controller', label: 'Steuerung', format: (l: Listing) => l.controller || '-' },
    { key: 'probeSystem', label: 'Tastsystem', format: (l: Listing) => l.probeSystem || '-' },
    { key: 'location', label: 'Standort', format: (l: Listing) => `${l.locationCity}, ${l.locationCountry}` },
    { key: 'seller', label: 'Verkäufer', format: (l: Listing) => l.seller?.companyName || '-' },
  ];

  return `
    <!DOCTYPE html>
    <html lang="de">
    <head>
      <meta charset="UTF-8">
      <title>Maschinenvergleich - CMM24</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.5;
          color: #1a1a1a;
          padding: 30px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #1e90e6;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #1e90e6;
        }
        .logo span {
          color: #1a1a1a;
        }
        h1 {
          font-size: 24px;
          margin-bottom: 20px;
        }
        .date {
          color: #666;
          font-size: 12px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
        }
        th, td {
          padding: 10px;
          text-align: left;
          border-bottom: 1px solid #e5e5e5;
        }
        th {
          background: #f8f9fa;
          font-weight: 600;
          color: #666;
          text-transform: uppercase;
          font-size: 11px;
          letter-spacing: 0.5px;
        }
        .machine-header {
          text-align: center;
          padding: 15px;
        }
        .machine-header img {
          width: 100%;
          max-height: 120px;
          object-fit: cover;
          border-radius: 6px;
          margin-bottom: 10px;
        }
        .machine-title {
          font-weight: 600;
          font-size: 14px;
        }
        .machine-manufacturer {
          color: #666;
          font-size: 12px;
        }
        .spec-label {
          font-weight: 500;
          background: #f8f9fa;
          width: 150px;
        }
        .highlight {
          background: #e8f4fd;
          font-weight: 600;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e5e5e5;
          text-align: center;
          color: #666;
          font-size: 11px;
        }
        .footer a {
          color: #1e90e6;
          text-decoration: none;
        }
        @media print {
          body {
            padding: 15px;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">CMM<span>24</span></div>
        <div class="date">Stand: ${currentDate}</div>
      </div>

      <h1>Maschinenvergleich (${listings.length} Maschinen)</h1>

      <table>
        <thead>
          <tr>
            <th></th>
            ${listings.map((l) => `
              <th class="machine-header">
                ${l.media[0] ? `<img src="${l.media[0].url}" alt="${l.title}">` : ''}
                <div class="machine-manufacturer">${l.manufacturer.name}</div>
                <div class="machine-title">${l.title}</div>
              </th>
            `).join('')}
          </tr>
        </thead>
        <tbody>
          ${specs.map((spec) => `
            <tr>
              <td class="spec-label">${spec.label}</td>
              ${listings.map((l) => `<td>${spec.format(l)}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="footer">
        <p>Dieser Vergleich wurde erstellt auf <a href="https://cmm24.com">CMM24.de</a></p>
        <p>Der führende Marktplatz für gebrauchte Koordinatenmessmaschinen</p>
      </div>
    </body>
    </html>
  `;
}

/**
 * Open PDF in new window for printing/saving
 */
export function openPdfWindow(content: string, title: string): void {
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.document.title = title;
    
    // Wait for images to load before printing
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 500);
    };
  }
}

/**
 * Download PDF content as HTML file (can be opened and printed as PDF)
 */
export function downloadPdfHtml(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
