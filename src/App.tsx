import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ChangeEvent,
  type FormEvent,
} from 'react'
import {
  addDoc,
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from 'firebase/firestore'
import { DEFAULT_LANGUAGE, getLanguageLabel, LANGUAGES } from './lib/languages'
import {
  DEFAULT_UI_LANGUAGE,
  getUiCopy,
  isUiLanguage,
  UI_LANGUAGES,
  type UiLanguage,
} from './lib/i18n'
import {
  MAX_MESSAGE_AGE_MS,
  MESSAGE_BATCH_WINDOW_MS,
  MESSAGE_BUFFER_LIMIT,
  MESSAGE_MAX_LENGTH,
  MESSAGE_RETENTION_DAYS,
  MUTE_ESCALATE_STRIKE_COUNT,
  MUTE_ESCALATED_DURATION_MS,
  MUTE_DURATION_MS,
  resolveMessagePageLimit,
  resolveRemoteSyncLimit,
  SPAM_EXTENDED_LIMIT_COUNT,
  SPAM_EXTENDED_WINDOW_MS,
  SPAM_LIMIT_COUNT,
  SPAM_WARNING_GAP_COUNT,
  SPAM_WINDOW_MS,
} from './lib/constants'
import {
  ensureAnonymousAuth,
  ensureGooglePaymentAuth,
  firebaseReady,
  getFirebaseDb,
} from './lib/firebase'
import {
  appendLocalMessage,
  appendLocalMessages,
  loadLocalMessages,
  pruneExpiredLocalMessages,
  pruneLocalMessages,
} from './lib/local-messages'
import { translateLocalText } from './lib/local-translation'
import { PAID_EFFECTS, type PaidTier } from './lib/paid-chat'
import { isAndroidBillingBridgeReady } from './lib/play-billing-bridge'
import {
  DEFAULT_VISUAL_SETTINGS,
  loadState,
  saveState,
  type PanelTransparencyPreset,
  type RuntimeProfile,
  type VisualSettings,
} from './lib/storage'
import type { Message, User } from './lib/types'
import {
  VirtualizedMessageList,
  type MessageDensity,
  type VirtualizedMessageListHandle,
} from './components/virtualized-message-list'

type View = 'entry' | 'chat' | 'settings'
type OpsLogLevel = 'info' | 'warn' | 'error'

type Toast = {
  message: string
  tone: 'info' | 'error'
}

type FormState = {
  nickname: string
  locale: string
  uiLanguage: UiLanguage
}

const EMPTY_FORM: FormState = {
  nickname: '',
  locale: DEFAULT_LANGUAGE,
  uiLanguage: DEFAULT_UI_LANGUAGE,
}

const ANDROID_PACKAGE_NAME = (
  import.meta.env.VITE_ANDROID_PACKAGE_NAME ?? ''
).trim()
const FIREBASE_FUNCTIONS_REGION = (
  import.meta.env.VITE_FIREBASE_FUNCTIONS_REGION ?? ''
).trim()
const FORCE_JOIN_DEBUG_TOAST = true
const TRANSLATION_CONCURRENCY = 6
const MAX_OPS_LOG_ENTRIES = 80
const MOBILE_VIEWPORT_BREAKPOINT = 720

type OpsLogEntry = {
  id: string
  level: OpsLogLevel
  message: string
  at: number
}

function roundMetric(value: number): number {
  return Math.round(value * 100) / 100
}

function clampNumber(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) {
    return min
  }
  if (value < min) {
    return min
  }
  if (value > max) {
    return max
  }
  return value
}

function toAlpha(percentage: number): number {
  return clampNumber(percentage, 0, 100) / 100
}

const PANEL_PRESET_ALPHA: Record<PanelTransparencyPreset, number> = {
  low: 0.82,
  medium: 0.72,
  high: 0.6,
}

type PaidMessage = Message & { paidTier: PaidTier }

function isPaidMessage(message: Message): message is PaidMessage {
  return message.paidTier === 'earth' || message.paidTier === 'space'
}

function findLatestTierMessages(
  messages: Message[],
  tier: PaidTier,
  maxCount: number
): PaidMessage[] {
  if (maxCount <= 0) {
    return []
  }

  const next: PaidMessage[] = []

  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const candidate = messages[index]
    if (isPaidMessage(candidate) && candidate.paidTier === tier) {
      next.push(candidate)
      if (next.length >= maxCount) {
        break
      }
    }
  }

  return next
}

function buildTranslationCacheKey(messageId: string, targetLang: string): string {
  return `${targetLang}::${messageId}`
}

function createClientId(): string {
  if (
    typeof globalThis !== 'undefined' &&
    typeof globalThis.crypto?.randomUUID === 'function'
  ) {
    return globalThis.crypto.randomUUID()
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

function detectMessageLanguage(text: string, fallback: string): string {
  if (/[\uac00-\ud7a3]/u.test(text)) {
    return 'ko'
  }
  if (/[\u3040-\u30ff]/u.test(text)) {
    return 'ja'
  }
  if (/[\u4e00-\u9fff]/u.test(text)) {
    return 'zh'
  }
  if (/[\u0400-\u04ff]/u.test(text)) {
    return 'ru'
  }
  if (/[\u0600-\u06ff]/u.test(text)) {
    return 'ar'
  }
  if (/[\u0900-\u097f]/u.test(text)) {
    return 'hi'
  }
  if (/[\u0e00-\u0e7f]/u.test(text)) {
    return 'th'
  }
  if (/^[\s\da-z.,!?'"`~@#$%^&*()_+\-=\[\]{};:/\\|<>]+$/i.test(text)) {
    return 'en'
  }
  return fallback
}

function App() {
  const [view, setView] = useState<View>('chat')
  const [user, setUser] = useState<User | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [settingsForm, setSettingsForm] = useState<FormState>(EMPTY_FORM)
  const [uiLanguage, setUiLanguage] = useState<UiLanguage>(DEFAULT_UI_LANGUAGE)
  const [draft, setDraft] = useState('')
  const [toast, setToast] = useState<Toast | null>(null)
  const [hydrated, setHydrated] = useState(false)
  const [authReady, setAuthReady] = useState(false)
  const [authUid, setAuthUid] = useState<string | null>(null)
  const [firebaseError, setFirebaseError] = useState(false)
  const [muteUntil, setMuteUntil] = useState<number | null>(null)
  const [nowTick, setNowTick] = useState(() => Date.now())
  const [searchQuery, setSearchQuery] = useState('')
  const [density, setDensity] = useState<MessageDensity>('compact')
  const [atBottom, setAtBottom] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const [showPerfPanel, setShowPerfPanel] = useState(false)
  const [autoTranslateEnabled, setAutoTranslateEnabled] = useState(true)
  const [translationLanguage, setTranslationLanguage] =
    useState<string>(DEFAULT_LANGUAGE)
  const [runtimeProfile, setRuntimeProfile] = useState<RuntimeProfile>('local')
  const [visualSettings, setVisualSettings] =
    useState<VisualSettings>(DEFAULT_VISUAL_SETTINGS)
  const [opsLogs, setOpsLogs] = useState<OpsLogEntry[]>([])
  const [showOpsLog, setShowOpsLog] = useState(false)
  const [stressCount, setStressCount] = useState(1000)
  const [stressPending, setStressPending] = useState(false)
  const [translationQueueDepth, setTranslationQueueDepth] = useState(0)
  const [translationInFlight, setTranslationInFlight] = useState(0)
  const [rateRiskLevel, setRateRiskLevel] = useState<'normal' | 'warning' | 'muted'>(
    'normal'
  )
  const [viewportInsetBottom, setViewportInsetBottom] = useState(0)
  const [isMobileViewport, setIsMobileViewport] = useState(false)
  const [fps, setFps] = useState(0)
  const [lastRenderMs, setLastRenderMs] = useState(0)
  const [lastStorageWriteMs, setLastStorageWriteMs] = useState(0)
  const [lastBatchSize, setLastBatchSize] = useState(0)
  const [translationCache, setTranslationCache] = useState<
    Record<string, string>
  >({})
  const [pinnedSpaceMessages, setPinnedSpaceMessages] = useState<PaidMessage[]>([])
  const [pinnedEarthMessage, setPinnedEarthMessage] = useState<PaidMessage | null>(
    null
  )
  const [spaceImpactActive, setSpaceImpactActive] = useState(false)

  const shortWindowSendHistoryRef = useRef<number[]>([])
  const extendedWindowSendHistoryRef = useRef<number[]>([])
  const muteStrikeCountRef = useRef<number>(0)
  const shortWindowWarningShownRef = useRef(false)
  const extendedWindowWarningShownRef = useRef(false)
  const messagesRef = useRef<Message[]>([])
  const pendingMessagesRef = useRef<Message[] | null>(null)
  const pendingBatchTimeoutRef = useRef<number | null>(null)
  const pendingFrameRef = useRef<number | null>(null)
  const translationCacheRef = useRef<Record<string, string>>({})
  const translationPendingRef = useRef<Set<string>>(new Set())
  const renderStartRef = useRef<number | null>(null)
  const lastVisibleMessageIdRef = useRef<string | null>(null)
  const listRef = useRef<VirtualizedMessageListHandle | null>(null)
  const spaceImpactTimeoutRef = useRef<number | null>(null)
  const tierBoardInitializedRef = useRef(false)
  const lastPinnedSpaceKeyRef = useRef<string>('')
  const lastPinnedEarthIdRef = useRef<string | null>(null)
  const lastTransportModeRef = useRef<string>('')
  const lastRuntimeProfileRef = useRef<RuntimeProfile | null>(null)
  const lastTranslationBacklogLogAtRef = useRef(0)

  const copy = useMemo(() => getUiCopy(uiLanguage), [uiLanguage])
  const isMobileAppRuntime = isAndroidBillingBridgeReady()
  const messagePageLimit = useMemo(
    () => resolveMessagePageLimit(isMobileAppRuntime),
    [isMobileAppRuntime]
  )
  const remoteSyncLimit = useMemo(
    () => resolveRemoteSyncLimit(isMobileAppRuntime),
    [isMobileAppRuntime]
  )
  const useLocalMode = !firebaseReady || !authReady || firebaseError
  const showTemporaryUi = runtimeProfile !== 'prod'
  const showPerfControls = runtimeProfile !== 'prod'
  const enableDebugToasts = FORCE_JOIN_DEBUG_TOAST && runtimeProfile === 'dev'
  const pushJoinDebugToast = (step: string) => {
    if (!enableDebugToasts) {
      return
    }
    const message = `[DEBUG] ${step}`
    if (typeof console !== 'undefined') {
      console.info(message)
    }
    setToast({ message, tone: 'info' })
  }
  const pushOpsLog = useCallback((level: OpsLogLevel, message: string) => {
    setOpsLogs((prev) => {
      const nextEntry: OpsLogEntry = {
        id: createClientId(),
        level,
        message,
        at: Date.now(),
      }
      const next = [nextEntry, ...prev]
      if (next.length > MAX_OPS_LOG_ENTRIES) {
        return next.slice(0, MAX_OPS_LOG_ENTRIES)
      }
      return next
    })
  }, [])

  const releaseReadiness = useMemo(() => {
    const hasFirebaseConfig = firebaseReady
    const hasAuthHandshake = authReady && !firebaseError
    const hasCloudSync = !useLocalMode
    const hasAndroidPackage = ANDROID_PACKAGE_NAME.length > 0
    const hasFunctionsRegion = FIREBASE_FUNCTIONS_REGION.length > 0

    const items = [
      {
        id: 'firebase-config',
        label: copy.launchItemFirebaseConfig,
        ready: hasFirebaseConfig,
      },
      {
        id: 'auth-handshake',
        label: copy.launchItemAuthHandshake,
        ready: hasAuthHandshake,
      },
      {
        id: 'cloud-sync',
        label: copy.launchItemCloudSync,
        ready: hasCloudSync,
      },
      {
        id: 'android-package',
        label: copy.launchItemAndroidPackage,
        ready: hasAndroidPackage,
      },
      {
        id: 'functions-region',
        label: copy.launchItemFunctionsRegion,
        ready: hasFunctionsRegion,
      },
    ]

    const missingCount = items.reduce(
      (count, item) => (item.ready ? count : count + 1),
      0
    )
    const webReady = hasFirebaseConfig && hasAuthHandshake && hasCloudSync
    const playReady = webReady && hasAndroidPackage && hasFunctionsRegion

    return {
      items,
      missingCount,
      webReady,
      playReady,
    }
  }, [authReady, copy, firebaseError, useLocalMode])

  useEffect(() => {
    if (lastRuntimeProfileRef.current === runtimeProfile) {
      return
    }
    lastRuntimeProfileRef.current = runtimeProfile
    pushOpsLog('info', `runtime profile switched to ${runtimeProfile}`)
  }, [pushOpsLog, runtimeProfile])

  useEffect(() => {
    const nextMode = useLocalMode ? 'local' : 'firebase'
    if (lastTransportModeRef.current === nextMode) {
      return
    }
    lastTransportModeRef.current = nextMode
    pushOpsLog(
      useLocalMode ? 'warn' : 'info',
      useLocalMode ? 'transport: local fallback' : 'transport: firebase realtime'
    )
  }, [pushOpsLog, useLocalMode])

  useEffect(() => {
    if (runtimeProfile === 'prod') {
      setShowPerfPanel(false)
      setShowOpsLog(false)
      return
    }
    if (runtimeProfile === 'dev') {
      setShowPerfPanel(true)
    }
  }, [runtimeProfile])

  const visibleMessages = useMemo(() => {
    if (messages.length <= messagePageLimit) {
      return messages
    }
    return messages.slice(-messagePageLimit)
  }, [messagePageLimit, messages])

  const normalizedSearchQuery = useMemo(
    () => searchQuery.trim().toLowerCase(),
    [searchQuery]
  )

  const translationTargetLang = translationLanguage || DEFAULT_LANGUAGE
  const translationTargetLabel = useMemo(
    () => getLanguageLabel(translationTargetLang),
    [translationTargetLang]
  )
  const filteredResult = useMemo(() => {
    if (!normalizedSearchQuery) {
      return {
        messages: visibleMessages,
        totalMatches: visibleMessages.length,
      }
    }

    const matches = messages.filter((message) => {
      const nickname =
        typeof message.nickname === 'string' ? message.nickname.toLowerCase() : ''
      const text = typeof message.text === 'string' ? message.text.toLowerCase() : ''
      const translated = (
        translationCache[buildTranslationCacheKey(message.id, translationTargetLang)] ??
        ''
      ).toLowerCase()

      return (
        nickname.includes(normalizedSearchQuery) ||
        text.includes(normalizedSearchQuery) ||
        translated.includes(normalizedSearchQuery)
      )
    })

    return {
      messages: matches.slice(-messagePageLimit),
      totalMatches: matches.length,
    }
  }, [
    messagePageLimit,
    messages,
    normalizedSearchQuery,
    translationCache,
    translationTargetLang,
    visibleMessages,
  ])
  const filteredMessages = filteredResult.messages
  const translatedTextByMessageId = useMemo(() => {
    if (!autoTranslateEnabled) {
      return {}
    }

    const next: Record<string, string> = {}
    for (const message of filteredMessages) {
      if (!message.text) {
        continue
      }
      if (message.lang && message.lang === translationTargetLang) {
        continue
      }
      const key = buildTranslationCacheKey(message.id, translationTargetLang)
      const translated = translationCache[key]
      if (translated) {
        next[message.id] = translated
      }
    }
    return next
  }, [
    autoTranslateEnabled,
    filteredMessages,
    translationCache,
    translationTargetLang,
  ])
  const resolveTranslatedText = useCallback(
    (message: Message): string => {
      if (!autoTranslateEnabled || !message.text) {
        return message.text
      }
      if (message.lang && message.lang === translationTargetLang) {
        return message.text
      }
      const cacheKey = buildTranslationCacheKey(message.id, translationTargetLang)
      return translationCache[cacheKey] ?? message.text
    },
    [autoTranslateEnabled, translationCache, translationTargetLang]
  )

  const queueMessagesUpdate = useCallback(
    (nextMessages: Message[], immediate = false) => {
      const next = pruneLocalMessages(nextMessages).slice(-MESSAGE_BUFFER_LIMIT)
      pendingMessagesRef.current = next

      if (typeof window === 'undefined') {
        renderStartRef.current = performance.now()
        setLastBatchSize(next.length)
        setMessages(next)
        return
      }

      const flush = () => {
        if (pendingFrameRef.current !== null) {
          return
        }

        pendingFrameRef.current = window.requestAnimationFrame(() => {
          pendingFrameRef.current = null
          const pending = pendingMessagesRef.current
          if (!pending) {
            return
          }

          pendingMessagesRef.current = null
          renderStartRef.current = performance.now()
          setLastBatchSize(pending.length)
          setMessages(pending)
        })
      }

      if (immediate) {
        if (pendingBatchTimeoutRef.current !== null) {
          window.clearTimeout(pendingBatchTimeoutRef.current)
          pendingBatchTimeoutRef.current = null
        }
        flush()
        return
      }

      if (pendingBatchTimeoutRef.current !== null) {
        return
      }

      pendingBatchTimeoutRef.current = window.setTimeout(() => {
        pendingBatchTimeoutRef.current = null
        flush()
      }, MESSAGE_BATCH_WINDOW_MS)
    },
    []
  )

  useEffect(() => {
    messagesRef.current = messages

    if (renderStartRef.current !== null) {
      setLastRenderMs(roundMetric(performance.now() - renderStartRef.current))
      renderStartRef.current = null
    }
  }, [messages])

  useEffect(() => {
    translationCacheRef.current = translationCache
  }, [translationCache])

  useEffect(() => {
    const visibleIds = new Set(messages.map((message) => message.id))
    setTranslationCache((prev) => {
      let changed = false
      const next: Record<string, string> = {}
      for (const [cacheKey, value] of Object.entries(prev)) {
        const separatorAt = cacheKey.indexOf('::')
        const messageId =
          separatorAt >= 0 ? cacheKey.slice(separatorAt + 2) : cacheKey
        if (visibleIds.has(messageId)) {
          next[cacheKey] = value
        } else {
          changed = true
        }
      }
      return changed ? next : prev
    })
  }, [messages])

  useEffect(() => {
    if (!autoTranslateEnabled || visibleMessages.length === 0) {
      setTranslationQueueDepth(0)
      setTranslationInFlight(0)
      return
    }

    let cancelled = false

    const run = async () => {
      const queue = visibleMessages
        .filter((message) => {
          if (!message.text) {
            return false
          }
          if (message.lang && message.lang === translationTargetLang) {
            return false
          }
          return true
        })
        .map((message) => {
          const priorityBoost = message.senderId && message.senderId === authUid ? 2 : 0
          const tierBoost = message.paidTier === 'space' ? 1 : 0
          return {
            message,
            priority: priorityBoost + tierBoost,
          }
        })
        .sort((a, b) => {
          if (b.priority !== a.priority) {
            return b.priority - a.priority
          }
          return b.message.createdAt - a.message.createdAt
        })
        .map((entry) => entry.message)

      setTranslationQueueDepth(queue.length)
      if (queue.length > 8) {
        const now = Date.now()
        if (now - lastTranslationBacklogLogAtRef.current >= 2000) {
          lastTranslationBacklogLogAtRef.current = now
          pushOpsLog('warn', `translation queue backlog ${queue.length}`)
        }
      }

      const worker = async () => {
        while (!cancelled) {
          const message = queue.shift()
          if (!message) {
            return
          }

          const cacheKey = buildTranslationCacheKey(message.id, translationTargetLang)
          if (
            translationCacheRef.current[cacheKey] ||
            translationPendingRef.current.has(cacheKey)
          ) {
            setTranslationQueueDepth(queue.length)
            continue
          }

          translationPendingRef.current.add(cacheKey)
          setTranslationInFlight((prev) => prev + 1)
          setTranslationQueueDepth(queue.length)
          try {
            const translated = await translateLocalText({
              text: message.text,
              sourceLang: message.lang ?? user?.locale,
              targetLang: translationTargetLang,
            })
            setTranslationCache((prev) =>
              prev[cacheKey] ? prev : { ...prev, [cacheKey]: translated }
            )
          } finally {
            translationPendingRef.current.delete(cacheKey)
            setTranslationInFlight((prev) => Math.max(0, prev - 1))
          }
        }
      }

      const workerCount = Math.min(TRANSLATION_CONCURRENCY, queue.length)
      if (workerCount <= 0) {
        return
      }

      await Promise.all(Array.from({ length: workerCount }, () => worker()))
      if (!cancelled) {
        setTranslationQueueDepth(0)
      }
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [
    authUid,
    autoTranslateEnabled,
    pushOpsLog,
    translationTargetLang,
    user?.locale,
    visibleMessages,
  ])

  useEffect(() => {
    return () => {
      if (
        pendingBatchTimeoutRef.current !== null &&
        typeof window !== 'undefined'
      ) {
        window.clearTimeout(pendingBatchTimeoutRef.current)
      }
      if (pendingFrameRef.current !== null && typeof window !== 'undefined') {
        window.cancelAnimationFrame(pendingFrameRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const stored = loadState()
    const initialUiLanguage = stored.uiLanguage ?? DEFAULT_UI_LANGUAGE
    const preferredLocale =
      stored.user?.locale ??
      (LANGUAGES.some((language) => language.code === initialUiLanguage)
        ? initialUiLanguage
        : DEFAULT_LANGUAGE)
    const bootstrappedUser: User =
      stored.user ??
      ({
        id: createClientId(),
        nickname: `guest-${Math.floor(Math.random() * 9000) + 1000}`,
        locale: preferredLocale,
        joinedAt: new Date().toISOString(),
      } satisfies User)
    const initialForm: FormState = {
      nickname: bootstrappedUser.nickname,
      locale: bootstrappedUser.locale,
      uiLanguage: initialUiLanguage,
    }
    const initialTranslationLanguage = LANGUAGES.some(
      (language) => language.code === stored.translationLanguage
    )
      ? stored.translationLanguage
      : bootstrappedUser.locale
    const initialRuntimeProfile = stored.runtimeProfile ?? 'local'
    const initialVisualSettings = stored.visualSettings ?? DEFAULT_VISUAL_SETTINGS

    setUser(bootstrappedUser)
    setUiLanguage(initialUiLanguage)
    setTranslationLanguage(initialTranslationLanguage)
    setRuntimeProfile(initialRuntimeProfile)
    setVisualSettings(initialVisualSettings)
    setForm(initialForm)
    setSettingsForm(initialForm)

    const initialLimit = resolveRemoteSyncLimit(isAndroidBillingBridgeReady())
    void loadLocalMessages(initialLimit)
      .then((loaded) => {
        setMessages(loaded)
        messagesRef.current = loaded
      })
      .catch((error: unknown) => {
        setMessages([])
        messagesRef.current = []
        if (FORCE_JOIN_DEBUG_TOAST) {
          const errorMessage =
            error instanceof Error ? error.message : 'load_local_messages_failed'
          setToast({
            message: `[DEBUG][LOAD] ${errorMessage}`,
            tone: 'error',
          })
        }
      })

    setView('chat')
    pushOpsLog('info', `runtime profile ${initialRuntimeProfile}`)
    pushOpsLog('info', 'visual profile restored')

    setHydrated(true)
  }, [pushOpsLog])

  useEffect(() => {
    if (!hydrated) {
      return
    }
    saveState({
      user,
      uiLanguage,
      translationLanguage,
      runtimeProfile,
      visualSettings,
    })
  }, [
    user,
    uiLanguage,
    translationLanguage,
    runtimeProfile,
    visualSettings,
    hydrated,
  ])

  useEffect(() => {
    document.documentElement.lang = uiLanguage
  }, [uiLanguage])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const mediaQuery = window.matchMedia(
      `(max-width: ${MOBILE_VIEWPORT_BREAKPOINT}px)`
    )
    const updateMobileViewport = () => {
      setIsMobileViewport(mediaQuery.matches)
    }
    updateMobileViewport()

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', updateMobileViewport)
    } else {
      mediaQuery.addListener(updateMobileViewport)
    }

    const visualViewport = window.visualViewport
    const updateViewportInset = () => {
      if (!visualViewport) {
        setViewportInsetBottom(0)
        return
      }

      const offset = Math.max(
        0,
        window.innerHeight - visualViewport.height - visualViewport.offsetTop
      )
      setViewportInsetBottom(Math.round(offset))
    }

    updateViewportInset()
    window.addEventListener('resize', updateViewportInset)
    if (visualViewport) {
      visualViewport.addEventListener('resize', updateViewportInset)
      visualViewport.addEventListener('scroll', updateViewportInset)
    }

    return () => {
      if (typeof mediaQuery.removeEventListener === 'function') {
        mediaQuery.removeEventListener('change', updateMobileViewport)
      } else {
        mediaQuery.removeListener(updateMobileViewport)
      }
      window.removeEventListener('resize', updateViewportInset)
      if (visualViewport) {
        visualViewport.removeEventListener('resize', updateViewportInset)
        visualViewport.removeEventListener('scroll', updateViewportInset)
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    if (typeof window.matchMedia !== 'function') {
      return
    }

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const finePointer = window.matchMedia('(pointer: fine)')

    if (prefersReduced.matches || !finePointer.matches) {
      return
    }

    let rafId: number | null = null
    let idleId: number | null = null
    let targetX = 0
    let targetY = 0

    const update = () => {
      document.documentElement.style.setProperty(
        '--parallax-x',
        targetX.toFixed(3)
      )
      document.documentElement.style.setProperty(
        '--parallax-y',
        targetY.toFixed(3)
      )
      rafId = null
    }

    const scheduleUpdate = () => {
      if (rafId !== null) {
        return
      }
      rafId = window.requestAnimationFrame(update)
    }

    const scheduleReset = () => {
      if (idleId !== null) {
        window.clearTimeout(idleId)
      }
      idleId = window.setTimeout(() => {
        targetX = 0
        targetY = 0
        scheduleUpdate()
      }, 220)
    }

    const handleMove = (event: MouseEvent) => {
      const x = event.clientX / window.innerWidth - 0.5
      const y = event.clientY / window.innerHeight - 0.5
      targetX = x * 2
      targetY = y * 2
      scheduleUpdate()
      scheduleReset()
    }

    const handleLeave = () => {
      targetX = 0
      targetY = 0
      scheduleUpdate()
    }

    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseleave', handleLeave)
    window.addEventListener('blur', handleLeave)

    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseleave', handleLeave)
      window.removeEventListener('blur', handleLeave)
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId)
      }
      if (idleId !== null) {
        window.clearTimeout(idleId)
      }
      handleLeave()
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    let rafId = 0
    let frameCount = 0
    let windowStart = performance.now()

    const tick = (time: number) => {
      frameCount += 1
      const delta = time - windowStart
      if (delta >= 1000) {
        setFps(Math.round((frameCount * 1000) / delta))
        frameCount = 0
        windowStart = time
      }
      rafId = window.requestAnimationFrame(tick)
    }

    rafId = window.requestAnimationFrame(tick)

    return () => {
      window.cancelAnimationFrame(rafId)
    }
  }, [])

  useEffect(() => {
    if (!firebaseReady) {
      setFirebaseError(false)
      return
    }

    let active = true
    ensureAnonymousAuth()
      .then((uid) => {
        if (!active) {
          return
        }
        setAuthUid(uid)
        setAuthReady(true)
      })
      .catch(() => {
        if (!active) {
          return
        }
        setFirebaseError(true)
        setToast({ message: copy.localModeAuthFailed, tone: 'error' })
      })

    return () => {
      active = false
    }
  }, [copy.localModeAuthFailed])

  useEffect(() => {
    setMessages((prev) => {
      if (prev.length <= MESSAGE_BUFFER_LIMIT) {
        return prev
      }
      return prev.slice(-MESSAGE_BUFFER_LIMIT)
    })
  }, [])

  useEffect(() => {
    if (!useLocalMode) {
      return
    }

    let canceled = false

    const runPrune = async () => {
      const removed = await pruneExpiredLocalMessages()
      if (canceled || removed <= 0) {
        return
      }
      const reloaded = await loadLocalMessages(remoteSyncLimit)
      if (canceled) {
        return
      }
      queueMessagesUpdate(reloaded)
    }

    void runPrune()
    const id = window.setInterval(() => {
      void runPrune()
    }, 60_000)

    return () => {
      canceled = true
      window.clearInterval(id)
    }
  }, [queueMessagesUpdate, remoteSyncLimit, useLocalMode])

  useEffect(() => {
    if (!firebaseReady || !authReady || !user || firebaseError) {
      return
    }

    const cutoff = Date.now() - MAX_MESSAGE_AGE_MS
    const remoteMessagesRef = collection(
      getFirebaseDb(),
      'rooms',
      'global',
      'messages'
    )
    const messagesQuery = query(
      remoteMessagesRef,
      where('createdAt', '>=', cutoff),
      orderBy('createdAt', 'asc'),
      limit(remoteSyncLimit)
    )

    const unsubscribe = onSnapshot(
      messagesQuery,
      (snapshot) => {
        const nextMessages = snapshot.docs
          .map((doc) => {
            const data = doc.data() as Partial<Message>
            const createdAt =
              typeof data.createdAt === 'number' ? data.createdAt : Date.now()

            return {
              id: doc.id,
              nickname:
                typeof data.nickname === 'string' ? data.nickname : 'Anonymous',
              text: typeof data.text === 'string' ? data.text : '',
              lang: typeof data.lang === 'string' ? data.lang : undefined,
              createdAt,
              paidTier:
                data.paidTier === 'earth' || data.paidTier === 'space'
                  ? data.paidTier
                  : undefined,
              paidUntil:
                typeof data.paidUntil === 'number' ? data.paidUntil : undefined,
              senderId:
                typeof data.senderId === 'string' ? data.senderId : undefined,
            }
          })
          .filter((message) => message.text.length > 0)

        queueMessagesUpdate(nextMessages)
      },
      () => {
        setToast({ message: copy.toastSendFailed, tone: 'error' })
      }
    )

    return () => unsubscribe()
  }, [
    authReady,
    copy.toastSendFailed,
    firebaseError,
    queueMessagesUpdate,
    remoteSyncLimit,
    user,
  ])

  useEffect(() => {
    if (!toast) {
      return
    }
    const id = window.setTimeout(() => setToast(null), 3000)
    return () => window.clearTimeout(id)
  }, [toast])

  useEffect(() => {
    if (!enableDebugToasts || typeof window === 'undefined') {
      return
    }

    const handleError = (event: ErrorEvent) => {
      const message = event.message || 'runtime error'
      setToast({ message: `[DEBUG][ERR] ${message}`, tone: 'error' })
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason =
        typeof event.reason === 'string'
          ? event.reason
          : event.reason && typeof event.reason.message === 'string'
            ? event.reason.message
            : 'unhandled rejection'
      setToast({ message: `[DEBUG][REJ] ${reason}`, tone: 'error' })
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [enableDebugToasts])

  useEffect(() => {
    if (!enableDebugToasts) {
      return
    }
    const message = `[DEBUG] view:${view}`
    if (typeof console !== 'undefined') {
      console.info(message)
    }
    setToast({ message, tone: 'info' })
  }, [enableDebugToasts, view])

  useEffect(() => {
    if (!user) {
      return
    }
    setSettingsForm((prev) => ({
      ...prev,
      nickname: user.nickname,
      locale: user.locale,
    }))
  }, [user])

  useEffect(() => {
    if (!muteUntil) {
      return
    }

    const tick = () => setNowTick(Date.now())
    tick()
    const id = window.setInterval(tick, 1000)

    return () => window.clearInterval(id)
  }, [muteUntil])

  useEffect(() => {
    if (muteUntil && nowTick >= muteUntil) {
      setMuteUntil(null)
      shortWindowSendHistoryRef.current = []
      extendedWindowSendHistoryRef.current = []
      shortWindowWarningShownRef.current = false
      extendedWindowWarningShownRef.current = false
      setRateRiskLevel('normal')
      pushOpsLog('info', 'chat mute cleared')
    }
  }, [muteUntil, nowTick, pushOpsLog])

  useEffect(() => {
    const lastVisibleId =
      visibleMessages.length > 0
        ? visibleMessages[visibleMessages.length - 1]?.id ?? null
        : null
    if (!lastVisibleId) {
      lastVisibleMessageIdRef.current = null
      return
    }

    if (!lastVisibleMessageIdRef.current) {
      lastVisibleMessageIdRef.current = lastVisibleId
      return
    }

    if (lastVisibleMessageIdRef.current === lastVisibleId) {
      return
    }

    if (atBottom) {
      listRef.current?.scrollToBottom('smooth')
      setUnreadCount(0)
    } else {
      setUnreadCount((prev) => prev + 1)
    }

    lastVisibleMessageIdRef.current = lastVisibleId
  }, [atBottom, visibleMessages])

  useEffect(() => {
    if (atBottom) {
      setUnreadCount(0)
    }
  }, [atBottom])

  useEffect(() => {
    if (view !== 'chat') {
      return
    }

    const id = window.setTimeout(() => {
      listRef.current?.scrollToBottom('auto')
    }, 0)

    return () => window.clearTimeout(id)
  }, [view])

  useEffect(() => {
    return () => {
      if (
        spaceImpactTimeoutRef.current !== null &&
        typeof window !== 'undefined'
      ) {
        window.clearTimeout(spaceImpactTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const latestSpaceMessages = findLatestTierMessages(messages, 'space', 2)
    const latestSpace = latestSpaceMessages[0] ?? null
    const latestSpaceKey = latestSpaceMessages.map((message) => message.id).join('|')
    const latestEarth = findLatestTierMessages(messages, 'earth', 1)[0] ?? null

    if (!tierBoardInitializedRef.current) {
      tierBoardInitializedRef.current = true

      setPinnedSpaceMessages(latestSpaceMessages)
      lastPinnedSpaceKeyRef.current = latestSpaceKey

      if (latestEarth) {
        setPinnedEarthMessage(latestEarth)
        lastPinnedEarthIdRef.current = latestEarth.id
      }

      return
    }

    if (latestSpaceKey !== lastPinnedSpaceKeyRef.current) {
      const previousTopSpaceId =
        lastPinnedSpaceKeyRef.current.split('|')[0] || null
      setPinnedSpaceMessages(latestSpaceMessages)
      lastPinnedSpaceKeyRef.current = latestSpaceKey

      if (latestSpace && latestSpace.id !== previousTopSpaceId) {
        setSpaceImpactActive(true)

        if (
          spaceImpactTimeoutRef.current !== null &&
          typeof window !== 'undefined'
        ) {
          window.clearTimeout(spaceImpactTimeoutRef.current)
        }

        if (typeof window !== 'undefined') {
          spaceImpactTimeoutRef.current = window.setTimeout(() => {
            setSpaceImpactActive(false)
            spaceImpactTimeoutRef.current = null
          }, PAID_EFFECTS.space.impactSeconds * 1000)
        }
      }
    }

    if (latestEarth && latestEarth.id !== lastPinnedEarthIdRef.current) {
      setPinnedEarthMessage(latestEarth)
      lastPinnedEarthIdRef.current = latestEarth.id
    }
  }, [messages])

  const joinWithCurrentForm = () => {
    pushJoinDebugToast('joinWithCurrentForm:start')
    const fallbackNickname = `guest-${Math.floor(Math.random() * 9000) + 1000}`
    const nickname = form.nickname.trim() || fallbackNickname
    const nextForm: FormState = {
      ...form,
      nickname,
    }

    const nextUser: User = {
      id: createClientId(),
      nickname,
      locale: nextForm.locale,
      joinedAt: new Date().toISOString(),
    }

    setUser(nextUser)
    setForm(nextForm)
    setUiLanguage(nextForm.uiLanguage)
    setSettingsForm(nextForm)
    setView('chat')
    setMuteUntil(null)
    shortWindowSendHistoryRef.current = []
    extendedWindowSendHistoryRef.current = []
    shortWindowWarningShownRef.current = false
    extendedWindowWarningShownRef.current = false
    muteStrikeCountRef.current = 0
    pushJoinDebugToast('joinWithCurrentForm:done')
    pushOpsLog('info', `joined as ${nickname}`)
  }

  const handleJoin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    pushJoinDebugToast('handleJoin:submit')
    joinWithCurrentForm()
  }

  const handleOpenChatRoom = () => {
    pushJoinDebugToast('openChatRoomButton:activate')
    setView('chat')
    pushOpsLog('info', 'entered chat room')
  }

  const handleJoinWithGoogle = async () => {
    pushJoinDebugToast('handleJoinWithGoogle:start')

    if (useLocalMode) {
      setToast({
        message: copy.toastGoogleJoinNeedsFirebase,
        tone: 'error',
      })
      return
    }

    try {
      const uid = await ensureGooglePaymentAuth()
      setAuthUid(uid)
      joinWithCurrentForm()
      setToast({ message: copy.toastJoinedWithGoogle, tone: 'info' })
      pushJoinDebugToast('handleJoinWithGoogle:success')
      pushOpsLog('info', 'google auth connected')
    } catch {
      setToast({
        message: `[DEBUG] googleJoin:error | ${copy.toastGoogleLoginFailed}`,
        tone: 'error',
      })
      pushOpsLog('error', 'google auth failed')
    }
  }

  const handleSend = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!user) {
      setToast({ message: copy.toastJoinFirst, tone: 'error' })
      return
    }

    const text = draft.trim()
    if (!text) {
      return
    }
    const messageLang = detectMessageLanguage(text, user.locale)

    const now = Date.now()

    if (muteUntil && now < muteUntil) {
      const remaining = Math.ceil((muteUntil - now) / 1000)
      setRateRiskLevel('muted')
      setToast({ message: copy.toastMuted(remaining), tone: 'error' })
      return
    }

    setDraft('')

    const shortWindowRecent = shortWindowSendHistoryRef.current.filter(
      (timestamp) => now - timestamp <= SPAM_WINDOW_MS
    )
    const extendedWindowRecent = extendedWindowSendHistoryRef.current.filter(
      (timestamp) => now - timestamp <= SPAM_EXTENDED_WINDOW_MS
    )

    shortWindowRecent.push(now)
    extendedWindowRecent.push(now)

    shortWindowSendHistoryRef.current = shortWindowRecent
    extendedWindowSendHistoryRef.current = extendedWindowRecent

    const shortWindowWarningThreshold = Math.max(
      1,
      SPAM_LIMIT_COUNT - SPAM_WARNING_GAP_COUNT
    )
    const extendedWindowWarningThreshold = Math.max(
      1,
      SPAM_EXTENDED_LIMIT_COUNT - SPAM_WARNING_GAP_COUNT
    )

    if (shortWindowRecent.length < shortWindowWarningThreshold) {
      shortWindowWarningShownRef.current = false
    }
    if (extendedWindowRecent.length < extendedWindowWarningThreshold) {
      extendedWindowWarningShownRef.current = false
    }

    let shouldWarnRateLimit = false

    if (
      shortWindowRecent.length >= shortWindowWarningThreshold &&
      shortWindowRecent.length < SPAM_LIMIT_COUNT &&
      !shortWindowWarningShownRef.current
    ) {
      shortWindowWarningShownRef.current = true
      shouldWarnRateLimit = true
    }

    if (
      extendedWindowRecent.length >= extendedWindowWarningThreshold &&
      extendedWindowRecent.length < SPAM_EXTENDED_LIMIT_COUNT &&
      !extendedWindowWarningShownRef.current
    ) {
      extendedWindowWarningShownRef.current = true
      shouldWarnRateLimit = true
    }

    if (shouldWarnRateLimit) {
      setRateRiskLevel('warning')
      pushOpsLog(
        'warn',
        `rate warning short=${shortWindowRecent.length}/${SPAM_LIMIT_COUNT} extended=${extendedWindowRecent.length}/${SPAM_EXTENDED_LIMIT_COUNT}`
      )
      setToast({ message: copy.toastRateWarning, tone: 'info' })
    } else {
      setRateRiskLevel('normal')
    }

    const hitShortWindowLimit = shortWindowRecent.length >= SPAM_LIMIT_COUNT
    const hitExtendedWindowLimit =
      extendedWindowRecent.length >= SPAM_EXTENDED_LIMIT_COUNT

    if (hitShortWindowLimit || hitExtendedWindowLimit) {
      muteStrikeCountRef.current += 1
      const muteDurationMs =
        muteStrikeCountRef.current >= MUTE_ESCALATE_STRIKE_COUNT
          ? MUTE_ESCALATED_DURATION_MS
          : MUTE_DURATION_MS
      const muteAt = now + muteDurationMs
      setMuteUntil(muteAt)
      setNowTick(now)
      setRateRiskLevel('muted')
      shortWindowSendHistoryRef.current = []
      extendedWindowSendHistoryRef.current = []
      shortWindowWarningShownRef.current = false
      extendedWindowWarningShownRef.current = false
      pushOpsLog(
        'error',
        `rate limit triggered: mute ${Math.ceil(muteDurationMs / 1000)}s (strike ${muteStrikeCountRef.current})`
      )
      setToast({
        message: copy.toastRateLimited(Math.ceil(muteDurationMs / 1000)),
        tone: 'error',
      })
      return
    }

    if (useLocalMode) {
      const nextMessage: Message = {
        id: createClientId(),
        nickname: user.nickname,
        text,
        lang: messageLang,
        createdAt: now,
        senderId: authUid ?? undefined,
        paidTier: user.subscriptionTier,
      }

      queueMessagesUpdate([...messagesRef.current, nextMessage], true)
      pushOpsLog('info', 'message sent (local)')

      const storageStart = performance.now()
      void appendLocalMessage(nextMessage)
        .then(() => {
          setLastStorageWriteMs(roundMetric(performance.now() - storageStart))
        })
        .catch(() => {
          setToast({ message: copy.toastLocalSaveFailed, tone: 'error' })
        })
      return
    }

    try {
      await addDoc(collection(getFirebaseDb(), 'rooms', 'global', 'messages'), {
        nickname: user.nickname,
        text,
        lang: messageLang,
        createdAt: now,
        senderId: authUid ?? undefined,
        paidTier: user.subscriptionTier,
      })
      pushOpsLog('info', 'message sent (firebase)')
    } catch {
      setToast({ message: copy.toastSendFailed, tone: 'error' })
      setDraft(text)
      pushOpsLog('error', 'message send failed')
    }
  }

  const handleSubscriptionTestSelect = (tier: PaidTier | null) => {
    if (!user) {
      setToast({ message: copy.toastJoinFirst, tone: 'error' })
      return
    }

    setUser({
      ...user,
      subscriptionTier: tier ?? undefined,
    })
    setToast({
      message: copy.toastSubscriptionTierUpdated(tier),
      tone: 'info',
    })
    pushOpsLog('info', `subscription tier set to ${tier ?? 'free'}`)
  }

  const handleSettingsSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nickname = settingsForm.nickname.trim()

    if (!nickname) {
      setToast({ message: copy.toastNicknameRequired, tone: 'error' })
      return
    }

    if (!user) {
      setToast({ message: copy.toastJoinFirst, tone: 'error' })
      return
    }

    setUser({ ...user, nickname, locale: settingsForm.locale })
    setForm(settingsForm)
    setUiLanguage(settingsForm.uiLanguage)
    setView('chat')
    setToast({ message: copy.toastSettingsUpdated, tone: 'info' })
    pushOpsLog('info', 'settings updated')
  }

  const handleFormChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target

    setForm((prev) => {
      if (name === 'uiLanguage' && isUiLanguage(value)) {
        const nextLocale = LANGUAGES.some((language) => language.code === value)
          ? value
          : prev.locale
        return { ...prev, uiLanguage: value, locale: nextLocale }
      }
      return { ...prev, nickname: value }
    })

    if (name === 'uiLanguage' && isUiLanguage(value)) {
      setUiLanguage(value)
    }
  }

  const handleSettingsChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target

    setSettingsForm((prev) => {
      if (name === 'uiLanguage' && isUiLanguage(value)) {
        return { ...prev, uiLanguage: value }
      }
      if (name === 'locale') {
        return { ...prev, locale: value }
      }
      return { ...prev, nickname: value }
    })

    if (name === 'uiLanguage' && isUiLanguage(value)) {
      setUiLanguage(value)
    }
  }

  const handleJumpToLatest = () => {
    listRef.current?.scrollToBottom('smooth')
    setUnreadCount(0)
  }

  const handleStressInsert = async () => {
    if (!useLocalMode) {
      setToast({ message: copy.stressLocalOnly, tone: 'error' })
      return
    }
    if (!user) {
      setToast({ message: copy.toastJoinFirst, tone: 'error' })
      return
    }

    const safeCount = Math.min(5000, Math.max(10, Math.floor(stressCount)))
    const baseTime = Date.now()
    const generated: Message[] = Array.from({ length: safeCount }, (_, index) => ({
      id: createClientId(),
      nickname: `bot-${(index % 12) + 1}`,
      text: `load sample #${index + 1}`,
      lang: user.locale,
      createdAt: baseTime + index,
      senderId: authUid ?? undefined,
    }))

    setStressPending(true)
    const writeStart = performance.now()

    try {
      await appendLocalMessages(generated)
      setLastStorageWriteMs(roundMetric(performance.now() - writeStart))
      queueMessagesUpdate([...messagesRef.current, ...generated])
      setToast({ message: copy.stressAdded(safeCount), tone: 'info' })
      pushOpsLog('warn', `stress injected ${safeCount} messages`)
    } catch {
      setToast({ message: copy.stressInsertFailed, tone: 'error' })
      pushOpsLog('error', 'stress insert failed')
    } finally {
      setStressPending(false)
    }
  }

  const toggleBackgroundEmphasisMode = () => {
    setVisualSettings((prev) => {
      const nextEnabled = !prev.backgroundEmphasis
      if (!nextEnabled) {
        return { ...prev, backgroundEmphasis: false }
      }
      return {
        ...prev,
        backgroundEmphasis: true,
        panelTransparencyPreset: 'high',
        composerOpacity: Math.min(prev.composerOpacity, 32),
        blurStrength: Math.min(prev.blurStrength, 5),
        textShadowIntensity: Math.min(prev.textShadowIntensity, 24),
        shadowIntensity: Math.min(prev.shadowIntensity, 46),
        mobileTransparencyBoost: true,
      }
    })
  }

  const panelPresetAlpha =
    PANEL_PRESET_ALPHA[visualSettings.panelTransparencyPreset] ??
    PANEL_PRESET_ALPHA.medium
  const mobileBoost =
    visualSettings.mobileTransparencyBoost && isMobileViewport ? 0.1 : 0
  const emphasisBoost = visualSettings.backgroundEmphasis ? 0.12 : 0
  const totalBoost = mobileBoost + emphasisBoost
  const boostedAlpha = (alpha: number, min = 0.12, weight = 1): number =>
    clampNumber(alpha - totalBoost * weight, min, 0.98)

  const panelAlpha = boostedAlpha(panelPresetAlpha, 0.2, 0.85)
  const panelChatAlpha = boostedAlpha(panelPresetAlpha - 0.1, 0.16, 0.95)
  const panelEntryAlpha = boostedAlpha(panelPresetAlpha + 0.08, 0.24, 0.75)
  const lobbyCardAlpha = boostedAlpha(toAlpha(visualSettings.lobbyCardOpacity), 0.14, 0.9)
  const messagesAlpha = boostedAlpha(toAlpha(visualSettings.messagesOpacity), 0.1, 0.95)
  const heroEntryAlpha = boostedAlpha(toAlpha(visualSettings.heroEntryOpacity), 0.2, 0.7)
  const heroChatAlpha = boostedAlpha(toAlpha(visualSettings.heroChatOpacity), 0.16, 0.88)
  const composerAlpha = boostedAlpha(toAlpha(visualSettings.composerOpacity), 0.08, 1)
  const activeHeroAlpha = view === 'entry' ? heroEntryAlpha : heroChatAlpha

  const uiBlurPx = clampNumber(
    visualSettings.blurStrength - (visualSettings.backgroundEmphasis ? 1.2 : 0),
    0,
    16
  )
  const textShadowAlpha = clampNumber(visualSettings.textShadowIntensity / 400, 0, 0.34)
  const textShadowSoftAlpha = clampNumber(textShadowAlpha * 1.28, 0, 0.5)
  const textShadowStrongAlpha = clampNumber(textShadowAlpha * 1.95, 0, 0.68)
  const shadowStrength = clampNumber(visualSettings.shadowIntensity / 100, 0, 1)
  const shadowAlpha = clampNumber(0.12 + shadowStrength * 0.62, 0.12, 0.82)
  const glowAlpha = clampNumber(0.04 + shadowStrength * 0.24, 0.04, 0.36)
  const tierEarthGlowAlpha = clampNumber(0.1 + shadowStrength * 0.32, 0.1, 0.52)
  const tierSpaceGlowAlpha = clampNumber(0.1 + shadowStrength * 0.34, 0.1, 0.54)

  const scanOverlayBase = visualSettings.backgroundEmphasis ? 0.06 : 0.24
  const gridOverlayBase = visualSettings.backgroundEmphasis ? 0.05 : 0.14
  const scanOverlayAlpha = visualSettings.scanOverlayEnabled
    ? clampNumber(scanOverlayBase - totalBoost * 0.28, 0, 0.4)
    : 0
  const gridOverlayAlpha = visualSettings.gridOverlayEnabled
    ? clampNumber(gridOverlayBase - totalBoost * 0.24, 0, 0.35)
    : 0

  const bgRadialAlpha = clampNumber(0.12 + (visualSettings.backgroundEmphasis ? 0.03 : 0), 0.06, 0.24)
  const bgDarkStartAlpha = clampNumber(0.74 - totalBoost * 0.5, 0.28, 0.86)
  const bgDarkMidAlpha = clampNumber(0.36 - totalBoost * 0.42, 0.08, 0.5)
  const bgDarkEndAlpha = clampNumber(0.76 - totalBoost * 0.52, 0.3, 0.88)

  const visualStyle = useMemo(
    () =>
      ({
        '--bg-radial-alpha': bgRadialAlpha.toFixed(3),
        '--bg-dark-start-alpha': bgDarkStartAlpha.toFixed(3),
        '--bg-dark-mid-alpha': bgDarkMidAlpha.toFixed(3),
        '--bg-dark-end-alpha': bgDarkEndAlpha.toFixed(3),
        '--overlay-scan-alpha': scanOverlayAlpha.toFixed(3),
        '--overlay-grid-alpha': gridOverlayAlpha.toFixed(3),
        '--panel-alpha': panelAlpha.toFixed(3),
        '--panel-chat-alpha': panelChatAlpha.toFixed(3),
        '--panel-entry-alpha': panelEntryAlpha.toFixed(3),
        '--lobby-card-alpha': lobbyCardAlpha.toFixed(3),
        '--messages-surface-alpha': messagesAlpha.toFixed(3),
        '--hero-alpha': activeHeroAlpha.toFixed(3),
        '--composer-alpha': composerAlpha.toFixed(3),
        '--ui-blur': `${uiBlurPx.toFixed(1)}px`,
        '--ui-blur-mobile': `${(uiBlurPx + 3).toFixed(1)}px`,
        '--text-shadow-alpha': textShadowAlpha.toFixed(3),
        '--text-shadow-soft-alpha': textShadowSoftAlpha.toFixed(3),
        '--text-shadow-strong-alpha': textShadowStrongAlpha.toFixed(3),
        '--shadow': `0 24px 70px rgba(0, 0, 0, ${shadowAlpha.toFixed(3)})`,
        '--glow': `0 0 24px rgba(70, 255, 154, ${glowAlpha.toFixed(3)})`,
        '--tier-glow-earth-alpha': tierEarthGlowAlpha.toFixed(3),
        '--tier-glow-space-alpha': tierSpaceGlowAlpha.toFixed(3),
      }) as CSSProperties,
    [
      activeHeroAlpha,
      bgDarkEndAlpha,
      bgDarkMidAlpha,
      bgDarkStartAlpha,
      bgRadialAlpha,
      composerAlpha,
      glowAlpha,
      gridOverlayAlpha,
      lobbyCardAlpha,
      messagesAlpha,
      panelAlpha,
      panelChatAlpha,
      panelEntryAlpha,
      scanOverlayAlpha,
      shadowAlpha,
      tierEarthGlowAlpha,
      tierSpaceGlowAlpha,
      textShadowAlpha,
      textShadowSoftAlpha,
      textShadowStrongAlpha,
      uiBlurPx,
    ]
  )

  const isEntry = view === 'entry'
  const isChat = view === 'chat'
  const isMuted = muteUntil !== null && nowTick < muteUntil
  const connectionStatusLabel = `${copy.perfModeLabel}: ${
    useLocalMode ? copy.perfModeLocal : copy.perfModeFirebase
  }`
  const translationStatusLabel = autoTranslateEnabled
    ? `${copy.translateLanguageLabel}: ${translationTargetLabel}`
    : `${copy.translateLanguageLabel}: ${copy.translateToggleOff}`
  const queueStatusLabel = `Queue ${translationQueueDepth} / In-flight ${translationInFlight}`
  const rateStatusLabel = isMuted
    ? 'Rate: muted'
    : rateRiskLevel === 'warning'
      ? 'Rate: warning'
      : 'Rate: normal'
  const runtimeStatusLabel = `Profile ${runtimeProfile.toUpperCase()}`
  const activeSubscriptionTier = user?.subscriptionTier ?? null
  const spaceImpactClass = spaceImpactActive ? 'tier-board__space--impact' : ''
  const tierFrameClass =
    activeSubscriptionTier === 'space'
      ? 'app--tier-space'
      : activeSubscriptionTier === 'earth'
        ? 'app--tier-earth'
        : ''

  return (
    <div
      className={`app ${tierFrameClass} ${isMobileViewport ? 'app--mobile-active' : ''}`.trim()}
      style={visualStyle}
    >
      <header className={`hero ${isEntry ? '' : 'hero--compact hero--slim'}`}>
        {isEntry ? (
          <>
            <div>
              <p className="eyebrow">Earth Chat</p>
              <h1>{copy.heroTitle}</h1>
              <p>{copy.heroSubtitle}</p>
            </div>
            <div className="hero__meta">
              <div className="stat-grid">
                <div className="stat-card">
                  <strong>{copy.statSingleRoomLabel}</strong>
                  <span>{copy.statSingleRoomHint}</span>
                </div>
                <div className="stat-card">
                  <strong>{copy.statRetentionLabel(MESSAGE_RETENTION_DAYS)}</strong>
                  <span>{copy.statRetentionHint}</span>
                </div>
                <div className="stat-card">
                  <strong>
                    {useLocalMode ? copy.statLocalLabel : copy.statRealtimeLabel}
                  </strong>
                  <span>{useLocalMode ? copy.statLocalHint : copy.statRealtimeHint}</span>
                </div>
                <div className="stat-card">
                  <strong>{copy.statAnonymousLabel}</strong>
                  <span>{copy.statAnonymousHint}</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className={`hero-bar ${isChat ? '' : 'hero-bar--solo'}`}>
            <span className="hero-title">EARTH CHAT</span>
            {isChat && (
              <div className="hero-actions">
                <button
                  className="btn btn--ghost btn--icon"
                  type="button"
                  onClick={() => setView('entry')}
                  aria-label={copy.dashboardButton}
                  title={copy.dashboardButton}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z" />
                  </svg>
                </button>
                <button
                  className="btn btn--ghost btn--icon"
                  type="button"
                  onClick={() => setView('settings')}
                  aria-label={copy.settingsButton}
                  title={copy.settingsButton}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="12" r="3.5" />
                    <path d="M12 2.5v2.5M12 19v2.5M4.6 4.6l1.8 1.8M17.6 17.6l1.8 1.8M2.5 12h2.5M19 12h2.5M4.6 19.4l1.8-1.8M17.6 6.4l1.8-1.8" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {view === 'entry' && (
        <section className={`panel ${user ? 'panel--entry-dashboard' : ''}`}>
          {!user ? (
            <>
              <h2>{copy.joinTitle}</h2>
              <form className="form-grid" onSubmit={handleJoin}>
                <label>
                  {copy.nicknameLabel}
                  <input
                    name="nickname"
                    value={form.nickname}
                    onChange={handleFormChange}
                    placeholder={copy.nicknamePlaceholder}
                    autoComplete="off"
                  />
                </label>
                <label>
                  {copy.uiLanguageLabel}
                  <select
                    name="uiLanguage"
                    value={form.uiLanguage}
                    onChange={handleFormChange}
                  >
                    {UI_LANGUAGES.map((language) => (
                      <option key={language.code} value={language.code}>
                        {language.label}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  className="btn btn--primary"
                  type="submit"
                  onClick={() => pushJoinDebugToast('joinButton:tap')}
                >
                  {copy.joinButton}
                </button>
                <button
                  className="btn btn--ghost"
                  type="button"
                  onClick={() => {
                    pushJoinDebugToast('googleJoinButton:tap')
                    void handleJoinWithGoogle()
                  }}
                >
                  {copy.joinWithGoogleButton}
                </button>
              </form>
              <p className="helper-text">{copy.helperText(MESSAGE_RETENTION_DAYS)}</p>
              <p className="helper-text">{copy.helperPaidLogin}</p>
            </>
          ) : (
            <div className="lobby">
              <div className="lobby__header">
                <div>
                  <h2>{copy.dashboardTitle}</h2>
                  <p>{copy.dashboardSubtitle}</p>
                </div>
                <div className="lobby__header-actions">
                  <button
                    className="btn btn--ghost"
                    type="button"
                    onClick={() => setView('settings')}
                  >
                    {copy.settingsButton}
                  </button>
                  <button
                    className="btn btn--primary"
                    type="button"
                    onClick={handleOpenChatRoom}
                    onTouchEnd={(event) => {
                      event.preventDefault()
                      handleOpenChatRoom()
                    }}
                  >
                    {copy.openChatRoomButton}
                  </button>
                </div>
              </div>

              <div className="lobby__controls">
                <article className="lobby-card">
                  <h3>{copy.controlSearchLabel}</h3>
                  <input
                    className="lobby-card__search"
                    placeholder={copy.searchPlaceholder}
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                  />
                  <p className="helper-text helper-text--inline">
                    {copy.resultsShown(filteredResult.totalMatches, messages.length)}
                  </p>
                </article>

                <article
                  className={`lobby-card ${showTemporaryUi ? 'ui-temporary' : ''}`.trim()}
                >
                  <h3>{copy.controlTranslateLabel}</h3>
                  <div className="lobby-card__density">
                    <button
                      className={`btn btn--chip ${
                        autoTranslateEnabled ? 'btn--chip-active' : ''
                      }`}
                      type="button"
                      onClick={() => setAutoTranslateEnabled(true)}
                    >
                      {copy.translateToggleOn}
                    </button>
                    <button
                      className={`btn btn--chip ${
                        !autoTranslateEnabled ? 'btn--chip-active' : ''
                      }`}
                      type="button"
                      onClick={() => setAutoTranslateEnabled(false)}
                    >
                      {copy.translateToggleOff}
                    </button>
                  </div>
                  <label className="lobby-card__translate-language">
                    <span>{copy.translateLanguageLabel}</span>
                    <select
                      value={translationLanguage}
                      onChange={(event) => setTranslationLanguage(event.target.value)}
                    >
                      {LANGUAGES.map((language) => (
                        <option key={language.code} value={language.code}>
                          {language.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <p className="helper-text helper-text--inline">
                    {copy.translateTargetLabel(translationTargetLabel)}
                  </p>
                  <p className="helper-text helper-text--inline">
                    {copy.translateTestModeHint}
                  </p>
                </article>

                <article className="lobby-card">
                  <h3>{copy.controlDensityLabel}</h3>
                  <div className="lobby-card__density">
                    <button
                      className={`btn btn--chip ${
                        density === 'compact' ? 'btn--chip-active' : ''
                      }`}
                      type="button"
                      onClick={() => setDensity('compact')}
                    >
                      {copy.densityCompact}
                    </button>
                    <button
                      className={`btn btn--chip ${
                        density === 'comfortable' ? 'btn--chip-active' : ''
                      }`}
                      type="button"
                      onClick={() => setDensity('comfortable')}
                    >
                      {copy.densityComfortable}
                    </button>
                  </div>
                </article>

                <article className="lobby-card">
                  <h3>Launch Profile</h3>
                  <div className="lobby-card__density">
                    <button
                      className={`btn btn--chip ${
                        runtimeProfile === 'local' ? 'btn--chip-active' : ''
                      }`}
                      type="button"
                      onClick={() => setRuntimeProfile('local')}
                    >
                      Local
                    </button>
                    <button
                      className={`btn btn--chip ${
                        runtimeProfile === 'dev' ? 'btn--chip-active' : ''
                      }`}
                      type="button"
                      onClick={() => setRuntimeProfile('dev')}
                    >
                      Dev
                    </button>
                    <button
                      className={`btn btn--chip ${
                        runtimeProfile === 'prod' ? 'btn--chip-active' : ''
                      }`}
                      type="button"
                      onClick={() => setRuntimeProfile('prod')}
                    >
                      Prod
                    </button>
                  </div>
                  <p className="helper-text helper-text--inline">
                    {runtimeProfile === 'prod'
                      ? 'Production-safe UI only (hides test/debug controls).'
                      : runtimeProfile === 'dev'
                        ? 'Developer diagnostics mode with debug toasts and tools.'
                        : 'Local build mode for rapid feature iteration.'}
                  </p>
                </article>

                <article className="lobby-card">
                  <h3>Background Visibility</h3>
                  <div className="lobby-card__density">
                    <button
                      className={`btn btn--chip ${
                        visualSettings.panelTransparencyPreset === 'low'
                          ? 'btn--chip-active'
                          : ''
                      }`}
                      type="button"
                      onClick={() =>
                        setVisualSettings((prev) => ({
                          ...prev,
                          panelTransparencyPreset: 'low',
                        }))
                      }
                    >
                      Panel Low
                    </button>
                    <button
                      className={`btn btn--chip ${
                        visualSettings.panelTransparencyPreset === 'medium'
                          ? 'btn--chip-active'
                          : ''
                      }`}
                      type="button"
                      onClick={() =>
                        setVisualSettings((prev) => ({
                          ...prev,
                          panelTransparencyPreset: 'medium',
                        }))
                      }
                    >
                      Panel Medium
                    </button>
                    <button
                      className={`btn btn--chip ${
                        visualSettings.panelTransparencyPreset === 'high'
                          ? 'btn--chip-active'
                          : ''
                      }`}
                      type="button"
                      onClick={() =>
                        setVisualSettings((prev) => ({
                          ...prev,
                          panelTransparencyPreset: 'high',
                        }))
                      }
                    >
                      Panel High
                    </button>
                  </div>
                  <div className="lobby-card__density">
                    <button
                      className={`btn btn--chip ${
                        visualSettings.backgroundEmphasis ? 'btn--chip-active' : ''
                      }`}
                      type="button"
                      onClick={toggleBackgroundEmphasisMode}
                    >
                      {visualSettings.backgroundEmphasis
                        ? 'Emphasis On'
                        : 'Background Emphasis'}
                    </button>
                    <button
                      className={`btn btn--chip ${
                        visualSettings.mobileTransparencyBoost
                          ? 'btn--chip-active'
                          : ''
                      }`}
                      type="button"
                      onClick={() =>
                        setVisualSettings((prev) => ({
                          ...prev,
                          mobileTransparencyBoost: !prev.mobileTransparencyBoost,
                        }))
                      }
                    >
                      Mobile Boost
                    </button>
                  </div>
                  <div className="lobby-card__density">
                    <button
                      className={`btn btn--chip ${
                        visualSettings.scanOverlayEnabled ? 'btn--chip-active' : ''
                      }`}
                      type="button"
                      onClick={() =>
                        setVisualSettings((prev) => ({
                          ...prev,
                          scanOverlayEnabled: !prev.scanOverlayEnabled,
                        }))
                      }
                    >
                      Scan Overlay
                    </button>
                    <button
                      className={`btn btn--chip ${
                        visualSettings.gridOverlayEnabled ? 'btn--chip-active' : ''
                      }`}
                      type="button"
                      onClick={() =>
                        setVisualSettings((prev) => ({
                          ...prev,
                          gridOverlayEnabled: !prev.gridOverlayEnabled,
                        }))
                      }
                    >
                      Grid Overlay
                    </button>
                  </div>
                  <p className="helper-text helper-text--inline">
                    One-click emphasis mode applies stronger transparency instantly.
                  </p>
                </article>

                <article className="lobby-card">
                  <h3>Glass Tuning</h3>
                  <div className="visual-controls">
                    <label className="visual-controls__row">
                      <span>Lobby Card</span>
                      <strong>{visualSettings.lobbyCardOpacity}%</strong>
                      <input
                        type="range"
                        min={20}
                        max={92}
                        value={visualSettings.lobbyCardOpacity}
                        onChange={(event) =>
                          setVisualSettings((prev) => ({
                            ...prev,
                            lobbyCardOpacity: clampNumber(
                              Number(event.target.value),
                              20,
                              92
                            ),
                          }))
                        }
                      />
                    </label>
                    <label className="visual-controls__row">
                      <span>Chat Surface</span>
                      <strong>{visualSettings.messagesOpacity}%</strong>
                      <input
                        type="range"
                        min={14}
                        max={88}
                        value={visualSettings.messagesOpacity}
                        onChange={(event) =>
                          setVisualSettings((prev) => ({
                            ...prev,
                            messagesOpacity: clampNumber(
                              Number(event.target.value),
                              14,
                              88
                            ),
                          }))
                        }
                      />
                    </label>
                    <label className="visual-controls__row">
                      <span>Hero (Dashboard)</span>
                      <strong>{visualSettings.heroEntryOpacity}%</strong>
                      <input
                        type="range"
                        min={28}
                        max={96}
                        value={visualSettings.heroEntryOpacity}
                        onChange={(event) =>
                          setVisualSettings((prev) => ({
                            ...prev,
                            heroEntryOpacity: clampNumber(
                              Number(event.target.value),
                              28,
                              96
                            ),
                          }))
                        }
                      />
                    </label>
                    <label className="visual-controls__row">
                      <span>Hero (Chat)</span>
                      <strong>{visualSettings.heroChatOpacity}%</strong>
                      <input
                        type="range"
                        min={20}
                        max={92}
                        value={visualSettings.heroChatOpacity}
                        onChange={(event) =>
                          setVisualSettings((prev) => ({
                            ...prev,
                            heroChatOpacity: clampNumber(
                              Number(event.target.value),
                              20,
                              92
                            ),
                          }))
                        }
                      />
                    </label>
                    <label className="visual-controls__row">
                      <span>Composer Glass</span>
                      <strong>{visualSettings.composerOpacity}%</strong>
                      <input
                        type="range"
                        min={10}
                        max={76}
                        value={visualSettings.composerOpacity}
                        onChange={(event) =>
                          setVisualSettings((prev) => ({
                            ...prev,
                            composerOpacity: clampNumber(
                              Number(event.target.value),
                              10,
                              76
                            ),
                          }))
                        }
                      />
                    </label>
                    <label className="visual-controls__row">
                      <span>Blur</span>
                      <strong>{visualSettings.blurStrength}px</strong>
                      <input
                        type="range"
                        min={0}
                        max={16}
                        value={visualSettings.blurStrength}
                        onChange={(event) =>
                          setVisualSettings((prev) => ({
                            ...prev,
                            blurStrength: clampNumber(
                              Number(event.target.value),
                              0,
                              16
                            ),
                          }))
                        }
                      />
                    </label>
                    <label className="visual-controls__row">
                      <span>Text Glow</span>
                      <strong>{visualSettings.textShadowIntensity}%</strong>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={visualSettings.textShadowIntensity}
                        onChange={(event) =>
                          setVisualSettings((prev) => ({
                            ...prev,
                            textShadowIntensity: clampNumber(
                              Number(event.target.value),
                              0,
                              100
                            ),
                          }))
                        }
                      />
                    </label>
                    <label className="visual-controls__row">
                      <span>Shadow Strength</span>
                      <strong>{visualSettings.shadowIntensity}%</strong>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={visualSettings.shadowIntensity}
                        onChange={(event) =>
                          setVisualSettings((prev) => ({
                            ...prev,
                            shadowIntensity: clampNumber(
                              Number(event.target.value),
                              0,
                              100
                            ),
                          }))
                        }
                      />
                    </label>
                  </div>
                </article>

                <article className="lobby-card">
                  <div className="lobby-card__head">
                    <h3>{copy.controlPerfLabel}</h3>
                    {showPerfControls ? (
                      <div className="lobby-card__density">
                        <button
                          className="btn btn--ghost btn--small"
                          type="button"
                          onClick={() => setShowPerfPanel((prev) => !prev)}
                        >
                          {copy.perfToggle}
                        </button>
                        <button
                          className="btn btn--ghost btn--small"
                          type="button"
                          onClick={() => setShowOpsLog((prev) => !prev)}
                        >
                          Ops Log
                        </button>
                      </div>
                    ) : null}
                  </div>
                  {showPerfControls && showPerfPanel ? (
                    <>
                      <div className="perf-panel">
                        <div className="perf-panel__grid">
                          <span>
                            {copy.perfFpsLabel}: {fps}
                          </span>
                          <span>
                            {copy.perfRenderLabel}: {lastRenderMs}ms
                          </span>
                          <span>
                            {copy.perfStorageLabel}: {lastStorageWriteMs}ms
                          </span>
                          <span>
                            {copy.perfBatchSizeLabel}: {lastBatchSize}
                          </span>
                          <span>
                            {copy.perfLimitLabel}: {messagePageLimit}
                          </span>
                          <span>Buffered: {messages.length}</span>
                          <span>Queue: {translationQueueDepth}</span>
                          <span>In-flight: {translationInFlight}</span>
                          <span>
                            {copy.perfModeLabel}:{' '}
                            {useLocalMode ? copy.perfModeLocal : copy.perfModeFirebase}
                          </span>
                        </div>
                      </div>
                      {showOpsLog && (
                        <div className="ops-log">
                          <div className="ops-log__head">
                            <strong>Ops Timeline</strong>
                            <span>{opsLogs.length}</span>
                          </div>
                          {opsLogs.length === 0 ? (
                            <p className="helper-text helper-text--inline">No events yet.</p>
                          ) : (
                            <div className="ops-log__list">
                              {opsLogs.slice(0, 18).map((entry) => (
                                <div
                                  className={`ops-log__item ops-log__item--${entry.level}`}
                                  key={entry.id}
                                >
                                  <span>{new Date(entry.at).toLocaleTimeString()}</span>
                                  <p>{entry.message}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      {showTemporaryUi && useLocalMode && (
                        <div
                          className={`lobby-card__stress ${
                            showTemporaryUi ? 'ui-temporary' : ''
                          }`.trim()}
                        >
                          <span>{copy.controlStressLabel}</span>
                          <div className="lobby-card__stress-actions">
                            <input
                              type="number"
                              min={10}
                              max={5000}
                              value={stressCount}
                              onChange={(event) =>
                                setStressCount(Number(event.target.value || 1000))
                              }
                            />
                            <button
                              className="btn btn--ghost btn--small"
                              type="button"
                              onClick={() => void handleStressInsert()}
                              disabled={stressPending}
                            >
                              {stressPending
                                ? copy.stressInjecting
                                : copy.stressInjectButton}
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : !showPerfControls ? (
                    <p className="helper-text helper-text--inline">
                      Perf/ops tools are hidden in production profile.
                    </p>
                  ) : (
                    <p className="helper-text helper-text--inline">
                      {copy.controlPerfHint}
                    </p>
                  )}
                </article>

                <article className="lobby-card">
                  <h3>{copy.subscriptionPlanTitle}</h3>
                  <p className="lobby-card__status">
                    {copy.subscriptionStatus(activeSubscriptionTier)}
                  </p>
                  <p className="helper-text helper-text--inline">
                    {copy.subscriptionPriceHint}
                  </p>
                  <div className="lobby-card__density">
                    <button
                      className={`btn btn--chip ${
                        activeSubscriptionTier === 'earth' ? 'btn--chip-active' : ''
                      }`}
                      type="button"
                      onClick={() => handleSubscriptionTestSelect('earth')}
                    >
                      {copy.subscriptionEarthButton}
                    </button>
                    <button
                      className={`btn btn--chip ${
                        activeSubscriptionTier === 'space' ? 'btn--chip-active' : ''
                      }`}
                      type="button"
                      onClick={() => handleSubscriptionTestSelect('space')}
                    >
                      {copy.subscriptionSpaceButton}
                    </button>
                    <button
                      className={`btn btn--chip ${
                        activeSubscriptionTier === null ? 'btn--chip-active' : ''
                      }`}
                      type="button"
                      onClick={() => handleSubscriptionTestSelect(null)}
                    >
                      {copy.subscriptionFreeButton}
                    </button>
                  </div>
                </article>

                {showTemporaryUi && (
                  <article className="lobby-card lobby-card--launch ui-temporary">
                    <h3>{copy.launchChecklistTitle}</h3>
                    <p className="lobby-card__status">
                      {copy.launchSummary(
                        releaseReadiness.webReady,
                        releaseReadiness.playReady
                      )}
                    </p>
                    <p className="helper-text helper-text--inline">
                      {copy.launchChecklistSubtitle}
                    </p>
                    <ul className="launch-checklist">
                      {releaseReadiness.items.map((item) => (
                        <li key={item.id}>
                          <span>{item.label}</span>
                          <strong
                            className={`launch-badge ${
                              item.ready
                                ? 'launch-badge--ready'
                                : 'launch-badge--pending'
                            }`}
                          >
                            {item.ready
                              ? copy.launchBadgeReady
                              : copy.launchBadgePending}
                          </strong>
                        </li>
                      ))}
                    </ul>
                    <p className="helper-text helper-text--inline">
                      {copy.launchNextStep(releaseReadiness.missingCount)}
                    </p>
                    <p className="helper-text helper-text--inline">
                      {copy.launchExternalNote}
                    </p>
                  </article>
                )}
              </div>
            </div>
          )}
        </section>
      )}

      {view === 'chat' && (
        <section
          className="panel panel--chat"
          style={
            isMobileViewport && viewportInsetBottom > 0
              ? { paddingBottom: `${Math.min(26, viewportInsetBottom + 6)}px` }
              : undefined
          }
        >
          <div className="chat-top">
            <div className="chat-status-bar">
              <span
                className={`chat-status-chip ${
                  useLocalMode ? 'chat-status-chip--warning' : ''
                }`.trim()}
              >
                {connectionStatusLabel}
              </span>
              <span className="chat-status-chip">{translationStatusLabel}</span>
              <span
                className={`chat-status-chip ${
                  rateRiskLevel === 'muted'
                    ? 'chat-status-chip--danger'
                    : rateRiskLevel === 'warning'
                      ? 'chat-status-chip--warning'
                      : ''
                }`.trim()}
              >
                {rateStatusLabel}
              </span>
              <span className="chat-status-chip">{queueStatusLabel}</span>
              <span className="chat-status-chip">{runtimeStatusLabel}</span>
            </div>
            <div className="chat-translate-controls">
              <label className="chat-translate-controls__language">
                <span>{copy.translateLanguageLabel}</span>
                <select
                  value={translationLanguage}
                  onChange={(event) => setTranslationLanguage(event.target.value)}
                >
                  {LANGUAGES.map((language) => (
                    <option key={language.code} value={language.code}>
                      {language.label}
                    </option>
                  ))}
                </select>
              </label>
              <div className="chat-translate-controls__toggle">
                <button
                  className={`btn btn--chip ${
                    autoTranslateEnabled ? 'btn--chip-active' : ''
                  }`}
                  type="button"
                  onClick={() => setAutoTranslateEnabled(true)}
                >
                  {copy.translateToggleOn}
                </button>
                <button
                  className={`btn btn--chip ${
                    !autoTranslateEnabled ? 'btn--chip-active' : ''
                  }`}
                  type="button"
                  onClick={() => setAutoTranslateEnabled(false)}
                >
                  {copy.translateToggleOff}
                </button>
              </div>
            </div>
            {normalizedSearchQuery && (
              <p className="chat-filter-pill">
                {copy.resultsShown(filteredResult.totalMatches, messages.length)}
              </p>
            )}
            {autoTranslateEnabled && (
              <p className="chat-filter-pill chat-filter-pill--translate">
                {copy.translateTargetLabel(translationTargetLabel)}
              </p>
            )}
            <div className="tier-board">
              <div className={`tier-board__space ${spaceImpactClass}`.trim()}>
                <span className="tier-board__tag">{copy.subscriptionSpaceTag}</span>
                {pinnedSpaceMessages.length > 0 ? (
                  <div className="tier-board__space-list">
                    {pinnedSpaceMessages.map((message) => (
                      <div className="tier-board__space-item" key={message.id}>
                        <span className="tier-board__name">{message.nickname}</span>
                        <p className="tier-board__text tier-board__text--space">
                          {resolveTranslatedText(message)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="tier-board__placeholder">
                    {copy.subscriptionSpacePlaceholder}
                  </p>
                )}
              </div>

              <div className="tier-board__earth">
                <span className="tier-board__tag">{copy.subscriptionEarthTag}</span>
                {pinnedEarthMessage ? (
                  <div className="tier-board__earth-line">
                    <span className="tier-board__name">{pinnedEarthMessage.nickname}</span>
                    <p className="tier-board__text tier-board__text--earth">
                      {resolveTranslatedText(pinnedEarthMessage)}
                    </p>
                  </div>
                ) : (
                  <p className="tier-board__placeholder">
                    {copy.subscriptionEarthPlaceholder}
                  </p>
                )}
              </div>
            </div>
          </div>

          <VirtualizedMessageList
            ref={listRef}
            density={density}
            emptyMessage={copy.noMessages}
            messages={filteredMessages}
            mobileOptimized={isMobileViewport}
            onAtBottomChange={setAtBottom}
            translatedTextById={translatedTextByMessageId}
            translatedBadge={copy.translatedBadge}
          />

          {!atBottom && unreadCount > 0 && (
            <button className="jump-latest" type="button" onClick={handleJumpToLatest}>
              {copy.jumpToLatest(unreadCount)}
            </button>
          )}

          <form className="composer" onSubmit={handleSend}>
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={copy.messagePlaceholder}
              maxLength={MESSAGE_MAX_LENGTH}
            />
            <div className="composer__actions">
              {showTemporaryUi && (
                <>
                  <button
                    className={`btn btn--earth btn--small ${
                      showTemporaryUi ? 'ui-temporary' : ''
                    } ${
                      activeSubscriptionTier === 'earth' ? 'btn--chip-active' : ''
                    }`.trim()}
                    type="button"
                    onClick={() => handleSubscriptionTestSelect('earth')}
                    title="$1 / month"
                  >
                    {copy.subscriptionEarthTestButton}
                  </button>
                  <button
                    className={`btn btn--space btn--small ${
                      showTemporaryUi ? 'ui-temporary' : ''
                    } ${
                      activeSubscriptionTier === 'space' ? 'btn--chip-active' : ''
                    }`.trim()}
                    type="button"
                    onClick={() => handleSubscriptionTestSelect('space')}
                    title="$10 / month"
                  >
                    {copy.subscriptionSpaceTestButton}
                  </button>
                  <button
                    className={`btn btn--test btn--small ${
                      showTemporaryUi ? 'ui-temporary' : ''
                    } ${
                      activeSubscriptionTier === null ? 'btn--chip-active' : ''
                    }`.trim()}
                    type="button"
                    onClick={() => handleSubscriptionTestSelect(null)}
                  >
                    {copy.subscriptionFreeTestButton}
                  </button>
                </>
              )}
              <button
                className="btn btn--primary btn--send"
                type="submit"
                disabled={!draft.trim() || isMuted}
              >
                {copy.sendButton}
              </button>
            </div>
          </form>
          <div className="composer-meta">
            <span className="composer-tier-status">
              {copy.subscriptionStatus(activeSubscriptionTier)}
            </span>
            <p className="composer-note">{copy.spamRuleNotice}</p>
          </div>
        </section>
      )}

      {view === 'settings' && (
        <section className="panel">
          <div className="room-header">
            <div>
              <h2>{copy.settingsTitle}</h2>
              <p>{copy.settingsSubtitle}</p>
            </div>
            <button
              className="btn btn--ghost"
              type="button"
              onClick={() => setView('chat')}
            >
              {copy.backToChat}
            </button>
          </div>

          <form className="settings-grid" onSubmit={handleSettingsSave}>
            <label>
              {copy.nicknameLabel}
              <input
                name="nickname"
                value={settingsForm.nickname}
                onChange={handleSettingsChange}
                placeholder={copy.nicknamePlaceholder}
              />
            </label>
            <label>
              {copy.languageLabel}
              <select
                name="locale"
                value={settingsForm.locale}
                onChange={handleSettingsChange}
              >
                {LANGUAGES.map((language) => (
                  <option key={language.code} value={language.code}>
                    {language.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {copy.uiLanguageLabel}
              <select
                name="uiLanguage"
                value={settingsForm.uiLanguage}
                onChange={handleSettingsChange}
              >
                {UI_LANGUAGES.map((language) => (
                  <option key={language.code} value={language.code}>
                    {language.label}
                  </option>
                ))}
              </select>
            </label>
            <button className="btn btn--primary" type="submit">
              {copy.saveSettings}
            </button>
          </form>
        </section>
      )}

      {toast && (
        <div className={`toast ${toast.tone === 'error' ? 'toast--error' : ''}`}>
          {toast.message}
        </div>
      )}
    </div>
  )
}

export default App
