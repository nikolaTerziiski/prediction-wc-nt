import { rankingOf } from "./data";
import type { Fixture, MatchStats, TeamMatchStats } from "./types";

// -----------------------------------------------------------------------------
// Illustrative ("seeded") match statistics.
//
// API-Football's free tier can't access the WC2026 season, and the app's results
// are a curated/predicted snapshot anyway — so for matches without live coverage
// we synthesise realistic, internally-consistent stats from the scoreline and the
// two teams' FIFA rankings. Deterministic (seeded by fixture id) so the numbers
// are stable across renders. Clearly illustrative, not real telemetry.
// -----------------------------------------------------------------------------

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Deterministic 0..1 PRNG (mulberry32). */
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const round1 = (v: number) => Math.round(v);
const round2 = (v: number) => Math.round(v * 100) / 100;

/**
 * Synthesise plausible possession/shots/xG/etc. for a played fixture from its
 * scoreline and the teams' FIFA rankings. Returns null for unplayed matches.
 */
export function deriveMatchStats(f: Fixture): MatchStats | null {
  if (f.homeScore == null || f.awayScore == null) return null;
  const hs = f.homeScore;
  const as = f.awayScore;

  const rng = mulberry32(hashStr(f.id));
  const jit = (range: number) => (rng() * 2 - 1) * range;

  // Strength gap from FIFA ranking (lower number = stronger). Positive ⇒ home stronger.
  const sd = clamp((rankingOf(f.away) - rankingOf(f.home)) / 40, -1.5, 1.5);
  const gd = hs - as;

  const possHome = clamp(50 + sd * 6 + gd * 1.5 + jit(4), 30, 70);
  const possAway = 100 - possHome;

  const shotsHome = clamp(round1(12 + sd * 2 + gd * 1.3 + jit(3)), 4, 26);
  const shotsAway = clamp(round1(12 - sd * 2 - gd * 1.3 + jit(3)), 3, 24);

  const sotHome = clamp(round1(hs + shotsHome * 0.2 + jit(1)), hs, shotsHome);
  const sotAway = clamp(round1(as + shotsAway * 0.2 + jit(1)), as, shotsAway);

  const team = (
    name: string,
    poss: number,
    shots: number,
    sot: number,
    goals: number,
    oppSot: number,
    oppGoals: number,
    cards: Fixture["homeCards"],
    strength: number,
  ): TeamMatchStats => ({
    team: name,
    possession: round1(poss),
    shots,
    shotsOnTarget: sot,
    corners: clamp(round1(3 + shots * 0.25 + jit(2)), 1, 13),
    fouls: clamp(round1(11 - strength + jit(4)), 5, 19),
    yellow: cards ? cards.yellow + cards.secondYellow + cards.yellowAndRed : clamp(round1(1 + jit(1.5)), 0, 4),
    red: cards ? cards.directRed + cards.secondYellow + cards.yellowAndRed : 0,
    passes: clamp(round1(450 + (poss - 50) * 8 + jit(40)), 250, 750),
    passAccuracy: clamp(round1(76 + strength * 2 + (poss - 50) * 0.18 + jit(3)), 68, 92),
    saves: clamp(Math.max(0, oppSot - oppGoals) + (rng() < 0.4 ? 1 : 0), 0, 9),
    xg: round2(clamp(0.3 + goals * 0.5 + sot * 0.12 + jit(0.3), 0.1, 4.5)),
  });

  return {
    fixtureId: hashStr(f.id),
    home: team(f.home, possHome, shotsHome, sotHome, hs, sotAway, as, f.homeCards, sd),
    away: team(f.away, possAway, shotsAway, sotAway, as, sotHome, hs, f.awayCards, -sd),
  };
}
