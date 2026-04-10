export type User = {
  id: string
  nickname: string
  locale: string
  joinedAt: string
  subscriptionTier?: 'earth' | 'space'
}

export type Message = {
  id: string
  nickname: string
  text: string
  lang?: string
  createdAt: number
  senderId?: string
  paidTier?: 'earth' | 'space'
  paidUntil?: number
}
