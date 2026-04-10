import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react'
import { formatRelativeTime } from '../lib/time'
import type { Message } from '../lib/types'
import { calculateVirtualRange } from '../lib/virtualization'

export type MessageDensity = 'compact' | 'comfortable'

export type VirtualizedMessageListHandle = {
  isAtBottom: () => boolean
  scrollToBottom: (behavior?: ScrollBehavior) => void
}

type VirtualizedMessageListProps = {
  density: MessageDensity
  emptyMessage: string
  messages: Message[]
  mobileOptimized?: boolean
  onAtBottomChange?: (atBottom: boolean) => void
  translatedTextById?: Record<string, string>
  translatedBadge?: string
}

const GROUP_WINDOW_MS = 2 * 60 * 1000

function getRowHeight(density: MessageDensity, mobileOptimized: boolean): number {
  if (density === 'compact') {
    return mobileOptimized ? 30 : 34
  }
  return mobileOptimized ? 36 : 42
}

export const VirtualizedMessageList = forwardRef<
  VirtualizedMessageListHandle,
  VirtualizedMessageListProps
>(function VirtualizedMessageList(
  {
    density,
    emptyMessage,
    messages,
    mobileOptimized = false,
    onAtBottomChange,
    translatedTextById,
    translatedBadge,
  }: VirtualizedMessageListProps,
  ref
) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [viewportHeight, setViewportHeight] = useState(0)

  const rowHeight = getRowHeight(density, mobileOptimized)
  const overscan = useMemo(() => {
    const base = mobileOptimized ? 6 : 8
    if (messages.length > 600) {
      return base + 4
    }
    if (messages.length > 200) {
      return base + 2
    }
    return base
  }, [messages.length, mobileOptimized])
  const range = useMemo(
    () =>
      calculateVirtualRange({
        itemCount: messages.length,
        rowHeight,
        viewportHeight,
        scrollTop,
        overscan,
      }),
    [messages.length, overscan, rowHeight, scrollTop, viewportHeight]
  )

  const topSpacerHeight = range.start * rowHeight
  const bottomSpacerHeight = Math.max(0, (messages.length - range.end) * rowHeight)
  const windowedMessages = useMemo(
    () => messages.slice(range.start, range.end),
    [messages, range.end, range.start]
  )

  const computeAtBottom = () => {
    const node = containerRef.current
    if (!node) {
      return true
    }
    const threshold = rowHeight * 1.5
    return node.scrollHeight - node.scrollTop - node.clientHeight <= threshold
  }

  const notifyAtBottom = () => {
    onAtBottomChange?.(computeAtBottom())
  }

  useImperativeHandle(
    ref,
    () => ({
      isAtBottom: () => computeAtBottom(),
      scrollToBottom: (behavior = 'auto') => {
        const node = containerRef.current
        if (!node) {
          return
        }
        if (typeof node.scrollTo === 'function') {
          try {
            node.scrollTo({ top: node.scrollHeight, behavior })
            return
          } catch {
            // Older mobile browsers may not support scroll options object.
          }
        }
        node.scrollTop = node.scrollHeight
      },
    }),
    [rowHeight]
  )

  useEffect(() => {
    const node = containerRef.current
    if (!node) {
      return
    }

    const updateViewport = () => setViewportHeight(node.clientHeight)
    updateViewport()

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(updateViewport)
      observer.observe(node)
      return () => observer.disconnect()
    }

    window.addEventListener('resize', updateViewport)
    return () => window.removeEventListener('resize', updateViewport)
  }, [])

  useEffect(() => {
    notifyAtBottom()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length, rowHeight])

  const handleScroll = () => {
    const node = containerRef.current
    if (!node) {
      return
    }
    setScrollTop(node.scrollTop)
    notifyAtBottom()
  }

  return (
    <div
      className={`messages messages--${density}`}
      ref={containerRef}
      onScroll={handleScroll}
    >
      {messages.length === 0 ? (
        <div className="notice">{emptyMessage}</div>
      ) : (
        <>
          {topSpacerHeight > 0 && <div style={{ height: topSpacerHeight }} />}
          {windowedMessages.map((message, index) => {
            const absoluteIndex = range.start + index
            const previous = messages[absoluteIndex - 1]
            const grouped =
              !!previous &&
              previous.nickname === message.nickname &&
              message.createdAt - previous.createdAt <= GROUP_WINDOW_MS
            const translatedText = translatedTextById?.[message.id]
            const displayText = translatedText ?? message.text

            return (
              <div
                key={message.id}
                className={`message ${
                  message.paidTier ? `message--${message.paidTier}` : ''
                } ${grouped ? 'message--grouped' : ''}`}
                style={{ '--delay': '0ms' } as CSSProperties}
              >
                {message.paidTier && (
                  <span className="message__tier">{message.paidTier.toUpperCase()}</span>
                )}
                {!grouped ? (
                  <span className="message__name">{message.nickname}:</span>
                ) : (
                  <span
                    className="message__name message__name--grouped"
                    aria-hidden="true"
                  />
                )}
                <span className="message__text" title={message.text}>
                  {displayText}
                </span>
                {translatedText && (
                  <span className="message__translated">
                    {translatedBadge ?? 'Translated'}
                  </span>
                )}
                <span className="message__time">{formatRelativeTime(message.createdAt)}</span>
              </div>
            )
          })}
          {bottomSpacerHeight > 0 && <div style={{ height: bottomSpacerHeight }} />}
        </>
      )}
    </div>
  )
})
