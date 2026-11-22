import { useState, type CSSProperties } from 'react'
import {
  degreeGlyph,
  noteAt,
  noteIndex,
  toRoman,
  type NoteName,
  type TriadDegree,
} from './theory'

/** String labels, high (thin) → low (thick): e B G D A E. */
const STRING_LABELS = ['e', 'B', 'G', 'D', 'A', 'E'] as const

/** Open-string pitch classes matching STRING_LABELS. */
const OPEN_PCS = [4, 11, 7, 2, 9, 4] as const

const WINDOW = 5
/** Highest allowed window start (show frets up to ~15). */
const MAX_START = 12

export type FretboardProps = {
  root: NoteName
  third: NoteName
  fifth: NoteName
  title?: string
  preferStart?: number
}

/**
 * Suggest a 5-fret window start near a root on the A or low-E string.
 * Prefers the A string, then E; places the root near the left of the window.
 */
export function suggestStart(root: NoteName, preferStart?: number): number {
  if (preferStart !== undefined) {
    return clampStart(preferStart)
  }

  const rootPc = noteIndex(root)
  // A string (index 4), then low E (index 5)
  for (const stringIdx of [4, 5] as const) {
    const open = OPEN_PCS[stringIdx]
    for (let fret = 0; fret <= MAX_START + WINDOW - 1; fret++) {
      if ((open + fret) % 12 === rootPc) {
        return clampStart(Math.max(0, fret - 1))
      }
    }
  }
  return 0
}

function clampStart(n: number): number {
  return Math.max(0, Math.min(MAX_START, Math.floor(n)))
}

type MarkerRole = 'root' | 'third' | 'fifth'

function roleAt(
  stringIdx: number,
  fret: number,
  rootPc: number,
  thirdPc: number,
  fifthPc: number,
): MarkerRole | null {
  const pc = (OPEN_PCS[stringIdx]! + fret) % 12
  if (pc === rootPc) return 'root'
  if (pc === thirdPc) return 'third'
  if (pc === fifthPc) return 'fifth'
  return null
}

export function Fretboard({ root, third, fifth, title, preferStart }: FretboardProps) {
  const [start, setStart] = useState(() => suggestStart(root, preferStart))
  const rootPc = noteIndex(root)
  const thirdPc = noteIndex(third)
  const fifthPc = noteIndex(fifth)
  const frets = Array.from({ length: WINDOW }, (_, i) => start + i)

  function shift(delta: number) {
    setStart((s) => clampStart(s + delta))
  }

  return (
    <div className="fretboard griifftabelle" aria-label={title ?? 'Griffbrett'}>
      {title ? <p className="fretboard-title">{title}</p> : null}

      <div className="fretboard-nav">
        <button
          type="button"
          className="fretboard-shift"
          onClick={() => shift(-1)}
          disabled={start <= 0}
          aria-label="Fenster nach links"
        >
          ←
        </button>
        <span className="fretboard-nav-label" aria-hidden="true">
          {start === 0 ? 'offen' : `ab ${toRoman(start)}`}
        </span>
        <button
          type="button"
          className="fretboard-shift"
          onClick={() => shift(1)}
          disabled={start >= MAX_START}
          aria-label="Fenster nach rechts"
        >
          →
        </button>
      </div>

      <div
        className="chord-diagram-body fretboard-body"
        role="img"
        aria-label={`Dreiklang ${root} ${third} ${fifth}`}
        style={{ '--frets': WINDOW } as CSSProperties}
      >
        {STRING_LABELS.map((label, stringIdx) => (
          <div key={label + stringIdx} className="chord-diagram-string fretboard-string" data-string={label}>
            <span className="chord-diagram-string-label">{label}</span>
            <div
              className={`chord-diagram-frets fretboard-frets ${start === 0 ? 'with-nut' : ''}`}
              style={{ '--frets': WINDOW } as CSSProperties}
            >
              {frets.map((fret, colIdx) => {
                const role = roleAt(stringIdx, fret, rootPc, thirdPc, fifthPc)
                const note = noteAt((OPEN_PCS[stringIdx]! + fret) % 12)
                const degree: TriadDegree | null =
                  role === 'root' ? 1 : role === 'third' ? 3 : role === 'fifth' ? 5 : null
                const glyph = degreeGlyph(degree)
                return (
                  <div
                    key={fret}
                    className={`chord-diagram-cell fretboard-cell${colIdx === 0 && start === 0 ? ' first' : ''}`}
                    data-fret={fret}
                  >
                    {role ? (
                      <span
                        className={`fretboard-degree ${role}`}
                        title={`${note} (${roleLabel(role)})`}
                      >
                        {glyph}
                      </span>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        <div className="chord-diagram-footer fretboard-footer" aria-label="Bundnummern">
          <span className="chord-diagram-label-spacer" aria-hidden="true" />
          <div
            className="chord-diagram-footer-track"
            style={{ '--frets': WINDOW } as CSSProperties}
          >
            {frets.map((fret) => (
              <span key={fret} className="chord-diagram-roman">
                {fret === 0 ? '·' : toRoman(fret)}
              </span>
            ))}
          </div>
        </div>
      </div>

      <ul className="fretboard-legend" aria-label="Legende">
        <li>
          <span className="fretboard-degree root legend-swatch" aria-hidden="true">
            ▲
          </span>
          Grundton (1)
        </li>
        <li>
          <span className="fretboard-degree third legend-swatch" aria-hidden="true">
            3
          </span>
          Terz (3)
        </li>
        <li>
          <span className="fretboard-degree fifth legend-swatch" aria-hidden="true">
            5
          </span>
          Quinte (5)
        </li>
      </ul>
    </div>
  )
}

function roleLabel(role: MarkerRole): string {
  if (role === 'root') return 'Grundton'
  if (role === 'third') return 'Terz'
  return 'Quinte'
}

export default Fretboard
