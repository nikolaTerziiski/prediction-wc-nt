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

function SlotRow({
  team,
  desc,
  confirmed,
  isWinner,
  selectable,
  onPick,
}: {
  team: string | null;
  desc: string;
  confirmed: boolean;
  isWinner: boolean;
  selectable: boolean;
  onPick: () => void;
}) {
  // Green ONLY for confirmed (real-result) teams; projected teams stay neutral.
  const tone = confirmed
    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
    : team
      ? "text-zinc-700 dark:text-zinc-200"
      : "";
  return (
    <button
      type="button"
      disabled={!selectable}
      onClick={onPick}
      className={[
        "flex w-full items-center justify-between gap-2 px-2.5 py-1.5 text-left text-sm transition-colors",
        selectable ? "cursor-pointer hover:bg-black/5 dark:hover:bg-white/10" : "cursor-default",
        tone,
        isWinner ? "font-bold ring-1 ring-inset ring-emerald-400" : "",
      ].join(" ")}
    >
      <span className={team ? "truncate font-medium" : "truncate text-zinc-400 italic"}>
        {team ?? desc}
      </span>
      {isWinner ? (
        <span className="shrink-0 text-emerald-500" title="Your pick to advance">
          ✓
        </span>
      ) : confirmed ? (
        <span
          className="shrink-0 text-emerald-500/70"
          title="Confirmed — real result"
          aria-hidden
        >
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
  // Both sides locked by real results → this is a real, decided matchup.
  const realTie = match.home.confirmed && match.away.confirmed;
  return (
    <div
      className={`w-48 shrink-0 overflow-hidden rounded-lg border bg-white dark:bg-zinc-950 ${
        realTie ? "border-emerald-500/50" : "border-black/10 dark:border-white/10"
      }`}
    >
      <SlotRow
        team={match.home.team}
        desc={match.home.desc}
        confirmed={match.home.confirmed}
        isWinner={match.winner != null && match.winner === match.home.team}
        selectable={match.home.team != null}
        onPick={() => onPick(match.id, "home")}
      />
      <div className="h-px bg-black/10 dark:bg-white/10" />
      <SlotRow
        team={match.away.team}
        desc={match.away.desc}
        confirmed={match.away.confirmed}
        isWinner={match.winner != null && match.winner === match.away.team}
        selectable={match.away.team != null}
        onPick={() => onPick(match.id, "away")}
      />
    </div>
  );
}

// Two-sided FIFA-style layout. The top half flows left→centre (R32→SF), the
// bottom half flows right→centre (SF→R32), meeting at the Final. Match IDs are
// the fixed 2026 bracket; the vertical order keeps each pair next to its feeder.
type BracketColumn = { round: Round; ids: string[] };

const LEFT_COLUMNS: BracketColumn[] = [
  { round: "R32", ids: ["74", "77", "73", "75", "83", "84", "81", "82"] },
  { round: "R16", ids: ["89", "90", "93", "94"] },
  { round: "QF", ids: ["97", "98"] },
  { round: "SF", ids: ["101"] },
];

const RIGHT_COLUMNS: BracketColumn[] = [
  { round: "SF", ids: ["102"] },
  { round: "QF", ids: ["99", "100"] },
  { round: "R16", ids: ["91", "92", "95", "96"] },
  { round: "R32", ids: ["76", "78", "79", "80", "86", "88", "85", "87"] },
];

function ColumnHeader({ round }: { round: Round }) {
  return (
    <h4 className="text-center text-xs font-semibold uppercase tracking-wide text-zinc-500">
      {ROUND_TITLES[round]}
    </h4>
  );
}

function HalfColumn({
  column,
  byId,
  onPick,
}: {
  column: BracketColumn;
  byId: Map<string, ResolvedMatch>;
  onPick: (matchId: string, side: "home" | "away") => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <ColumnHeader round={column.round} />
      <div className="flex flex-1 flex-col justify-around gap-3">
        {column.ids.map((id) => {
          const m = byId.get(id);
          return m ? <MatchCard key={id} match={m} onPick={onPick} /> : null;
        })}
      </div>
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
  const byId = new Map(matches.map((m) => [m.id, m]));
  const final = byId.get("104");
  const thirdPlace = byId.get("103");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500">
        <span className="flex items-center gap-1.5">
          <i className="inline-block h-3 w-3 rounded bg-emerald-500/20 ring-1 ring-emerald-500/50" />
          Confirmed — real result
        </span>
        <span className="flex items-center gap-1.5">
          <i className="inline-block h-3 w-3 rounded bg-zinc-400/20 ring-1 ring-zinc-400/40" />
          Projected (from predictions)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-emerald-500">✓</span> Your pick to advance
        </span>
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="flex min-w-max items-stretch gap-3">
          {/* Top half: R32 → Semi-final, flowing toward the centre */}
          {LEFT_COLUMNS.map((col) => (
            <HalfColumn key={`L-${col.round}`} column={col} byId={byId} onPick={onPick} />
          ))}

          {/* Centre: Final, champion, third-place play-off */}
          <div className="flex flex-col gap-2">
            <ColumnHeader round="F" />
            <div className="flex flex-1 flex-col items-center justify-center gap-3">
              {final && <MatchCard match={final} onPick={onPick} />}
              {final?.winner && (
                <div className="w-48 rounded-lg border border-amber-400/40 bg-amber-400/10 px-3 py-2 text-center">
                  <div className="text-[10px] uppercase tracking-wide text-amber-600 dark:text-amber-400">
                    Projected Champion
                  </div>
                  <div className="mt-0.5 text-lg font-bold">🏆 {final.winner}</div>
                </div>
              )}
              {thirdPlace && (
                <div className="flex flex-col gap-1 pt-2">
                  <h5 className="text-center text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
                    {ROUND_TITLES.TP}
                  </h5>
                  <MatchCard match={thirdPlace} onPick={onPick} />
                </div>
              )}
            </div>
          </div>

          {/* Bottom half: Semi-final → R32, flowing toward the centre (mirrored) */}
          {RIGHT_COLUMNS.map((col) => (
            <HalfColumn key={`R-${col.round}`} column={col} byId={byId} onPick={onPick} />
          ))}
        </div>
      </div>
    </div>
  );
}
