import { describe, expect, test } from 'bun:test'
import { calculateVirtualRange } from '../src/lib/virtualization'

describe('calculateVirtualRange', () => {
  test('returns empty range when item count is zero', () => {
    // #given
    const input = {
      itemCount: 0,
      rowHeight: 44,
      viewportHeight: 300,
      scrollTop: 0,
      overscan: 6,
    }

    // #when
    const range = calculateVirtualRange(input)

    // #then
    expect(range).toEqual({ start: 0, end: 0 })
  })

  test('includes overscan around the first visible item', () => {
    // #given
    const input = {
      itemCount: 1000,
      rowHeight: 50,
      viewportHeight: 300,
      scrollTop: 500,
      overscan: 4,
    }

    // #when
    const range = calculateVirtualRange(input)

    // #then
    expect(range.start).toBe(6)
    expect(range.end).toBe(21)
  })

  test('clamps to the available item count near the end', () => {
    // #given
    const input = {
      itemCount: 42,
      rowHeight: 40,
      viewportHeight: 400,
      scrollTop: 1400,
      overscan: 8,
    }

    // #when
    const range = calculateVirtualRange(input)

    // #then
    expect(range.start).toBeGreaterThanOrEqual(0)
    expect(range.end).toBe(42)
  })

  test('normalizes negative and zero inputs', () => {
    // #given
    const input = {
      itemCount: 10,
      rowHeight: 0,
      viewportHeight: -1,
      scrollTop: -100,
      overscan: -5,
    }

    // #when
    const range = calculateVirtualRange(input)

    // #then
    expect(range.start).toBe(0)
    expect(range.end).toBe(1)
  })
})
