"use client";

import { FixtureRow } from "./FixtureRow";
import { r32OpponentOf } from "@/lib/engine";
import type { BracketResult } from "@/lib/engine";
import type { TeamProspect } from "@/lib/scenarios";
import type { Fixture, Group, Predictions, Score, TeamStanding } from "@/lib/types";

function rankStyle(rank: number, thirdQualifies: boolean): string {
  if (rank <= 2) return "border-l-emerald-500";
  if (rank === 3) return thirdQualifies ? "border-l-sky-500" : "border-l-amber-400";
  return "border-l-transparent";
}

function fmtDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const CHIP = {
  green: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  sky: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
  amber: "bg-amber-500/15 text-amber-600 dark:text-amber-500",
  zinc: "bg-zinc-500/15 text-zinc-500",
};

/** Forward-looking qualification chip for a standings row. Null = nothing to show. */
function statusChip(
  p: TeamProspect | undefined,
  complete: boolean,
  thirdQ: boolean,
): { label: string; cls: string } | null {
  if (!p) return null;
  switch (p.status) {
    case "winner":
      return { label: complete ? "1st" : "1st seed", cls: CHIP.green };
    case "qualified":
      return { label: "through", cls: CHIP.green };
    case "third-race":
      if (complete)
        return thirdQ
          ? { label: "3rd ✓", cls: CHIP.sky }
          : { label: "out", cls: CHIP.zinc };
      return { label: "3rd race", cls: CHIP.amber };
    case "eliminated":
      return { label: "out", cls: CHIP.zinc };
    case "contention":
      return null;
  }
}

/** "When is their next game" — remaining group match, else the Round-of-32 tie. */
function nextGameText(
  p: TeamProspect | undefined,
  team: string,
  bracket: BracketResult,
): string | null {
  if (p?.nextOpponent && p.nextDate) {
    return `Next: ${fmtDate(p.nextDate)} vs ${p.nextOpponent}`;
  }
  const r32 = r32OpponentOf(team, bracket);
  if (r32) {
    return `Next: Round of 32 vs ${r32.opponent ?? r32.opponentDesc}`;
  }
  return null;
}

export function GroupTable({
  group,
  standings,
  fixtures,
  predictions,
  qualifyingThirds,
  prospects,
  bracket,
  locked,
  onScore,
}: {
  group: Group;
  standings: TeamStanding[];
  fixtures: Fixture[];
  predictions: Predictions;
  qualifyingThirds: Set<string>;
  prospects: Map<string, TeamProspect>;
  bracket: BracketResult;
  locked: boolean;
  onScore: (fixtureId: string, score: Score | null) => void;
}) {
  const groupFixtures = fixtures
    .filter((f) => f.group === group.group)
    .sort((a, b) => a.date.localeCompare(b.date) || a.matchNumber - b.matchNumber);

  const complete = groupFixtures.every((f) => f.homeScore != null && f.awayScore != null);

  // Dead-rubber rotation note: an already-through team in its final group game.
  const rotationNote = (f: Fixture): string | null => {
    const sides: string[] = [];
    const hp = prospects.get(f.home);
    const ap = prospects.get(f.away);
    if (hp?.rotationLikely && hp.nextFixtureId === f.id) sides.push(f.home);
    if (ap?.rotationLikely && ap.nextFixtureId === f.id) sides.push(f.away);
    if (sides.length === 0) return null;
    return `⚡ ${sides.join(" & ")} already through — may rest / rotate players`;
  };

  return (
    <section className="rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 overflow-hidden">
      <header className="flex items-center justify-between px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border-b border-black/10 dark:border-white/10">
        <h3 className="font-bold tracking-tight">Group {group.group}</h3>
        {complete && (
          <span className="rounded-full bg-zinc-500/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-500">
            complete
          </span>
        )}
      </header>

      {/* Standings */}
      <table className="w-full text-sm">
        <thead>
          <tr className="text-[11px] uppercase tracking-wide text-zinc-400">
            <th className="text-left font-medium px-4 py-1.5">Team</th>
            <th className="w-8 text-center font-medium" title="Played">P</th>
            <th className="w-8 text-center font-medium" title="Won">W</th>
            <th className="w-8 text-center font-medium" title="Drawn">D</th>
            <th className="w-8 text-center font-medium" title="Lost">L</th>
            <th className="w-10 text-center font-medium" title="Goal difference">GD</th>
            <th className="w-10 text-center font-medium pr-4" title="Points">Pts</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((s) => {
            const thirdQ = s.rank === 3 && qualifyingThirds.has(s.team);
            const p = prospects.get(s.team);
            const chip = statusChip(p, complete, thirdQ);
            const next = nextGameText(p, s.team, bracket);
            return (
              <tr
                key={s.team}
                className={`border-l-[3px] ${rankStyle(s.rank, thirdQ)} border-t border-black/5 dark:border-white/5`}
              >
                <td className="px-4 py-1.5">
                  <span className="text-zinc-400 tabular-nums mr-2">{s.rank}</span>
                  <span
                    className="font-medium"
                    title={`FIFA World Ranking #${s.worldRanking}${
                      s.yellow || s.red
                        ? ` · fair-play ${s.fairPlay} (${s.yellow}Y${
                            s.red ? ` ${s.red}R` : ""
                          })`
                        : ""
                    }`}
                  >
                    {s.team}
                  </span>
                  {chip && (
                    <span
                      className={`ml-2 rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${chip.cls}`}
                      title={next ?? undefined}
                    >
                      {chip.label}
                    </span>
                  )}
                </td>
                <td className="text-center tabular-nums">{s.played}</td>
                <td className="text-center tabular-nums">{s.won}</td>
                <td className="text-center tabular-nums">{s.drawn}</td>
                <td className="text-center tabular-nums">{s.lost}</td>
                <td className="text-center tabular-nums">
                  {s.gd > 0 ? `+${s.gd}` : s.gd}
                </td>
                <td className="text-center font-bold tabular-nums pr-4">{s.points}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Fixtures */}
      <div className="px-4 py-2 border-t border-black/10 dark:border-white/10">
        {groupFixtures.map((f) => (
          <FixtureRow
            key={f.id}
            fixture={f}
            predictions={predictions}
            onScore={onScore}
            locked={locked}
            note={rotationNote(f)}
          />
        ))}
      </div>
    </section>
  );
}
