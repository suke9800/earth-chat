import { httpsCallable } from 'firebase/functions'
import { firebaseReady, getFirebaseFunctions } from './firebase'

export type VerifyPurchaseRequest = {
  packageName: string
  productId: string
  purchaseToken: string
  messageText: string
}

export type VerifyPurchaseResponse = {
  ok: boolean
  status: 'pending' | 'paid' | 'rejected'
  paidMessageId?: string
  reason?: string
}

const CALLABLE_NAME = 'verifyPlayPurchase'

function readOptionalHttpFallback(): string {
  return (import.meta.env.VITE_PLAY_VERIFY_HTTP_URL ?? '').trim()
}

async function verifyViaCallable(
  payload: VerifyPurchaseRequest
): Promise<VerifyPurchaseResponse> {
  const fn = httpsCallable<VerifyPurchaseRequest, VerifyPurchaseResponse>(
    getFirebaseFunctions(),
    CALLABLE_NAME
  )
  const result = await fn(payload)
  return result.data
}

async function verifyViaHttpFallback(
  payload: VerifyPurchaseRequest,
  endpoint: string
): Promise<VerifyPurchaseResponse> {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    return {
      ok: false,
      status: 'rejected',
      reason: `http_${response.status}`,
    }
  }

  return (await response.json()) as VerifyPurchaseResponse
}

export async function verifyPlayPurchase(
  payload: VerifyPurchaseRequest
): Promise<VerifyPurchaseResponse> {
  if (firebaseReady) {
    try {
      return await verifyViaCallable(payload)
    } catch {
      const fallback = readOptionalHttpFallback()
      if (!fallback) {
        return {
          ok: false,
          status: 'rejected',
          reason: 'callable_failed',
        }
      }
      return verifyViaHttpFallback(payload, fallback)
    }
  }

  const fallback = readOptionalHttpFallback()
  if (!fallback) {
    return {
      ok: false,
      status: 'rejected',
      reason: 'firebase_not_configured',
    }
  }

  return verifyViaHttpFallback(payload, fallback)
}
