import { describe, expect, it } from 'vitest'
import {
  NOTES,
  TRIAD_INTERVALS,
  intervalsFormula,
  normalizeNoteInput,
  noteAt,
  semitoneGlyph,
  semitoneRole,
  toRoman,
  triadNotes,
  triadSemitone,
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

describe('triadSemitone', () => {
  it('maps C-Dur tones to 0 / 4 / 7', () => {
    expect(triadSemitone('C', 'C', 'dur')).toBe(0)
    expect(triadSemitone('E', 'C', 'dur')).toBe(4)
    expect(triadSemitone('G', 'C', 'dur')).toBe(7)
  })

  it('maps A-Moll tones to 0 / 3 / 7', () => {
    expect(triadSemitone('A', 'A', 'moll')).toBe(0)
    expect(triadSemitone('C', 'A', 'moll')).toBe(3)
    expect(triadSemitone('E', 'A', 'moll')).toBe(7)
  })

  it('returns null for non-chord tones and garbage', () => {
    expect(triadSemitone('D', 'C', 'dur')).toBeNull()
    expect(triadSemitone('xyz', 'C', 'dur')).toBeNull()
  })

  it('accepts aliased note spellings', () => {
    expect(triadSemitone('Cis', 'A', 'dur')).toBe(4)
    expect(triadSemitone('C#', 'A', 'dur')).toBe(4)
  })
})

describe('semitoneGlyph', () => {
  it('renders ▲ / 3|4 / 7 and empty for null', () => {
    expect(semitoneGlyph(0)).toBe('▲')
    expect(semitoneGlyph(3)).toBe('3')
    expect(semitoneGlyph(4)).toBe('4')
    expect(semitoneGlyph(7)).toBe('7')
    expect(semitoneGlyph(null)).toBe('')
    expect(semitoneGlyph(undefined)).toBe('')
  })
})

describe('semitoneRole', () => {
  it('maps offsets to root / third / fifth', () => {
    expect(semitoneRole(0)).toBe('root')
    expect(semitoneRole(3)).toBe('third')
    expect(semitoneRole(4)).toBe('third')
    expect(semitoneRole(7)).toBe('fifth')
    expect(semitoneRole(1)).toBeNull()
    expect(semitoneRole(null)).toBeNull()
  })
})

describe('intervalsFormula', () => {
  it('formats Dur and Moll as 0·4·7 / 0·3·7', () => {
    expect(intervalsFormula('dur')).toBe('0·4·7')
    expect(intervalsFormula('moll')).toBe('0·3·7')
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
