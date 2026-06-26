"use client";

import { useMemo, useState } from "react";
import { AS_OF, BRACKET, DATA_NOTE, FIXTURES, GROUPS } from "@/lib/data";
import { allStandings, rankedThirds, resolveBracket } from "@/lib/engine";
import { groupProspects, type TeamProspect } from "@/lib/scenarios";
import { usePredictions } from "@/lib/usePredictions";
import { GroupTable } from "@/components/GroupTable";
import { Bracket } from "@/components/Bracket";
import { Scenarios } from "@/components/Scenarios";

type Tab = "groups" | "bracket" | "scenarios";

export default function Home() {
  const { predictions, setScore, setKoPick, resetAll, resetScores } =
    usePredictions();
  const [tab, setTab] = useState<Tab>("groups");
  const [editUnlocked, setEditUnlocked] = useState(false);

  const standings = useMemo(
    () => allStandings(GROUPS, FIXTURES, predictions),
    [predictions],
  );
  const thirds = useMemo(() => rankedThirds(standings), [standings]);
  const qualifyingThirds = useMemo(
    () => new Set(thirds.slice(0, 8).map((t) => t.team)),
    [thirds],
  );
  // Groups whose REAL results are all in — used to mark the bracket's confirmed
  // (green) teams vs projected ones. Independent of predictions.
  const completeGroups = useMemo(() => {
    const s = new Set<string>();
    for (const g of GROUPS) {
      const fx = FIXTURES.filter((f) => f.group === g.group);
      if (fx.length > 0 && fx.every((f) => f.homeScore != null && f.awayScore != null)) {
        s.add(g.group);
      }
    }
    return s;
  }, []);
  const bracket = useMemo(
    () => resolveBracket(BRACKET, standings, predictions, completeGroups),
    [standings, predictions, completeGroups],
  );
  const prospects = useMemo(() => {
    const m = new Map<string, Map<string, TeamProspect>>();
    for (const g of GROUPS) m.set(g.group, groupProspects(g.group, predictions));
    return m;
  }, [predictions]);

  const predictionCount =
    Object.keys(predictions.scores).length + Object.keys(predictions.ko).length;

  return (
    <div className="min-h-full bg-zinc-50 dark:bg-black">
      <header className="sticky top-0 z-10 border-b border-black/10 dark:border-white/10 bg-white/80 dark:bg-black/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
          <div className="mr-auto">
            <h1 className="text-lg font-bold tracking-tight">
              World Cup 2026 — Standings &amp; Bracket Predictor
            </h1>
            <p className="text-xs text-zinc-500">
              Real results as of {AS_OF}. Type any scoreline to predict — tables
              and the bracket update live.
            </p>
          </div>

          <div className="flex rounded-lg border border-black/10 dark:border-white/15 p-0.5 text-sm">
            <button
              type="button"
              onClick={() => setTab("groups")}
              className={`rounded-md px-3 py-1 font-medium ${tab === "groups" ? "bg-emerald-500 text-white" : "text-zinc-600 dark:text-zinc-300"}`}
            >
              Groups
            </button>
            <button
              type="button"
              onClick={() => setTab("bracket")}
              className={`rounded-md px-3 py-1 font-medium ${tab === "bracket" ? "bg-emerald-500 text-white" : "text-zinc-600 dark:text-zinc-300"}`}
            >
              Knockout
            </button>
            <button
              type="button"
              onClick={() => setTab("scenarios")}
              className={`rounded-md px-3 py-1 font-medium ${tab === "scenarios" ? "bg-emerald-500 text-white" : "text-zinc-600 dark:text-zinc-300"}`}
            >
              Scenarios
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400">
              {predictionCount} prediction{predictionCount === 1 ? "" : "s"}
            </span>
            <button
              type="button"
              onClick={() => setEditUnlocked((v) => !v)}
              title="Played results are locked by default. Unlock to override them for what-ifs."
              className={`rounded-md border px-2.5 py-1 text-xs font-medium ${
                editUnlocked
                  ? "border-amber-400 bg-amber-400/10 text-amber-600 dark:text-amber-400"
                  : "border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10"
              }`}
            >
              {editUnlocked ? "🔓 Editing results" : "🔒 Results locked"}
            </button>
            <button
              type="button"
              onClick={resetScores}
              className="rounded-md border border-black/10 dark:border-white/15 px-2.5 py-1 text-xs font-medium hover:bg-black/5 dark:hover:bg-white/10"
            >
              Reset scores
            </button>
            <button
              type="button"
              onClick={resetAll}
              className="rounded-md border border-rose-300 px-2.5 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:border-rose-500/40 dark:hover:bg-rose-500/10"
            >
              Reset all
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        {tab === "groups" && (
          <>
            <Legend />
            <TiebreakerInfo />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {GROUPS.map((g) => (
                <GroupTable
                  key={g.group}
                  group={g}
                  standings={standings.get(g.group) ?? []}
                  fixtures={FIXTURES}
                  predictions={predictions}
                  qualifyingThirds={qualifyingThirds}
                  prospects={prospects.get(g.group) ?? new Map()}
                  bracket={bracket}
                  locked={!editUnlocked}
                  onScore={setScore}
                />
              ))}
            </div>
          </>
        )}

        {tab === "bracket" && (
          <div className="space-y-6">
            <ThirdsPanel thirds={thirds} />
            <div>
              <h2 className="mb-3 text-base font-bold tracking-tight">
                Projected knockout bracket
              </h2>
              <p className="mb-3 text-xs text-zinc-500">
                <span className="font-medium text-zinc-600 dark:text-zinc-300">
                  New for 2026:
                </span>{" "}
                32 teams reach the knockouts (12 group winners + 12 runners-up +
                8 best third-placed), so the bracket begins with a{" "}
                <span className="font-medium text-zinc-600 dark:text-zinc-300">
                  Round of 32
                </span>{" "}
                — 32 teams playing 16 matches. The Round of 16 is the{" "}
                <em>second</em> round. Group winners / runners-up fill in
                automatically from the tables; click a team to advance it and
                reveal who it would play. Third-place slotting approximates
                FIFA&apos;s allocation table.
              </p>
              <Bracket matches={bracket.matches} onPick={togglePick(setKoPick, predictions)} />
            </div>
          </div>
        )}

        {tab === "scenarios" && <Scenarios predictions={predictions} />}

        {DATA_NOTE && (
          <p className="mt-8 text-center text-xs text-zinc-400">{DATA_NOTE}</p>
        )}
      </main>
    </div>
  );
}

/** Build a pick handler that toggles off when re-clicking the current winner. */
function togglePick(
  setKoPick: (matchId: string, side: "home" | "away" | null) => void,
  predictions: { ko: Record<string, "home" | "away"> },
) {
  return (matchId: string, side: "home" | "away") => {
    const current = predictions.ko[matchId];
    setKoPick(matchId, current === side ? null : side);
  };
}

const TIEBREAKERS: { label: string; detail: string }[] = [
  { label: "Points", detail: "across all 3 group matches" },
  { label: "Head-to-head points", detail: "between the tied teams only" },
  { label: "Head-to-head goal difference", detail: "between the tied teams" },
  { label: "Head-to-head goals scored", detail: "between the tied teams" },
  { label: "Overall goal difference", detail: "across all group matches" },
  { label: "Overall goals scored", detail: "across all group matches" },
  { label: "Fair-play / conduct score", detail: "fewest card deductions" },
  { label: "FIFA World Ranking", detail: "11 June 2026 — replaces drawing of lots" },
];

function TiebreakerInfo() {
  return (
    <details className="mb-4 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 text-sm">
      <summary className="cursor-pointer select-none px-4 py-2.5 font-medium">
        How ties are broken{" "}
        <span className="font-normal text-zinc-500">— FIFA 2026 rules</span>
      </summary>
      <div className="border-t border-black/10 dark:border-white/10 px-4 py-3">
        <p className="mb-2 text-xs text-zinc-500">
          New for 2026, FIFA breaks ties{" "}
          <span className="font-medium text-zinc-600 dark:text-zinc-300">
            head-to-head first
          </span>{" "}
          (the result between level teams), before overall goal difference — the
          reverse of every previous World Cup. Applied in order until the tie breaks:
        </p>
        <ol className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
          {TIEBREAKERS.map((t, i) => (
            <li key={t.label} className="flex gap-2 text-xs">
              <span className="w-4 shrink-0 font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                {i + 1}
              </span>
              <span>
                <span className="font-medium">{t.label}</span>{" "}
                <span className="text-zinc-500">— {t.detail}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </details>
  );
}

function Legend() {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-zinc-500">
      <span className="flex items-center gap-1.5">
        <i className="inline-block h-3 w-1 rounded bg-emerald-500" /> Top 2 — advance
      </span>
      <span className="flex items-center gap-1.5">
        <i className="inline-block h-3 w-1 rounded bg-sky-500" /> 3rd — currently qualifies
      </span>
      <span className="flex items-center gap-1.5">
        <i className="inline-block h-3 w-1 rounded bg-amber-400" /> 3rd — outside top 8
      </span>
    </div>
  );
}

function ThirdsPanel({
  thirds,
}: {
  thirds: import("@/lib/types").TeamStanding[];
}) {
  return (
    <section className="rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 p-4">
      <h2 className="mb-1 text-base font-bold tracking-tight">
        Best third-placed teams
      </h2>
      <p className="mb-3 text-xs text-zinc-500">
        The 8 best of the 12 third-placed teams reach the Round of 32.
      </p>
      <div className="grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-3 lg:grid-cols-4">
        {thirds.map((t, i) => (
          <div
            key={t.team}
            className={`flex items-center gap-2 rounded-md px-2 py-1 text-sm ${i < 8 ? "bg-sky-500/10" : "opacity-60"}`}
          >
            <span className="w-5 tabular-nums text-zinc-400">{i + 1}</span>
            <span className="text-zinc-400">{t.group}</span>
            <span className="flex-1 truncate font-medium">{t.team}</span>
            <span className="tabular-nums text-zinc-500">{t.points}p</span>
            <span className="tabular-nums text-zinc-400">
              {t.gd > 0 ? `+${t.gd}` : t.gd}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
