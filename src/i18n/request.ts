import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';
import type { Locale } from './routing';

// Statischer Import aller Nachrichtendateien
import de from '../messages/de.json';
import en from '../messages/en.json';
import pl from '../messages/pl.json';
import sr from '../messages/sr.json';
import nl from '../messages/nl.json';
import it from '../messages/it.json';
import hr from '../messages/hr.json';
import sv from '../messages/sv.json';
import nb from '../messages/nb.json';
import da from '../messages/da.json';
import pt from '../messages/pt.json';
import ro from '../messages/ro.json';
import tr from '../messages/tr.json';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const messages: Record<string, any> = {
  de,
  en,
  pl,
  sr,
  nl,
  it,
  hr,
  sv,
  nb,
  da,
  pt,
  ro,
  tr,
};

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  // Validierung: Nur unterstuetzte Locales erlauben
  if (!locale || !routing.locales.includes(locale as Locale)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    // Fallback auf Deutsch fuer noch nicht uebersetzte Sprachen (z.B. Tuerkisch, Bulgarisch)
    messages: messages[locale] || de,
  };
});
