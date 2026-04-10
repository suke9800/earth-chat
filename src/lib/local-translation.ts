type TranslateLocalRequest = {
  text: string
  sourceLang?: string
  targetLang: string
  localOnly?: boolean
}

type MyMemoryResponse = {
  responseData?: {
    translatedText?: string
  }
  responseStatus?: number
  responseDetails?: string
}

type GoogleDjResponse = {
  sentences?: Array<{
    trans?: string
  }>
}

type TranslateProvider = 'auto' | 'google' | 'mymemory' | 'local'

const GOOGLE_TRANSLATE_ENDPOINT = (
  import.meta.env.VITE_TRANSLATE_GOOGLE_HTTP_URL ??
  'https://translate.googleapis.com/translate_a/single'
).trim()
const MYMEMORY_TRANSLATE_ENDPOINT = (
  import.meta.env.VITE_TRANSLATE_HTTP_URL ??
  'https://api.mymemory.translated.net/get'
).trim()
const MYMEMORY_CONTACT_EMAIL = (
  import.meta.env.VITE_TRANSLATE_MYMEMORY_EMAIL ??
  ''
).trim()
const TRANSLATE_PROVIDER = (
  import.meta.env.VITE_TRANSLATE_PROVIDER ??
  'auto'
).trim()
const TRANSLATE_TIMEOUT_MS = 3000
const MAX_REMOTE_TEXT_LENGTH = 450
const REMOTE_CACHE_MAX = 3000

const LANGUAGE_CODE_MAP: Record<string, string> = {
  en: 'en-US',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
  pt: 'pt-PT',
  ar: 'ar-SA',
  hi: 'hi-IN',
  ja: 'ja-JP',
  ko: 'ko-KR',
  zh: 'zh-CN',
  ru: 'ru-RU',
  it: 'it-IT',
  tr: 'tr-TR',
  vi: 'vi-VN',
  th: 'th-TH',
  id: 'id-ID',
  ms: 'ms-MY',
  nl: 'nl-NL',
  pl: 'pl-PL',
}

const HI_TRANSLATIONS: Record<string, string> = {
  en: 'hi',
  es: 'hola',
  fr: 'salut',
  de: 'hallo',
  pt: 'oi',
  ar: '\u0645\u0631\u062D\u0628\u0627',
  hi: '\u0928\u092E\u0938\u094D\u0924\u0947',
  ja: '\u3053\u3093\u306B\u3061\u306F',
  ko: '\uC548\uB155',
  zh: '\u4F60\u597D',
  ru: '\u043F\u0440\u0438\u0432\u0435\u0442',
  it: 'ciao',
  tr: 'merhaba',
  vi: 'xin chao',
  th: '\u0E2A\u0E27\u0E31\u0E2A\u0E14\u0E35',
  id: 'hai',
  ms: 'hai',
  nl: 'hoi',
  pl: 'czesc',
}

const THANK_YOU_TRANSLATIONS: Record<string, string> = {
  en: 'thank you',
  es: 'gracias',
  fr: 'merci',
  de: 'danke',
  pt: 'obrigado',
  ar: '\u0634\u0643\u0631\u0627',
  hi: '\u0927\u0928\u094D\u092F\u0935\u093E\u0926',
  ja: '\u3042\u308A\u304C\u3068\u3046',
  ko: '\uAC10\uC0AC\uD569\uB2C8\uB2E4',
  zh: '\u8C22\u8C22',
  ru: '\u0441\u043F\u0430\u0441\u0438\u0431\u043E',
  it: 'grazie',
  tr: 'tesekkurler',
  vi: 'cam on',
  th: '\u0E02\u0E2D\u0E1A\u0E04\u0E38\u0E13',
  id: 'terima kasih',
  ms: 'terima kasih',
  nl: 'dank je',
  pl: 'dziekuje',
}

const BYE_TRANSLATIONS: Record<string, string> = {
  en: 'bye',
  es: 'adios',
  fr: 'au revoir',
  de: 'tschuss',
  pt: 'tchau',
  ar: '\u0645\u0639 \u0627\u0644\u0633\u0644\u0627\u0645\u0629',
  hi: '\u0905\u0932\u0935\u093F\u0926\u093E',
  ja: '\u3058\u3083\u3042\u306D',
  ko: '\uC798\uAC00',
  zh: '\u518D\u89C1',
  ru: '\u043F\u043E\u043A\u0430',
  it: 'ciao',
  tr: 'gule gule',
  vi: 'tam biet',
  th: '\u0E25\u0E32\u0E01\u0E48\u0E2D\u0E19',
  id: 'dadah',
  ms: 'selamat tinggal',
  nl: 'doei',
  pl: 'pa',
}

const HOW_ARE_YOU_TRANSLATIONS: Record<string, string> = {
  en: 'how are you',
  es: 'como estas',
  fr: 'comment ca va',
  de: 'wie geht es dir',
  pt: 'como voce esta',
  ar: '\u0643\u064A\u0641 \u062D\u0627\u0644\u0643',
  hi: '\u0906\u092A \u0915\u0948\u0938\u0947 \u0939\u0948\u0902',
  ja: '\u304A\u5143\u6C17\u3067\u3059\u304B',
  ko: '\uC5B4\uB5BB\uAC8C \uC9C0\uB0B4\uC138\uC694',
  zh: '\u4F60\u8FD8\u597D\u5417',
  ru: '\u043A\u0430\u043A \u0434\u0435\u043B\u0430',
  it: 'come stai',
  tr: 'nasilsin',
  vi: 'ban khoe khong',
  th: '\u0E2A\u0E1A\u0E32\u0E22\u0E14\u0E35\u0E44\u0E2B\u0E21',
  id: 'apa kabar',
  ms: 'apa khabar',
  nl: 'hoe gaat het',
  pl: 'jak sie masz',
}

const FALLBACK_PHRASES: Record<string, Record<string, string>> = {
  hi: HI_TRANSLATIONS,
  hey: HI_TRANSLATIONS,
  hello: {
    ...HI_TRANSLATIONS,
    en: 'hello',
  },
  thanks: THANK_YOU_TRANSLATIONS,
  'thank you': THANK_YOU_TRANSLATIONS,
  bye: BYE_TRANSLATIONS,
  'how are you': HOW_ARE_YOU_TRANSLATIONS,
}

const remoteTranslationCache = new Map<string, string>()

function normalizeInput(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[?!.,]/g, '')
    .replace(/\s+/g, ' ')
}

function normalizeProvider(rawProvider: string): TranslateProvider {
  const normalized = rawProvider.trim().toLowerCase()
  if (
    normalized === 'google' ||
    normalized === 'mymemory' ||
    normalized === 'local'
  ) {
    return normalized
  }
  return 'auto'
}

function mapLanguageCodeForMyMemory(code?: string): string | null {
  if (!code) {
    return null
  }
  const normalized = code.trim().toLowerCase()
  if (!normalized) {
    return null
  }
  if (LANGUAGE_CODE_MAP[normalized]) {
    return LANGUAGE_CODE_MAP[normalized]
  }
  return normalized
}

function mapLanguageCodeForGoogle(code?: string): string | null {
  if (!code) {
    return null
  }
  const normalized = code.trim().toLowerCase()
  if (!normalized) {
    return null
  }
  if (normalized === 'zh') {
    return 'zh-CN'
  }
  if (normalized === 'pt-br') {
    return 'pt'
  }
  return normalized
}

function buildCacheKey(text: string, sourceLang: string, targetLang: string): string {
  return `${sourceLang}|${targetLang}|${text}`
}

function getCachedTranslation(cacheKey: string): string | null {
  const cached = remoteTranslationCache.get(cacheKey)
  if (!cached) {
    return null
  }
  remoteTranslationCache.delete(cacheKey)
  remoteTranslationCache.set(cacheKey, cached)
  return cached
}

function setCachedTranslation(cacheKey: string, translated: string): void {
  remoteTranslationCache.set(cacheKey, translated)
  if (remoteTranslationCache.size <= REMOTE_CACHE_MAX) {
    return
  }
  const oldest = remoteTranslationCache.keys().next().value
  if (oldest) {
    remoteTranslationCache.delete(oldest)
  }
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error('translation_timeout'))
    }, ms)
  })

  try {
    return await Promise.race([promise, timeoutPromise])
  } finally {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
    }
  }
}

function extractLegacyGoogleTranslation(payload: unknown): string | null {
  if (!Array.isArray(payload) || !Array.isArray(payload[0])) {
    return null
  }

  const segments = (payload[0] as unknown[])
    .map((segment) => (Array.isArray(segment) ? segment[0] : null))
    .filter((segment): segment is string => typeof segment === 'string')

  if (segments.length === 0) {
    return null
  }

  const merged = segments.join('').trim()
  return merged || null
}

async function translateByGoogle(params: {
  text: string
  sourceLang: string
  targetLang: string
}): Promise<string> {
  const sourceLang = mapLanguageCodeForGoogle(params.sourceLang) ?? 'auto'
  const targetLang = mapLanguageCodeForGoogle(params.targetLang)

  if (!targetLang) {
    return params.text
  }
  if (sourceLang !== 'auto' && sourceLang === targetLang) {
    return params.text
  }

  const url = new URL(GOOGLE_TRANSLATE_ENDPOINT)
  url.searchParams.set('client', 'gtx')
  url.searchParams.set('sl', sourceLang)
  url.searchParams.set('tl', targetLang)
  url.searchParams.set('dt', 't')
  url.searchParams.set('dj', '1')
  url.searchParams.set('q', params.text.slice(0, MAX_REMOTE_TEXT_LENGTH))

  const response = await withTimeout(
    fetch(url.toString(), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    }),
    TRANSLATE_TIMEOUT_MS
  )

  if (!response.ok) {
    throw new Error(`google_translation_http_${response.status}`)
  }

  const payload = (await response.json()) as GoogleDjResponse | unknown
  let translated: string | null = null

  if (payload && typeof payload === 'object' && 'sentences' in payload) {
    const sentences = (payload as GoogleDjResponse).sentences ?? []
    const merged = sentences
      .map((entry) => entry.trans)
      .filter((entry): entry is string => typeof entry === 'string')
      .join('')
      .trim()
    translated = merged || null
  } else {
    translated = extractLegacyGoogleTranslation(payload)
  }

  if (!translated) {
    throw new Error('google_translation_empty')
  }

  return translated
}

async function translateByMyMemory(params: {
  text: string
  sourceLang: string
  targetLang: string
}): Promise<string> {
  const sourceLang = mapLanguageCodeForMyMemory(params.sourceLang)
  const targetLang = mapLanguageCodeForMyMemory(params.targetLang)

  if (!sourceLang || !targetLang || sourceLang === targetLang) {
    return params.text
  }

  const url = new URL(MYMEMORY_TRANSLATE_ENDPOINT)
  url.searchParams.set('q', params.text.slice(0, MAX_REMOTE_TEXT_LENGTH))
  url.searchParams.set('langpair', `${sourceLang}|${targetLang}`)
  if (MYMEMORY_CONTACT_EMAIL) {
    url.searchParams.set('de', MYMEMORY_CONTACT_EMAIL)
  }

  const response = await withTimeout(
    fetch(url.toString(), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    }),
    TRANSLATE_TIMEOUT_MS
  )

  if (!response.ok) {
    throw new Error(`mymemory_translation_http_${response.status}`)
  }

  const payload = (await response.json()) as MyMemoryResponse
  const status = Number(payload.responseStatus ?? 200)
  if (!Number.isFinite(status) || status >= 400) {
    throw new Error(payload.responseDetails || `mymemory_translation_status_${status}`)
  }

  const translated = payload.responseData?.translatedText
  if (typeof translated !== 'string' || !translated.trim()) {
    throw new Error('mymemory_translation_empty')
  }

  return translated.trim()
}

function translateByFallbackDictionary(params: {
  text: string
  targetLang: string
}): string {
  const normalized = normalizeInput(params.text)
  const target = params.targetLang.trim().toLowerCase()
  const phrase = FALLBACK_PHRASES[normalized]?.[target]
  if (phrase) {
    return phrase
  }
  return `[${target.toUpperCase()}] ${params.text}`
}

async function translateByRemoteProviders(params: {
  text: string
  sourceLang: string
  targetLang: string
  provider: TranslateProvider
}): Promise<string> {
  const providerOrder =
    params.provider === 'google'
      ? ['google']
      : params.provider === 'mymemory'
        ? ['mymemory']
        : ['google', 'mymemory']

  let lastError: Error | null = null

  for (const provider of providerOrder) {
    try {
      if (provider === 'google') {
        return await translateByGoogle(params)
      }
      return await translateByMyMemory(params)
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('translation_failed')
    }
  }

  throw lastError ?? new Error('translation_failed')
}

export async function translateLocalText({
  text,
  sourceLang,
  targetLang,
  localOnly = false,
}: TranslateLocalRequest): Promise<string> {
  const safeText = text.trim()
  const normalizedTarget = targetLang.trim().toLowerCase()
  const normalizedSource = (sourceLang ?? '').trim().toLowerCase() || 'auto'
  const activeProvider = normalizeProvider(TRANSLATE_PROVIDER)

  if (!safeText) {
    return safeText
  }

  if (normalizedTarget && normalizedTarget === normalizedSource) {
    return safeText
  }

  const cacheKey = buildCacheKey(safeText, normalizedSource, normalizedTarget)
  const cached = getCachedTranslation(cacheKey)
  if (cached) {
    return cached
  }

  if (!localOnly && activeProvider !== 'local') {
    try {
      const translated = await translateByRemoteProviders({
        text: safeText,
        sourceLang: normalizedSource,
        targetLang: normalizedTarget,
        provider: activeProvider,
      })
      setCachedTranslation(cacheKey, translated)
      return translated
    } catch {
    }
  }

  const fallback = translateByFallbackDictionary({
    text: safeText,
    targetLang: normalizedTarget || 'translated',
  })
  setCachedTranslation(cacheKey, fallback)
  return fallback
}
