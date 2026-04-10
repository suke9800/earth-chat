import { DEFAULT_UI_LANGUAGE, isUiLanguage, type UiLanguage } from './i18n'
import { DEFAULT_LANGUAGE, LANGUAGES } from './languages'
import type { User } from './types'

export type RuntimeProfile = 'local' | 'dev' | 'prod'
export type PanelTransparencyPreset = 'low' | 'medium' | 'high'
export type VisualSettings = {
  panelTransparencyPreset: PanelTransparencyPreset
  lobbyCardOpacity: number
  messagesOpacity: number
  heroEntryOpacity: number
  heroChatOpacity: number
  composerOpacity: number
  blurStrength: number
  textShadowIntensity: number
  shadowIntensity: number
  scanOverlayEnabled: boolean
  gridOverlayEnabled: boolean
  mobileTransparencyBoost: boolean
  backgroundEmphasis: boolean
}

const DEFAULT_RUNTIME_PROFILE: RuntimeProfile = 'local'
export const DEFAULT_VISUAL_SETTINGS: VisualSettings = {
  panelTransparencyPreset: 'medium',
  lobbyCardOpacity: 72,
  messagesOpacity: 52,
  heroEntryOpacity: 74,
  heroChatOpacity: 64,
  composerOpacity: 38,
  blurStrength: 6,
  textShadowIntensity: 36,
  shadowIntensity: 58,
  scanOverlayEnabled: true,
  gridOverlayEnabled: true,
  mobileTransparencyBoost: true,
  backgroundEmphasis: false,
}

export type StoredState = {
  user: User | null
  uiLanguage: UiLanguage
  translationLanguage: string
  runtimeProfile: RuntimeProfile
  visualSettings: VisualSettings
}

const STORAGE_KEY = 'earth-chat-state-v3'

const EMPTY_STATE: StoredState = {
  user: null,
  uiLanguage: DEFAULT_UI_LANGUAGE,
  translationLanguage: DEFAULT_LANGUAGE,
  runtimeProfile: DEFAULT_RUNTIME_PROFILE,
  visualSettings: DEFAULT_VISUAL_SETTINGS,
}

function normalizeRuntimeProfile(candidate: unknown): RuntimeProfile {
  if (candidate === 'local' || candidate === 'dev' || candidate === 'prod') {
    return candidate
  }
  return DEFAULT_RUNTIME_PROFILE
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

function normalizePanelTransparencyPreset(candidate: unknown): PanelTransparencyPreset {
  if (candidate === 'low' || candidate === 'medium' || candidate === 'high') {
    return candidate
  }
  return DEFAULT_VISUAL_SETTINGS.panelTransparencyPreset
}

function normalizeVisualSettings(candidate: unknown): VisualSettings {
  if (!candidate || typeof candidate !== 'object') {
    return DEFAULT_VISUAL_SETTINGS
  }

  const next = candidate as Partial<VisualSettings>

  return {
    panelTransparencyPreset: normalizePanelTransparencyPreset(
      next.panelTransparencyPreset
    ),
    lobbyCardOpacity: clampNumber(
      Number(next.lobbyCardOpacity),
      20,
      92
    ),
    messagesOpacity: clampNumber(
      Number(next.messagesOpacity),
      14,
      88
    ),
    heroEntryOpacity: clampNumber(
      Number(next.heroEntryOpacity),
      28,
      96
    ),
    heroChatOpacity: clampNumber(
      Number(next.heroChatOpacity),
      20,
      92
    ),
    composerOpacity: clampNumber(
      Number(next.composerOpacity),
      10,
      76
    ),
    blurStrength: clampNumber(
      Number(next.blurStrength),
      0,
      16
    ),
    textShadowIntensity: clampNumber(
      Number(next.textShadowIntensity),
      0,
      100
    ),
    shadowIntensity: clampNumber(
      Number(next.shadowIntensity),
      0,
      100
    ),
    scanOverlayEnabled:
      typeof next.scanOverlayEnabled === 'boolean'
        ? next.scanOverlayEnabled
        : DEFAULT_VISUAL_SETTINGS.scanOverlayEnabled,
    gridOverlayEnabled:
      typeof next.gridOverlayEnabled === 'boolean'
        ? next.gridOverlayEnabled
        : DEFAULT_VISUAL_SETTINGS.gridOverlayEnabled,
    mobileTransparencyBoost:
      typeof next.mobileTransparencyBoost === 'boolean'
        ? next.mobileTransparencyBoost
        : DEFAULT_VISUAL_SETTINGS.mobileTransparencyBoost,
    backgroundEmphasis:
      typeof next.backgroundEmphasis === 'boolean'
        ? next.backgroundEmphasis
        : DEFAULT_VISUAL_SETTINGS.backgroundEmphasis,
  }
}

function normalizeStoredUser(candidate: unknown): User | null {
  if (!candidate || typeof candidate !== 'object') {
    return null
  }

  const userLike = candidate as Partial<User>
  const id = typeof userLike.id === 'string' ? userLike.id.trim() : ''
  const nickname =
    typeof userLike.nickname === 'string' ? userLike.nickname.trim() : ''
  const locale = typeof userLike.locale === 'string' ? userLike.locale.trim() : ''
  const joinedAt =
    typeof userLike.joinedAt === 'string' ? userLike.joinedAt.trim() : ''
  const subscriptionTier =
    userLike.subscriptionTier === 'earth' || userLike.subscriptionTier === 'space'
      ? userLike.subscriptionTier
      : undefined

  if (!id || !nickname || !locale || !joinedAt) {
    return null
  }

  return {
    id,
    nickname,
    locale,
    joinedAt,
    subscriptionTier,
  }
}

export function loadState(): StoredState {
  if (typeof localStorage === 'undefined') {
    return EMPTY_STATE
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return EMPTY_STATE
    }

    const parsed = JSON.parse(raw) as Partial<StoredState>
    const uiLanguage =
      typeof parsed.uiLanguage === 'string' && isUiLanguage(parsed.uiLanguage)
        ? parsed.uiLanguage
        : DEFAULT_UI_LANGUAGE
    const user = normalizeStoredUser(parsed.user)
    const translationLanguage =
      typeof parsed.translationLanguage === 'string' &&
      LANGUAGES.some((language) => language.code === parsed.translationLanguage)
        ? parsed.translationLanguage
        : user?.locale ?? DEFAULT_LANGUAGE
    const runtimeProfile = normalizeRuntimeProfile(parsed.runtimeProfile)
    const visualSettings = normalizeVisualSettings(parsed.visualSettings)

    return {
      user,
      uiLanguage,
      translationLanguage,
      runtimeProfile,
      visualSettings,
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('Failed to load Earth Chat state', error)
    }
    return EMPTY_STATE
  }
}

export function saveState(state: StoredState): void {
  if (typeof localStorage === 'undefined') {
    return
  }

  try {
    const payload: StoredState = {
      user: state.user,
      uiLanguage: state.uiLanguage,
      translationLanguage: state.translationLanguage,
      runtimeProfile: normalizeRuntimeProfile(state.runtimeProfile),
      visualSettings: normalizeVisualSettings(state.visualSettings),
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('Failed to save Earth Chat state', error)
    }
  }
}
