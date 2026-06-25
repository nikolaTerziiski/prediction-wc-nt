"use client";

import { FixtureRow } from "./FixtureRow";
import type { Fixture, Group, Predictions, Score, TeamStanding } from "@/lib/types";

function rankStyle(rank: number, thirdQualifies: boolean): string {
  if (rank <= 2) return "border-l-emerald-500";
  if (rank === 3) return thirdQualifies ? "border-l-sky-500" : "border-l-amber-400";
  return "border-l-transparent";
}

export function GroupTable({
  group,
  standings,
  fixtures,
  predictions,
  qualifyingThirds,
  onScore,
}: {
  group: Group;
  standings: TeamStanding[];
  fixtures: Fixture[];
  predictions: Predictions;
  qualifyingThirds: Set<string>;
  onScore: (fixtureId: string, score: Score | null) => void;
}) {
  const groupFixtures = fixtures
    .filter((f) => f.group === group.group)
    .sort((a, b) => a.date.localeCompare(b.date) || a.matchNumber - b.matchNumber);

  return (
    <section className="rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 overflow-hidden">
      <header className="flex items-center justify-between px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border-b border-black/10 dark:border-white/10">
        <h3 className="font-bold tracking-tight">Group {group.group}</h3>
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
                  {s.rank === 3 && (
                    <span
                      className={`ml-2 text-[10px] uppercase tracking-wide ${thirdQ ? "text-sky-500" : "text-amber-500"}`}
                    >
                      {thirdQ ? "3rd ✓" : "3rd"}
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
          />
        ))}
      </div>
    </section>
  );
}
