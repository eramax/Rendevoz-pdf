import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import zhCN from '@/assets/locales/zh-CN/translation.json'
import enUS from '@/assets/locales/en-US/translation.json'

const initI18n = (defaultLang = 'en-US') => {
  i18n.use(initReactI18next).init({
    resources: {
      'en-US': {
        translation: enUS
      },
      'zh-CN': {
        translation: zhCN
      }
    },
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: false
    },
    lng: defaultLang,
    fallbackLng: defaultLang
  })
  return i18n
}
export default initI18n
