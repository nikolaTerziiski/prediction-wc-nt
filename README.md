# World Cup 2026 — Standings & Bracket Predictor

A small local web app for the 2026 FIFA World Cup (USA · Canada · Mexico, 48 teams,
12 groups A–L). It shows the **current group standings** from the real results so
far and lets you **predict the rest**: type any scoreline (+3 for a win, +1 for a
draw) and every table — plus the full **knockout bracket** — recalculates live so
you can see who finishes where and **who each team would play next**.

## Run it

```bash
npm install      # first time only
npm run dev
```

Then open **http://localhost:3000**.

To build/run a production version:

```bash
npm run build
npm start
```

## What it does

**Groups tab**
- 12 live group tables (Played / Won / Drawn / Lost / Goal difference / Points).
- Every fixture has a score box. Matchdays 1–2 are pre-filled with the **real
  results**; later matches are empty for you to predict.
- Type a score and the table instantly re-ranks using FIFA tiebreakers
  (points → goal difference → goals for → head-to-head).
- Colour key: green = top 2 (advance), blue = a 3rd place currently inside the
  best-8, amber = a 3rd place currently outside it.
- A predicted/overridden result is tagged **PRED**; the ↺ button clears it.

**Knockout tab**
- The 8 best third-placed teams are ranked, with the qualifying 8 highlighted.
- A projected bracket from the **Round of 32 → Final** (plus third-place play-off).
- Group winners and runners-up fill in automatically from the standings.
- Click a team in any match to advance it — the next round (and the team it would
  face) fills in. Click again to undo. Pick all the way through to a champion 🏆.

**Persistence** — all your predictions are saved in the browser (localStorage),
so they survive a refresh. Use **Reset scores** or **Reset all** to start over.

## Data

Groups, fixtures and matchday 1–2 results were cross-verified across Wikipedia,
ESPN, Yahoo Sports and Sky Sports, and live in [`lib/data.ts`](lib/data.ts).
The data is a snapshot as of **24 June 2026** — to refresh it after more matches
are played, just edit the scores / `status` in that file (no other changes needed).

> **Note on the bracket:** which group's third-placed team fills which Round-of-32
> slot is governed by FIFA's official 495-row allocation table. This app uses a
> deterministic matching that always puts each third into an *eligible* slot —
> correct in structure and a close approximation of the official assignment.

## Project layout

| Path | Purpose |
| --- | --- |
| [`lib/data.ts`](lib/data.ts) | Groups, all 72 fixtures, and the bracket template |
| [`lib/engine.ts`](lib/engine.ts) | Standings, tiebreakers, best-thirds, bracket resolution (pure functions) |
| [`lib/types.ts`](lib/types.ts) | Shared TypeScript types |
| [`lib/usePredictions.ts`](lib/usePredictions.ts) | localStorage-backed prediction state |
| [`components/GroupTable.tsx`](components/GroupTable.tsx) | One group's table + fixtures |
| [`components/FixtureRow.tsx`](components/FixtureRow.tsx) | Editable scoreline row |
| [`components/Bracket.tsx`](components/Bracket.tsx) | Click-to-advance knockout bracket |
| [`app/page.tsx`](app/page.tsx) | Main page wiring it together |

Built with Next.js 16, React 19 and Tailwind CSS 4.
