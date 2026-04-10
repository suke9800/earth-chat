export const MESSAGE_RETENTION_DAYS = 1
export const MAX_MESSAGE_AGE_MS = MESSAGE_RETENTION_DAYS * 24 * 60 * 60 * 1000
export const WEB_MESSAGE_PAGE_LIMIT = 20
export const MOBILE_APP_MESSAGE_PAGE_LIMIT = 10
export const WEB_REMOTE_SYNC_LIMIT = 200
export const MOBILE_REMOTE_SYNC_LIMIT = 120
export const MESSAGE_BUFFER_LIMIT = 4000
export const MESSAGE_BATCH_WINDOW_MS = 120
export const MESSAGE_MAX_LENGTH = 500
export const SPAM_WINDOW_MS = 3000
export const SPAM_LIMIT_COUNT = 5
export const SPAM_EXTENDED_WINDOW_MS = 20000
export const SPAM_EXTENDED_LIMIT_COUNT = 12
export const SPAM_WARNING_GAP_COUNT = 2
export const MUTE_DURATION_MS = 10000
export const MUTE_ESCALATED_DURATION_MS = 60000
export const MUTE_ESCALATE_STRIKE_COUNT = 3

export function resolveMessagePageLimit(isMobileAppRuntime: boolean): number {
  return isMobileAppRuntime
    ? MOBILE_APP_MESSAGE_PAGE_LIMIT
    : WEB_MESSAGE_PAGE_LIMIT
}

export function resolveRemoteSyncLimit(isMobileAppRuntime: boolean): number {
  return isMobileAppRuntime
    ? MOBILE_REMOTE_SYNC_LIMIT
    : WEB_REMOTE_SYNC_LIMIT
}
