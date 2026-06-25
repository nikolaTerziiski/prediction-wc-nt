import { getMatchStats } from "@/lib/api-football";
import { FIXTURES } from "@/lib/data";
import { deriveMatchStats } from "@/lib/seeded-stats";
import type { MatchStatsResult } from "@/lib/types";

// GET /api/match-stats?home=<team>&away=<team>
// Tries live API-Football data first (when a Pro-tier key covers the season);
// otherwise falls back to deterministic, illustrative seeded stats so the panel
// always shows something for a played match. Runs server-side only, so the key
// (read inside getMatchStats) never reaches the browser.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const home = searchParams.get("home");
  const away = searchParams.get("away");

  if (!home || !away) {
    return Response.json(
      { available: false, reason: "error" } satisfies MatchStatsResult,
      { status: 400 },
    );
  }

  // 1) Live data, if the key/plan covers it.
  const live = await getMatchStats(home, away);
  if (live.available) return Response.json(live);

  // 2) Seeded fallback from the curated scoreline.
  const fixture = FIXTURES.find((f) => f.home === home && f.away === away);
  const seeded = fixture ? deriveMatchStats(fixture) : null;
  if (seeded) {
    return Response.json({
      available: true,
      source: "seeded",
      stats: seeded,
    } satisfies MatchStatsResult);
  }

  // 3) Nothing to show (e.g. an unplayed match).
  return Response.json(live);
}
