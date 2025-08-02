import axios from 'axios'

export interface TranslationResult {
    text: string
    language: string
    languageName: string
    flag: string
    error?: string
}

export interface I18nMessages {
    googleApiKeyMissing: string
    microsoftApiKeyMissing: string
    deeplApiKeyMissing: string
    baiduConfigIncomplete: string
    googleTranslateFailed: string
    microsoftTranslateFailed: string
    deeplTranslateFailed: string
    baiduTranslateFailed: string
}

export interface TranslationProvider {
    name: string
    translate: (text: string, targetLang: string, messages?: I18nMessages) => Promise<string>
    isConfigured: () => boolean
}

// Google Translate API
export class GoogleTranslate implements TranslationProvider {
    name = 'Google Translate'
    private apiKey: string

    constructor(apiKey: string) {
        this.apiKey = apiKey
    }

    isConfigured(): boolean {
        return !!this.apiKey
    }

    async translate(text: string, targetLang: string, messages?: I18nMessages): Promise<string> {
        if (!this.apiKey) throw new Error(messages?.googleApiKeyMissing ?? 'Google API Key not configured')

        try {
            const response = await axios.post(
                `https://translation.googleapis.com/language/translate/v2?key=${this.apiKey}`,
                {
                    q: text,
                    target: targetLang,
                    format: 'text'
                }
            )

            return response.data.data.translations[0].translatedText
        } catch (error) {
            throw new Error(messages?.googleTranslateFailed ?? `Google Translate failed: ${error}`)
        }
    }
}

// Microsoft Translator API
export class MicrosoftTranslate implements TranslationProvider {
    name = 'Microsoft Translator'
    private apiKey: string
    private region: string

    constructor(apiKey: string, region: string = 'global') {
        this.apiKey = apiKey
        this.region = region
    }

    isConfigured(): boolean {
        return !!this.apiKey
    }

    async translate(text: string, targetLang: string, messages?: I18nMessages): Promise<string> {
        if (!this.apiKey) throw new Error(messages?.microsoftApiKeyMissing ?? 'Microsoft API Key not configured')

        try {
            const response = await axios.post(
                'https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&to=' + targetLang,
                [{text}],
                {
                    headers: {
                        'Ocp-Apim-Subscription-Key': this.apiKey,
                        'Ocp-Apim-Subscription-Region': this.region,
                        'Content-Type': 'application/json'
                    }
                }
            )

            return response.data[0].translations[0].text
        } catch (error) {
            throw new Error(messages?.microsoftTranslateFailed ?? `Microsoft Translator failed: ${error}`)
        }
    }
}

// DeepL API
export class DeepLTranslate implements TranslationProvider {
    name = 'DeepL'
    private apiKey: string

    constructor(apiKey: string) {
        this.apiKey = apiKey
    }

    isConfigured(): boolean {
        return !!this.apiKey
    }

    async translate(text: string, targetLang: string, messages?: I18nMessages): Promise<string> {
        if (!this.apiKey) throw new Error(messages?.deeplApiKeyMissing ?? 'DeepL API Key not configured')

        try {
            const response = await axios.post(
                'https://api-free.deepl.com/v2/translate',
                new URLSearchParams({
                    auth_key: this.apiKey,
                    text,
                    target_lang: targetLang.toUpperCase()
                }),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            )

            return response.data.translations[0].text
        } catch (error) {
            throw new Error(messages?.deeplTranslateFailed ?? `DeepL translation failed: ${error}`)
        }
    }
}

// 百度翻译API
export class BaiduTranslate implements TranslationProvider {
    name = '百度翻译'
    private appId: string
    private secretKey: string

    constructor(appId: string, secretKey: string) {
        this.appId = appId
        this.secretKey = secretKey
    }

    isConfigured(): boolean {
        return !!(this.appId && this.secretKey)
    }

    private md5(str: string): string {
        // Simple MD5 implementation for browser
        function md5cycle(x: number[], k: number[]) {
            let a = x[0], b = x[1], c = x[2], d = x[3]

            a = ff(a, b, c, d, k[0], 7, -680876936)
            d = ff(d, a, b, c, k[1], 12, -389564586)
            c = ff(c, d, a, b, k[2], 17, 606105819)
            b = ff(b, c, d, a, k[3], 22, -1044525330)
            a = ff(a, b, c, d, k[4], 7, -176418897)
            d = ff(d, a, b, c, k[5], 12, 1200080426)
            c = ff(c, d, a, b, k[6], 17, -1473231341)
            b = ff(b, c, d, a, k[7], 22, -45705983)
            a = ff(a, b, c, d, k[8], 7, 1770035416)
            d = ff(d, a, b, c, k[9], 12, -1958414417)
            c = ff(c, d, a, b, k[10], 17, -42063)
            b = ff(b, c, d, a, k[11], 22, -1990404162)
            a = ff(a, b, c, d, k[12], 7, 1804603682)
            d = ff(d, a, b, c, k[13], 12, -40341101)
            c = ff(c, d, a, b, k[14], 17, -1502002290)
            b = ff(b, c, d, a, k[15], 22, 1236535329)

            a = gg(a, b, c, d, k[1], 5, -165796510)
            d = gg(d, a, b, c, k[6], 9, -1069501632)
            c = gg(c, d, a, b, k[11], 14, 643717713)
            b = gg(b, c, d, a, k[0], 20, -373897302)
            a = gg(a, b, c, d, k[5], 5, -701558691)
            d = gg(d, a, b, c, k[10], 9, 38016083)
            c = gg(c, d, a, b, k[15], 14, -660478335)
            b = gg(b, c, d, a, k[4], 20, -405537848)
            a = gg(a, b, c, d, k[9], 5, 568446438)
            d = gg(d, a, b, c, k[14], 9, -1019803690)
            c = gg(c, d, a, b, k[3], 14, -187363961)
            b = gg(b, c, d, a, k[8], 20, 1163531501)
            a = gg(a, b, c, d, k[13], 5, -1444681467)
            d = gg(d, a, b, c, k[2], 9, -51403784)
            c = gg(c, d, a, b, k[7], 14, 1735328473)
            b = gg(b, c, d, a, k[12], 20, -1926607734)

            a = hh(a, b, c, d, k[5], 4, -378558)
            d = hh(d, a, b, c, k[8], 11, -2022574463)
            c = hh(c, d, a, b, k[11], 16, 1839030562)
            b = hh(b, c, d, a, k[14], 23, -35309556)
            a = hh(a, b, c, d, k[1], 4, -1530992060)
            d = hh(d, a, b, c, k[4], 11, 1272893353)
            c = hh(c, d, a, b, k[7], 16, -155497632)
            b = hh(b, c, d, a, k[10], 23, -1094730640)
            a = hh(a, b, c, d, k[13], 4, 681279174)
            d = hh(d, a, b, c, k[0], 11, -358537222)
            c = hh(c, d, a, b, k[3], 16, -722521979)
            b = hh(b, c, d, a, k[6], 23, 76029189)
            a = hh(a, b, c, d, k[9], 4, -640364487)
            d = hh(d, a, b, c, k[12], 11, -421815835)
            c = hh(c, d, a, b, k[15], 16, 530742520)
            b = hh(b, c, d, a, k[2], 23, -995338651)

            a = ii(a, b, c, d, k[0], 6, -198630844)
            d = ii(d, a, b, c, k[7], 10, 1126891415)
            c = ii(c, d, a, b, k[14], 15, -1416354905)
            b = ii(b, c, d, a, k[5], 21, -57434055)
            a = ii(a, b, c, d, k[12], 6, 1700485571)
            d = ii(d, a, b, c, k[3], 10, -1894986606)
            c = ii(c, d, a, b, k[10], 15, -1051523)
            b = ii(b, c, d, a, k[1], 21, -2054922799)
            a = ii(a, b, c, d, k[8], 6, 1873313359)
            d = ii(d, a, b, c, k[15], 10, -30611744)
            c = ii(c, d, a, b, k[6], 15, -1560198380)
            b = ii(b, c, d, a, k[13], 21, 1309151649)
            a = ii(a, b, c, d, k[4], 6, -145523070)
            d = ii(d, a, b, c, k[11], 10, -1120210379)
            c = ii(c, d, a, b, k[2], 15, 718787259)
            b = ii(b, c, d, a, k[9], 21, -343485551)

            x[0] = add32(a, x[0])
            x[1] = add32(b, x[1])
            x[2] = add32(c, x[2])
            x[3] = add32(d, x[3])
        }

        function cmn(q: number, a: number, b: number, x: number, s: number, t: number) {
            a = add32(add32(a, q), add32(x, t))
            return add32((a << s) | (a >>> (32 - s)), b)
        }

        function ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
            return cmn((b & c) | ((~b) & d), a, b, x, s, t)
        }

        function gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
            return cmn((b & d) | (c & (~d)), a, b, x, s, t)
        }

        function hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
            return cmn(b ^ c ^ d, a, b, x, s, t)
        }

        function ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
            return cmn(c ^ (b | (~d)), a, b, x, s, t)
        }

        function md51(s: string) {
            const n = s.length
            const state = [1732584193, -271733879, -1732584194, 271733878]
            let i
            for (i = 64; i <= s.length; i += 64) {
                md5cycle(state, md5blk(s.substring(i - 64, i)))
            }
            s = s.substring(i - 64)
            const tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            for (i = 0; i < s.length; i++)
                tail[i >> 2] |= s.charCodeAt(i) << ((i % 4) << 3)
            tail[i >> 2] |= 0x80 << ((i % 4) << 3)
            if (i > 55) {
                md5cycle(state, tail)
                for (i = 0; i < 16; i++) tail[i] = 0
            }
            tail[14] = n * 8
            md5cycle(state, tail)
            return state
        }

        function md5blk(s: string) {
            const md5blks = []
            for (let i = 0; i < 64; i += 4) {
                md5blks[i >> 2] = s.charCodeAt(i)
                    + (s.charCodeAt(i + 1) << 8)
                    + (s.charCodeAt(i + 2) << 16)
                    + (s.charCodeAt(i + 3) << 24)
            }
            return md5blks
        }

        function rhex(n: number) {
            let s = '', j = 0
            for (; j < 4; j++)
                s += hex_chr[(n >> (j * 8 + 4)) & 0x0F]
                    + hex_chr[(n >> (j * 8)) & 0x0F]
            return s
        }

        function hex(x: number[]) {
            for (let i = 0; i < x.length; i++)
                x[i] = Number(rhex(x[i]))
            return x.join('')
        }

        function add32(a: number, b: number) {
            return (a + b) & 0xFFFFFFFF
        }

        const hex_chr = '0123456789abcdef'.split('')

        return hex(md51(str))
    }

    private generateSign(query: string, salt: string): string {
        const str = this.appId + query + salt + this.secretKey
        return this.md5(str)
    }

    async translate(text: string, targetLang: string, messages?: I18nMessages): Promise<string> {
        if (!this.appId || !this.secretKey) throw new Error(messages?.baiduConfigIncomplete ?? 'Baidu Translate API configuration incomplete')

        try {
            const salt = Date.now().toString()
            const sign = this.generateSign(text, salt)

            const response = await axios.get('https://fanyi-api.baidu.com/api/trans/vip/translate', {
                params: {
                    q: text,
                    from: 'auto',
                    to: targetLang,
                    appid: this.appId,
                    salt,
                    sign
                }
            })

            if (response.data.error_code) {
                throw new Error(`Baidu Translate error: ${response.data.error_msg}`)
            }

            return response.data.trans_result[0].dst
        } catch (error) {
            throw new Error(messages?.baiduTranslateFailed ?? `Baidu translation failed: ${error}`)
        }
    }
}

// 语言配置
export const SUPPORTED_LANGUAGES_BASE = [
    {code: 'en', flag: '🇺🇸'},
    {code: 'zh', flag: '🇨🇳'},
    {code: 'ja', flag: '🇯🇵'},
    {code: 'ko', flag: '🇰🇷'},
    {code: 'fr', flag: '🇫🇷'},
    {code: 'de', flag: '🇩🇪'},
    {code: 'es', flag: '🇪🇸'},
    {code: 'it', flag: '🇮🇹'},
    {code: 'ru', flag: '🇷🇺'},
    {code: 'pt', flag: '🇵🇹'},
    {code: 'ar', flag: '🇸🇦'},
    {code: 'th', flag: '🇹🇭'},
    {code: 'vi', flag: '🇻🇳'},
    {code: 'hi', flag: '🇮🇳'}
]

// 创建国际化语言列表的函数
export const createSupportedLanguages = (t: (key: string) => string) => {
    return SUPPORTED_LANGUAGES_BASE.map(lang => ({
        ...lang,
        name: t(`languages_list.${lang.code}`)
    }))
}

// 为了兼容性，保留原有的导出（使用中文名称）
export const SUPPORTED_LANGUAGES = [
    {code: 'en', name: '英语', flag: '🇺🇸'},
    {code: 'zh', name: '中文', flag: '🇨🇳'},
    {code: 'ja', name: '日语', flag: '🇯🇵'},
    {code: 'ko', name: '韩语', flag: '🇰🇷'},
    {code: 'fr', name: '法语', flag: '🇫🇷'},
    {code: 'de', name: '德语', flag: '🇩🇪'},
    {code: 'es', name: '西班牙语', flag: '🇪🇸'},
    {code: 'it', name: '意大利语', flag: '🇮🇹'},
    {code: 'ru', name: '俄语', flag: '🇷🇺'},
    {code: 'pt', name: '葡萄牙语', flag: '🇵🇹'},
    {code: 'ar', name: '阿拉伯语', flag: '🇸🇦'},
    {code: 'th', name: '泰语', flag: '🇹🇭'},
    {code: 'vi', name: '越南语', flag: '🇻🇳'},
    {code: 'hi', name: '印地语', flag: '🇮🇳'}
]

// 翻译服务类
export class TranslationService {
    private providers: TranslationProvider[] = []
    private selectedProvider: TranslationProvider | null = null

    addProvider(provider: TranslationProvider) {
        this.providers.push(provider)
        if (!this.selectedProvider && provider.isConfigured()) {
            this.selectedProvider = provider
        }
    }

    setProvider(providerName: string) {
        const provider = this.providers.find(p => p.name === providerName)
        if (provider && provider.isConfigured()) {
            this.selectedProvider = provider
            return true
        }
        return false
    }

    getAvailableProviders(): string[] {
        return this.providers.filter(p => p.isConfigured()).map(p => p.name)
    }

    getCurrentProvider(): string | null {
        return this.selectedProvider?.name || null
    }

    async translateToMultipleLanguages(
        text: string,
        targetLanguages: string[],
        messages?: {
            noProvider: string
            translationFailed: string
        } & I18nMessages
    ): Promise<TranslationResult[]> {
        if (!this.selectedProvider) {
            throw new Error(messages?.noProvider ?? 'No translation service provider available')
        }

        const results: TranslationResult[] = []

        for (const langCode of targetLanguages) {
            const langInfo = SUPPORTED_LANGUAGES.find(l => l.code === langCode)
            if (!langInfo) continue

            try {
                const translatedText = await this.selectedProvider.translate(text, langCode, messages)
                results.push({
                    text: translatedText,
                    language: langCode,
                    languageName: langInfo.name,
                    flag: langInfo.flag
                })
            } catch (error) {
                results.push({
                    text: '',
                    language: langCode,
                    languageName: langInfo.name,
                    flag: langInfo.flag,
                    error: error instanceof Error ? error.message : (messages?.translationFailed ?? 'Translation failed')
                })
            }
        }

        return results
    }
}