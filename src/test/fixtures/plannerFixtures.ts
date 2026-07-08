import type { Game } from "@/types/domain";

const base = new Date("2026-07-10T18:00:00Z").getTime();

function hoursFromBase(hours: number): string {
  return new Date(base + hours * 60 * 60 * 1000).toISOString();
}

export const fixtureFavorites = ["Minnesota Vikings", "UFC"];

export const fixtureGames: Game[] = [
  {
    id: "fav-live",
    league: "NFL",
    startTimeIso: hoursFromBase(0),
    status: "live",
    homeTeam: "Minnesota Vikings",
    awayTeam: "Green Bay Packers",
  },
  {
    id: "fav-next",
    league: "NFL",
    startTimeIso: hoursFromBase(2),
    status: "scheduled",
    homeTeam: "Minnesota Vikings",
    awayTeam: "Chicago Bears",
  },
  {
    id: "ufc-card",
    league: "UFC",
    startTimeIso: hoursFromBase(3),
    status: "scheduled",
    homeTeam: "Main Card",
    awayTeam: "Featured Fight",
  },
  {
    id: "nba-feature",
    league: "NBA",
    startTimeIso: hoursFromBase(4),
    status: "scheduled",
    homeTeam: "Lakers",
    awayTeam: "Celtics",
  },
  {
    id: "nhl-overlap",
    league: "NHL",
    startTimeIso: hoursFromBase(4.25),
    status: "scheduled",
    homeTeam: "Wild",
    awayTeam: "Avalanche",
  },
  {
    id: "pga-evening",
    league: "PGA",
    startTimeIso: hoursFromBase(6),
    status: "scheduled",
    homeTeam: "Round",
    awayTeam: "Featured Group",
  },
];

export const expectedRecommendationTopId = "ufc-card";
export const expectedPlanFavoritePrefix = ["fav-live", "fav-next", "ufc-card"];
