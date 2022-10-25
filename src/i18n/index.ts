import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import Backend from 'i18next-http-backend'

const initI18n = (defaultLang = 'en-US') => {
  i18n
    .use(Backend)
    .use(initReactI18next)
    .init({
      interpolation: {
        escapeValue: false
      },
      react: {
        useSuspense: false
      },
      lng: defaultLang,
      fallbackLng: defaultLang,
      backend: {
        loadPath: (lang: string) => `/locales/${lang}/translation.json`
      }
    })
  return i18n
}
export default initI18n
