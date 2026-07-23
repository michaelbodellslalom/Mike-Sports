import type { Game, Recommendation } from "@/types/domain";

function favoriteTokens(favorites: string[]): string[] {
  return favorites
    .flatMap((value) => value.toLowerCase().split(/\s+/g))
    .filter((token) => token.length > 2);
}

function gameText(game: Game): string {
  return `${game.homeTeam} ${game.awayTeam}`.toLowerCase();
}

function isFavoriteGame(game: Game, favorites: string[]): boolean {
  const text = gameText(game);
  return favorites.some((favorite) => text.includes(favorite.toLowerCase()));
}

function leagueWeight(game: Game): number {
  const map = {
    NFL: 14,
    NBA: 10,
    MLB: 8,
    NHL: 9,
    NCAAF: 11,
    NCAAB: 9,
    PGA: 7,
    UFC: 12,
  } as const;

  return map[game.league];
}

function temporalFit(game: Game, now = Date.now()): number {
  const startMs = new Date(game.startTimeIso).getTime();
  if (Number.isNaN(startMs)) {
    return 0;
  }

  const deltaHours = (startMs - now) / (1000 * 60 * 60);
  if (deltaHours < -4) {
    return 0;
  }
  if (deltaHours <= 2) {
    return 12;
  }
  if (deltaHours <= 8) {
    return 8;
  }
  if (deltaHours <= 24) {
    return 4;
  }
  return 2;
}

function marqueeSignal(game: Game, favorites: string[]): number {
  let score = 0;
  const text = gameText(game);
  const tokens = favoriteTokens(favorites);

  if (game.status === "live") {
    score += 10;
  }

  if (tokens.some((token) => text.includes(token))) {
    score += 7;
  }

  if (text.includes("vs") || text.includes("at")) {
    score += 2;
  }

  return score;
}

function overlapPenalty(game: Game, games: Game[]): number {
  const start = new Date(game.startTimeIso).getTime();
  if (Number.isNaN(start)) {
    return 0;
  }

  const overlapCount = games.filter((candidate) => {
    if (candidate.id === game.id) {
      return false;
    }
    const value = new Date(candidate.startTimeIso).getTime();
    return Math.abs(value - start) <= 30 * 60 * 1000;
  }).length;

  return overlapCount * 2;
}

function stableVariant(game: Game, optionCount: number): number {
  const value = `${game.id}-${game.awayTeam}-${game.homeTeam}`;
  const hash = Array.from(value).reduce((total, character) => total + character.charCodeAt(0), 0);
  return hash % optionCount;
}

function matchupWindowLabel(game: Game, now = Date.now()): string {
  const startMs = new Date(game.startTimeIso).getTime();
  if (Number.isNaN(startMs)) return "in your current schedule window";

  const deltaHours = (startMs - now) / (1000 * 60 * 60);
  if (deltaHours <= 2) return "coming up soon";
  if (deltaHours <= 8) return "later today";
  if (deltaHours <= 24) return "within the next day";
  return "later in your schedule";
}

function reasonLabel(game: Game, favorites: string[], games: Game[]): string {
  const matchup = `${game.awayTeam} at ${game.homeTeam}`;

  if (game.status === "live") {
    const liveReasons = [
      `${matchup} is already live, making it an easy game to jump into right now.`,
      `Live action gives this ${game.league} matchup extra urgency in your recommendations.`,
      `This game earns a look because the action is underway and the result is still developing.`,
    ];
    return liveReasons[stableVariant(game, liveReasons.length)];
  }

  if (isFavoriteGame(game, favorites)) {
    return `${matchup} connects directly to one of your selected favorites.`;
  }

  if (game.league === "UFC") {
    return "This high-impact fight card adds a different kind of live event to your favorite-driven lineup.";
  }

  if (game.league === "PGA") {
    return "This featured golf window broadens your schedule beyond team matchups without competing with your top picks.";
  }

  const starts = matchupWindowLabel(game);
  const hasNearbyGame = overlapPenalty(game, games) > 0;
  const generalReasons = [
    `${matchup} is a strong ${game.league} option ${starts} that complements your favorite-team slate.`,
    `This ${game.league} matchup adds variety while staying close to the sports and teams you follow.`,
    `${matchup} rates well as an additional watch based on league relevance and start time.`,
    hasNearbyGame
      ? `This matchup overlaps another viewing window, but its league relevance keeps it in consideration.`
      : `The start time fits cleanly around your higher-priority games, making this a useful additional option.`,
  ];

  return generalReasons[stableVariant(game, generalReasons.length)];
}

export function buildRecommendations(games: Game[], favorites: string[]): Recommendation[] {
  const candidates = games.filter((game) => !isFavoriteGame(game, favorites));

  const scored = candidates.map((game) => {
    const score =
      leagueWeight(game) +
      temporalFit(game) +
      marqueeSignal(game, favorites) -
      overlapPenalty(game, candidates);

    return {
      gameId: game.id,
      score,
      reason: reasonLabel(game, favorites, candidates),
    };
  });

  return scored.sort((a, b) => b.score - a.score);
}
