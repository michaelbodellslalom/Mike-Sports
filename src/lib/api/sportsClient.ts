import { getJson } from "@/lib/api/http";
import { env } from "@/lib/env";
import { normalizeSportsDbEvents } from "@/lib/api/normalize";
import type { Game, LeagueCode } from "@/types/domain";

type SportsDbEventsResponse = {
  events: Array<{
    idEvent: string;
    strLeague: string;
    dateEvent: string;
    strTime?: string;
    strStatus?: string;
    strHomeTeam: string;
    strAwayTeam: string;
    intHomeScore?: string;
    intAwayScore?: string;
    strVenue?: string;
  }> | null;
};

const leagueIdByCode: Record<LeagueCode, string | null> = {
  NFL: "4391",
  NBA: "4387",
  MLB: "4424",
  NHL: "4380",
  NCAAF: null,
  NCAAB: null,
  PGA: "4571",
  UFC: "4587",
};

export async function fetchLeagueGames(league: LeagueCode): Promise<Game[]> {
  const leagueId = leagueIdByCode[league];
  if (!leagueId) {
    return [];
  }

  const url = `${env.THESPORTSDB_BASE_URL}/eventsnextleague.php?id=${leagueId}`;
  const data = await getJson<SportsDbEventsResponse>(url, {
    retries: 2,
    timeoutMs: 9000,
    ttlMs: 45_000,
    cacheKey: `sports:${league}`,
    fallbackData: { events: [] },
  });

  return normalizeSportsDbEvents(data.events ?? []);
}
