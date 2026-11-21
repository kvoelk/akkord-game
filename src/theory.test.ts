import { describe, expect, it } from 'vitest'
import {
  NOTES,
  TRIAD_INTERVALS,
  normalizeNoteInput,
  noteAt,
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
