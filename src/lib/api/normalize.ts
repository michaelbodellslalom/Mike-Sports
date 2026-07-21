import type { Game, GameStatus, LeagueCode, NewsItem } from "@/types/domain";

type TheSportsDbEvent = {
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
};

type NewsApiArticle = {
  title: string;
  url: string;
  publishedAt: string;
  urlToImage?: string | null;
  source: { name: string };
};

function mapLeague(leagueName: string): LeagueCode {
  const lower = leagueName.toLowerCase();
  if (lower.includes("nfl")) return "NFL";
  if (lower.includes("nba")) return "NBA";
  if (lower.includes("mlb")) return "MLB";
  if (lower.includes("nhl")) return "NHL";
  if (lower.includes("ncaa football") || lower.includes("college football")) return "NCAAF";
  if (lower.includes("ncaa basketball") || lower.includes("college basketball")) return "NCAAB";
  if (lower.includes("pga") || lower.includes("golf")) return "PGA";
  if (lower.includes("ufc") || lower.includes("mma")) return "UFC";
  return "NFL";
}

function mapStatus(raw: string | undefined): GameStatus {
  const value = (raw ?? "").toLowerCase();
  if (value.includes("live") || value.includes("in progress")) return "live";
  if (value.includes("ft") || value.includes("final")) return "final";
  return "scheduled";
}

export function normalizeSportsDbEvents(events: TheSportsDbEvent[]): Game[] {
  return events.map((event) => {
    const time = event.strTime ? `${event.strTime}Z` : "00:00:00Z";
    return {
      id: event.idEvent,
      league: mapLeague(event.strLeague),
      startTimeIso: `${event.dateEvent}T${time}`,
      status: mapStatus(event.strStatus),
      homeTeam: event.strHomeTeam,
      awayTeam: event.strAwayTeam,
      homeScore: event.intHomeScore ? Number(event.intHomeScore) : undefined,
      awayScore: event.intAwayScore ? Number(event.intAwayScore) : undefined,
      venue: event.strVenue,
    };
  });
}

export function normalizeNewsApiArticles(
  articles: NewsApiArticle[],
  league?: LeagueCode,
): NewsItem[] {
  return articles.map((article, index) => ({
    id: `${article.url}-${index}`,
    title: article.title,
    source: article.source.name,
    publishedAtIso: article.publishedAt,
    url: article.url,
    imageUrl: article.urlToImage ?? undefined,
    relatedLeague: league,
  }));
}
