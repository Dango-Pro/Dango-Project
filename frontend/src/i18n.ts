import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locales/en.json";
import ko from "./locales/ko.json";
import ja from "./locales/ja.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ko: { translation: ko },
      ja: { translation: ja },
    },
    fallbackLng: "ko", // Default to Korean as per user context implicitly or explicit request? User said "Korean, Japanese, English". I'll default to KO.
    interpolation: {
      escapeValue: false, // React already safes from xss
    },
  });

export default i18n;
