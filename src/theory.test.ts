import { describe, expect, it } from 'vitest'
import {
  NOTES,
  TRIAD_INTERVALS,
  degreeGlyph,
  normalizeNoteInput,
  noteAt,
  toRoman,
  triadDegree,
  triadNotes,
} from './theory'

describe('NOTES', () => {
  it('has 12 chromatic pitch classes ending on B', () => {
    expect(NOTES).toHaveLength(12)
    expect(NOTES[0]).toBe('C')
    expect(NOTES[11]).toBe('B')
  })
})

describe('TRIAD_INTERVALS', () => {
  it('uses 0/4/7 for Dur and 0/3/7 for Moll', () => {
    expect(TRIAD_INTERVALS.dur).toEqual([0, 4, 7])
    expect(TRIAD_INTERVALS.moll).toEqual([0, 3, 7])
  })
})

describe('normalizeNoteInput', () => {
  it('accepts sharp and flat spellings', () => {
    expect(normalizeNoteInput('C#')).toBe(1)
    expect(normalizeNoteInput('Cis')).toBe(1)
    expect(normalizeNoteInput('Db')).toBe(1)
    expect(normalizeNoteInput('Des')).toBe(1)
  })

  it('handles international B and German H/Bb aliases', () => {
    expect(normalizeNoteInput('B')).toBe(11)
    expect(normalizeNoteInput('H')).toBe(11)
    expect(normalizeNoteInput('Bb')).toBe(10)
    expect(normalizeNoteInput('hes')).toBe(10)
  })

  it('is case-insensitive and trims', () => {
    expect(normalizeNoteInput('  fis ')).toBe(6)
    expect(normalizeNoteInput('g♭')).toBe(6)
  })

  it('returns null for garbage', () => {
    expect(normalizeNoteInput('')).toBeNull()
    expect(normalizeNoteInput('xyz')).toBeNull()
  })
})

describe('triadNotes', () => {
  it('builds C Dur as C–E–G', () => {
    expect(triadNotes('C', 'dur')).toEqual(['C', 'E', 'G'])
  })

  it('builds A Moll as A–C–E', () => {
    expect(triadNotes('A', 'moll')).toEqual(['A', 'C', 'E'])
  })

  it('wraps across the octave (Fis Dur)', () => {
    expect(triadNotes('Fis', 'dur')).toEqual(['Fis', 'Ais', 'Cis'])
  })

  it('accepts aliased root strings', () => {
    expect(triadNotes('C#', 'moll')).toEqual(triadNotes('Cis', 'moll'))
  })
})

describe('noteAt', () => {
  it('wraps negative and large semitones', () => {
    expect(noteAt(-1)).toBe('B')
    expect(noteAt(12)).toBe('C')
  })
})

describe('triadDegree', () => {
  it('maps C-Dur tones to 1 / 3 / 5', () => {
    expect(triadDegree('C', 'C', 'dur')).toBe(1)
    expect(triadDegree('E', 'C', 'dur')).toBe(3)
    expect(triadDegree('G', 'C', 'dur')).toBe(5)
  })

  it('maps A-Moll tones to 1 / 3 / 5', () => {
    expect(triadDegree('A', 'A', 'moll')).toBe(1)
    expect(triadDegree('C', 'A', 'moll')).toBe(3)
    expect(triadDegree('E', 'A', 'moll')).toBe(5)
  })

  it('returns null for non-chord tones and garbage', () => {
    expect(triadDegree('D', 'C', 'dur')).toBeNull()
    expect(triadDegree('xyz', 'C', 'dur')).toBeNull()
  })

  it('accepts aliased note spellings', () => {
    expect(triadDegree('Cis', 'A', 'dur')).toBe(3)
    expect(triadDegree('C#', 'A', 'dur')).toBe(3)
  })
})

describe('degreeGlyph', () => {
  it('renders ▲ / 3 / 5 and empty for null', () => {
    expect(degreeGlyph(1)).toBe('▲')
    expect(degreeGlyph(3)).toBe('3')
    expect(degreeGlyph(5)).toBe('5')
    expect(degreeGlyph(null)).toBe('')
    expect(degreeGlyph(undefined)).toBe('')
  })
})

describe('toRoman', () => {
  it('converts fret numbers used in diagrams', () => {
    expect(toRoman(1)).toBe('I')
    expect(toRoman(2)).toBe('II')
    expect(toRoman(3)).toBe('III')
    expect(toRoman(4)).toBe('IV')
    expect(toRoman(5)).toBe('V')
    expect(toRoman(9)).toBe('IX')
    expect(toRoman(12)).toBe('XII')
  })

  it('returns empty for non-positive or non-integer input', () => {
    expect(toRoman(0)).toBe('')
    expect(toRoman(-1)).toBe('')
    expect(toRoman(1.5)).toBe('')
  })
})
