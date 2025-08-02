import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { 
  TranslationService, 
  GoogleTranslate, 
  MicrosoftTranslate, 
  DeepLTranslate, 
  BaiduTranslate,
  SUPPORTED_LANGUAGES,
  SUPPORTED_LANGUAGES_BASE,
  createSupportedLanguages,
  type TranslationResult,
  type I18nMessages 
} from '../services/translationService'

export interface ApiConfig {
  google?: {
    apiKey: string
  }
  microsoft?: {
    apiKey: string
    region: string
  }
  deepl?: {
    apiKey: string
  }
  baidu?: {
    appId: string
    secretKey: string
  }
}

export interface AppSettings {
  selectedLanguages: string[]
  alwaysOnTop: boolean
  opacity: number
  autoTranslateOnClipboard: boolean
  autoTranslate: boolean
  currentProvider: string
}

export const useAppStore = defineStore('app', () => {
  // 状态
  const translationService = new TranslationService()
  const translationResults = ref<TranslationResult[]>([])
  const isTranslating = ref(false)
  const inputText = ref('')
  const i18nMessages = ref<I18nMessages & { noProvider: string; translationFailed: string }>({
    googleApiKeyMissing: 'Google API Key not configured',
    microsoftApiKeyMissing: 'Microsoft API Key not configured',
    deeplApiKeyMissing: 'DeepL API Key not configured',
    baiduConfigIncomplete: 'Baidu Translate API configuration incomplete',
    googleTranslateFailed: 'Google Translate failed',
    microsoftTranslateFailed: 'Microsoft Translator failed',
    deeplTranslateFailed: 'DeepL translation failed',
    baiduTranslateFailed: 'Baidu translation failed',
    noProvider: 'No translation service provider available',
    translationFailed: 'Translation failed'
  })
  const translateFunction = ref<((key: string) => string) | null>(null)
  
  // 设置
  const settings = ref<AppSettings>({
    selectedLanguages: ['en', 'ja', 'ko', 'fr'],
    alwaysOnTop: false,
    opacity: 1,
    autoTranslateOnClipboard: true,
    autoTranslate: false,
    currentProvider: ''
  })
  
  const apiConfig = ref<ApiConfig>({})

  // 计算属性
  const availableLanguages = computed(() => {
    if (translateFunction.value) {
      return createSupportedLanguages(translateFunction.value)
    }
    return SUPPORTED_LANGUAGES
  })
  
  const selectedLanguageNames = computed(() => 
    settings.value.selectedLanguages.map(code => 
      availableLanguages.value.find(lang => lang.code === code)?.name
    ).filter(Boolean)
  )
  const availableProviders = computed(() => translationService.getAvailableProviders())
  
  // 显示的翻译卡片（按选中语言顺序）
  const displayCards = computed(() => {
    return settings.value.selectedLanguages.map(langCode => {
      const langInfo = availableLanguages.value.find(l => l.code === langCode)
      const result = translationResults.value.find(r => r.language === langCode)
      
      return {
        language: langCode,
        languageName: langInfo?.name || '',
        flag: langInfo?.flag || '',
        text: result?.text || '',
        error: result?.error || '',
        isLoading: isTranslating.value && !result?.text && !result?.error
      }
    })
  })

  // 初始化翻译服务
  const initializeTranslationServices = () => {
    if (apiConfig.value.google?.apiKey) {
      translationService.addProvider(new GoogleTranslate(apiConfig.value.google.apiKey))
    }
    
    if (apiConfig.value.microsoft?.apiKey) {
      translationService.addProvider(new MicrosoftTranslate(
        apiConfig.value.microsoft.apiKey,
        apiConfig.value.microsoft.region
      ))
    }
    
    if (apiConfig.value.deepl?.apiKey) {
      translationService.addProvider(new DeepLTranslate(apiConfig.value.deepl.apiKey))
    }
    
    if (apiConfig.value.baidu?.appId && apiConfig.value.baidu?.secretKey) {
      translationService.addProvider(new BaiduTranslate(
        apiConfig.value.baidu.appId,
        apiConfig.value.baidu.secretKey
      ))
    }

    // 设置当前提供商
    if (settings.value.currentProvider) {
      translationService.setProvider(settings.value.currentProvider)
    }
  }

  // 设置国际化消息和翻译函数
  const setI18nMessages = (messages: typeof i18nMessages.value, t?: (key: string) => string) => {
    i18nMessages.value = messages
    if (t) {
      translateFunction.value = t
    }
  }

  // 动作
  const translate = async (text?: string) => {
    const textToTranslate = text || inputText.value
    if (!textToTranslate.trim()) return

    isTranslating.value = true
    try {
      const results = await translationService.translateToMultipleLanguages(
        textToTranslate,
        settings.value.selectedLanguages,
        i18nMessages.value
      )
      translationResults.value = results
    } catch (error) {
      console.error('Translation failed:', error)
      // 显示错误结果
      translationResults.value = settings.value.selectedLanguages.map(langCode => {
        const langInfo = availableLanguages.value.find(l => l.code === langCode)
        return {
          text: '',
          language: langCode,
          languageName: langInfo?.name || '',
          flag: langInfo?.flag || '',
          error: error instanceof Error ? error.message : i18nMessages.value.translationFailed
        }
      })
    } finally {
      isTranslating.value = false
    }
  }

  const updateApiConfig = (config: Partial<ApiConfig>) => {
    apiConfig.value = { ...apiConfig.value, ...config }
    saveSettings()
    initializeTranslationServices()
  }

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    settings.value = { ...settings.value, ...newSettings }
    saveSettings()
  }

  const toggleLanguage = (langCode: string) => {
    const index = settings.value.selectedLanguages.indexOf(langCode)
    if (index > -1) {
      settings.value.selectedLanguages.splice(index, 1)
    } else {
      settings.value.selectedLanguages.push(langCode)
    }
    saveSettings()
  }

  const setProvider = (providerName: string) => {
    if (translationService.setProvider(providerName)) {
      settings.value.currentProvider = providerName
      saveSettings()
      return true
    }
    return false
  }

  const setAlwaysOnTop = async (alwaysOnTop: boolean) => {
    if (window.electronAPI) {
      const success = await window.electronAPI.setAlwaysOnTop(alwaysOnTop)
      if (success) {
        settings.value.alwaysOnTop = alwaysOnTop
        saveSettings()
      }
      return success
    }
    return false
  }

  const setOpacity = async (opacity: number) => {
    if (window.electronAPI) {
      const success = await window.electronAPI.setOpacity(opacity)
      if (success) {
        settings.value.opacity = opacity
        saveSettings()
      }
      return success
    }
    return false
  }

  // 持久化
  const saveSettings = () => {
    localStorage.setItem('app-settings', JSON.stringify(settings.value))
    localStorage.setItem('api-config', JSON.stringify(apiConfig.value))
  }

  const loadSettings = () => {
    try {
      const savedSettings = localStorage.getItem('app-settings')
      if (savedSettings) {
        settings.value = { ...settings.value, ...JSON.parse(savedSettings) }
      }

      const savedApiConfig = localStorage.getItem('api-config')
      if (savedApiConfig) {
        apiConfig.value = { ...apiConfig.value, ...JSON.parse(savedApiConfig) }
      }

      initializeTranslationServices()
    } catch (error) {
      console.error('加载设置失败:', error)
    }
  }

  // 剪贴板处理
  const handleClipboardText = (text: string) => {
    if (settings.value.autoTranslateOnClipboard && text.trim()) {
      inputText.value = text
      translate(text)
    }
  }

  return {
    // 状态
    translationResults,
    isTranslating,
    inputText,
    settings,
    apiConfig,
    
    // 计算属性
    availableLanguages,
    selectedLanguageNames,
    availableProviders,
    displayCards,
    
    // 动作
    translate,
    updateApiConfig,
    updateSettings,
    toggleLanguage,
    setProvider,
    setAlwaysOnTop,
    setOpacity,
    loadSettings,
    handleClipboardText,
    setI18nMessages
  }
})