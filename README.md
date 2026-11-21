# Dreiklang · akkord-game

Vite/React-Übung für **Dur- und Moll-Dreiklänge**. Die App heißt *akkord-game*; die Marke in der Oberfläche ist **Dreiklang**.

## Modi

### Lernen
- Grundton wählen und zwischen **Dur** und **Moll** umschalten
- Ansicht **Griff**: klassische Akkorddiagramme (offene Lagen, Barré, A-/E-Form)
- Ansicht **Töne**: Dreiklangtöne auf Griffbrett und Notenpad
- Stufen **1 / 3 / 5** mit Halbtonabständen:
  - Dur: `0 / 4 / 7`
  - Moll: `0 / 3 / 7`

### Töne
- Zu einem vorgegebenen Grundton + Tongeschlecht Terz und Quinte eintragen
- Eingabe per Tastatur oder Notenpad
- Punkte und Streak

### Greifen
- **Saiten**: offenen Griff Saite für Saite im Diagramm nachbauen (X / O / Bünde)
- **Lage**: unter 2–3 Varianten die passende Position wählen (ohne spoilernde Lage-Labels)
- Punkte und Streak

## Noteneingabe

`src/theory.ts` akzeptiert u. a.:

| Eingabe | Bedeutung |
|---------|-----------|
| `C#`, `Cis`, `Db`, `Des` | C♯ / D♭ |
| `B`, `H` | B (deutsch H) |
| `Bb`, `hes` | B♭ |

## Entwickeln

```bash
npm install
npm run dev
```

```bash
npm test          # theory unit tests (Vitest)
npm run build     # Typecheck + Production-Build
```

## Cloudflare Deploy

Deploy läuft über **Cloudflare Workers** (Static Assets / SPA) im Account **Cursor Cloud Account** (früher Sofa Game).

Ziel-URL: https://akkord-game.voelkslieder.com

```bash
npx wrangler login
npm run deploy
```

`npm run deploy` baut die App und führt `wrangler deploy` aus (siehe `wrangler.jsonc`).

## Stack

- Vite + React + TypeScript
- reine Client-SPA, keine Backend-Abhängigkeit
- Cloudflare Workers (Static Assets) für Hosting

## Lizenz

MIT — siehe [LICENSE](./LICENSE).
