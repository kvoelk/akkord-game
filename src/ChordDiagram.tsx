import type { CSSProperties } from 'react'
import {
  STRING_LABELS,
  diagramBaseFret,
  noteForStringAction,
  type FingerNumber,
  type StringAction,
} from './shapes'

const DIAGRAM_FRETS = 4

export type ChordDiagramProps = {
  value: readonly StringAction[]
  /** Optional finger numbers (1–4) parallel to value; shown inside fretted dots. */
  fingers?: readonly FingerNumber[]
  /** When set, the diagram is interactive. */
  onChange?: (next: StringAction[]) => void
  /** Quiz-card selection (click anywhere on the card). */
  onSelect?: () => void
  selected?: boolean
  title?: string
  /** Show absolute fret number above the first fret column when base > 1. */
  showBaseFret?: boolean
  className?: string
}

function cycleString(current: StringAction, base: number): StringAction {
  if (current === 'mute') return 'open'
  if (current === 'open' || current === 0) return base
  if (typeof current === 'number') {
    const next = current + 1
    if (next > base + DIAGRAM_FRETS - 1) return 'mute'
    return next
  }
  return 'mute'
}

export function ChordDiagram({
  value,
  fingers,
  onChange,
  onSelect,
  selected,
  title,
  showBaseFret = true,
  className,
}: ChordDiagramProps) {
  const frets = value.length === 6 ? value : (['mute', 'mute', 'mute', 'mute', 'mute', 'mute'] as StringAction[])
  const base = diagramBaseFret(frets)
  const interactive = Boolean(onChange)
  const fretRows = Array.from({ length: DIAGRAM_FRETS }, (_, i) => base + i)

  function setString(index: number, action: StringAction) {
    if (!onChange) return
    const next = frets.map((f, i) => (i === index ? action : f))
    onChange(next)
  }

  function handleNutClick(index: number) {
    if (!onChange) return
    setString(index, cycleString(frets[index]!, base))
  }

  function handleCellClick(stringIdx: number, fret: number) {
    if (!onChange) return
    const current = frets[stringIdx]!
    if (typeof current === 'number' && current === fret) {
      setString(stringIdx, 'mute')
    } else {
      setString(stringIdx, fret)
    }
  }

  const rootClass = [
    'chord-diagram',
    interactive ? 'interactive' : undefined,
    onSelect ? 'selectable' : undefined,
    selected ? 'selected' : undefined,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={rootClass}
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onClick={onSelect}
      onKeyDown={
        onSelect
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onSelect()
              }
            }
          : undefined
      }
      aria-label={title ?? 'Akkorddiagramm'}
      aria-pressed={onSelect ? Boolean(selected) : undefined}
    >
      {title ? <p className="chord-diagram-title">{title}</p> : null}

      <div className="chord-diagram-body">
        <div className="chord-diagram-header" aria-hidden={!(showBaseFret && base > 1)}>
          <span className="chord-diagram-label-spacer" />
          <span className="chord-diagram-nut-spacer" />
          <div
            className="chord-diagram-base-track"
            style={{ '--frets': DIAGRAM_FRETS } as CSSProperties}
          >
            {showBaseFret && base > 1 ? (
              <span className="chord-diagram-base" aria-label={`ab Bund ${base}`}>
                {base}
              </span>
            ) : (
              <span className="chord-diagram-base spacer" aria-hidden="true" />
            )}
          </div>
          <span className="chord-diagram-note-spacer" />
        </div>

        {STRING_LABELS.map((label, stringIdx) => {
          const action = frets[stringIdx]!
          const isMute = action === 'mute'
          const isOpen = action === 'open' || action === 0
          const marker = isMute ? 'X' : isOpen ? 'O' : '·'
          const note = noteForStringAction(stringIdx, action)
          return (
            <div key={label} className="chord-diagram-string" data-string={label}>
              <span className="chord-diagram-string-label" aria-hidden="true">
                {label}
              </span>
              <button
                type="button"
                className={`chord-diagram-nut ${isMute ? 'mute' : isOpen ? 'open' : 'fretted'}`}
                tabIndex={interactive ? 0 : -1}
                aria-disabled={!interactive}
                onClick={(e) => {
                  if (!interactive) return
                  e.stopPropagation()
                  handleNutClick(stringIdx)
                }}
                aria-label={`${label}-Saite: ${isMute ? 'gedämpft' : isOpen ? 'leer' : `Bund ${action}`}`}
              >
                {marker}
              </button>
              <div
                className={`chord-diagram-frets ${base === 1 ? 'with-nut' : ''}`}
                style={{ '--frets': DIAGRAM_FRETS } as CSSProperties}
              >
                {fretRows.map((fret, colIdx) => {
                  const hasDot = typeof action === 'number' && action === fret
                  const finger = fingers?.[stringIdx] ?? null
                  const showFinger = hasDot && finger != null
                  return (
                    <button
                      key={`${label}-${fret}`}
                      type="button"
                      className={`chord-diagram-cell ${colIdx === 0 && base === 1 ? 'first' : ''}`}
                      tabIndex={interactive ? 0 : -1}
                      aria-disabled={!interactive}
                      onClick={(e) => {
                        if (!interactive) return
                        e.stopPropagation()
                        handleCellClick(stringIdx, fret)
                      }}
                      aria-label={`${label}-Saite Bund ${fret}${hasDot ? ', gegriffen' : ''}${showFinger ? `, Finger ${finger}` : ''}`}
                    >
                      {hasDot ? (
                        <span className={`chord-diagram-dot${showFinger ? ' numbered' : ''}`}>
                          {showFinger ? finger : null}
                        </span>
                      ) : null}
                    </button>
                  )
                })}
              </div>
              <span
                className={`chord-diagram-note${note == null ? ' empty' : ''}`}
                aria-hidden="true"
              >
                {note ?? ''}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
