import { describe, expect, it } from 'vitest'
import { suggestStart } from './Fretboard'
import { noteIndex } from './theory'

describe('suggestStart', () => {
  it('honours preferStart when provided', () => {
    expect(suggestStart('C', 3)).toBe(3)
    expect(suggestStart('C', -2)).toBe(0)
    expect(suggestStart('C', 99)).toBe(12)
  })

  it('places a window near a root on the A or E string', () => {
    // Open A = 9 (A), open E = 4 (E)
    // C (pc 0) on A string: fret 3 → start max(0, 3-1) = 2
    expect(suggestStart('C')).toBe(2)
    // A (pc 9) on A string: fret 0 → start 0
    expect(suggestStart('A')).toBe(0)
    // E (pc 4) on A string: fret 7 → start 6
    expect(suggestStart('E')).toBe(6)
  })

  it('keeps the suggested root fret inside the 5-fret window', () => {
    for (const root of ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'Cis', 'Fis'] as const) {
      const start = suggestStart(root)
      const rootPc = noteIndex(root)
      const openA = 9
      const openE = 4
      const inWindow = (open: number) => {
        for (let f = start; f < start + 5; f++) {
          if ((open + f) % 12 === rootPc) return true
        }
        return false
      }
      expect(inWindow(openA) || inWindow(openE)).toBe(true)
    }
  })
})
