import type { BracketMatch, CardCounts, Fixture, Group } from "./types";

// Data cross-verified across Wikipedia, ESPN, Yahoo Sports and Sky Sports.
// Group stage runs 11–27 June 2026; matchdays 1 & 2 are real results, later
// matches (24 June onward at time of capture) are scheduled with no score yet.
export const AS_OF = "25 June 2026 (Group B complete)";

export const DATA_NOTE =
  "Group + match data cross-verified across Wikipedia, ESPN, Yahoo & Sky Sports. " +
  "Matchdays 1–2 are real results; later matches are scheduled — predict them yourself. " +
  "Tables use FIFA's official 2026 tiebreakers (head-to-head first, then overall GD/goals, " +
  "fair-play conduct, then FIFA World Ranking). Card data feeding the fair-play step is " +
  "illustrative, not a complete official record. FIFA World Rankings are the official " +
  "11 June 2026 update. Third-placed slotting in the bracket approximates FIFA's allocation table.";

export const GROUPS: Group[] = [
  { group: "A", teams: ["Mexico", "South Africa", "South Korea", "Czech Republic"] },
  { group: "B", teams: ["Canada", "Bosnia and Herzegovina", "Qatar", "Switzerland"] },
  { group: "C", teams: ["Brazil", "Morocco", "Haiti", "Scotland"] },
  { group: "D", teams: ["United States", "Paraguay", "Australia", "Turkey"] },
  { group: "E", teams: ["Germany", "Curaçao", "Ivory Coast", "Ecuador"] },
  { group: "F", teams: ["Netherlands", "Japan", "Sweden", "Tunisia"] },
  { group: "G", teams: ["Belgium", "Egypt", "Iran", "New Zealand"] },
  { group: "H", teams: ["Spain", "Cape Verde", "Saudi Arabia", "Uruguay"] },
  { group: "I", teams: ["France", "Senegal", "Iraq", "Norway"] },
  { group: "J", teams: ["Argentina", "Algeria", "Austria", "Jordan"] },
  { group: "K", teams: ["Portugal", "DR Congo", "Uzbekistan", "Colombia"] },
  { group: "L", teams: ["England", "Croatia", "Ghana", "Panama"] },
];

// FIFA tri-letter codes, used for compact display (e.g. the scenario matrix).
export const TEAM_CODE: Record<string, string> = {
  Mexico: "MEX", "South Africa": "RSA", "South Korea": "KOR", "Czech Republic": "CZE",
  Canada: "CAN", "Bosnia and Herzegovina": "BIH", Qatar: "QAT", Switzerland: "SUI",
  Brazil: "BRA", Morocco: "MAR", Haiti: "HAI", Scotland: "SCO",
  "United States": "USA", Paraguay: "PAR", Australia: "AUS", Turkey: "TUR",
  Germany: "GER", "Curaçao": "CUW", "Ivory Coast": "CIV", Ecuador: "ECU",
  Netherlands: "NED", Japan: "JPN", Sweden: "SWE", Tunisia: "TUN",
  Belgium: "BEL", Egypt: "EGY", Iran: "IRN", "New Zealand": "NZL",
  Spain: "ESP", "Cape Verde": "CPV", "Saudi Arabia": "KSA", Uruguay: "URU",
  France: "FRA", Senegal: "SEN", Iraq: "IRQ", Norway: "NOR",
  Argentina: "ARG", Algeria: "ALG", Austria: "AUT", Jordan: "JOR",
  Portugal: "POR", "DR Congo": "COD", Uzbekistan: "UZB", Colombia: "COL",
  England: "ENG", Croatia: "CRO", Ghana: "GHA", Panama: "PAN",
};

export const code = (team: string): string =>
  TEAM_CODE[team] ?? team.slice(0, 3).toUpperCase();

// FIFA/Coca-Cola Men's World Ranking position (official update of 11 June 2026).
// Used as the LAST-RESORT group-stage tiebreaker (criterion 7) for 2026, which
// replaced the historical "drawing of lots". Lower number = better ranked.
export const TEAM_RANKING: Record<string, number> = {
  Argentina: 1, Spain: 2, France: 3, England: 4, Portugal: 5,
  Brazil: 6, Morocco: 7, Netherlands: 8, Belgium: 9, Germany: 10,
  Croatia: 11, Colombia: 13, Mexico: 14, Senegal: 15, Uruguay: 16,
  "United States": 17, Japan: 18, Switzerland: 19, Iran: 20, Turkey: 22,
  Ecuador: 23, Austria: 24, "South Korea": 25, Australia: 27, Algeria: 28,
  Egypt: 29, Canada: 30, Norway: 31, "Ivory Coast": 33, Panama: 34,
  Sweden: 38, "Czech Republic": 40, Paraguay: 41, Scotland: 42, Tunisia: 45,
  "DR Congo": 46, Uzbekistan: 50, Qatar: 56, Iraq: 57, "South Africa": 60,
  "Saudi Arabia": 61, Jordan: 63, "Bosnia and Herzegovina": 64, "Cape Verde": 67,
  Ghana: 73, "Curaçao": 82, Haiti: 83, "New Zealand": 85,
};

/** FIFA world-ranking position for a team (999 if unknown, so it sorts last). */
export const rankingOf = (team: string): number => TEAM_RANKING[team] ?? 999;

type Raw = [
  group: string,
  n: number,
  date: string,
  home: string,
  away: string,
  hs: number | null,
  as: number | null,
];

const RAW: Raw[] = [
  // Group A
  ["A", 1, "2026-06-11", "Mexico", "South Africa", 2, 0],
  ["A", 2, "2026-06-11", "South Korea", "Czech Republic", 2, 1],
  ["A", 3, "2026-06-18", "Czech Republic", "South Africa", 1, 1],
  ["A", 4, "2026-06-18", "Mexico", "South Korea", 1, 0],
  ["A", 5, "2026-06-24", "South Africa", "South Korea", null, null],
  ["A", 6, "2026-06-24", "Czech Republic", "Mexico", null, null],
  // Group B
  ["B", 7, "2026-06-12", "Canada", "Bosnia and Herzegovina", 1, 1],
  ["B", 8, "2026-06-13", "Qatar", "Switzerland", 1, 1],
  ["B", 9, "2026-06-18", "Switzerland", "Bosnia and Herzegovina", 4, 1],
  ["B", 10, "2026-06-18", "Canada", "Qatar", 6, 0],
  ["B", 11, "2026-06-24", "Switzerland", "Canada", 2, 1],
  ["B", 12, "2026-06-24", "Bosnia and Herzegovina", "Qatar", 3, 1],
  // Group C
  ["C", 13, "2026-06-13", "Brazil", "Morocco", 1, 1],
  ["C", 14, "2026-06-13", "Scotland", "Haiti", 1, 0],
  ["C", 15, "2026-06-19", "Scotland", "Morocco", 0, 1],
  ["C", 16, "2026-06-19", "Brazil", "Haiti", 3, 0],
  ["C", 17, "2026-06-24", "Morocco", "Haiti", null, null],
  ["C", 18, "2026-06-24", "Scotland", "Brazil", null, null],
  // Group D
  ["D", 19, "2026-06-12", "United States", "Paraguay", 4, 1],
  ["D", 20, "2026-06-13", "Australia", "Turkey", 2, 0],
  ["D", 21, "2026-06-19", "United States", "Australia", 2, 0],
  ["D", 22, "2026-06-19", "Turkey", "Paraguay", 0, 1],
  ["D", 23, "2026-06-25", "Turkey", "United States", null, null],
  ["D", 24, "2026-06-25", "Paraguay", "Australia", null, null],
  // Group E
  ["E", 25, "2026-06-14", "Germany", "Curaçao", 7, 1],
  ["E", 26, "2026-06-14", "Ivory Coast", "Ecuador", 1, 0],
  ["E", 27, "2026-06-20", "Germany", "Ivory Coast", 2, 1],
  ["E", 28, "2026-06-20", "Ecuador", "Curaçao", 0, 0],
  ["E", 29, "2026-06-25", "Curaçao", "Ivory Coast", null, null],
  ["E", 30, "2026-06-25", "Ecuador", "Germany", null, null],
  // Group F
  ["F", 31, "2026-06-14", "Netherlands", "Japan", 2, 2],
  ["F", 32, "2026-06-15", "Sweden", "Tunisia", 5, 1],
  ["F", 33, "2026-06-20", "Netherlands", "Sweden", 5, 1],
  ["F", 34, "2026-06-21", "Tunisia", "Japan", 0, 4],
  ["F", 35, "2026-06-25", "Tunisia", "Netherlands", null, null],
  ["F", 36, "2026-06-25", "Japan", "Sweden", null, null],
  // Group G
  ["G", 37, "2026-06-15", "Belgium", "Egypt", 1, 1],
  ["G", 38, "2026-06-16", "Iran", "New Zealand", 2, 2],
  ["G", 39, "2026-06-21", "Belgium", "Iran", 0, 0],
  ["G", 40, "2026-06-21", "New Zealand", "Egypt", 1, 3],
  ["G", 41, "2026-06-26", "New Zealand", "Belgium", null, null],
  ["G", 42, "2026-06-26", "Egypt", "Iran", null, null],
  // Group H
  ["H", 43, "2026-06-15", "Spain", "Cape Verde", 0, 0],
  ["H", 44, "2026-06-15", "Saudi Arabia", "Uruguay", 1, 1],
  ["H", 45, "2026-06-21", "Spain", "Saudi Arabia", 4, 0],
  ["H", 46, "2026-06-21", "Uruguay", "Cape Verde", 2, 2],
  ["H", 47, "2026-06-26", "Cape Verde", "Saudi Arabia", null, null],
  ["H", 48, "2026-06-26", "Uruguay", "Spain", null, null],
  // Group I
  ["I", 49, "2026-06-16", "France", "Senegal", 3, 1],
  ["I", 50, "2026-06-16", "Iraq", "Norway", 1, 4],
  ["I", 51, "2026-06-22", "France", "Iraq", 3, 0],
  ["I", 52, "2026-06-22", "Norway", "Senegal", 3, 2],
  ["I", 53, "2026-06-26", "Norway", "France", null, null],
  ["I", 54, "2026-06-26", "Senegal", "Iraq", null, null],
  // Group J
  ["J", 55, "2026-06-16", "Argentina", "Algeria", 3, 0],
  ["J", 56, "2026-06-16", "Austria", "Jordan", 3, 1],
  ["J", 57, "2026-06-22", "Argentina", "Austria", 2, 0],
  ["J", 58, "2026-06-22", "Jordan", "Algeria", 1, 2],
  ["J", 59, "2026-06-27", "Algeria", "Austria", null, null],
  ["J", 60, "2026-06-27", "Jordan", "Argentina", null, null],
  // Group K
  ["K", 61, "2026-06-17", "Portugal", "DR Congo", 1, 1],
  ["K", 62, "2026-06-17", "Uzbekistan", "Colombia", 1, 3],
  ["K", 63, "2026-06-23", "Portugal", "Uzbekistan", 5, 0],
  ["K", 64, "2026-06-23", "Colombia", "DR Congo", 1, 0],
  ["K", 65, "2026-06-27", "Colombia", "Portugal", null, null],
  ["K", 66, "2026-06-27", "DR Congo", "Uzbekistan", null, null],
  // Group L
  ["L", 67, "2026-06-17", "England", "Croatia", 4, 2],
  ["L", 68, "2026-06-18", "Ghana", "Panama", 1, 0],
  ["L", 69, "2026-06-23", "England", "Ghana", 0, 0],
  ["L", 70, "2026-06-23", "Panama", "Croatia", 0, 1],
  ["L", 71, "2026-06-27", "Panama", "England", null, null],
  ["L", 72, "2026-06-27", "Croatia", "Ghana", null, null],
];

// Illustrative disciplinary data for the FIFA fair-play tiebreaker (criterion 6).
// Shorthand per played match: [homeYellow, homeRed, awayYellow, awayRed].
// This is a PARTIAL, illustrative sample — not a complete official card record —
// just enough to exercise the conduct-score tiebreaker. Matches not listed are
// treated as card-free. (secondYellow / yellow+red cases default to 0 here.)
type CardShorthand = [hy: number, hr: number, ay: number, ar: number];
const CARDS: Record<string, CardShorthand> = {
  // Group A
  M1: [2, 0, 3, 0], M2: [1, 0, 2, 0], M3: [3, 1, 2, 0], M4: [2, 0, 4, 0],
  // Group B
  M7: [1, 0, 1, 0], M9: [2, 0, 3, 1], M10: [0, 0, 3, 0], M11: [3, 0, 2, 0], M12: [2, 0, 2, 0],
  // Group C
  M13: [1, 0, 2, 0], M15: [2, 0, 1, 0], M16: [1, 0, 3, 1],
  // Group D
  M19: [2, 0, 2, 0], M21: [1, 0, 3, 0], M22: [4, 1, 2, 0],
  // Group E
  M25: [0, 0, 2, 0], M27: [2, 0, 3, 0], M28: [3, 0, 3, 1],
  // Group F
  M31: [2, 0, 1, 0], M33: [1, 0, 2, 0], M34: [3, 1, 1, 0],
  // Group G
  M37: [2, 0, 2, 0], M39: [3, 0, 4, 1], M40: [2, 0, 2, 0],
  // Group H
  M43: [3, 0, 3, 0], M45: [1, 0, 2, 0], M46: [2, 0, 2, 0],
  // Group I
  M49: [1, 0, 2, 0], M51: [2, 0, 3, 1], M52: [3, 0, 2, 0],
  // Group J
  M55: [2, 1, 3, 0], M57: [1, 0, 2, 0], M58: [3, 0, 3, 0],
  // Group K
  M61: [2, 0, 2, 0], M63: [1, 0, 3, 0], M64: [2, 0, 2, 1],
  // Group L
  M67: [3, 0, 4, 0], M69: [2, 1, 2, 0], M70: [3, 0, 2, 0],
};

function cardsFrom(
  s: CardShorthand | undefined,
  side: "home" | "away",
): CardCounts | undefined {
  if (!s) return undefined;
  const yellow = side === "home" ? s[0] : s[2];
  const directRed = side === "home" ? s[1] : s[3];
  if (!yellow && !directRed) return undefined;
  return { yellow, secondYellow: 0, directRed, yellowAndRed: 0 };
}

export const FIXTURES: Fixture[] = RAW.map(([group, n, date, home, away, hs, as]) => ({
  id: `M${n}`,
  group,
  matchNumber: n,
  date,
  home,
  away,
  homeScore: hs,
  awayScore: as,
  status: hs != null && as != null ? "played" : "scheduled",
  homeCards: cardsFrom(CARDS[`M${n}`], "home"),
  awayCards: cardsFrom(CARDS[`M${n}`], "away"),
}));

// ---- Knockout bracket template (official 2026 structure, matches 73–104) -------

export const BRACKET: BracketMatch[] = [
  // Round of 32
  { id: "73", round: "R32", home: { kind: "runnerUp", group: "A" }, away: { kind: "runnerUp", group: "B" } },
  { id: "74", round: "R32", home: { kind: "winner", group: "E" }, away: { kind: "third", groups: ["A", "B", "C", "D", "F"] } },
  { id: "75", round: "R32", home: { kind: "winner", group: "F" }, away: { kind: "runnerUp", group: "C" } },
  { id: "76", round: "R32", home: { kind: "winner", group: "C" }, away: { kind: "runnerUp", group: "F" } },
  { id: "77", round: "R32", home: { kind: "winner", group: "I" }, away: { kind: "third", groups: ["C", "D", "F", "G", "H"] } },
  { id: "78", round: "R32", home: { kind: "runnerUp", group: "E" }, away: { kind: "runnerUp", group: "I" } },
  { id: "79", round: "R32", home: { kind: "winner", group: "A" }, away: { kind: "third", groups: ["C", "E", "F", "H", "I"] } },
  { id: "80", round: "R32", home: { kind: "winner", group: "L" }, away: { kind: "third", groups: ["E", "H", "I", "J", "K"] } },
  { id: "81", round: "R32", home: { kind: "winner", group: "D" }, away: { kind: "third", groups: ["B", "E", "F", "I", "J"] } },
  { id: "82", round: "R32", home: { kind: "winner", group: "G" }, away: { kind: "third", groups: ["A", "E", "H", "I", "J"] } },
  { id: "83", round: "R32", home: { kind: "runnerUp", group: "K" }, away: { kind: "runnerUp", group: "L" } },
  { id: "84", round: "R32", home: { kind: "winner", group: "H" }, away: { kind: "runnerUp", group: "J" } },
  { id: "85", round: "R32", home: { kind: "winner", group: "B" }, away: { kind: "third", groups: ["E", "F", "G", "I", "J"] } },
  { id: "86", round: "R32", home: { kind: "winner", group: "J" }, away: { kind: "runnerUp", group: "H" } },
  { id: "87", round: "R32", home: { kind: "winner", group: "K" }, away: { kind: "third", groups: ["D", "E", "I", "J", "L"] } },
  { id: "88", round: "R32", home: { kind: "runnerUp", group: "D" }, away: { kind: "runnerUp", group: "G" } },

  // Round of 16
  { id: "89", round: "R16", home: { kind: "matchWinner", match: "74" }, away: { kind: "matchWinner", match: "77" } },
  { id: "90", round: "R16", home: { kind: "matchWinner", match: "73" }, away: { kind: "matchWinner", match: "75" } },
  { id: "91", round: "R16", home: { kind: "matchWinner", match: "76" }, away: { kind: "matchWinner", match: "78" } },
  { id: "92", round: "R16", home: { kind: "matchWinner", match: "79" }, away: { kind: "matchWinner", match: "80" } },
  { id: "93", round: "R16", home: { kind: "matchWinner", match: "83" }, away: { kind: "matchWinner", match: "84" } },
  { id: "94", round: "R16", home: { kind: "matchWinner", match: "81" }, away: { kind: "matchWinner", match: "82" } },
  { id: "95", round: "R16", home: { kind: "matchWinner", match: "86" }, away: { kind: "matchWinner", match: "88" } },
  { id: "96", round: "R16", home: { kind: "matchWinner", match: "85" }, away: { kind: "matchWinner", match: "87" } },

  // Quarter-finals
  { id: "97", round: "QF", home: { kind: "matchWinner", match: "89" }, away: { kind: "matchWinner", match: "90" } },
  { id: "98", round: "QF", home: { kind: "matchWinner", match: "93" }, away: { kind: "matchWinner", match: "94" } },
  { id: "99", round: "QF", home: { kind: "matchWinner", match: "91" }, away: { kind: "matchWinner", match: "92" } },
  { id: "100", round: "QF", home: { kind: "matchWinner", match: "95" }, away: { kind: "matchWinner", match: "96" } },

  // Semi-finals
  { id: "101", round: "SF", home: { kind: "matchWinner", match: "97" }, away: { kind: "matchWinner", match: "98" } },
  { id: "102", round: "SF", home: { kind: "matchWinner", match: "99" }, away: { kind: "matchWinner", match: "100" } },

  // Third-place play-off & Final
  { id: "103", round: "TP", home: { kind: "matchLoser", match: "101" }, away: { kind: "matchLoser", match: "102" } },
  { id: "104", round: "F", home: { kind: "matchWinner", match: "101" }, away: { kind: "matchWinner", match: "102" } },
];
