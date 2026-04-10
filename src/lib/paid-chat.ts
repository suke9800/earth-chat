export type PaidTier = 'earth' | 'space'

export type PaidProduct = {
  tier: PaidTier
  productId: string
  usdPrice: number
}

export type PaidEffectConfig = {
  impactSeconds: number
}

export const PAID_PRODUCTS: PaidProduct[] = [
  { tier: 'earth', productId: 'earth_chat_1', usdPrice: 1 },
  { tier: 'space', productId: 'space_chat_10', usdPrice: 10 },
]

export const PAID_EFFECTS: Record<PaidTier, PaidEffectConfig> = {
  earth: {
    impactSeconds: 1,
  },
  space: {
    impactSeconds: 3,
  },
}

export function resolveTierByProductId(productId: string): PaidTier | null {
  const match = PAID_PRODUCTS.find((product) => product.productId === productId)
  return match ? match.tier : null
}
