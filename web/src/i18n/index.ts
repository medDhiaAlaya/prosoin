import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import fr from './locales/fr.json';

const resources = {
  fr: {
    translation: fr
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'fr', // Force French language
    fallbackLng: 'fr',
    debug: false,
    interpolation: {
      escapeValue: false,
    }
  });

export default i18n; 