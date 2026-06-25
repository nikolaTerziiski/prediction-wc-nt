"use client";

import { useState } from "react";
import { effectiveScore, isPlayed } from "@/lib/engine";
import type { Fixture, Predictions, Score } from "@/lib/types";
import { MatchStats } from "./MatchStats";

function fmtDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d.getTime())) return iso;
  // Fixed locale keeps server and client output identical (no hydration warning).
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function FixtureRow({
  fixture,
  predictions,
  onScore,
}: {
  fixture: Fixture;
  predictions: Predictions;
  onScore: (fixtureId: string, score: Score | null) => void;
}) {
  const [showStats, setShowStats] = useState(false);
  const eff = effectiveScore(fixture, predictions);
  const played = isPlayed(fixture);
  const overridden = !!predictions.scores[fixture.id];
  const isPrediction = eff != null && (!played || overridden);

  const update = (side: "home" | "away", raw: string) => {
    const parsed = raw === "" ? null : parseInt(raw, 10);
    const v =
      parsed == null || isNaN(parsed) ? null : Math.max(0, Math.min(99, parsed));
    const base: Score = eff ?? { home: 0, away: 0 };
    if (v == null) {
      // Clearing a future match removes the prediction entirely.
      if (!played) {
        onScore(fixture.id, null);
        return;
      }
      // Clearing one side of a played match keeps the other and zeroes this one.
      const next: Score =
        side === "home"
          ? { home: 0, away: base.away }
          : { home: base.home, away: 0 };
      onScore(fixture.id, next);
      return;
    }
    const next: Score =
      side === "home" ? { home: v, away: base.away } : { home: base.home, away: v };
    onScore(fixture.id, next);
  };

  const inputCls =
    "w-9 h-9 rounded-md border border-black/15 dark:border-white/20 bg-white dark:bg-zinc-900 text-center text-sm font-semibold tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500/60";

  return (
    <div>
    <div className="flex items-center gap-2 py-1.5 text-sm">
      <span className="w-12 shrink-0 text-xs text-zinc-500 tabular-nums">
        {fmtDate(fixture.date)}
      </span>

      <span className="flex-1 text-right truncate" title={fixture.home}>
        {fixture.home}
      </span>

      <input
        type="number"
        min={0}
        inputMode="numeric"
        aria-label={`${fixture.home} goals`}
        className={inputCls}
        value={eff ? eff.home : ""}
        placeholder="–"
        onChange={(e) => update("home", e.target.value)}
      />
      <span className="text-zinc-400">:</span>
      <input
        type="number"
        min={0}
        inputMode="numeric"
        aria-label={`${fixture.away} goals`}
        className={inputCls}
        value={eff ? eff.away : ""}
        placeholder="–"
        onChange={(e) => update("away", e.target.value)}
      />

      <span className="flex-1 truncate" title={fixture.away}>
        {fixture.away}
      </span>

      <span className="w-16 shrink-0 text-right">
        {isPrediction ? (
          <span className="text-[10px] font-medium uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
            pred
          </span>
        ) : played ? (
          <span className="text-[10px] font-medium uppercase tracking-wide text-zinc-400">
            result
          </span>
        ) : null}
      </span>

      <button
        type="button"
        aria-label="Reset to actual / clear prediction"
        title={overridden ? "Clear prediction" : "Clear"}
        disabled={!overridden}
        onClick={() => onScore(fixture.id, null)}
        className="w-6 shrink-0 text-zinc-400 enabled:hover:text-rose-500 disabled:opacity-25"
      >
        ↺
      </button>

      <button
        type="button"
        aria-label="Toggle match statistics"
        title={played ? "Match stats" : "Stats available once played"}
        aria-expanded={showStats}
        disabled={!played}
        onClick={() => setShowStats((v) => !v)}
        className={`w-6 shrink-0 disabled:opacity-20 ${
          showStats ? "text-emerald-500" : "text-zinc-400 enabled:hover:text-emerald-500"
        }`}
      >
        📊
      </button>
    </div>

      {showStats && played && (
        <MatchStats home={fixture.home} away={fixture.away} />
      )}
    </div>
  );
}
