// Core domain types for the World Cup 2026 standings & bracket app.

export type Team = string; // team name doubles as its id

export interface Group {
  group: string; // "A" .. "L"
  teams: Team[]; // exactly 4 teams
}

export type MatchStatus = "played" | "scheduled";

/**
 * Per-team disciplinary record in a single match, used for FIFA's fair-play
 * (team conduct) tiebreaker. Only the single most severe sanction per player
 * counts, so these are mutually-exclusive per-player categories.
 */
export interface CardCounts {
  yellow: number; // single yellow card (no red): −1 each
  secondYellow: number; // sent off via a 2nd yellow / indirect red: −3 each
  directRed: number; // straight red card: −4 each
  yellowAndRed: number; // a yellow AND a later direct red (same player): −5 each
}

/** A group-stage fixture. `homeScore`/`awayScore` hold the REAL result (null if not yet played). */
export interface Fixture {
  id: string; // unique, e.g. "M1"
  group: string; // "A" .. "L"
  matchNumber: number;
  date: string; // ISO date "2026-06-11"
  home: Team;
  away: Team;
  homeScore: number | null;
  awayScore: number | null;
  status: MatchStatus;
  /** Optional disciplinary records (for the fair-play tiebreaker). */
  homeCards?: CardCounts;
  awayCards?: CardCounts;
}

/** A predicted/overridden scoreline the user typed in. */
export interface Score {
  home: number;
  away: number;
}

/** User predictions persisted in localStorage. */
export interface Predictions {
  /** fixtureId -> score override (used for future matches AND to override real results) */
  scores: Record<string, Score>;
  /** knockout matchId -> "home" | "away" (which slot advances) */
  ko: Record<string, "home" | "away">;
}

export interface TeamStanding {
  team: Team;
  group: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
  rank: number; // 1..4 within the group
  // --- FIFA 2026 tiebreaker inputs ---
  fairPlay: number; // team conduct score (≤ 0; higher/closer-to-0 ranks better)
  yellow: number; // aggregate yellow cards (display)
  red: number; // aggregate red cards (display)
  worldRanking: number; // FIFA/Coca-Cola world ranking position (lower = better)
}

// ---- Knockout bracket template -------------------------------------------------

export type Round = "R32" | "R16" | "QF" | "SF" | "TP" | "F";

/** Describes how a knockout slot is filled. */
export type SlotSpec =
  | { kind: "winner"; group: string } // winner of a group
  | { kind: "runnerUp"; group: string } // runner-up of a group
  | { kind: "third"; groups: string[] } // a best-third-placed team from one of these groups
  | { kind: "matchWinner"; match: string } // winner of an earlier KO match
  | { kind: "matchLoser"; match: string }; // loser of an earlier KO match (for 3rd-place playoff)

export interface BracketMatch {
  id: string; // e.g. "73"
  round: Round;
  label?: string; // optional display label, e.g. "Round of 32"
  home: SlotSpec;
  away: SlotSpec;
}

// ---- Resolved values for rendering ---------------------------------------------

export interface ResolvedSlot {
  team: Team | null; // null when not yet determined
  desc: string; // human label e.g. "Winner A", "3rd B/E/F", "Winner M73"
  /** True when the team is locked by REAL results (its group is complete),
   *  as opposed to a projection from predictions / unfinished groups. */
  confirmed: boolean;
}

export interface ResolvedMatch {
  id: string;
  round: Round;
  home: ResolvedSlot;
  away: ResolvedSlot;
  winner: Team | null; // resolved from KO picks (or null)
  pick: "home" | "away" | null;
}

// ---- Live match statistics (from API-Football) ---------------------------------
// Declared here (a side-effect-free module) so client components can import the
// shapes without pulling in the `server-only` API client.

export interface TeamMatchStats {
  team: string;
  possession: number | null; // percent 0..100
  shots: number | null;
  shotsOnTarget: number | null;
  corners: number | null;
  fouls: number | null;
  yellow: number | null;
  red: number | null;
  passes: number | null;
  passAccuracy: number | null; // percent
  saves: number | null;
  xg: number | null;
}

export interface MatchStats {
  fixtureId: number;
  home: TeamMatchStats;
  away: TeamMatchStats;
}

export type MatchStatsResult =
  | { available: true; source: "live" | "seeded"; stats: MatchStats }
  | { available: false; reason: "no-key" | "not-found" | "no-stats" | "error" };
