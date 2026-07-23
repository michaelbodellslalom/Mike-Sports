import type { Game, NewsItem, Recommendation, TicketOption, WatchOption, WatchPlanEntry } from "@/types/domain";

function isoFromNow(hoursFromNow: number): string {
  return new Date(Date.now() + hoursFromNow * 60 * 60 * 1000).toISOString();
}

export const fallbackGamesByLeague: Record<string, Game[]> = {
  NFL: [
    {
      id: "fallback-nfl-1",
      league: "NFL",
      startTimeIso: isoFromNow(-1),
      status: "live",
      homeTeam: "Minnesota Vikings",
      awayTeam: "Green Bay Packers",
      homeScore: 24,
      awayScore: 20,
      periodLabel: "3rd Quarter",
      clock: "8:42",
      venue: "U.S. Bank Stadium",
    },
    {
      id: "fallback-nfl-2",
      league: "NFL",
      startTimeIso: isoFromNow(-4),
      status: "final",
      homeTeam: "Buffalo Bills",
      awayTeam: "Philadelphia Eagles",
      homeScore: 27,
      awayScore: 24,
      venue: "Highmark Stadium",
    },
    {
      id: "fallback-nfl-3",
      league: "NFL",
      startTimeIso: isoFromNow(6),
      status: "scheduled",
      homeTeam: "Chicago Bears",
      awayTeam: "Minnesota Vikings",
      venue: "Soldier Field",
    },
    {
      id: "fallback-nfl-4",
      league: "NFL",
      startTimeIso: isoFromNow(10),
      status: "scheduled",
      homeTeam: "Detroit Lions",
      awayTeam: "Kansas City Chiefs",
      venue: "Ford Field",
    },
  ],
  MLB: [
    {
      id: "fallback-mlb-1",
      league: "MLB",
      startTimeIso: isoFromNow(-3),
      status: "final",
      homeTeam: "Boston Red Sox",
      awayTeam: "New York Yankees",
      homeScore: 5,
      awayScore: 3,
      venue: "Fenway Park",
    },
    {
      id: "fallback-mlb-2",
      league: "MLB",
      startTimeIso: isoFromNow(3),
      status: "scheduled",
      homeTeam: "Minnesota Twins",
      awayTeam: "Cleveland Guardians",
      venue: "Target Field",
    },
    {
      id: "fallback-mlb-3",
      league: "MLB",
      startTimeIso: isoFromNow(4.5),
      status: "scheduled",
      homeTeam: "Los Angeles Dodgers",
      awayTeam: "Atlanta Braves",
      venue: "Dodger Stadium",
    },
    {
      id: "fallback-mlb-4",
      league: "MLB",
      startTimeIso: isoFromNow(5),
      status: "scheduled",
      homeTeam: "New York Yankees",
      awayTeam: "Boston Red Sox",
      venue: "Yankee Stadium",
    },
  ],
  NHL: [
    {
      id: "fallback-nhl-1",
      league: "NHL",
      startTimeIso: isoFromNow(-2),
      status: "final",
      homeTeam: "Colorado Avalanche",
      awayTeam: "Minnesota Wild",
      homeScore: 4,
      awayScore: 2,
      venue: "Ball Arena",
    },
    {
      id: "fallback-nhl-2",
      league: "NHL",
      startTimeIso: isoFromNow(7),
      status: "scheduled",
      homeTeam: "Minnesota Wild",
      awayTeam: "Colorado Avalanche",
      venue: "Xcel Energy Center",
    },
  ],
  NBA: [
    {
      id: "fallback-nba-1",
      league: "NBA",
      startTimeIso: isoFromNow(2.5),
      status: "scheduled",
      homeTeam: "Minnesota Timberwolves",
      awayTeam: "Denver Nuggets",
      venue: "Target Center",
    },
    {
      id: "fallback-nba-2",
      league: "NBA",
      startTimeIso: isoFromNow(6.5),
      status: "scheduled",
      homeTeam: "Los Angeles Lakers",
      awayTeam: "Boston Celtics",
      venue: "Crypto.com Arena",
    },
  ],
  NCAAF: [
    {
      id: "fallback-ncaaf-1",
      league: "NCAAF",
      startTimeIso: isoFromNow(20),
      status: "scheduled",
      homeTeam: "University of Minnesota",
      awayTeam: "Iowa",
      venue: "Huntington Bank Stadium",
    },
  ],
  NCAAB: [
    {
      id: "fallback-ncaab-1",
      league: "NCAAB",
      startTimeIso: isoFromNow(22),
      status: "scheduled",
      homeTeam: "University of Minnesota",
      awayTeam: "Wisconsin",
      venue: "Williams Arena",
    },
  ],
  PGA: [
    {
      id: "fallback-pga-1",
      league: "PGA",
      startTimeIso: isoFromNow(8),
      status: "scheduled",
      homeTeam: "Round 1",
      awayTeam: "Featured Group",
      venue: "TPC Sawgrass",
    },
  ],
  UFC: [
    {
      id: "fallback-ufc-1",
      league: "UFC",
      startTimeIso: isoFromNow(26),
      status: "scheduled",
      homeTeam: "Main Card",
      awayTeam: "Title Fight",
      venue: "T-Mobile Arena",
    },
  ],
};

export const fallbackNewsByLeague: Record<string, NewsItem[]> = {
  NFL: [
    {
      id: "news-1",
      title: "Vikings lean into explosive play-action packages during camp installs",
      source: "Mike Sports Wire",
      publishedAtIso: "2026-07-08T13:00:00Z",
      url: "/news/vikings-camp",
      relatedLeague: "NFL",
      relatedTeam: "Minnesota Vikings",
    },
    {
      id: "news-2",
      title: "NFC North watch: why divisional tiebreakers could matter by Week 10",
      source: "North Notes",
      publishedAtIso: "2026-07-08T11:00:00Z",
      url: "/news/nfc-north-watch",
      relatedLeague: "NFL",
    },
  ],
  NBA: [
    {
      id: "news-3",
      title: "Timberwolves rotation battle could reshape late-game closing lineups",
      source: "Hoops Daily",
      publishedAtIso: "2026-07-08T12:30:00Z",
      url: "/news/wolves-rotation",
      relatedLeague: "NBA",
      relatedTeam: "Minnesota Timberwolves",
    },
    {
      id: "news-3b",
      title: "Western Conference outlook: matchups that could shape Minnesota's next stretch",
      source: "Mike Sports Preview",
      publishedAtIso: isoFromNow(-3),
      url: "/news/nba-west-preview",
      relatedLeague: "NBA",
      relatedTeam: "Minnesota Timberwolves",
    },
  ],
  MLB: [
    {
      id: "news-4",
      title: "Twins offense trending up as hard-hit rate climbs over last two series",
      source: "Diamond Report",
      publishedAtIso: isoFromNow(-2),
      url: "/news/twins-offense",
      relatedLeague: "MLB",
      relatedTeam: "Minnesota Twins",
    },
    {
      id: "news-4b",
      title: "Twins bullpen usage map: late-inning leverage options for tonight's game",
      source: "AL Central Brief",
      publishedAtIso: isoFromNow(-4),
      url: "/news/twins-bullpen",
      relatedLeague: "MLB",
      relatedTeam: "Minnesota Twins",
    },
    {
      id: "news-4c",
      title: "MLB slate preview: three series with major playoff seeding impact",
      source: "Diamond Report",
      publishedAtIso: isoFromNow(-6),
      url: "/news/mlb-slate-preview",
      relatedLeague: "MLB",
    },
  ],
  NHL: [
    {
      id: "news-5",
      title: "Wild blue-line depth looks stronger heading into the road-heavy stretch",
      source: "Rink Bulletin",
      publishedAtIso: "2026-07-08T10:30:00Z",
      url: "/news/wild-depth",
      relatedLeague: "NHL",
      relatedTeam: "Minnesota Wild",
    },
    {
      id: "news-5b",
      title: "Three special-teams trends to watch in the Wild's upcoming games",
      source: "Mike Sports Preview",
      publishedAtIso: isoFromNow(-5),
      url: "/news/wild-special-teams",
      relatedLeague: "NHL",
      relatedTeam: "Minnesota Wild",
    },
  ],
  NCAAF: [
    {
      id: "news-6",
      title: "Minnesota football identifies red-zone efficiency as fall camp priority",
      source: "Campus Gameday",
      publishedAtIso: "2026-07-08T08:15:00Z",
      url: "/news/gophers-football",
      relatedLeague: "NCAAF",
      relatedTeam: "University of Minnesota football",
    },
    {
      id: "news-6b",
      title: "Gophers position groups to follow as the next kickoff approaches",
      source: "Mike Sports Preview",
      publishedAtIso: isoFromNow(-7),
      url: "/news/gophers-football-preview",
      relatedLeague: "NCAAF",
      relatedTeam: "University of Minnesota football",
    },
  ],
  NCAAB: [
    {
      id: "news-7",
      title: "Gophers basketball backcourt depth will decide early-season ceiling",
      source: "Campus Hardwood",
      publishedAtIso: "2026-07-08T07:50:00Z",
      url: "/news/gophers-basketball",
      relatedLeague: "NCAAB",
      relatedTeam: "University of Minnesota basketball",
    },
    {
      id: "news-7b",
      title: "Minnesota's frontcourt combinations offer several paths to a balanced rotation",
      source: "Mike Sports Preview",
      publishedAtIso: isoFromNow(-8),
      url: "/news/gophers-basketball-preview",
      relatedLeague: "NCAAB",
      relatedTeam: "University of Minnesota basketball",
    },
  ],
  PGA: [
    {
      id: "news-8",
      title: "Three featured groups worth tracking before the leaderboard starts to separate",
      source: "Tour Lens",
      publishedAtIso: "2026-07-08T06:45:00Z",
      url: "/news/pga-featured-groups",
      relatedLeague: "PGA",
    },
    {
      id: "news-8b",
      title: "Course setup preview: the holes most likely to influence this week's finish",
      source: "Mike Sports Preview",
      publishedAtIso: isoFromNow(-9),
      url: "/news/pga-course-preview",
      relatedLeague: "PGA",
    },
  ],
  UFC: [
    {
      id: "news-9",
      title: "Main-event pacing and grappling paths to watch on this weekend's card",
      source: "Fight View",
      publishedAtIso: "2026-07-08T05:30:00Z",
      url: "/news/ufc-main-event",
      relatedLeague: "UFC",
    },
    {
      id: "news-9b",
      title: "Five undercard storylines that could set the tone for fight night",
      source: "Mike Sports Preview",
      publishedAtIso: isoFromNow(-10),
      url: "/news/ufc-undercard-preview",
      relatedLeague: "UFC",
    },
  ],
};

export const fallbackWatchOptions: WatchOption[] = [
  {
    gameId: "fallback-default",
    network: "Fox",
    notes: "Primary national broadcast window",
  },
  {
    gameId: "fallback-default",
    network: "NBC",
    notes: "Secondary national broadcast option",
  },
];

export const fallbackTicketOptions: TicketOption[] = [
  {
    gameId: "fallback-default",
    provider: "Gametime",
    url: "https://gametime.co/",
    city: "80222",
    state: "CO",
  },
  {
    gameId: "fallback-default",
    provider: "StubHub",
    url: "https://www.stubhub.com/",
    city: "80222",
    state: "CO",
  },
];

export const fallbackRecommendations: Recommendation[] = [
  {
    gameId: "fallback-rec-1",
    score: 21,
    reason: "Because this nationally featured matchup gives you a strong non-favorite watch option tonight.",
  },
  {
    gameId: "fallback-rec-2",
    score: 17,
    reason: "Because it fits your preferred leagues and avoids direct overlap with your top favorite game.",
  },
];

export const fallbackWatchPlan: WatchPlanEntry[] = [
  {
    gameId: "fallback-plan-1",
    rank: 1,
    plannedStartIso: "2026-07-08T18:30:00Z",
    reason: "Favorited team or league.",
  },
  {
    gameId: "fallback-plan-2",
    rank: 2,
    plannedStartIso: "2026-07-08T21:00:00Z",
    reason: "High-interest follow-up that adds variety without major overlap.",
  },
  {
    gameId: "fallback-plan-3",
    rank: 3,
    plannedStartIso: "2026-07-09T00:00:00Z",
    reason: "Late-window recommendation chosen to keep your viewing schedule efficient.",
  },
];
