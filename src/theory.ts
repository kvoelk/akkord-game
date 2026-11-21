/** Chromatic note names (international B; German H accepted as alias). */
export const NOTES = [
  'C',
  'Cis',
  'D',
  'Dis',
  'E',
  'F',
  'Fis',
  'G',
  'Gis',
  'A',
  'Ais',
  'B',
] as const

export type NoteName = (typeof NOTES)[number]
export type ChordQuality = 'dur' | 'moll'

/** Semitone offsets for triad degrees 1 / 3 / 5. */
export const TRIAD_INTERVALS: Record<ChordQuality, readonly [number, number, number]> = {
  dur: [0, 4, 7],
  moll: [0, 3, 7],
}

const ALIASES: Record<string, number> = {
  c: 0,
  'c#': 0 + 1,
  cis: 1,
  db: 1,
  des: 1,
  d: 2,
  'd#': 3,
  dis: 3,
  eb: 3,
  es: 3,
  e: 4,
  fb: 4,
  fes: 4,
  'e#': 5,
  eis: 5,
  f: 5,
  'f#': 6,
  fis: 6,
  gb: 6,
  ges: 6,
  g: 7,
  'g#': 8,
  gis: 8,
  ab: 8,
  as: 8,
  a: 9,
  'a#': 10,
  ais: 10,
  // International B = B♮; German H kept as alias. Bb/hes = B♭.
  b: 11,
  bb: 10,
  hes: 10,
  h: 11,
  'h#': 0,
  his: 0,
  cb: 11,
  ces: 11,
}

function stripAccidentalsNoise(raw: string): string {
  return raw
    .trim()
    .normalize('NFKC')
    .replace(/\s+/g, '')
    .replace(/♯/g, '#')
    .replace(/♭/g, 'b')
    .toLowerCase()
}

/**
 * Parse free-form note input (English or German) into a pitch-class index 0–11.
 * Accepts e.g. C#, Cis, Db/Des, B/H (B♮), Bb/hes (B♭).
 */
export function normalizeNoteInput(input: string): number | null {
  const key = stripAccidentalsNoise(input)
  if (!key) return null
  if (Object.prototype.hasOwnProperty.call(ALIASES, key)) {
    return ALIASES[key]!
  }
  return null
}

export function noteIndex(note: NoteName): number {
  return NOTES.indexOf(note)
}

export function noteAt(semitone: number): NoteName {
  const i = ((semitone % 12) + 12) % 12
  return NOTES[i]!
}

/** Return the three triad tones (root, third, fifth) for a root + quality. */
export function triadNotes(root: NoteName | string, quality: ChordQuality): [NoteName, NoteName, NoteName] {
  const rootPc =
    typeof root === 'string' && (NOTES as readonly string[]).includes(root)
      ? noteIndex(root as NoteName)
      : normalizeNoteInput(String(root))
  if (rootPc === null || rootPc < 0) {
    throw new Error(`Unbekannter Grundton: ${root}`)
  }
  const [i1, i3, i5] = TRIAD_INTERVALS[quality]
  return [noteAt(rootPc + i1), noteAt(rootPc + i3), noteAt(rootPc + i5)]
}

export function qualityLabel(quality: ChordQuality): string {
  return quality === 'dur' ? 'Dur' : 'Moll'
}

export function randomRoot(): NoteName {
  return NOTES[Math.floor(Math.random() * NOTES.length)]!
}

export function randomQuality(): ChordQuality {
  return Math.random() < 0.5 ? 'dur' : 'moll'
}
