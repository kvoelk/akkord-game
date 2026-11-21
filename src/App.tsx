import { useId, useMemo, useState } from 'react'
import { ChordDiagram } from './ChordDiagram'
import { Fretboard } from './Fretboard'
import {
  emptyGuess,
  lageLabel,
  multiLageRoots,
  openShapes,
  randomShape,
  shapesEqual,
  shapesFor,
  type ChordShape,
  type StringAction,
} from './shapes'
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

type Mode = 'lernen' | 'toene' | 'greifen'
type LearnView = 'griff' | 'toene'
type GreifenLevel = 'saiten' | 'lage'

function App() {
  const [mode, setMode] = useState<Mode>('lernen')

  return (
    <div className="app">
      <div className="atmosphere" aria-hidden="true" />
      <header className="brand">
        <p className="brand-mark">Dreiklang</p>
        <h1 className="brand-line">Akkorde hören und finden</h1>
        <p className="brand-sub">
          Lerne Dur- und Moll-Dreiklänge am Notenkreis, Griffbrett und in Gitarrengriffen — oder
          spiele Töne und Greifen gegen deine eigene Streak.
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
            className={mode === 'toene' ? 'active' : undefined}
            onClick={() => setMode('toene')}
          >
            Töne
          </button>
          <button
            type="button"
            className={mode === 'greifen' ? 'active' : undefined}
            onClick={() => setMode('greifen')}
          >
            Greifen
          </button>
        </nav>
      </header>

      <main>
        {mode === 'lernen' ? <LearnPanel /> : null}
        {mode === 'toene' ? <ToenePanel /> : null}
        {mode === 'greifen' ? <GreifenPanel /> : null}
      </main>
    </div>
  )
}

function LearnPanel() {
  const [root, setRoot] = useState<NoteName>('C')
  const [quality, setQuality] = useState<ChordQuality>('dur')
  const [view, setView] = useState<LearnView>('griff')
  const triad = triadNotes(root, quality)
  const intervals = TRIAD_INTERVALS[quality]
  const triadSet = new Set(triad)
  const shapes = shapesFor(root, quality)

  return (
    <section className="panel learn" aria-labelledby="learn-title">
      <h2 id="learn-title">Lernen</h2>
      <p className="panel-lead">
        Wähle einen Grundton und das Tongeschlecht — wechsle zwischen Griffdiagrammen und den
        Dreiklangtönen auf Griffbrett und Notenpad.
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

        <div className="toggle" role="group" aria-label="Ansicht">
          <button
            type="button"
            className={view === 'griff' ? 'active' : undefined}
            onClick={() => setView('griff')}
          >
            Griff
          </button>
          <button
            type="button"
            className={view === 'toene' ? 'active' : undefined}
            onClick={() => setView('toene')}
          >
            Töne
          </button>
        </div>
      </div>

      <p className="chord-name">
        {root}-{qualityLabel(quality)}
      </p>

      {view === 'griff' ? (
        shapes.length > 0 ? (
          <div className="shape-gallery" role="list" aria-label="Griffvarianten">
            {shapes.map((shape) => (
              <div key={shape.id} className="shape-card" role="listitem">
                <ChordDiagram value={shape.frets} title={lageLabel(shape)} />
              </div>
            ))}
          </div>
        ) : (
          <p className="panel-lead">Für diesen Akkord sind noch keine Griffbilder hinterlegt.</p>
        )
      ) : (
        <>
          <Fretboard
            key={`${root}-${quality}`}
            root={triad[0]}
            third={triad[1]}
            fifth={triad[2]}
            title="Griffbrett — 1 · 3 · 5"
          />

          <NotePad
            highlighted={triadSet}
            labels={Object.fromEntries(triad.map((n, i) => [n, String([1, 3, 5][i])]))}
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
        </>
      )}
    </section>
  )
}

function ToenePanel() {
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
      setMessage('Bitte Terz und Quinte eingeben (z. B. E, Gis, Cis, Db, B).')
      return
    }
    const ok =
      t === normalizeNoteInput(expected[1]) && f === normalizeNoteInput(expected[2])
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
      <h2 id="play-title">Töne</h2>
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

      {feedback === 'ok' ? (
        <Fretboard
          key={`${root}-${quality}-play`}
          root={expected[0]}
          third={expected[1]}
          fifth={expected[2]}
          title="Griffbrett — so liegt der Dreiklang"
        />
      ) : null}
    </section>
  )
}

type SaitenChallenge = {
  shape: ChordShape
}

type LageChallenge = {
  target: ChordShape
  options: ChordShape[]
}

function pickSaitenChallenge(): SaitenChallenge {
  const pool = openShapes()
  return { shape: randomShape(undefined, undefined, pool) }
}

function shuffle<T>(items: T[]): T[] {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j]!, arr[i]!]
  }
  return arr
}

function pickLageChallenge(): LageChallenge {
  const groups = multiLageRoots()
  const group = groups[Math.floor(Math.random() * groups.length)]!
  const target = group.shapes[Math.floor(Math.random() * group.shapes.length)]!
  const others = group.shapes.filter((s) => s.id !== target.id)
  const distractors = shuffle(others).slice(0, 2)
  // If fewer than 2 same-chord distractors, pad with unrelated shapes that look different
  while (distractors.length < 2) {
    const extra = randomShape()
    if (
      extra.id !== target.id &&
      !distractors.some((d) => d.id === extra.id) &&
      !shapesEqual(extra.frets, target.frets)
    ) {
      distractors.push(extra)
    }
  }
  const options = shuffle([target, ...distractors.slice(0, 2)])
  return { target, options }
}

function GreifenPanel() {
  const [level, setLevel] = useState<GreifenLevel>('saiten')
  const [saiten, setSaiten] = useState<SaitenChallenge>(() => pickSaitenChallenge())
  const [lage, setLage] = useState<LageChallenge>(() => pickLageChallenge())
  const [guess, setGuess] = useState<StringAction[]>(() => emptyGuess())
  const [picked, setPicked] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [feedback, setFeedback] = useState<'idle' | 'ok' | 'fail'>('idle')
  const [message, setMessage] = useState('')

  const challengeLabel = useMemo(() => {
    if (level === 'saiten') {
      return `${saiten.shape.root}-${qualityLabel(saiten.shape.quality)}`
    }
    return `${lage.target.root}-${qualityLabel(lage.target.quality)}`
  }, [level, saiten, lage])

  function resetFeedback() {
    setFeedback('idle')
    setMessage('')
  }

  function nextSaiten() {
    setSaiten(pickSaitenChallenge())
    setGuess(emptyGuess())
    resetFeedback()
  }

  function nextLage() {
    setLage(pickLageChallenge())
    setPicked(null)
    resetFeedback()
  }

  function switchLevel(next: GreifenLevel) {
    setLevel(next)
    setScore(0)
    setStreak(0)
    resetFeedback()
    if (next === 'saiten') {
      setSaiten(pickSaitenChallenge())
      setGuess(emptyGuess())
    } else {
      setLage(pickLageChallenge())
      setPicked(null)
    }
  }

  function checkSaiten() {
    if (shapesEqual(guess, saiten.shape.frets)) {
      setScore((s) => s + 1)
      setStreak((s) => s + 1)
      setFeedback('ok')
      setMessage(`Richtig — ${challengeLabel} (${lageLabel(saiten.shape)}).`)
    } else {
      setStreak(0)
      setFeedback('fail')
      setMessage('Noch nicht. X / O oben tippen oder Bünde in der Gitterfläche setzen.')
    }
  }

  function checkLage() {
    if (!picked) {
      setFeedback('fail')
      setMessage('Bitte eine Variante wählen.')
      return
    }
    if (picked === lage.target.id) {
      setScore((s) => s + 1)
      setStreak((s) => s + 1)
      setFeedback('ok')
      setMessage(`Richtig — ${challengeLabel}, ${lageLabel(lage.target)}.`)
    } else {
      setStreak(0)
      setFeedback('fail')
      setMessage(`Nicht diese Lage. Gesucht war: ${lageLabel(lage.target)}.`)
    }
  }

  return (
    <section className="panel play" aria-labelledby="greifen-title">
      <h2 id="greifen-title">Greifen</h2>
      <p className="panel-lead">
        {level === 'saiten'
          ? 'Baue den offenen Griff Saite für Saite nach — X dämpfen, O leer, Punkte für Finger.'
          : 'Welche Variante ist der gesuchte Griff? Die Labels verraten die Lage nicht.'}
      </p>

      <div className="controls">
        <div className="toggle" role="group" aria-label="Stufe">
          <button
            type="button"
            className={level === 'saiten' ? 'active' : undefined}
            onClick={() => switchLevel('saiten')}
          >
            Saiten
          </button>
          <button
            type="button"
            className={level === 'lage' ? 'active' : undefined}
            onClick={() => switchLevel('lage')}
          >
            Lage
          </button>
        </div>
      </div>

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
        <span className="challenge-root">
          {level === 'saiten' ? saiten.shape.root : lage.target.root}
        </span>
        <span className="challenge-quality">
          {qualityLabel(level === 'saiten' ? saiten.shape.quality : lage.target.quality)}
        </span>
      </p>

      {level === 'saiten' ? (
        <>
          <ChordDiagram value={guess} onChange={setGuess} title="Dein Griff" />
          <div className="actions">
            <button type="button" className="primary" onClick={checkSaiten}>
              Prüfen
            </button>
            <button type="button" className="ghost" onClick={nextSaiten}>
              Nächste Aufgabe
            </button>
            <button type="button" className="ghost" onClick={() => setGuess(emptyGuess())}>
              Leeren
            </button>
          </div>
          {feedback === 'ok' ? (
            <div className="shape-gallery reveal">
              <ChordDiagram value={saiten.shape.frets} title={lageLabel(saiten.shape)} />
            </div>
          ) : null}
        </>
      ) : (
        <>
          <div className="lage-options" role="list" aria-label="Griffvarianten">
            {lage.options.map((opt, idx) => (
              <div key={opt.id} className="lage-option" role="listitem">
                <ChordDiagram
                  value={opt.frets}
                  title={`Variante ${idx + 1}`}
                  onSelect={() => {
                    setPicked(opt.id)
                    resetFeedback()
                  }}
                  selected={picked === opt.id}
                />
              </div>
            ))}
          </div>
          <div className="actions">
            <button type="button" className="primary" onClick={checkLage}>
              Prüfen
            </button>
            <button type="button" className="ghost" onClick={nextLage}>
              Nächste Aufgabe
            </button>
          </div>
        </>
      )}

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
