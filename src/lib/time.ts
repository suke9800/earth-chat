export function formatRelativeTime(value: number | string): string {
  const timestamp = typeof value === 'number' ? value : Date.parse(value)
  if (!Number.isFinite(timestamp)) {
    return 'unknown'
  }

  const delta = Date.now() - timestamp
  if (delta < 60_000) {
    return 'just now'
  }

  const minutes = Math.floor(delta / 60_000)
  if (minutes < 60) {
    return `${minutes}m`
  }

  const hours = Math.floor(minutes / 60)
  if (hours < 24) {
    return `${hours}h`
  }

  const days = Math.floor(hours / 24)
  return `${days}d`
}
