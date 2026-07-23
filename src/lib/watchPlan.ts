import { buildRecommendations } from "@/lib/recommendations";
import type { Game, WatchPlanEntry } from "@/types/domain";

function containsFavorite(game: Game, favorites: string[]): boolean {
  const text = `${game.homeTeam} ${game.awayTeam}`.toLowerCase();
  return favorites.some((favorite) => text.includes(favorite.toLowerCase()));
}

function startMs(game: Game): number {
  return new Date(game.startTimeIso).getTime();
}

function sortByTimeWithLiveFirst(a: Game, b: Game): number {
  if (a.status === "live" && b.status !== "live") return -1;
  if (b.status === "live" && a.status !== "live") return 1;
  return startMs(a) - startMs(b);
}

function overlapPenalty(game: Game, selected: Game[]): number {
  const current = startMs(game);
  return selected.reduce((sum, item) => {
    const delta = Math.abs(startMs(item) - current);
    return delta <= 45 * 60 * 1000 ? sum + 1 : sum;
  }, 0);
}

export function buildDailyWatchPlan(games: Game[], favorites: string[], limit = 8): WatchPlanEntry[] {
  const relevant = games.filter((game) => game.status !== "final");

  const favoriteGames = relevant
    .filter((game) => containsFavorite(game, favorites) || favorites.some((fav) => fav.toLowerCase() === game.league.toLowerCase()))
    .sort(sortByTimeWithLiveFirst);

  const nonFavoriteGames = relevant.filter((game) => !favoriteGames.some((fav) => fav.id === game.id));

  const recommendationMap = new Map(
    buildRecommendations(nonFavoriteGames, favorites).map((item) => [item.gameId, item]),
  );

  const nonFavoriteSorted = [...nonFavoriteGames].sort((a, b) => {
    const aScore = recommendationMap.get(a.id)?.score ?? 0;
    const bScore = recommendationMap.get(b.id)?.score ?? 0;
    if (aScore !== bScore) return bScore - aScore;
    return sortByTimeWithLiveFirst(a, b);
  });

  const selected: Game[] = [];

  for (const game of favoriteGames) {
    if (selected.length >= limit) break;
    selected.push(game);
  }

  for (const game of nonFavoriteSorted) {
    if (selected.length >= limit) break;
    const penalty = overlapPenalty(game, selected);
    if (penalty > 1) {
      continue;
    }
    selected.push(game);
  }

  return selected.map((game, index) => {
    const recommendation = recommendationMap.get(game.id);
    const isFavorite = favoriteGames.some((item) => item.id === game.id);

    return {
      gameId: game.id,
      rank: index + 1,
      plannedStartIso: game.startTimeIso,
      reason: isFavorite
        ? "Favorited team or league."
        : recommendation?.reason ?? "Selected to improve variety and reduce overlap.",
    };
  });
}
