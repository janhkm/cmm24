import type { TeamMember } from '@/types';

// Team-Mitglieder fuer die Ueber-uns-Seite
export const teamMembers: TeamMember[] = [
  {
    name: 'Jan Hemkemeier',
    role: 'Gründer & Geschäftsführer',
    bio: 'Jan hat CMM24 mit der Vision gegründet, den Gebrauchtmaschinenmarkt für Messtechnik transparenter und effizienter zu gestalten. Mit über 10 Jahren Erfahrung in der Messtechnik-Branche kennt er die Herausforderungen von Käufern und Verkäufern aus erster Hand.',
    linkedin: 'https://linkedin.com/in/janhemkemeier',
  },
];

// Unternehmensinformationen fuer rechtliche Seiten (Impressum, AGB, Datenschutz)
export const companyInfo = {
  name: 'Kneissl Messtechnik GmbH',
  street: 'Mühlstr. 41',
  postalCode: '71229',
  city: 'Leonberg',
  country: 'Deutschland',
  email: 'info@kneissl-messtechnik.de',
  phone: '+49 (0) 7152 / 35 76 59-0',
  fax: '+49 (0) 7152 / 35 76 59-60',
  managingDirector: 'Dr. Matthias Kugler, Adrian Awad',
  registerCourt: 'AG Stuttgart',
  registerNumber: 'HRB 253089',
  vatId: 'DE813458220',
};
