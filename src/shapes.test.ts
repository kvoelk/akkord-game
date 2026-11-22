import { describe, expect, it } from 'vitest'
import {
  CHORD_SHAPES,
  emptyGuess,
  noteForStringAction,
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

  it('assigns finger 1–4 on fretted strings and null on mute/open', () => {
    for (const shape of CHORD_SHAPES) {
      expect(shape.fingers).toHaveLength(6)
      expect(shape.fingers).toHaveLength(shape.frets.length)
      for (let i = 0; i < 6; i++) {
        const fret = shape.frets[i]!
        const finger = shape.fingers[i]!
        if (fret === 'mute' || fret === 'open' || fret === 0) {
          expect(finger).toBeNull()
        } else {
          expect([1, 2, 3, 4]).toContain(finger)
        }
      }
    }
  })

  it('uses standard C-open and A-form barre fingerings', () => {
    const cOpen = CHORD_SHAPES.find((s) => s.id === 'C-open')!
    expect(cOpen.fingers).toEqual([null, 1, null, 2, 3, null])

    const aForm = CHORD_SHAPES.find((s) => s.id === 'C-A-form3')!
    expect(aForm.fingers).toEqual([1, 4, 3, 2, 1, null])
  })

  it('maps open C frets to sounding notes E,C,G,E,C,null', () => {
    const cOpen = CHORD_SHAPES.find((s) => s.id === 'C-open')!
    const notes = cOpen.frets.map((action, i) => noteForStringAction(i, action))
    expect(notes).toEqual(['E', 'C', 'G', 'E', 'C', null])
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
