import type { LocalizationResource } from '@clerk/types';
import type { LocalePrefixMode } from 'next-intl/routing';
import { enUS, frFR, idID } from '@clerk/localizations';

const localePrefix: LocalePrefixMode = 'as-needed';

// FIXME: Update this configuration file based on your project information
export const AppConfig = {
  name: 'UndanganAI',
  locales: ['id', 'en', 'fr'],
  defaultLocale: 'id',
  localePrefix,
};

const supportedLocales: Record<string, LocalizationResource> = {
  id: idID,
  en: enUS,
  fr: frFR,
};

export const ClerkLocalizations = {
  defaultLocale: enUS,
  supportedLocales,
};
