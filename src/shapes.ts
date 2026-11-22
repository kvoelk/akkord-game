import type { ChordQuality, NoteName } from './theory'

/** Per-string action: mute (X), open (O), or fretted finger position. */
export type StringAction = 'mute' | 'open' | number

/** Finger number 1–4, or null for mute / open strings. */
export type FingerNumber = 1 | 2 | 3 | 4 | null

/** High e → low E (six entries). */
export type ShapeFrets = readonly [
  StringAction,
  StringAction,
  StringAction,
  StringAction,
  StringAction,
  StringAction,
]

/** High e → low E (six entries), parallel to frets. */
export type ShapeFingers = readonly [
  FingerNumber,
  FingerNumber,
  FingerNumber,
  FingerNumber,
  FingerNumber,
  FingerNumber,
]

export type ChordShape = {
  id: string
  root: NoteName
  quality: ChordQuality
  /** Short display label, e.g. "offen", "Barré 1", "A-Form 3". */
  label: string
  frets: ShapeFrets
  /** Finger numbers parallel to frets (null = mute/open). */
  fingers: ShapeFingers
}

/** String labels, high (thin) → low (thick): e B G D A E. */
export const STRING_LABELS = ['e', 'B', 'G', 'D', 'A', 'E'] as const

export const CHORD_SHAPES: readonly ChordShape[] = [
  // ——— Offene Dur ———
  {
    id: 'C-open',
    root: 'C',
    quality: 'dur',
    label: 'offen',
    frets: [0, 1, 0, 2, 3, 'mute'],
    fingers: [null, 1, null, 2, 3, null],
  },
  {
    id: 'D-open',
    root: 'D',
    quality: 'dur',
    label: 'offen',
    frets: [2, 3, 2, 0, 'mute', 'mute'],
    fingers: [2, 3, 1, null, null, null],
  },
  {
    id: 'E-open',
    root: 'E',
    quality: 'dur',
    label: 'offen',
    frets: [0, 0, 1, 2, 2, 0],
    fingers: [null, null, 1, 3, 2, null],
  },
  {
    id: 'F-barre1',
    root: 'F',
    quality: 'dur',
    label: 'Barré 1',
    frets: [1, 1, 2, 3, 3, 1],
    // E-form barre: 1 on barre strings, 2 on G, 3 on A, 4 on D
    fingers: [1, 1, 2, 4, 3, 1],
  },
  {
    id: 'G-open',
    root: 'G',
    quality: 'dur',
    label: 'offen',
    frets: [3, 0, 0, 0, 2, 3],
    fingers: [4, null, null, null, 2, 3],
  },
  {
    id: 'A-open',
    root: 'A',
    quality: 'dur',
    label: 'offen',
    frets: [0, 2, 2, 2, 0, 'mute'],
    fingers: [null, 3, 2, 1, null, null],
  },
  {
    id: 'B-barre2',
    root: 'B',
    quality: 'dur',
    label: 'Barré 2',
    frets: [2, 4, 4, 4, 2, 'mute'],
    // A-form barre: 1 on barre strings, 2/3/4 on D/G/B
    fingers: [1, 4, 3, 2, 1, null],
  },

  // ——— Offene Moll ———
  {
    id: 'Am-open',
    root: 'A',
    quality: 'moll',
    label: 'offen',
    frets: [0, 1, 2, 2, 0, 'mute'],
    fingers: [null, 1, 3, 2, null, null],
  },
  {
    id: 'Dm-open',
    root: 'D',
    quality: 'moll',
    label: 'offen',
    frets: [1, 3, 2, 0, 'mute', 'mute'],
    fingers: [1, 3, 2, null, null, null],
  },
  {
    id: 'Em-open',
    root: 'E',
    quality: 'moll',
    label: 'offen',
    frets: [0, 0, 0, 2, 2, 0],
    fingers: [null, null, null, 3, 2, null],
  },

  // ——— Mittlere Lagen ———
  {
    id: 'C-A-form3',
    root: 'C',
    quality: 'dur',
    label: 'A-Form 3',
    frets: [3, 5, 5, 5, 3, 'mute'],
    fingers: [1, 4, 3, 2, 1, null],
  },
  {
    id: 'D-A-form5',
    root: 'D',
    quality: 'dur',
    label: 'A-Form 5',
    frets: [5, 7, 7, 7, 5, 'mute'],
    fingers: [1, 4, 3, 2, 1, null],
  },
  {
    id: 'G-E-form3',
    root: 'G',
    quality: 'dur',
    label: 'E-Form 3',
    frets: [3, 3, 4, 5, 5, 3],
    fingers: [1, 1, 2, 4, 3, 1],
  },
  {
    id: 'A-E-form5',
    root: 'A',
    quality: 'dur',
    label: 'E-Form 5',
    frets: [5, 5, 6, 7, 7, 5],
    fingers: [1, 1, 2, 4, 3, 1],
  },
  {
    id: 'Cm-A-form3',
    root: 'C',
    quality: 'moll',
    label: 'A-Form 3',
    frets: [3, 4, 5, 5, 3, 'mute'],
    fingers: [1, 2, 4, 3, 1, null],
  },
  {
    id: 'Am-E-form5',
    root: 'A',
    quality: 'moll',
    label: 'E-Form 5',
    frets: [5, 5, 5, 7, 7, 5],
    fingers: [1, 1, 1, 3, 4, 1],
  },

  // ——— Hohe Lagen ———
  {
    id: 'C-A-form15',
    root: 'C',
    quality: 'dur',
    label: 'A-Form 15',
    frets: [15, 17, 17, 17, 15, 'mute'],
    fingers: [1, 4, 3, 2, 1, null],
  },
  {
    id: 'E-A-form7',
    root: 'E',
    quality: 'dur',
    label: 'A-Form 7',
    frets: [7, 9, 9, 9, 7, 'mute'],
    fingers: [1, 4, 3, 2, 1, null],
  },
]

export function shapesFor(root: NoteName, quality: ChordQuality): ChordShape[] {
  return CHORD_SHAPES.filter((s) => s.root === root && s.quality === quality)
}

export function randomShape(
  root?: NoteName,
  quality?: ChordQuality,
  pool: readonly ChordShape[] = CHORD_SHAPES,
): ChordShape {
  let candidates = [...pool]
  if (root !== undefined) candidates = candidates.filter((s) => s.root === root)
  if (quality !== undefined) candidates = candidates.filter((s) => s.quality === quality)
  if (candidates.length === 0) {
    candidates = [...pool]
  }
  return candidates[Math.floor(Math.random() * candidates.length)]!
}

/** Empty interactive guess: all strings muted. */
export function emptyGuess(): StringAction[] {
  return ['mute', 'mute', 'mute', 'mute', 'mute', 'mute']
}

function normalizeAction(a: StringAction): StringAction {
  if (a === 0 || a === 'open') return 'open'
  return a
}

/** Compare two shapes; fret `0` and `'open'` are equal. */
export function shapesEqual(
  a: readonly StringAction[],
  b: readonly StringAction[],
): boolean {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (normalizeAction(a[i]!) !== normalizeAction(b[i]!)) return false
  }
  return true
}

/**
 * Base fret for a classic diagram window.
 * Open / low shapes start at 1; higher shapes start at the lowest fretted note.
 */
export function diagramBaseFret(frets: readonly StringAction[]): number {
  const numbers = frets.filter((f): f is number => typeof f === 'number' && f > 0)
  if (numbers.length === 0) return 1
  const min = Math.min(...numbers)
  const max = Math.max(...numbers)
  if (max <= 4) return 1
  return min
}

/** Human-readable Lage / Form label for learning UI. */
export function lageLabel(shape: ChordShape): string {
  return shape.label
}

/** Open-position shapes useful for the „Saiten“ quiz level. */
export function openShapes(pool: readonly ChordShape[] = CHORD_SHAPES): ChordShape[] {
  return pool.filter((s) => s.label === 'offen' || s.label.startsWith('Barré'))
}

/** Shapes that have at least one alternate Lage for the same chord. */
export function multiLageRoots(pool: readonly ChordShape[] = CHORD_SHAPES): {
  root: NoteName
  quality: ChordQuality
  shapes: ChordShape[]
}[] {
  const map = new Map<string, ChordShape[]>()
  for (const s of pool) {
    const key = `${s.root}|${s.quality}`
    const list = map.get(key) ?? []
    list.push(s)
    map.set(key, list)
  }
  const out: { root: NoteName; quality: ChordQuality; shapes: ChordShape[] }[] = []
  for (const [, shapes] of map) {
    if (shapes.length >= 2) {
      out.push({ root: shapes[0]!.root, quality: shapes[0]!.quality, shapes })
    }
  }
  return out
}
