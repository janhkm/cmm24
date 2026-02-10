/**
 * Statische UI-Labels, Enums und Konfigurationskonstanten.
 * Diese Werte aendern sich selten und sind keine Mock-Daten.
 */

// Laender fuer Standort-Auswahl
export const countries = [
  { code: 'DE', name: 'Deutschland' },
  { code: 'AT', name: 'Österreich' },
  { code: 'CH', name: 'Schweiz' },
  { code: 'NL', name: 'Niederlande' },
  { code: 'BE', name: 'Belgien' },
  { code: 'FR', name: 'Frankreich' },
  { code: 'IT', name: 'Italien' },
  { code: 'ES', name: 'Spanien' },
  { code: 'PL', name: 'Polen' },
  { code: 'CZ', name: 'Tschechien' },
  { code: 'UK', name: 'Vereinigtes Königreich' },
];

// Maschinenkategorien (entspricht DB-Enum machine_category)
export const categories = [
  { value: 'cmm', label: '3D-Koordinatenmessmaschine' },
  { value: 'optical', label: 'Optisches Messsystem' },
  { value: 'other', label: 'Sonstiges' },
];

// Zustand-Labels (entspricht DB-Enum listing_condition)
export const conditions = [
  { value: 'new', label: 'Neu' },
  { value: 'like_new', label: 'Wie neu' },
  { value: 'good', label: 'Gut' },
  { value: 'fair', label: 'Akzeptabel' },
];

// Sortieroptionen fuer Listing-Suche
export const sortOptions = [
  { value: 'relevance', label: 'Relevanz' },
  { value: 'date_desc', label: 'Neueste zuerst' },
  { value: 'date_asc', label: 'Älteste zuerst' },
  { value: 'price_asc', label: 'Preis aufsteigend' },
  { value: 'price_desc', label: 'Preis absteigend' },
  { value: 'year_desc', label: 'Baujahr neueste' },
  { value: 'year_asc', label: 'Baujahr älteste' },
];

// Statische Statistiken fuer Homepage/Marketing-Seiten
export const stats = [
  { label: 'Maschinen', value: '245+' },
  { label: 'Verkäufer', value: '48' },
  { label: 'Länder', value: '12' },
  { label: 'Hersteller', value: '8' },
];
