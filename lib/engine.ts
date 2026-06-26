import { rankingOf } from "./data";
import type {
  BracketMatch,
  CardCounts,
  Fixture,
  Group,
  Predictions,
  ResolvedMatch,
  ResolvedSlot,
  Round,
  Score,
  SlotSpec,
  TeamStanding,
} from "./types";

// -------------------------------------------------------------------------------
// Scores
// -------------------------------------------------------------------------------

/** Effective score for a fixture: a user prediction/override wins over the real result. */
export function effectiveScore(f: Fixture, p: Predictions): Score | null {
  const override = p.scores[f.id];
  if (override) return override;
  if (f.homeScore != null && f.awayScore != null) {
    return { home: f.homeScore, away: f.awayScore };
  }
  return null;
}

/** Whether the fixture currently has a real (played) result, ignoring predictions. */
export function isPlayed(f: Fixture): boolean {
  return f.homeScore != null && f.awayScore != null;
}

// -------------------------------------------------------------------------------
// Group standings
// -------------------------------------------------------------------------------

function blank(team: string, group: string, worldRanking: number): TeamStanding {
  return {
    team,
    group,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    gf: 0,
    ga: 0,
    gd: 0,
    points: 0,
    rank: 0,
    fairPlay: 0,
    yellow: 0,
    red: 0,
    worldRanking,
  };
}

/** FIFA fair-play deduction for one team's cards in one match (yellow −1, 2nd-yellow −3, direct red −4, yellow+red −5). */
function conductDeduction(c: CardCounts): number {
  return c.yellow + 3 * c.secondYellow + 4 * c.directRed + 5 * c.yellowAndRed;
}

/**
 * Tiebreaker once head-to-head can no longer separate teams: FIFA criteria 4–7 —
 * overall goal difference, overall goals scored, fair-play conduct score, then the
 * FIFA/Coca-Cola World Ranking (lower = better). Alphabetical is a final safety net.
 */
function overallTiebreak(a: TeamStanding, b: TeamStanding): number {
  return (
    b.gd - a.gd ||
    b.gf - a.gf ||
    b.fairPlay - a.fairPlay ||
    a.worldRanking - b.worldRanking ||
    a.team.localeCompare(b.team)
  );
}

/** Mini head-to-head table among a subset of teams. */
function headToHead(
  teams: string[],
  fixtures: Fixture[],
  scoreOf: (f: Fixture) => Score | null,
): Map<string, { points: number; gd: number; gf: number }> {
  const set = new Set(teams);
  const m = new Map<string, { points: number; gd: number; gf: number }>();
  for (const t of teams) m.set(t, { points: 0, gd: 0, gf: 0 });
  for (const f of fixtures) {
    if (!set.has(f.home) || !set.has(f.away)) continue;
    const s = scoreOf(f);
    if (!s) continue;
    const h = m.get(f.home)!;
    const a = m.get(f.away)!;
    h.gf += s.home;
    h.gd += s.home - s.away;
    a.gf += s.away;
    a.gd += s.away - s.home;
    if (s.home > s.away) h.points += 3;
    else if (s.home < s.away) a.points += 3;
    else {
      h.points += 1;
      a.points += 1;
    }
  }
  return m;
}

/**
 * Resolve a block of teams that are level on points using the official FIFA 2026
 * order: HEAD-TO-HEAD FIRST (points, then GD, then goals among the tied teams),
 * re-applied to any still-level subset; only then overall GD/goals, fair-play and
 * the FIFA World Ranking. This is the 2026 reversal of the historic "overall GD
 * first" rule — the result of the match(es) between level teams decides first.
 */
function resolveTied(
  block: TeamStanding[],
  fixtures: Fixture[],
  scoreOf: (f: Fixture) => Score | null,
): TeamStanding[] {
  if (block.length <= 1) return block;

  // Head-to-head mini-table among EXACTLY these still-tied teams.
  const h2h = headToHead(
    block.map((s) => s.team),
    fixtures,
    scoreOf,
  );

  const sorted = [...block].sort((x, y) => {
    const hx = h2h.get(x.team)!;
    const hy = h2h.get(y.team)!;
    return hy.points - hx.points || hy.gd - hx.gd || hy.gf - hx.gf;
  });

  // Partition into sub-blocks equal on the head-to-head key.
  const groups: TeamStanding[][] = [];
  for (const s of sorted) {
    const last = groups[groups.length - 1];
    const hs = h2h.get(s.team)!;
    if (last) {
      const hl = h2h.get(last[0].team)!;
      if (hs.points === hl.points && hs.gd === hl.gd && hs.gf === hl.gf) {
        last.push(s);
        continue;
      }
    }
    groups.push([s]);
  }

  if (groups.length > 1) {
    // Head-to-head separated some teams — re-apply the FULL chain (recomputing
    // head-to-head) within each sub-block that is still tied.
    return groups.flatMap((g) => resolveTied(g, fixtures, scoreOf));
  }

  // Head-to-head cannot separate them → fall through to overall GD/goals, fair-play,
  // then FIFA World Ranking (which is unique, so this fully resolves the order).
  return [...block].sort(overallTiebreak);
}

/** Apply FIFA 2026 tiebreakers (points → head-to-head → overall → fair-play → ranking) and assign ranks. */
function rankTable(
  arr: TeamStanding[],
  fixtures: Fixture[],
  scoreOf: (f: Fixture) => Score | null,
): void {
  const sorted = [...arr].sort((a, b) => b.points - a.points);
  const result: TeamStanding[] = [];
  let i = 0;
  while (i < sorted.length) {
    let j = i + 1;
    while (j < sorted.length && sorted[j].points === sorted[i].points) j++;
    result.push(...resolveTied(sorted.slice(i, j), fixtures, scoreOf));
    i = j;
  }
  result.forEach((s, idx) => (s.rank = idx + 1));
  for (let k = 0; k < result.length; k++) arr[k] = result[k];
}

/** Standings for a single group. */
export function groupStandings(
  group: Group,
  fixtures: Fixture[],
  p: Predictions,
  ranking: (team: string) => number = rankingOf,
): TeamStanding[] {
  const scoreOf = (f: Fixture) => effectiveScore(f, p);
  const table = new Map<string, TeamStanding>();
  for (const t of group.teams) table.set(t, blank(t, group.group, ranking(t)));
  const groupFixtures = fixtures.filter((f) => f.group === group.group);
  for (const f of groupFixtures) {
    const s = scoreOf(f);
    if (!s) continue;
    const h = table.get(f.home);
    const a = table.get(f.away);
    if (!h || !a) continue;
    h.played++;
    a.played++;
    h.gf += s.home;
    h.ga += s.away;
    a.gf += s.away;
    a.ga += s.home;
    if (s.home > s.away) {
      h.won++;
      h.points += 3;
      a.lost++;
    } else if (s.home < s.away) {
      a.won++;
      a.points += 3;
      h.lost++;
    } else {
      h.drawn++;
      a.drawn++;
      h.points++;
      a.points++;
    }
    // Fair-play (real cards from played matches; predictions don't add cards).
    if (f.homeCards) {
      h.yellow += f.homeCards.yellow;
      h.red += f.homeCards.directRed + f.homeCards.secondYellow + f.homeCards.yellowAndRed;
      h.fairPlay -= conductDeduction(f.homeCards);
    }
    if (f.awayCards) {
      a.yellow += f.awayCards.yellow;
      a.red += f.awayCards.directRed + f.awayCards.secondYellow + f.awayCards.yellowAndRed;
      a.fairPlay -= conductDeduction(f.awayCards);
    }
  }
  const arr = [...table.values()];
  for (const s of arr) s.gd = s.gf - s.ga;
  rankTable(arr, groupFixtures, scoreOf);
  return arr;
}

/** Map of group letter -> ranked standings. */
export function allStandings(
  groups: Group[],
  fixtures: Fixture[],
  p: Predictions,
  ranking: (team: string) => number = rankingOf,
): Map<string, TeamStanding[]> {
  const m = new Map<string, TeamStanding[]>();
  for (const g of groups) m.set(g.group, groupStandings(g, fixtures, p, ranking));
  return m;
}

/**
 * The 12 third-placed teams, ranked best-first. The top 8 qualify for the Round of 32.
 * Thirds come from different groups, so head-to-head never applies — FIFA ranks them by
 * points, overall GD, overall goals, fair-play conduct, then the FIFA World Ranking.
 */
export function rankedThirds(
  standings: Map<string, TeamStanding[]>,
): TeamStanding[] {
  const thirds: TeamStanding[] = [];
  for (const table of standings.values()) {
    if (table[2]) thirds.push(table[2]);
  }
  thirds.sort(
    (a, b) =>
      b.points - a.points ||
      b.gd - a.gd ||
      b.gf - a.gf ||
      b.fairPlay - a.fairPlay ||
      a.worldRanking - b.worldRanking ||
      a.team.localeCompare(b.team),
  );
  return thirds;
}

// -------------------------------------------------------------------------------
// Knockout bracket resolution
// -------------------------------------------------------------------------------

const ROUND_ORDER: Record<Round, number> = {
  R32: 0,
  R16: 1,
  QF: 2,
  SF: 3,
  TP: 4,
  F: 5,
};

/**
 * Assign the qualified third-placed teams to the bracket's "third" slots.
 * Uses augmenting-path bipartite matching so every third lands in a slot whose
 * allowed-groups set permits it. (Approximates FIFA's official allocation table.)
 */
function assignThirds(
  thirdSlots: { key: string; groups: string[] }[],
  qualifiedGroups: { group: string }[],
): Map<string, string> {
  // match group letter -> slot key
  const slotForGroup = new Map<string, string>();
  const groupForSlot = new Map<string, string>();

  const tryAssign = (group: string, seen: Set<string>): boolean => {
    for (const slot of thirdSlots) {
      if (!slot.groups.includes(group) || seen.has(slot.key)) continue;
      seen.add(slot.key);
      const occupant = groupForSlot.get(slot.key);
      if (!occupant || tryAssign(occupant, seen)) {
        groupForSlot.set(slot.key, group);
        slotForGroup.set(group, slot.key);
        return true;
      }
    }
    return false;
  };

  for (const q of qualifiedGroups) tryAssign(q.group, new Set());
  return slotForGroup; // group -> slotKey
}

export interface BracketResult {
  matches: ResolvedMatch[];
  byId: Map<string, ResolvedMatch>;
  qualifiedThirds: TeamStanding[]; // top 8
}

/**
 * Resolve the whole knockout bracket from current group standings + user KO picks.
 * Group winners/runners-up resolve automatically from standings; deeper rounds
 * fill in as the user clicks a team to advance it.
 */
export function resolveBracket(
  template: BracketMatch[],
  standings: Map<string, TeamStanding[]>,
  p: Predictions,
): BracketResult {
  const winnerOf = (g: string) => standings.get(g)?.[0]?.team ?? null;
  const runnerUpOf = (g: string) => standings.get(g)?.[1]?.team ?? null;

  const thirds = rankedThirds(standings);
  const qualifiedThirds = thirds.slice(0, 8);

  // Collect all "third" slots from the template.
  const thirdSlots: { key: string; groups: string[] }[] = [];
  for (const m of template) {
    if (m.home.kind === "third")
      thirdSlots.push({ key: `${m.id}:home`, groups: m.home.groups });
    if (m.away.kind === "third")
      thirdSlots.push({ key: `${m.id}:away`, groups: m.away.groups });
  }
  const groupToSlot = assignThirds(
    thirdSlots,
    qualifiedThirds.map((t) => ({ group: t.group })),
  );
  const slotToTeam = new Map<string, string>();
  for (const t of qualifiedThirds) {
    const slot = groupToSlot.get(t.group);
    if (slot) slotToTeam.set(slot, t.team);
  }

  const ordered = [...template].sort(
    (a, b) => ROUND_ORDER[a.round] - ROUND_ORDER[b.round],
  );
  const byId = new Map<string, ResolvedMatch>();

  const resolveSlot = (m: BracketMatch, side: "home" | "away"): ResolvedSlot => {
    const spec: SlotSpec = side === "home" ? m.home : m.away;
    switch (spec.kind) {
      case "winner":
        return { team: winnerOf(spec.group), desc: `Winner ${spec.group}` };
      case "runnerUp":
        return { team: runnerUpOf(spec.group), desc: `2nd ${spec.group}` };
      case "third": {
        const team = slotToTeam.get(`${m.id}:${side}`) ?? null;
        return { team, desc: `3rd ${spec.groups.join("/")}` };
      }
      case "matchWinner": {
        const ref = byId.get(spec.match);
        return { team: ref?.winner ?? null, desc: `Winner M${spec.match}` };
      }
      case "matchLoser": {
        const ref = byId.get(spec.match);
        let team: string | null = null;
        if (ref && ref.winner) {
          team =
            ref.winner === ref.home.team
              ? ref.away.team
              : ref.home.team;
        }
        return { team, desc: `Loser M${spec.match}` };
      }
    }
  };

  for (const m of ordered) {
    const home = resolveSlot(m, "home");
    const away = resolveSlot(m, "away");
    const pick = p.ko[m.id] ?? null;
    let winner: string | null = null;
    if (pick === "home") winner = home.team;
    else if (pick === "away") winner = away.team;
    const resolved: ResolvedMatch = {
      id: m.id,
      round: m.round,
      home,
      away,
      winner,
      pick,
    };
    byId.set(m.id, resolved);
  }

  // Return in original template order for stable rendering.
  const matches = template.map((m) => byId.get(m.id)!);
  return { matches, byId, qualifiedThirds };
}

/** Find the Round-of-32 match a team lands in and who it would face. */
export function r32OpponentOf(
  team: string,
  result: BracketResult,
): { matchId: string; opponent: string | null; opponentDesc: string } | null {
  for (const m of result.matches) {
    if (m.round !== "R32") continue;
    if (m.home.team === team)
      return { matchId: m.id, opponent: m.away.team, opponentDesc: m.away.desc };
    if (m.away.team === team)
      return { matchId: m.id, opponent: m.home.team, opponentDesc: m.home.desc };
  }
  return null;
}
