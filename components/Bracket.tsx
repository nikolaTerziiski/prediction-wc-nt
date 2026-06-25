"use client";

import type { ResolvedMatch, Round } from "@/lib/types";

const ROUND_TITLES: Record<Round, string> = {
  R32: "Round of 32",
  R16: "Round of 16",
  QF: "Quarter-finals",
  SF: "Semi-finals",
  TP: "Third place",
  F: "Final",
};

const ROUND_SEQUENCE: Round[] = ["R32", "R16", "QF", "SF", "F"];

function SlotRow({
  team,
  desc,
  isWinner,
  selectable,
  onPick,
}: {
  team: string | null;
  desc: string;
  isWinner: boolean;
  selectable: boolean;
  onPick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={!selectable}
      onClick={onPick}
      className={[
        "flex w-full items-center justify-between gap-2 px-2.5 py-1.5 text-left text-sm transition-colors",
        selectable ? "cursor-pointer hover:bg-emerald-500/10" : "cursor-default",
        isWinner
          ? "bg-emerald-500/20 font-semibold text-emerald-700 dark:text-emerald-300"
          : team
            ? "bg-emerald-500/[0.07] text-emerald-800 dark:text-emerald-200"
            : "",
      ].join(" ")}
    >
      <span className={team ? "truncate font-medium" : "truncate text-zinc-400 italic"}>
        {team ?? desc}
      </span>
      {isWinner ? (
        <span className="shrink-0 text-emerald-500">✓</span>
      ) : team ? (
        <span className="shrink-0 text-emerald-500/60" aria-hidden>
          ●
        </span>
      ) : null}
    </button>
  );
}

function MatchCard({
  match,
  onPick,
}: {
  match: ResolvedMatch;
  onPick: (matchId: string, side: "home" | "away") => void;
}) {
  return (
    <div className="w-48 shrink-0 overflow-hidden rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950">
      <SlotRow
        team={match.home.team}
        desc={match.home.desc}
        isWinner={match.winner != null && match.winner === match.home.team}
        selectable={match.home.team != null}
        onPick={() => onPick(match.id, "home")}
      />
      <div className="h-px bg-black/10 dark:bg-white/10" />
      <SlotRow
        team={match.away.team}
        desc={match.away.desc}
        isWinner={match.winner != null && match.winner === match.away.team}
        selectable={match.away.team != null}
        onPick={() => onPick(match.id, "away")}
      />
    </div>
  );
}

export function Bracket({
  matches,
  onPick,
}: {
  matches: ResolvedMatch[];
  onPick: (matchId: string, side: "home" | "away") => void;
}) {
  const final = matches.find((m) => m.round === "F");
  const thirdPlace = matches.find((m) => m.round === "TP");

  return (
    <div className="space-y-4">
      <div className="flex gap-4 overflow-x-auto pb-4">
        {ROUND_SEQUENCE.map((round) => {
          const roundMatches = matches.filter((m) => m.round === round);
          if (roundMatches.length === 0) return null;
          return (
            <div key={round} className="flex flex-col gap-3">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                <span className="block">{ROUND_TITLES[round]}</span>
                <span className="block text-[10px] font-normal normal-case tracking-normal text-zinc-400">
                  {roundMatches.length * 2} teams · {roundMatches.length}{" "}
                  {roundMatches.length === 1 ? "match" : "matches"}
                </span>
              </h4>
              <div className="flex flex-1 flex-col justify-around gap-3">
                {roundMatches.map((m) => (
                  <MatchCard key={m.id} match={m} onPick={onPick} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {thirdPlace && (
        <div className="flex items-center gap-3">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            {ROUND_TITLES.TP}
          </h4>
          <MatchCard match={thirdPlace} onPick={onPick} />
        </div>
      )}

      {final?.winner && (
        <div className="rounded-lg border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-center">
          <div className="text-xs uppercase tracking-wide text-amber-600 dark:text-amber-400">
            Projected Champion
          </div>
          <div className="mt-0.5 text-xl font-bold">🏆 {final.winner}</div>
        </div>
      )}
    </div>
  );
}
