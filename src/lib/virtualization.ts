export type VirtualRangeInput = {
  itemCount: number
  rowHeight: number
  viewportHeight: number
  scrollTop: number
  overscan: number
}

export type VirtualRange = {
  start: number
  end: number
}

export function calculateVirtualRange(input: VirtualRangeInput): VirtualRange {
  const itemCount = Math.max(0, Math.floor(input.itemCount))
  if (itemCount === 0) {
    return { start: 0, end: 0 }
  }

  const rowHeight = Math.max(1, input.rowHeight)
  const viewportHeight = Math.max(0, input.viewportHeight)
  const overscan = Math.max(0, Math.floor(input.overscan))
  const scrollTop = Math.max(0, input.scrollTop)

  const firstVisible = Math.floor(scrollTop / rowHeight)
  const visibleCount = Math.ceil(viewportHeight / rowHeight)
  const start = Math.max(0, firstVisible - overscan)
  const end = Math.min(itemCount, firstVisible + visibleCount + overscan + 1)

  return { start, end }
}
