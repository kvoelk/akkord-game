import { useId, useState } from 'react'
import {
  NOTES,
  TRIAD_INTERVALS,
  type ChordQuality,
  type NoteName,
  normalizeNoteInput,
  qualityLabel,
  randomQuality,
  randomRoot,
  triadNotes,
} from './theory'
import './App.css'

type Mode = 'lernen' | 'spielen'

function App() {
  const [mode, setMode] = useState<Mode>('lernen')

  return (
    <div className="app">
      <div className="atmosphere" aria-hidden="true" />
      <header className="brand">
        <p className="brand-mark">Dreiklang</p>
        <h1 className="brand-line">Akkorde hören und finden</h1>
        <p className="brand-sub">
          Lerne Dur- und Moll-Dreiklänge am Notenkreis — oder spiele gegen deine eigene Streak.
        </p>
        <nav className="mode-switch" aria-label="Modus">
          <button
            type="button"
            className={mode === 'lernen' ? 'active' : undefined}
            onClick={() => setMode('lernen')}
          >
            Lernen
          </button>
          <button
            type="button"
            className={mode === 'spielen' ? 'active' : undefined}
            onClick={() => setMode('spielen')}
          >
            Spielen
          </button>
        </nav>
      </header>

      <main>{mode === 'lernen' ? <LearnPanel /> : <PlayPanel />}</main>
    </div>
  )
}

function LearnPanel() {
  const [root, setRoot] = useState<NoteName>('C')
  const [quality, setQuality] = useState<ChordQuality>('dur')
  const triad = triadNotes(root, quality)
  const intervals = TRIAD_INTERVALS[quality]
  const triadSet = new Set(triad)

  return (
    <section className="panel learn" aria-labelledby="learn-title">
      <h2 id="learn-title">Lernen</h2>
      <p className="panel-lead">
        Wähle einen Grundton und die Tongeschlecht — die Stufen 1 · 3 · 5 leuchten mit.
      </p>

      <div className="controls">
        <label className="field">
          <span>Grundton</span>
          <select
            value={root}
            onChange={(e) => setRoot(e.target.value as NoteName)}
            aria-label="Grundton wählen"
          >
            {NOTES.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>

        <div className="toggle" role="group" aria-label="Tongeschlecht">
          <button
            type="button"
            className={quality === 'dur' ? 'active' : undefined}
            onClick={() => setQuality('dur')}
          >
            Dur
          </button>
          <button
            type="button"
            className={quality === 'moll' ? 'active' : undefined}
            onClick={() => setQuality('moll')}
          >
            Moll
          </button>
        </div>
      </div>

      <p className="chord-name">
        {root}-{qualityLabel(quality)}
      </p>

      <NotePad
        highlighted={triadSet}
        labels={Object.fromEntries(
          triad.map((n, i) => [n, String([1, 3, 5][i])]),
        )}
      />

      <ul className="degree-list">
        {[
          { degree: 1, label: 'Grundton', note: triad[0], semis: intervals[0] },
          { degree: 3, label: 'Terz', note: triad[1], semis: intervals[1] },
          { degree: 5, label: 'Quinte', note: triad[2], semis: intervals[2] },
        ].map((row) => (
          <li key={row.degree}>
            <span className="deg">{row.degree}</span>
            <span className="lbl">{row.label}</span>
            <span className="nte">{row.note}</span>
            <span className="semi">{row.semis} Halbtöne</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

function PlayPanel() {
  const [root, setRoot] = useState<NoteName>(() => randomRoot())
  const [quality, setQuality] = useState<ChordQuality>(() => randomQuality())
  const [third, setThird] = useState('')
  const [fifth, setFifth] = useState('')
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [feedback, setFeedback] = useState<'idle' | 'ok' | 'fail'>('idle')
  const [message, setMessage] = useState('')
  const thirdId = useId()
  const fifthId = useId()

  const expected = triadNotes(root, quality)

  function nextChallenge() {
    setRoot(randomRoot())
    setQuality(randomQuality())
    setThird('')
    setFifth('')
    setFeedback('idle')
    setMessage('')
  }

  function check() {
    const t = normalizeNoteInput(third)
    const f = normalizeNoteInput(fifth)
    if (t === null || f === null) {
      setFeedback('fail')
      setMessage('Bitte Terz und Quinte eingeben (z. B. E, Gis, Cis, Db, H).')
      return
    }
    const ok =
      t === normalizeNoteInput(expected[1]) &&
      f === normalizeNoteInput(expected[2])
    if (ok) {
      setScore((s) => s + 1)
      setStreak((s) => s + 1)
      setFeedback('ok')
      setMessage(`Richtig — ${expected[0]}-${qualityLabel(quality)} ist ${expected.join(' · ')}.`)
    } else {
      setStreak(0)
      setFeedback('fail')
      setMessage(
        `Nicht ganz. Gesucht: Terz ${expected[1]}, Quinte ${expected[2]} (${intervalsHint(quality)}).`,
      )
    }
  }

  function fillFromPad(note: NoteName) {
    if (!third.trim()) {
      setThird(note)
      return
    }
    if (!fifth.trim()) {
      setFifth(note)
    }
  }

  return (
    <section className="panel play" aria-labelledby="play-title">
      <h2 id="play-title">Spielen</h2>
      <p className="panel-lead">
        Zu diesem Akkord die Terz und Quinte finden — tippen oder auf dem Notenpad tippen.
      </p>

      <div className="scoreboard" aria-live="polite">
        <div>
          <span className="score-label">Punkte</span>
          <strong>{score}</strong>
        </div>
        <div>
          <span className="score-label">Streak</span>
          <strong>{streak}</strong>
        </div>
      </div>

      <p className="challenge">
        <span className="challenge-root">{root}</span>
        <span className="challenge-quality">{qualityLabel(quality)}</span>
      </p>
      <p className="challenge-hint">
        Intervalle: 1 → {TRIAD_INTERVALS[quality][0]}, 3 → {TRIAD_INTERVALS[quality][1]}, 5 →{' '}
        {TRIAD_INTERVALS[quality][2]} Halbtöne
      </p>

      <div className="answer-fields">
        <label className="field" htmlFor={thirdId}>
          <span>Terz (3)</span>
          <input
            id={thirdId}
            value={third}
            onChange={(e) => setThird(e.target.value)}
            placeholder="z. B. E oder Cis"
            autoComplete="off"
            spellCheck={false}
          />
        </label>
        <label className="field" htmlFor={fifthId}>
          <span>Quinte (5)</span>
          <input
            id={fifthId}
            value={fifth}
            onChange={(e) => setFifth(e.target.value)}
            placeholder="z. B. G oder Des"
            autoComplete="off"
            spellCheck={false}
          />
        </label>
      </div>

      <NotePad onPick={fillFromPad} />

      <div className="actions">
        <button type="button" className="primary" onClick={check}>
          Prüfen
        </button>
        <button type="button" className="ghost" onClick={nextChallenge}>
          Nächste Aufgabe
        </button>
      </div>

      {message ? (
        <p className={`feedback ${feedback}`} role="status">
          {message}
        </p>
      ) : null}
    </section>
  )
}

function intervalsHint(quality: ChordQuality): string {
  const [a, b, c] = TRIAD_INTERVALS[quality]
  return `${a}/${b}/${c}`
}

type NotePadProps = {
  highlighted?: Set<string>
  labels?: Record<string, string>
  onPick?: (note: NoteName) => void
}

function NotePad({ highlighted, labels, onPick }: NotePadProps) {
  return (
    <div className="note-pad" role="list" aria-label="Notenpad">
      {NOTES.map((note) => {
        const on = highlighted?.has(note)
        const label = labels?.[note]
        return (
          <button
            key={note}
            type="button"
            role="listitem"
            className={on ? 'tone on' : 'tone'}
            onClick={() => onPick?.(note)}
            aria-pressed={onPadPressed(on, onPick)}
          >
            <span className="tone-name">{note}</span>
            {label ? <span className="tone-deg">{label}</span> : null}
          </button>
        )
      })}
    </div>
  )
}

function onPadPressed(on: boolean | undefined, onPick: NotePadProps['onPick']): boolean | undefined {
  if (onPick) return undefined
  return Boolean(on)
}

export default App
