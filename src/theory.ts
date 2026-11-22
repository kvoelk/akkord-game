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

/** Semitone offsets from the root for triad tones (root / third / fifth). */
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

/** Semitone offset of a triad tone relative to the root: 0, 3|4, or 7. */
export type TriadSemitone = 0 | 3 | 4 | 7

export type SemitoneRole = 'root' | 'third' | 'fifth'

/**
 * Return the semitone offset of a note relative to root + quality, or null
 * when the pitch class is not a chord tone.
 */
export function triadSemitone(
  note: NoteName | string,
  root: NoteName | string,
  quality: ChordQuality,
): TriadSemitone | null {
  const notePc =
    typeof note === 'string' && (NOTES as readonly string[]).includes(note)
      ? noteIndex(note as NoteName)
      : normalizeNoteInput(String(note))
  if (notePc === null || notePc < 0) return null

  const [r, t, f] = triadNotes(root, quality)
  const [iRoot, iThird, iFifth] = TRIAD_INTERVALS[quality]
  const rootPc = noteIndex(r)
  const thirdPc = noteIndex(t)
  const fifthPc = noteIndex(f)
  if (notePc === rootPc) return iRoot as TriadSemitone
  if (notePc === thirdPc) return iThird as TriadSemitone
  if (notePc === fifthPc) return iFifth as TriadSemitone
  return null
}

/** Glyph for a triad semitone in Grifftabelle diagrams (▲ / 3|4 / 7). */
export function semitoneGlyph(semi: TriadSemitone | null | undefined): string {
  if (semi === 0) return '▲'
  if (semi === 3 || semi === 4 || semi === 7) return String(semi)
  return ''
}

/** Role of a triad semitone offset (root / third / fifth). */
export function semitoneRole(semi: number | null | undefined): SemitoneRole | null {
  if (semi === 0) return 'root'
  if (semi === 3 || semi === 4) return 'third'
  if (semi === 7) return 'fifth'
  return null
}

/** Compact formula string, e.g. "0·4·7" (Dur) or "0·3·7" (Moll). */
export function intervalsFormula(quality: ChordQuality): string {
  const [a, b, c] = TRIAD_INTERVALS[quality]
  return `${a}·${b}·${c}`
}

const ROMAN_TABLE: ReadonlyArray<readonly [number, string]> = [
  [1000, 'M'],
  [900, 'CM'],
  [500, 'D'],
  [400, 'CD'],
  [100, 'C'],
  [90, 'XC'],
  [50, 'L'],
  [40, 'XL'],
  [10, 'X'],
  [9, 'IX'],
  [5, 'V'],
  [4, 'IV'],
  [1, 'I'],
]

/** Convert a positive integer to uppercase Roman numerals (e.g. 4 → "IV"). */
export function toRoman(n: number): string {
  if (!Number.isInteger(n) || n <= 0) return ''
  let rest = n
  let out = ''
  for (const [value, numeral] of ROMAN_TABLE) {
    while (rest >= value) {
      out += numeral
      rest -= value
    }
  }
  return out
}

export function randomRoot(): NoteName {
  return NOTES[Math.floor(Math.random() * NOTES.length)]!
}

export function randomQuality(): ChordQuality {
  return Math.random() < 0.5 ? 'dur' : 'moll'
}
