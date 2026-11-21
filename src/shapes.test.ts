import { describe, expect, it } from 'vitest'
import {
  CHORD_SHAPES,
  emptyGuess,
  shapesEqual,
  shapesFor,
} from './shapes'

describe('CHORD_SHAPES', () => {
  it('encodes C open as [0, 1, 0, 2, 3, mute] high-e → low-E', () => {
    const cOpen = CHORD_SHAPES.find((s) => s.id === 'C-open')
    expect(cOpen).toBeDefined()
    expect(cOpen!.frets).toEqual([0, 1, 0, 2, 3, 'mute'])
    expect(shapesFor('C', 'dur').some((s) => s.id === 'C-open')).toBe(true)
  })
})

describe('shapesEqual', () => {
  it('treats 0 and open as equal', () => {
    expect(shapesEqual([0, 1, 0, 2, 3, 'mute'], ['open', 1, 'open', 2, 3, 'mute'])).toBe(
      true,
    )
  })

  it('detects differing frets', () => {
    expect(shapesEqual([0, 1, 0, 2, 3, 'mute'], [0, 1, 0, 2, 2, 'mute'])).toBe(false)
  })

  it('matches empty guesses only when both muted', () => {
    expect(shapesEqual(emptyGuess(), emptyGuess())).toBe(true)
    expect(shapesEqual(emptyGuess(), [0, 0, 0, 0, 0, 0])).toBe(false)
  })
})
