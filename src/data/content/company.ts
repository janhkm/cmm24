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
  name: 'CMM24 GmbH',
  street: 'Musterstraße 1',
  postalCode: '80331',
  city: 'München',
  country: 'Deutschland',
  email: 'kontakt@cmm24.de',
  phone: '+49 89 123456',
  managingDirector: 'Jan Hemkemeier',
  registerCourt: 'Amtsgericht München',
  registerNumber: 'HRB 123456',
  vatId: 'DE123456789',
};
