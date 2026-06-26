"use client";

import { useMemo, useState } from "react";
import { code, GROUPS } from "@/lib/data";
import {
  groupScenarios,
  outcomeLabel,
  type GroupScenario,
  type Outcome,
  type ScenQualifier,
} from "@/lib/scenarios";
import type { Predictions } from "@/lib/types";

const OUTCOMES: Outcome[] = ["home", "draw", "away"];

function rankColor(q: ScenQualifier): string {
  if (q.rank <= 2) return "text-emerald-600 dark:text-emerald-400";
  if (q.qualifies) return "text-sky-600 dark:text-sky-400";
  return "text-amber-600 dark:text-amber-500";
}

function r32Text(q: ScenQualifier): string {
  if (!q.qualifies) return "does not qualify";
  if (!q.r32) return "—";
  const { opponent, opponentDesc, matchId } = q.r32;
  const opp = opponent ? `${opponent} · ${opponentDesc}` : opponentDesc;
  return `Match ${matchId} vs ${opp}`;
}

/** Compact 3-line summary of a scenario's top 3, used inside a matrix cell. */
function CellSummary({ s }: { s: GroupScenario }) {
  return (
    <div className="space-y-0.5">
      {s.qualifiers.map((q) => (
        <div key={q.team} className="flex items-center gap-1 text-xs">
          <span className="w-2.5 text-zinc-400 tabular-nums">{q.rank}</span>
          <span className={`font-semibold ${rankColor(q)}`}>{code(q.team)}</span>
          {q.rank === 3 && (
            <span className={q.qualifies ? "text-sky-500" : "text-amber-500"}>
              {q.qualifies ? "✓" : "✗"}
            </span>
          )}
        </div>
      ))}
      {s.goalSensitive && (
        <div className="pt-0.5 text-[10px] text-orange-500" title={s.sensitiveNote}>
          ⚽ tiebreak
        </div>
      )}
    </div>
  );
}

export function Scenarios({ predictions }: { predictions: Predictions }) {
  const [group, setGroup] = useState(GROUPS[0].group);
  const [selected, setSelected] = useState(0);

  const set = useMemo(() => groupScenarios(group, predictions), [group, predictions]);
  const sel = set.scenarios[Math.min(selected, set.scenarios.length - 1)];

  const pickGroup = (g: string) => {
    setGroup(g);
    setSelected(0);
  };

  const twoMatches = set.remaining.length === 2;
  const m1 = set.remaining[0];
  const m2 = set.remaining[1];

  return (
    <div className="space-y-5">
      {/* Group selector */}
      <div className="flex flex-wrap gap-1.5">
        {GROUPS.map((g) => (
          <button
            key={g.group}
            type="button"
            onClick={() => pickGroup(g.group)}
            className={`h-8 w-9 rounded-md text-sm font-semibold ${
              g.group === group
                ? "bg-emerald-500 text-white"
                : "border border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10"
            }`}
          >
            {g.group}
          </button>
        ))}
      </div>

      <p className="text-xs text-zinc-500">
        Every win/draw/loss combination of Group {group}&apos;s remaining matches.
        Standings use FIFA&apos;s 2026 tiebreakers (head-to-head first, then overall
        goals); a <span className="text-orange-500">⚽ tiebreak</span> tag marks
        scenarios where teams finish level on points. Click a cell for the full table
        and each qualifier&apos;s Round-of-32 opponent.
      </p>

      {set.complete ? (
        <div className="rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 p-4 text-sm">
          Group {group} has no matches left — it&apos;s already decided.
        </div>
      ) : twoMatches ? (
        <div className="grid gap-5 lg:grid-cols-[auto_1fr]">
          {/* Matrix */}
          <div>
            <div className="mb-2 space-y-0.5 text-xs text-zinc-500">
              <div>
                <span className="font-semibold text-zinc-400">rows →</span>{" "}
                {m1.home} v {m1.away}
              </div>
              <div>
                <span className="font-semibold text-zinc-400">cols →</span>{" "}
                {m2.home} v {m2.away}
              </div>
            </div>
            <table className="border-separate border-spacing-1">
              <thead>
                <tr>
                  <th />
                  {OUTCOMES.map((o) => (
                    <th
                      key={o}
                      className="px-1 pb-1 text-center text-[11px] font-semibold text-zinc-500"
                    >
                      {o === "draw" ? "Draw" : code(o === "home" ? m2.home : m2.away)}
                      {o !== "draw" && <span className="font-normal"> win</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {OUTCOMES.map((ro, r) => (
                  <tr key={ro}>
                    <th className="pr-1 text-right text-[11px] font-semibold text-zinc-500 whitespace-nowrap">
                      {ro === "draw" ? "Draw" : code(ro === "home" ? m1.home : m1.away)}
                      {ro !== "draw" && <span className="font-normal"> win</span>}
                    </th>
                    {OUTCOMES.map((co, c) => {
                      const idx = r * 3 + c;
                      const s = set.scenarios[idx];
                      const active = idx === selected;
                      return (
                        <td key={co}>
                          <button
                            type="button"
                            onClick={() => setSelected(idx)}
                            className={`h-[92px] w-[92px] overflow-hidden rounded-lg border p-1.5 text-left align-top transition-colors ${
                              active
                                ? "border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500"
                                : "border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 hover:border-emerald-400"
                            }`}
                          >
                            <CellSummary s={s} />
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Detail */}
          {sel && <ScenarioDetail s={sel} remaining={set.remaining} />}
        </div>
      ) : (
        // Fallback: linear list (e.g. a single remaining match)
        <div className="grid gap-5 lg:grid-cols-[auto_1fr]">
          <div className="flex flex-col gap-2">
            {set.scenarios.map((s, idx) => (
              <button
                key={s.key}
                type="button"
                onClick={() => setSelected(idx)}
                className={`w-56 rounded-lg border p-2 text-left ${
                  idx === selected
                    ? "border-emerald-500 bg-emerald-500/10"
                    : "border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950"
                }`}
              >
                <div className="mb-1 text-xs font-medium text-zinc-500">
                  {s.outcomes
                    .map((o, i) =>
                      outcomeLabel(o, set.remaining[i].home, set.remaining[i].away),
                    )
                    .join(" · ")}
                </div>
                <CellSummary s={s} />
              </button>
            ))}
          </div>
          {sel && <ScenarioDetail s={sel} remaining={set.remaining} />}
        </div>
      )}
    </div>
  );
}

function ScenarioDetail({
  s,
  remaining,
}: {
  s: GroupScenario;
  remaining: { id: string; home: string; away: string }[];
}) {
  return (
    <section className="rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 p-4">
      {/* Scenario description */}
      <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
        {s.outcomes.map((o, i) => (
          <span key={remaining[i].id} className="font-medium">
            <span className="text-zinc-400">{remaining[i].home} v {remaining[i].away}:</span>{" "}
            {outcomeLabel(o, remaining[i].home, remaining[i].away)}
          </span>
        ))}
        {s.outcomes.length === 0 && (
          <span className="font-medium text-zinc-500">Final standings</span>
        )}
      </div>

      {/* Final table */}
      <table className="w-full text-sm">
        <thead>
          <tr className="text-[11px] uppercase tracking-wide text-zinc-400">
            <th className="text-left font-medium py-1">#</th>
            <th className="text-left font-medium">Team</th>
            <th className="w-10 text-center font-medium">Pts</th>
            <th className="w-10 text-center font-medium">GD</th>
            <th className="w-10 text-center font-medium">GF</th>
          </tr>
        </thead>
        <tbody>
          {s.table.map((t, i) => {
            const q = s.qualifiers.find((x) => x.team === t.team);
            const cls =
              i <= 1
                ? "text-emerald-600 dark:text-emerald-400"
                : i === 2 && q?.qualifies
                  ? "text-sky-600 dark:text-sky-400"
                  : i === 2
                    ? "text-amber-600 dark:text-amber-500"
                    : "text-zinc-400";
            return (
              <tr key={t.team} className="border-t border-black/5 dark:border-white/5">
                <td className={`py-1 font-semibold ${cls}`}>{i + 1}</td>
                <td className="font-medium">{t.team}</td>
                <td className="text-center tabular-nums font-bold">{t.points}</td>
                <td className="text-center tabular-nums">
                  {t.gd > 0 ? `+${t.gd}` : t.gd}
                </td>
                <td className="text-center tabular-nums">{t.gf}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Qualifiers' knockout matchups */}
      <div className="mt-3 space-y-1 border-t border-black/10 dark:border-white/10 pt-3">
        <h4 className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
          Round of 32
        </h4>
        {s.qualifiers.map((q) => (
          <div key={q.team} className="flex items-baseline gap-2 text-sm">
            <span className={`w-8 font-semibold ${rankColor(q)}`}>
              {q.rank}
              {q.rank === 1 ? "st" : q.rank === 2 ? "nd" : "rd"}
            </span>
            <span className="font-medium">{q.team}</span>
            <span className="text-zinc-400">→</span>
            <span className={q.qualifies ? "text-zinc-600 dark:text-zinc-300" : "text-amber-500"}>
              {r32Text(q)}
            </span>
          </div>
        ))}
      </div>

      {/* Goal note */}
      {s.goalSensitive && (
        <p className="mt-3 rounded-md bg-orange-500/10 px-3 py-2 text-xs text-orange-700 dark:text-orange-400">
          ⚽ {s.sensitiveNote}. Your win/draw/loss picks set the head-to-head result;
          where teams are still level it assumes a 1-goal margin — set exact scores on
          the Groups tab to resolve it.
        </p>
      )}
    </section>
  );
}
