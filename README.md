# Dreiklang · akkord-game

Vite/React-Übung für **Dur- und Moll-Dreiklänge**. Die App heißt *akkord-game*; die Marke in der Oberfläche ist **Dreiklang**.

## Modi

### Lernen
- Grundton wählen und zwischen **Dur** und **Moll** umschalten
- Die Dreiklangtöne werden auf dem Notenpad hervorgehoben
- Stufen **1 / 3 / 5** mit Halbtonabständen:
  - Dur: `0 / 4 / 7`
  - Moll: `0 / 3 / 7`

### Spielen
- Zu einem vorgegebenen Grundton + Tongeschlecht Terz und Quinte eintragen
- Eingabe per Tastatur oder Notenpad
- Punkte und Streak

## Noteneingabe

`src/theory.ts` akzeptiert u. a.:

| Eingabe | Bedeutung |
|---------|-----------|
| `C#`, `Cis`, `Db`, `Des` | C♯ / D♭ |
| `H` | H (engl. B) |
| `B`, `Bb` | B (engl. B♭) |

## Entwickeln

```bash
npm install
npm run dev
```

```bash
npm test          # theory unit tests (Vitest)
npm run build     # Typecheck + Production-Build
```

## Stack

- Vite + React + TypeScript
- reine Client-SPA, keine Backend-Abhängigkeit

## Lizenz

MIT — siehe [LICENSE](./LICENSE).
