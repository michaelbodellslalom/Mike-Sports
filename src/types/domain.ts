export type LeagueCode =
  | "NFL"
  | "NBA"
  | "MLB"
  | "NHL"
  | "NCAAF"
  | "NCAAB"
  | "PGA"
  | "UFC";

export type Team = {
  id: string;
  name: string;
  league: LeagueCode;
  logoUrl?: string;
};

export type GameStatus = "scheduled" | "live" | "final";

export type Game = {
  id: string;
  league: LeagueCode;
  startTimeIso: string;
  status: GameStatus;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  periodLabel?: string;
  clock?: string;
  venue?: string;
};

export type NewsItem = {
  id: string;
  title: string;
  source: string;
  publishedAtIso: string;
  url: string;
  imageUrl?: string;
  relatedLeague?: LeagueCode;
  relatedTeam?: string;
};

export type WatchOption = {
  gameId: string;
  network?: string;
  streamingService?: string;
  notes?: string;
};

export type TicketOption = {
  gameId: string;
  provider: string;
  url: string;
  city?: string;
  state?: string;
};

export type Recommendation = {
  gameId: string;
  reason: string;
  score: number;
};

export type WatchPlanEntry = {
  gameId: string;
  rank: number;
  plannedStartIso: string;
  reason: string;
};
