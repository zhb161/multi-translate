import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import zhCN from './locales/zh-CN.json'

export type MessageLanguages = keyof typeof en

const i18n = createI18n<false, typeof en>({
  legacy: false,
  locale: 'zh-CN', // default locale
  fallbackLocale: 'en',
  messages: {
    'en': en,
    'zh-CN': zhCN
  }
})

export default i18n