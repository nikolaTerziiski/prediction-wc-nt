import { BRACKET, FIXTURES, GROUPS } from "./data";
import { allStandings, r32OpponentOf, rankedThirds, resolveBracket } from "./engine";
import type { Predictions, Score, TeamStanding } from "./types";

export type Outcome = "home" | "draw" | "away";

/** Representative scoreline for an outcome (minimal margin). Goal-sensitivity is flagged separately. */
function repScore(o: Outcome): Score {
  if (o === "home") return { home: 1, away: 0 };
  if (o === "away") return { home: 0, away: 1 };
  return { home: 1, away: 1 };
}

export function outcomeLabel(o: Outcome, home: string, away: string): string {
  if (o === "home") return `${home} win`;
  if (o === "away") return `${away} win`;
  return "Draw";
}

export interface R32Slot {
  matchId: string;
  opponent: string | null; // resolved opponent team, if determined
  opponentDesc: string; // descriptor, e.g. "3rd C/E/F/H/I"
}

export interface ScenQualifier {
  team: string;
  rank: number; // 1..3
  qualifies: boolean; // ranks 1-2 always; rank 3 only if in best-8 thirds
  r32: R32Slot | null;
}

export interface GroupScenario {
  key: string;
  outcomes: Outcome[]; // aligned with the remaining-fixtures list
  table: TeamStanding[]; // resulting final standings
  qualifiers: ScenQualifier[]; // ranks 1..3
  goalSensitive: boolean;
  sensitiveNote: string;
}

export interface RemainingFixture {
  id: string;
  home: string;
  away: string;
}

export interface GroupScenarioSet {
  group: string;
  remaining: RemainingFixture[];
  scenarios: GroupScenario[];
  complete: boolean; // no remaining matches
}

/** All outcome combinations for n matches, in row-major order (first match outermost). */
function combos(n: number): Outcome[][] {
  const opts: Outcome[] = ["home", "draw", "away"];
  let acc: Outcome[][] = [[]];
  for (let i = 0; i < n; i++) {
    const next: Outcome[][] = [];
    for (const a of acc) for (const o of opts) next.push([...a, o]);
    acc = next;
  }
  return acc;
}

/**
 * Enumerate every win/draw/loss combination of a group's remaining matches.
 * Goal difference is computed (using real results so far + a representative margin),
 * and any scenario where teams finish level on points is flagged as goal-decided.
 */
export function groupScenarios(
  group: string,
  base: Predictions,
): GroupScenarioSet {
  const remaining = FIXTURES.filter(
    (f) => f.group === group && f.homeScore == null,
  ).sort((a, b) => a.matchNumber - b.matchNumber);

  const remList: RemainingFixture[] = remaining.map((f) => ({
    id: f.id,
    home: f.home,
    away: f.away,
  }));

  if (remaining.length === 0) {
    // Group already decided — still surface the current qualifiers + opponents.
    const standings = allStandings(GROUPS, FIXTURES, base);
    const table = standings.get(group)!;
    const top8 = new Set(
      rankedThirds(standings)
        .slice(0, 8)
        .map((t) => t.team),
    );
    const bracket = resolveBracket(BRACKET, standings, base);
    const qualifiers = buildQualifiers(table, top8, bracket);
    return {
      group,
      remaining: [],
      complete: true,
      scenarios: [
        {
          key: "final",
          outcomes: [],
          table,
          qualifiers,
          goalSensitive: false,
          sensitiveNote: "",
        },
      ],
    };
  }

  const scenarios: GroupScenario[] = [];
  for (const combo of combos(remaining.length)) {
    const scores = { ...base.scores };
    remaining.forEach((f, i) => {
      scores[f.id] = repScore(combo[i]);
    });
    const overlay: Predictions = { scores, ko: base.ko };

    const standings = allStandings(GROUPS, FIXTURES, overlay);
    const table = standings.get(group)!;
    const top8 = new Set(
      rankedThirds(standings)
        .slice(0, 8)
        .map((t) => t.team),
    );
    const bracket = resolveBracket(BRACKET, standings, overlay);
    const qualifiers = buildQualifiers(table, top8, bracket);

    // Goal sensitivity: any block of teams level on points is order-decided by goals.
    const notes: string[] = [];
    let i = 0;
    while (i < table.length) {
      let j = i + 1;
      while (j < table.length && table[j].points === table[i].points) j++;
      if (j - i > 1) {
        const teams = table.slice(i, j).map((t) => t.team).join(", ");
        const ranks =
          j - i === 2
            ? `${i + 1}${ord(i + 1)}/${i + 2}${ord(i + 2)}`
            : `${i + 1}${ord(i + 1)}–${j}${ord(j)}`;
        notes.push(
          `${ranks}: ${teams} level on ${table[i].points} pts → head-to-head, then goals decide`,
        );
      }
      i = j;
    }

    scenarios.push({
      key: combo.join("-"),
      outcomes: combo,
      table,
      qualifiers,
      goalSensitive: notes.length > 0,
      sensitiveNote: notes.join("; "),
    });
  }

  return { group, remaining: remList, scenarios, complete: false };
}

function buildQualifiers(
  table: TeamStanding[],
  top8Thirds: Set<string>,
  bracket: ReturnType<typeof resolveBracket>,
): ScenQualifier[] {
  const out: ScenQualifier[] = [];
  for (let r = 0; r < 3 && r < table.length; r++) {
    const s = table[r];
    const qualifies = r < 2 || top8Thirds.has(s.team);
    out.push({
      team: s.team,
      rank: r + 1,
      qualifies,
      r32: qualifies ? r32OpponentOf(s.team, bracket) : null,
    });
  }
  return out;
}

function ord(n: number): string {
  if (n === 1) return "st";
  if (n === 2) return "nd";
  if (n === 3) return "rd";
  return "th";
}
