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

function reasonLabel(game: Game, favorites: string[]): string {
  if (game.status === "live") {
    return `Because this ${game.league} matchup is live right now.`;
  }

  if (isFavoriteGame(game, favorites)) {
    return "Because it is directly connected to your selected favorites.";
  }

  if (game.league === "UFC") {
    return "Because UFC events are high-impact cards that fit your selected interests.";
  }

  if (game.league === "PGA") {
    return "Because this PGA event extends your watch options beyond team-based games.";
  }

  return `Because this ${game.league} game is a strong non-favorite option in your schedule window.`;
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
      reason: reasonLabel(game, favorites),
    };
  });

  return scored.sort((a, b) => b.score - a.score);
}
