import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { resources, DEFAULT_LOCALE, SUPPORTED_LOCALES } from 'onote-shared';

export function initI18n() {
  return i18next
    .use(initReactI18next)
    .use(LanguageDetector)
    .init({
      resources,
      fallbackLng: DEFAULT_LOCALE,
      supportedLngs: SUPPORTED_LOCALES,
      ns: ['common', 'menu', 'setting', 'sidebar'],
      defaultNS: 'common',
      interpolation: {
        escapeValue: false,
      },
      detection: {
        order: ['localStorage', 'navigator'],
        caches: ['localStorage'],
        lookupLocalStorage: 'i18nextLng',
      },
    });
}

export default i18next;
