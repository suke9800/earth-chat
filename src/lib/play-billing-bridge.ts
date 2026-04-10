import type { PaidProduct } from './paid-chat'

type AndroidPurchaseResult = {
  ok: boolean
  productId?: string
  purchaseToken?: string
  reason?: string
}

type AndroidBillingBridge = {
  purchaseProduct: (productId: string) => Promise<AndroidPurchaseResult>
  queryProducts: () => Promise<Array<{ productId: string; formattedPrice: string }>>
}

declare global {
  interface Window {
    AndroidBilling?: AndroidBillingBridge
  }
}

export function isAndroidBillingBridgeReady(): boolean {
  return typeof window !== 'undefined' && !!window.AndroidBilling
}

export async function queryAndroidBillingProducts(): Promise<
  Array<{ productId: string; formattedPrice: string }>
> {
  if (!isAndroidBillingBridgeReady()) {
    return []
  }
  return window.AndroidBilling!.queryProducts()
}

export async function requestAndroidPlayPurchase(
  product: PaidProduct
): Promise<AndroidPurchaseResult> {
  if (!isAndroidBillingBridgeReady()) {
    return {
      ok: false,
      reason: 'bridge_unavailable',
    }
  }
  return window.AndroidBilling!.purchaseProduct(product.productId)
}
