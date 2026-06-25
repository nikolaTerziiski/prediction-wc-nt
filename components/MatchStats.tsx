"use client";

import { useEffect, useState } from "react";
import type { MatchStats, MatchStatsResult } from "@/lib/types";

const REASON_MESSAGE: Record<string, string> = {
  "no-key":
    "Live stats need a (free) API-Football key. Add API_SPORTS_KEY to .env.local — see .env.example.",
  "not-found": "No API-Football coverage found for this fixture.",
  "no-stats": "Match statistics haven't been published for this match yet.",
  error: "Couldn't load match statistics. Try again later.",
};

type Row = {
  label: string;
  home: number | null;
  away: number | null;
  suffix?: string;
  /** higher value is "better" → highlight the leader (default true). */
  decimals?: number;
};

function fmt(v: number | null, suffix = "", decimals = 0): string {
  if (v == null) return "–";
  return `${v.toFixed(decimals)}${suffix}`;
}

function StatRow({ label, home, away, suffix = "", decimals = 0 }: Row) {
  const h = home ?? 0;
  const a = away ?? 0;
  const total = h + a;
  const homeShare = total > 0 ? (h / total) * 100 : 50;
  const homeLeads = (home ?? -Infinity) > (away ?? -Infinity);
  const awayLeads = (away ?? -Infinity) > (home ?? -Infinity);

  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between text-xs">
        <span
          className={`tabular-nums ${homeLeads ? "font-bold text-emerald-600 dark:text-emerald-400" : "font-medium"}`}
        >
          {fmt(home, suffix, decimals)}
        </span>
        <span className="text-[11px] uppercase tracking-wide text-zinc-400">
          {label}
        </span>
        <span
          className={`tabular-nums ${awayLeads ? "font-bold text-sky-600 dark:text-sky-400" : "font-medium"}`}
        >
          {fmt(away, suffix, decimals)}
        </span>
      </div>
      <div className="flex h-1.5 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
        <div className="bg-emerald-500/80" style={{ width: `${homeShare}%` }} />
        <div className="bg-sky-500/80" style={{ width: `${100 - homeShare}%` }} />
      </div>
    </div>
  );
}

function StatsBody({
  stats,
  source,
}: {
  stats: MatchStats;
  source: "live" | "seeded";
}) {
  const { home, away } = stats;
  const rows: Row[] = [
    { label: "Possession", home: home.possession, away: away.possession, suffix: "%" },
    { label: "Shots", home: home.shots, away: away.shots },
    { label: "On target", home: home.shotsOnTarget, away: away.shotsOnTarget },
    { label: "Expected goals (xG)", home: home.xg, away: away.xg, decimals: 2 },
    { label: "Corners", home: home.corners, away: away.corners },
    { label: "Fouls", home: home.fouls, away: away.fouls },
    { label: "Pass accuracy", home: home.passAccuracy, away: away.passAccuracy, suffix: "%" },
    { label: "Saves", home: home.saves, away: away.saves },
  ];
  const shown = rows.filter((r) => r.home != null || r.away != null);

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-center">
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
            source === "live"
              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
              : "bg-zinc-500/15 text-zinc-500"
          }`}
          title={
            source === "live"
              ? "Real match statistics from API-Football (final stats for finished matches)"
              : "Illustrative stats derived from the scoreline — API-Football's free tier doesn't cover the 2026 season"
          }
        >
          {source === "live" ? "● API-Football" : "illustrative"}
        </span>
      </div>
      <div className="flex items-center justify-between text-xs font-semibold">
        <span className="truncate text-emerald-600 dark:text-emerald-400">
          {home.team}
        </span>
        <span className="truncate text-right text-sky-600 dark:text-sky-400">
          {away.team}
        </span>
      </div>
      {shown.length === 0 ? (
        <p className="text-xs text-zinc-500">No detailed statistics available.</p>
      ) : (
        shown.map((r) => <StatRow key={r.label} {...r} />)
      )}
    </div>
  );
}

export function MatchStats({ home, away }: { home: string; away: string }) {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<MatchStatsResult | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setResult(null);
    fetch(
      `/api/match-stats?home=${encodeURIComponent(home)}&away=${encodeURIComponent(away)}`,
    )
      .then((r) => r.json() as Promise<MatchStatsResult>)
      .then((r) => {
        if (active) {
          setResult(r);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setResult({ available: false, reason: "error" });
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [home, away]);

  return (
    <div className="mt-1 mb-2 rounded-lg border border-black/10 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900/60 p-3">
      {loading ? (
        <p className="text-xs text-zinc-500">Loading match stats…</p>
      ) : result && result.available ? (
        <StatsBody stats={result.stats} source={result.source} />
      ) : (
        <p className="text-xs text-zinc-500">
          {REASON_MESSAGE[result && !result.available ? result.reason : "error"]}
        </p>
      )}
    </div>
  );
}
