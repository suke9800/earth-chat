import { MAX_MESSAGE_AGE_MS } from './constants'
import type { Message } from './types'

const LOCAL_MESSAGES_KEY = 'earth-chat-local-messages-v1'
const LOCAL_DB_NAME = 'earth-chat-local-messages-db'
const LOCAL_DB_VERSION = 1
const LOCAL_STORE_NAME = 'messages'
const LOCAL_INDEX_CREATED_AT = 'createdAt'

let localDbPromise: Promise<IDBDatabase> | null = null

function normalizeTimestamp(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }
  if (typeof value === 'string') {
    const parsed = Date.parse(value)
    if (Number.isFinite(parsed)) {
      return parsed
    }
  }
  return null
}

function normalizeMessage(candidate: unknown): Message | null {
  if (!candidate || typeof candidate !== 'object') {
    return null
  }

  const messageLike = candidate as Partial<Message>
  const id = typeof messageLike.id === 'string' ? messageLike.id.trim() : ''
  const text = typeof messageLike.text === 'string' ? messageLike.text : ''
  const nickname =
    typeof messageLike.nickname === 'string' &&
    messageLike.nickname.trim().length > 0
      ? messageLike.nickname
      : 'Anonymous'
  const createdAt = normalizeTimestamp(messageLike.createdAt)

  if (!id || !text || createdAt === null) {
    return null
  }

  return {
    id,
    nickname,
    text,
    createdAt,
    lang: typeof messageLike.lang === 'string' ? messageLike.lang : undefined,
    senderId:
      typeof messageLike.senderId === 'string' ? messageLike.senderId : undefined,
    paidTier:
      messageLike.paidTier === 'earth' || messageLike.paidTier === 'space'
        ? messageLike.paidTier
        : undefined,
    paidUntil:
      typeof messageLike.paidUntil === 'number' &&
      Number.isFinite(messageLike.paidUntil)
        ? messageLike.paidUntil
        : undefined,
  }
}

function normalizeMessages(candidates: unknown[]): Message[] {
  const next: Message[] = []
  for (const candidate of candidates) {
    const normalized = normalizeMessage(candidate)
    if (normalized) {
      next.push(normalized)
    }
  }
  return next
}

export function pruneLocalMessages(messages: Message[]): Message[] {
  const cutoff = Date.now() - MAX_MESSAGE_AGE_MS
  const next: Message[] = []
  for (const message of messages) {
    const normalized = normalizeMessage(message)
    if (!normalized) {
      continue
    }
    if (normalized.createdAt >= cutoff) {
      next.push(normalized)
    }
  }
  return next
}

function isIndexedDbAvailable(): boolean {
  return typeof indexedDB !== 'undefined'
}

function loadLocalMessagesFromStorage(): Message[] {
  if (typeof localStorage === 'undefined') {
    return []
  }

  try {
    const raw = localStorage.getItem(LOCAL_MESSAGES_KEY)
    if (!raw) {
      return []
    }

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return []
    }

    return pruneLocalMessages(normalizeMessages(parsed))
  } catch {
    return []
  }
}

function saveLocalMessagesToStorage(messages: Message[]): void {
  if (typeof localStorage === 'undefined') {
    return
  }

  try {
    const payload = pruneLocalMessages(messages)
    localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(payload))
  } catch {
  }
}

function clearLocalMessagesStorage(): void {
  if (typeof localStorage === 'undefined') {
    return
  }

  try {
    localStorage.removeItem(LOCAL_MESSAGES_KEY)
  } catch {
  }
}

function openLocalDb(): Promise<IDBDatabase> {
  if (!isIndexedDbAvailable()) {
    return Promise.reject(new Error('indexeddb_unavailable'))
  }

  if (localDbPromise) {
    return localDbPromise
  }

  localDbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(LOCAL_DB_NAME, LOCAL_DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(LOCAL_STORE_NAME)) {
        const store = db.createObjectStore(LOCAL_STORE_NAME, { keyPath: 'id' })
        store.createIndex(LOCAL_INDEX_CREATED_AT, LOCAL_INDEX_CREATED_AT)
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('indexeddb_open_failed'))
  }).catch((error: unknown) => {
    localDbPromise = null
    throw error
  })

  if (!localDbPromise) {
    return Promise.reject(new Error('indexeddb_open_failed'))
  }

  return localDbPromise
}

function readRecentFromDb(limit: number): Promise<Message[]> {
  return new Promise((resolve, reject) => {
    openLocalDb()
      .then((db) => {
        const transaction = db.transaction(LOCAL_STORE_NAME, 'readonly')
        const store = transaction.objectStore(LOCAL_STORE_NAME)
        const index = store.index(LOCAL_INDEX_CREATED_AT)
        const cursorRequest = index.openCursor(null, 'prev')
        const cutoff = Date.now() - MAX_MESSAGE_AGE_MS
        const next: Message[] = []

        cursorRequest.onerror = () => {
          reject(cursorRequest.error ?? new Error('indexeddb_cursor_failed'))
        }

        cursorRequest.onsuccess = () => {
          const cursor = cursorRequest.result
          if (!cursor || next.length >= limit) {
            resolve(next.reverse())
            return
          }

          const normalized = normalizeMessage(cursor.value)
          if (normalized && normalized.createdAt >= cutoff) {
            next.push(normalized)
          }
          cursor.continue()
        }
      })
      .catch((error) => reject(error))
  })
}

function writeManyToDb(messages: Message[]): Promise<void> {
  const safeMessages = pruneLocalMessages(messages)
  if (safeMessages.length === 0) {
    return Promise.resolve()
  }

  return openLocalDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const transaction = db.transaction(LOCAL_STORE_NAME, 'readwrite')
        const store = transaction.objectStore(LOCAL_STORE_NAME)

        for (const message of safeMessages) {
          store.put(message)
        }

        transaction.oncomplete = () => resolve()
        transaction.onerror = () =>
          reject(transaction.error ?? new Error('indexeddb_write_failed'))
      })
  )
}

function pruneExpiredFromDb(): Promise<number> {
  if (typeof IDBKeyRange === 'undefined') {
    return Promise.resolve(0)
  }

  return openLocalDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const transaction = db.transaction(LOCAL_STORE_NAME, 'readwrite')
        const store = transaction.objectStore(LOCAL_STORE_NAME)
        const index = store.index(LOCAL_INDEX_CREATED_AT)
        const cutoff = Date.now() - MAX_MESSAGE_AGE_MS
        const range = IDBKeyRange.upperBound(cutoff - 1)
        const cursorRequest = index.openCursor(range)
        let removed = 0

        cursorRequest.onerror = () =>
          reject(cursorRequest.error ?? new Error('indexeddb_prune_failed'))

        cursorRequest.onsuccess = () => {
          const cursor = cursorRequest.result
          if (!cursor) {
            return
          }
          cursor.delete()
          removed += 1
          cursor.continue()
        }

        transaction.oncomplete = () => resolve(removed)
        transaction.onerror = () =>
          reject(transaction.error ?? new Error('indexeddb_prune_failed'))
      })
  )
}

async function migrateStorageToDbIfNeeded(): Promise<void> {
  const legacy = loadLocalMessagesFromStorage()
  if (legacy.length === 0) {
    return
  }

  try {
    await writeManyToDb(legacy)
    clearLocalMessagesStorage()
  } catch {
  }
}

export async function loadLocalMessages(limit: number): Promise<Message[]> {
  const safeLimit = Number.isFinite(limit) ? Math.max(1, Math.floor(limit)) : 1

  if (!isIndexedDbAvailable()) {
    return loadLocalMessagesFromStorage().slice(-safeLimit)
  }

  try {
    await migrateStorageToDbIfNeeded()
    await pruneExpiredFromDb()
    return await readRecentFromDb(safeLimit)
  } catch {
    return loadLocalMessagesFromStorage().slice(-safeLimit)
  }
}

export async function appendLocalMessage(message: Message): Promise<void> {
  const safeMessage = normalizeMessage(message)
  if (!safeMessage) {
    return
  }

  if (!isIndexedDbAvailable()) {
    const prev = loadLocalMessagesFromStorage()
    saveLocalMessagesToStorage([...prev, safeMessage])
    return
  }

  try {
    await writeManyToDb([safeMessage])
  } catch {
    const prev = loadLocalMessagesFromStorage()
    saveLocalMessagesToStorage([...prev, safeMessage])
  }
}

export async function appendLocalMessages(messages: Message[]): Promise<void> {
  const safeMessages = pruneLocalMessages(messages)
  if (safeMessages.length === 0) {
    return
  }

  if (!isIndexedDbAvailable()) {
    const prev = loadLocalMessagesFromStorage()
    saveLocalMessagesToStorage([...prev, ...safeMessages])
    return
  }

  try {
    await writeManyToDb(safeMessages)
  } catch {
    const prev = loadLocalMessagesFromStorage()
    saveLocalMessagesToStorage([...prev, ...safeMessages])
  }
}

export async function pruneExpiredLocalMessages(): Promise<number> {
  if (!isIndexedDbAvailable()) {
    const prev = loadLocalMessagesFromStorage()
    const next = pruneLocalMessages(prev)
    const removed = Math.max(0, prev.length - next.length)
    if (removed > 0) {
      saveLocalMessagesToStorage(next)
    }
    return removed
  }

  try {
    return await pruneExpiredFromDb()
  } catch {
    const prev = loadLocalMessagesFromStorage()
    const next = pruneLocalMessages(prev)
    const removed = Math.max(0, prev.length - next.length)
    if (removed > 0) {
      saveLocalMessagesToStorage(next)
    }
    return removed
  }
}
