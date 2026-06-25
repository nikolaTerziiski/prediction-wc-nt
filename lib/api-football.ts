import "server-only";
import type {
  MatchStats,
  MatchStatsResult,
  TeamMatchStats,
} from "./types";

// -----------------------------------------------------------------------------
// API-Football (api-sports.io) client — SERVER ONLY.
//
// The `server-only` import above makes importing this module from any client
// ("use client") component a build error, so the API key can never reach the
// browser. All calls go out from the server (a Route Handler), authenticated
// with the `x-apisports-key` header and cached hard to respect the free tier's
// 100-requests/day quota.
//
// Set API_SPORTS_KEY in .env.local (NOT NEXT_PUBLIC_ — that would inline it into
// the client bundle). Get a free key at https://www.api-football.com.
// -----------------------------------------------------------------------------

const BASE = "https://v3.football.api-sports.io";
const WORLD_CUP_LEAGUE = 1; // API-Football league id for the FIFA World Cup
const SEASON = 2026;

// Cache windows (seconds). Fixtures rarely change; finished-match stats never do.
const FIXTURES_TTL = 6 * 60 * 60; // 6h
const STATS_TTL = 30 * 60; // 30m (covers in-progress matches without burning quota)

function apiKey(): string | undefined {
  return process.env.API_SPORTS_KEY;
}

// ---- Team-name matching ------------------------------------------------------
// API-Football uses some different spellings than this app's data. Canonicalise
// both sides (strip accents/punctuation) and map the known variants.
const NAME_ALIASES: Record<string, string> = {
  usa: "unitedstates",
  korearepublic: "southkorea",
  iriran: "iran",
  czechia: "czechrepublic",
  caboverde: "capeverde",
  congodr: "drcongo",
  turkiye: "turkey",
  cotedivoire: "ivorycoast",
};

function canonical(name: string): string {
  const n = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]/g, "");
  return NAME_ALIASES[n] ?? n;
}

// ---- Raw API shapes (only the bits we use) ----------------------------------
interface ApiTeam {
  id: number;
  name: string;
}
interface ApiFixture {
  fixture: { id: number; date: string; status: { short: string } };
  teams: { home: ApiTeam; away: ApiTeam };
}
interface ApiStatLine {
  type: string;
  value: number | string | null;
}
interface ApiTeamStatistics {
  team: ApiTeam;
  statistics: ApiStatLine[];
}

// ---- Fetch helpers -----------------------------------------------------------
async function apiGet<T>(
  path: string,
  revalidate: number,
): Promise<{ response: T } | null> {
  const key = apiKey();
  if (!key) return null;
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { "x-apisports-key": key },
      next: { revalidate, tags: ["api-football"] },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { response: T };
    return json;
  } catch {
    return null;
  }
}

async function worldCupFixtures(): Promise<ApiFixture[] | null> {
  const json = await apiGet<ApiFixture[]>(
    `/fixtures?league=${WORLD_CUP_LEAGUE}&season=${SEASON}`,
    FIXTURES_TTL,
  );
  return json?.response ?? null;
}

function num(v: number | string | null): number | null {
  if (v == null) return null;
  if (typeof v === "number") return v;
  const cleaned = v.replace("%", "").trim();
  if (cleaned === "") return null;
  const n = Number(cleaned);
  return Number.isNaN(n) ? null : n;
}

function parseTeamStats(line: ApiTeamStatistics): TeamMatchStats {
  const get = (type: string) =>
    line.statistics.find((s) => s.type === type)?.value ?? null;
  return {
    team: line.team.name,
    possession: num(get("Ball Possession")),
    shots: num(get("Total Shots")),
    shotsOnTarget: num(get("Shots on Goal")),
    corners: num(get("Corner Kicks")),
    fouls: num(get("Fouls")),
    yellow: num(get("Yellow Cards")),
    red: num(get("Red Cards")),
    passes: num(get("Total passes")),
    passAccuracy: num(get("Passes %")),
    saves: num(get("Goalkeeper Saves")),
    xg: num(get("expected_goals")),
  };
}

/**
 * Resolve the API-Football fixture id for a group-stage match by home/away team,
 * then fetch its statistics. Returns a discriminated result so the UI can show a
 * precise message (missing key, fixture not covered, stats not published yet).
 */
export async function getMatchStats(
  home: string,
  away: string,
): Promise<MatchStatsResult> {
  if (!apiKey()) return { available: false, reason: "no-key" };

  const fixtures = await worldCupFixtures();
  if (!fixtures) return { available: false, reason: "error" };

  const h = canonical(home);
  const a = canonical(away);
  const match = fixtures.find(
    (f) =>
      canonical(f.teams.home.name) === h && canonical(f.teams.away.name) === a,
  );
  if (!match) return { available: false, reason: "not-found" };

  const json = await apiGet<ApiTeamStatistics[]>(
    `/fixtures/statistics?fixture=${match.fixture.id}`,
    STATS_TTL,
  );
  const lines = json?.response;
  if (!lines || lines.length < 2) return { available: false, reason: "no-stats" };

  // Order home/away by matching the fixture's team ids.
  const homeLine =
    lines.find((l) => l.team.id === match.teams.home.id) ?? lines[0];
  const awayLine =
    lines.find((l) => l.team.id === match.teams.away.id) ?? lines[1];

  return {
    available: true,
    source: "live",
    stats: {
      fixtureId: match.fixture.id,
      home: parseTeamStats(homeLine),
      away: parseTeamStats(awayLine),
    },
  };
}
