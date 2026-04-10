import { afterEach, describe, expect, test } from 'bun:test'
import { translateLocalText } from '../src/lib/local-translation'

const originalFetch = globalThis.fetch

afterEach(() => {
  globalThis.fetch = originalFetch
})

describe('local translation engine', () => {
  test('returns same text when source and target are equal', async () => {
    const translated = await translateLocalText({
      text: 'hello',
      sourceLang: 'en',
      targetLang: 'en',
    })

    expect(translated).toBe('hello')
  })

  test('uses remote translation when API returns success', async () => {
    globalThis.fetch = (async () =>
      new Response(
        JSON.stringify({
          responseData: { translatedText: 'hola mundo' },
          responseStatus: 200,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      )) as typeof fetch

    const translated = await translateLocalText({
      text: 'hello world',
      sourceLang: 'en',
      targetLang: 'es',
    })

    expect(translated).toBe('hola mundo')
  })

  test('falls back when remote translation fails', async () => {
    globalThis.fetch = (async () =>
      new Response('upstream unavailable', { status: 503 })) as typeof fetch

    const translated = await translateLocalText({
      text: 'ship test payload',
      sourceLang: 'en',
      targetLang: 'ja',
    })

    expect(translated).toBe('[JA] ship test payload')
  })

  test('uses fixed chat phrase mapping for hi before remote call', async () => {
    globalThis.fetch = (async () => {
      throw new Error('remote should not be used for fixed phrase')
    }) as typeof fetch

    const translated = await translateLocalText({
      text: 'hi',
      sourceLang: 'en',
      targetLang: 'ko',
    })

    expect(translated).toBe('\uC548\uB155')
  })

  test('uses fixed chat phrase mapping for how are you before remote call', async () => {
    globalThis.fetch = (async () => {
      throw new Error('remote should not be used for fixed phrase')
    }) as typeof fetch

    const translated = await translateLocalText({
      text: 'how are you',
      sourceLang: 'en',
      targetLang: 'ko',
    })

    expect(translated).toBe('\uC5B4\uB5BB\uAC8C \uC9C0\uB0B4\uC138\uC694')
  })

  test('supports local-only fallback mode', async () => {
    globalThis.fetch = (async () => {
      throw new Error('fetch should not be called in local-only mode')
    }) as typeof fetch

    const translated = await translateLocalText({
      text: 'thank you',
      sourceLang: 'en',
      targetLang: 'de',
      localOnly: true,
    })

    expect(translated).toBe('danke')
  })
})
