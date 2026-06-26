import type { BracketMatch, Fixture, Group } from "./types";

// Data cross-verified across Wikipedia, ESPN, Yahoo Sports and Sky Sports.
// Group stage runs 11–27 June 2026; matchdays 1 & 2 are real results, later
// matches (24 June onward at time of capture) are scheduled with no score yet.
export const AS_OF = "26 June 2026 — Groups A–F complete";

export const DATA_NOTE =
  "Group + match data cross-verified across Wikipedia, ESPN, Yahoo & Sky Sports. " +
  "Matchdays 1–2 are real results; later matches are scheduled — predict them yourself. " +
  "Third-placed slotting in the bracket approximates FIFA's official allocation table.";

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
  ["A", 5, "2026-06-24", "South Africa", "South Korea", 1, 0],
  ["A", 6, "2026-06-24", "Czech Republic", "Mexico", 0, 3],
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
  ["C", 17, "2026-06-24", "Morocco", "Haiti", 4, 2],
  ["C", 18, "2026-06-24", "Scotland", "Brazil", 0, 3],
  // Group D
  ["D", 19, "2026-06-12", "United States", "Paraguay", 4, 1],
  ["D", 20, "2026-06-13", "Australia", "Turkey", 2, 0],
  ["D", 21, "2026-06-19", "United States", "Australia", 2, 0],
  ["D", 22, "2026-06-19", "Turkey", "Paraguay", 0, 1],
  ["D", 23, "2026-06-25", "Turkey", "United States", 3, 2],
  ["D", 24, "2026-06-25", "Paraguay", "Australia", 0, 0],
  // Group E
  ["E", 25, "2026-06-14", "Germany", "Curaçao", 7, 1],
  ["E", 26, "2026-06-14", "Ivory Coast", "Ecuador", 1, 0],
  ["E", 27, "2026-06-20", "Germany", "Ivory Coast", 2, 1],
  ["E", 28, "2026-06-20", "Ecuador", "Curaçao", 0, 0],
  ["E", 29, "2026-06-25", "Curaçao", "Ivory Coast", 0, 2],
  ["E", 30, "2026-06-25", "Ecuador", "Germany", 2, 1],
  // Group F
  ["F", 31, "2026-06-14", "Netherlands", "Japan", 2, 2],
  ["F", 32, "2026-06-15", "Sweden", "Tunisia", 5, 1],
  ["F", 33, "2026-06-20", "Netherlands", "Sweden", 5, 1],
  ["F", 34, "2026-06-21", "Tunisia", "Japan", 0, 4],
  ["F", 35, "2026-06-25", "Tunisia", "Netherlands", 1, 3],
  ["F", 36, "2026-06-25", "Japan", "Sweden", 1, 1],
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
