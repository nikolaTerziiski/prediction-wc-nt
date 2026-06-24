// Core domain types for the World Cup 2026 standings & bracket app.

export type Team = string; // team name doubles as its id

export interface Group {
  group: string; // "A" .. "L"
  teams: Team[]; // exactly 4 teams
}

export type MatchStatus = "played" | "scheduled";

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
}

export interface ResolvedMatch {
  id: string;
  round: Round;
  home: ResolvedSlot;
  away: ResolvedSlot;
  winner: Team | null; // resolved from KO picks (or null)
  pick: "home" | "away" | null;
}
