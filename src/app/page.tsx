"use client";

import { useEffect, useMemo, useState } from "react";

import { GameOfTheDay } from "@/components/dashboard/GameOfTheDay";
import { NewsSection } from "@/components/dashboard/NewsSection";
import { PreferencesSection } from "@/components/dashboard/PreferencesSection";
import { RecommendationsSection } from "@/components/dashboard/RecommendationsSection";
import { ScoresSection } from "@/components/dashboard/ScoresSection";
import { TicketsSection } from "@/components/dashboard/TicketsSection";
import { TodaySchedule } from "@/components/dashboard/TodaySchedule";
import { LoadingState } from "@/components/state/LoadingState";
import { TeamLogo } from "@/components/ui/TeamLogo";
import {
  fallbackGamesByLeague,
  fallbackNewsByLeague,
  fallbackRecommendations,
  fallbackTicketOptions,
  fallbackWatchOptions,
  fallbackWatchPlan,
} from "@/data/fallbackContent";
import { initialFavoriteOptions } from "@/data/favorites";
import { inferLeagueFromFavorite } from "@/lib/favoritesToLeague";
import { isWithinScheduleWindow, type ScheduleWindow } from "@/lib/dateTime";
import { buildRecommendations } from "@/lib/recommendations";
import { buildTicketOptions } from "@/lib/tickets";
import { buildDailyWatchPlan } from "@/lib/watchPlan";
import { usePreferencesStore } from "@/store/preferencesStore";
import type { Game, LeagueCode, NewsItem, Recommendation, WatchOption, WatchPlanEntry } from "@/types/domain";

type SportsApiResponse = {
  league: LeagueCode;
  games: Game[];
};

type NewsApiResponse = {
  items: NewsItem[];
};

type WatchApiResponse = {
  options: WatchOption[];
};

const leagueNewsTerms: Record<LeagueCode, string> = {
  NFL: "NFL",
  NBA: "NBA",
  MLB: "MLB",
  NHL: "NHL",
  NCAAF: "college football",
  NCAAB: "college basketball",
  PGA: "PGA Tour",
  UFC: "UFC",
};

function buildNewsQuery(league: LeagueCode, favorites: string[]): string {
  const teamTerms = favorites
    .filter((favorite) => inferLeagueFromFavorite(favorite) === league)
    .slice(0, 2)
    .join(" OR ");

  return teamTerms.length > 0 ? `${teamTerms} OR ${leagueNewsTerms[league]}` : leagueNewsTerms[league];
}


function isGameToday(gameStartIso: string, now = new Date()): boolean {
  const gameDate = new Date(gameStartIso);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);
  return gameDate >= todayStart && gameDate < tomorrowStart;
}

function getGameHour(gameStartIso: string): number {
  return new Date(gameStartIso).getHours();
}

function spreadGamesInTimeSlots(games: Game[]): Game[] {
  // Target time slots: 11am, 2:30pm, 4:30pm, 7pm, 10pm
  const timeSlots = [11, 14.5, 16.5, 19, 22];
  const assigned = new Set<string>();
  const result: Game[] = [];

  for (const slot of timeSlots) {
    // Find closest unassigned game to this time slot
    let closestGame: Game | null = null;
    let closestDistance = Infinity;

    for (const game of games) {
      if (assigned.has(game.id)) continue;
      const gameHour = getGameHour(game.startTimeIso);
      const distance = Math.abs(gameHour - slot);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestGame = game;
      }
    }

    if (closestGame) {
      result.push(closestGame);
      assigned.add(closestGame.id);
      if (result.length >= 5) break; // Max 5 games
    }
  }

  return result.length > 0 ? result : games.slice(0, 5);
}

export default function Home() {
  const { favorites, favoriteRanks, toggleFavorite, zipCode, setZipCode, moveFavorite } = usePreferencesStore();
  const [games, setGames] = useState<Game[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [watchOptions, setWatchOptions] = useState<WatchOption[]>([]);
  const [isLoadingGames, setIsLoadingGames] = useState(false);
  const [isLoadingNews, setIsLoadingNews] = useState(false);
  const [gameError, setGameError] = useState<string | null>(null);
  const [newsError, setNewsError] = useState<string | null>(null);
  const [geoMessage, setGeoMessage] = useState<string>("Use geolocation to suggest a local ZIP.");
  const [scheduleWindow] = useState<ScheduleWindow>("day");
  const [selectedWatchGameId] = useState<string>("");
  const [showAllFavorites, setShowAllFavorites] = useState(false);
  const [newsPage, setNewsPage] = useState(1);
  const [hasHydratedPreferences, setHasHydratedPreferences] = useState(false);

  useEffect(() => {
    void Promise.resolve(usePreferencesStore.persist.rehydrate()).finally(() => {
      setHasHydratedPreferences(true);
    });
  }, []);

  const favoriteCollageTeams = useMemo(
    () => (favorites.length > 0 ? favorites : initialFavoriteOptions.slice(0, 12)),
    [favorites],
  );
  const collageTiles = useMemo(() => {
    if (favoriteCollageTeams.length === 0) {
      return [] as Array<{
        id: string;
        teamName: string;
        offsetX: number;
        offsetY: number;
        rotate: number;
        scale: number;
        opacity: number;
      }>;
    }

    return Array.from({ length: 144 }, (_, index) => {
      return {
        id: `collage-${index}`,
        teamName: favoriteCollageTeams[index % favoriteCollageTeams.length],
        offsetX: ((index * 13) % 7) - 3,
        offsetY: ((index * 17) % 7) - 3,
        rotate: ((index * 17) % 24) - 12,
        scale: 0.86 + ((index * 11) % 10) / 100,
        opacity: 0.18 + ((index * 5) % 7) / 100,
      };
    });
  }, [favoriteCollageTeams]);
  const favoriteLeagues = useMemo<LeagueCode[]>(() => {
    const leagues = favorites.map((favorite) => inferLeagueFromFavorite(favorite));
    return Array.from(new Set(leagues));
  }, [favorites]);
  const fallbackGames = useMemo(() => {
    const merged = favoriteLeagues.flatMap((league) => fallbackGamesByLeague[league] ?? []);
    return merged.length > 0 ? merged : fallbackGamesByLeague.NFL;
  }, [favoriteLeagues]);
  const fallbackNews = useMemo(() => {
    const merged = favoriteLeagues.flatMap((league) => fallbackNewsByLeague[league] ?? []);
    return merged.length > 0 ? merged : fallbackNewsByLeague.NFL;
  }, [favoriteLeagues]);

  useEffect(() => {
    const abortController = new AbortController();

    async function loadScores() {
      setIsLoadingGames(true);
      setGameError(null);
      try {
        const requests = favoriteLeagues.map(async (league) => {
          const response = await fetch(`/api/sports?league=${league}`, {
            signal: abortController.signal,
          });
          if (!response.ok) {
            throw new Error(`Sports API returned ${response.status} for ${league}`);
          }
          const payload = (await response.json()) as SportsApiResponse;
          return payload.games ?? [];
        });

        const leagueGameArrays = await Promise.all(requests);
        const merged = leagueGameArrays.flat();
        const deduped = Array.from(new Map(merged.map((game) => [game.id, game])).values());
        setGames(deduped);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        setGameError(error instanceof Error ? error.message : "Unable to load scores");
        setGames([]);
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoadingGames(false);
        }
      }
    }

    loadScores();

    return () => {
      abortController.abort();
    };
  }, [favoriteLeagues]);

  useEffect(() => {
    const abortController = new AbortController();

    async function loadNews() {
      setIsLoadingNews(true);
      setNewsError(null);
      try {
        const requests = favoriteLeagues.map(async (league) => {
          const encodedQuery = encodeURIComponent(buildNewsQuery(league, favorites));
          const response = await fetch(`/api/news?q=${encodedQuery}&league=${league}`, {
            signal: abortController.signal,
          });
          if (!response.ok) {
            throw new Error(`News API returned ${response.status} for ${league}`);
          }
          const payload = (await response.json()) as NewsApiResponse;
          return payload.items ?? [];
        });

        const leagueNewsArrays = await Promise.all(requests);
        const merged = leagueNewsArrays.flat();
        const deduped = Array.from(new Map(merged.map((item) => [item.id, item])).values()).sort((a, b) => {
          return new Date(b.publishedAtIso).getTime() - new Date(a.publishedAtIso).getTime();
        });
        setNews(deduped);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        setNewsError(error instanceof Error ? error.message : "Unable to load news");
        setNews([]);
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoadingNews(false);
        }
      }
    }

    loadNews();

    return () => {
      abortController.abort();
    };
  }, [favoriteLeagues, favorites]);

  // Blend real games with fallback games for variety, prioritizing real games
  const displayedGames = useMemo(() => {
    if (games.length > 0) {
      // Mix real games with fallback games for better variety
      return [...games, ...fallbackGames.filter((fg) => !games.some((g) => g.id === fg.id))];
    }
    return fallbackGames;
  }, [fallbackGames, games]);
  const displayedUpcomingGames = useMemo(() => displayedGames.filter((game) => game.status === "scheduled"), [displayedGames]);

  // Today's games only
  const todayGames = useMemo(() => displayedGames.filter((game) => isGameToday(game.startTimeIso)), [displayedGames]);
  const todayLiveGames = useMemo(() => todayGames.filter((game) => game.status === "live"), [todayGames]);
  const todayUpcomingGames = useMemo(() => todayGames.filter((game) => game.status === "scheduled"), [todayGames]);
  const todayCompletedGames = useMemo(() => todayGames.filter((game) => game.status === "final"), [todayGames]);

  // Schedule section: 3-5 games spread throughout the day (prioritize live, then upcoming)
  const scheduledTodayGames = useMemo(() => {
    const rankedGames = spreadGamesInTimeSlots([...todayLiveGames, ...todayUpcomingGames, ...todayCompletedGames]);
    if (rankedGames.length < 2) {
      return rankedGames;
    }

    const firstGame = rankedGames[0];
    const secondGame = rankedGames[1];
    return [
      { ...secondGame, startTimeIso: firstGame.startTimeIso },
      { ...firstGame, startTimeIso: secondGame.startTimeIso },
      ...rankedGames.slice(2),
    ];
  }, [todayLiveGames, todayUpcomingGames, todayCompletedGames]);

  const scheduleGames = useMemo(
    () => displayedUpcomingGames.filter((game) => isWithinScheduleWindow(game.startTimeIso, scheduleWindow)),
    [displayedUpcomingGames, scheduleWindow],
  );
  const watchGameCandidates = useMemo(() => displayedGames.slice(0, 8), [displayedGames]);
  const activeWatchGameId = useMemo(() => {
    if (watchGameCandidates.length === 0) {
      return "";
    }
    if (watchGameCandidates.some((game) => game.id === selectedWatchGameId)) {
      return selectedWatchGameId;
    }
    return watchGameCandidates[0].id;
  }, [selectedWatchGameId, watchGameCandidates]);
  const displayedWatchOptions = useMemo(() => {
    if (!activeWatchGameId) {
      return [];
    }
    return watchOptions.length > 0
      ? watchOptions
      : fallbackWatchOptions.map((option, index) => ({
          ...option,
          gameId: activeWatchGameId,
          notes: index === 0 ? "Fallback coverage suggestion while live provider data is limited" : option.notes,
        }));
  }, [activeWatchGameId, watchOptions]);
  const ticketOptions = useMemo(() => {
    const sortedScheduleGames = [...scheduleGames].sort(
      (a, b) => new Date(a.startTimeIso).getTime() - new Date(b.startTimeIso).getTime(),
    );
    const generated = buildTicketOptions(sortedScheduleGames.slice(0, 6), zipCode);
    if (generated.length > 0) {
      return generated;
    }
    return fallbackTicketOptions.map((option) => ({
      ...option,
      city: zipCode,
      url: `${option.url}?postalCode=${zipCode}`,
    }));
  }, [scheduleGames, zipCode]);
  const recommendations = useMemo<Recommendation[]>(() => {
    const built = buildRecommendations(displayedGames, favorites).slice(0, 6);
    // Sort by favorite ranks - lower rank (higher priority) comes first
    const sorted = built.sort((a, b) => {
      const aTeamRank = Math.min(
        ...favorites
          .map((fav) => ({ fav, rank: favoriteRanks[fav] ?? Infinity }))
          .filter((f) => a.gameId?.includes?.(f.fav) || a.gameId === f.fav)
          .map((f) => f.rank)
      );
      const bTeamRank = Math.min(
        ...favorites
          .map((fav) => ({ fav, rank: favoriteRanks[fav] ?? Infinity }))
          .filter((f) => b.gameId?.includes?.(f.fav) || b.gameId === f.fav)
          .map((f) => f.rank)
      );
      return aTeamRank - bTeamRank;
    });
    return sorted.length > 0 ? sorted : fallbackRecommendations;
  }, [displayedGames, favorites, favoriteRanks]);
  const dailyWatchPlan = useMemo<WatchPlanEntry[]>(() => {
    const sourceGames = scheduledTodayGames.length > 0 ? scheduledTodayGames : scheduleGames.length > 0 ? scheduleGames : displayedGames;
    const built = buildDailyWatchPlan(sourceGames, favorites, 8);
    return built.length > 0 ? built : fallbackWatchPlan;
  }, [displayedGames, favorites, scheduleGames, scheduledTodayGames]);
  const recommendationGames = useMemo(() => {
    const map = new Map(displayedGames.map((game) => [game.id, game]));
    return recommendations
      .map((recommendation) => {
        const game = map.get(recommendation.gameId);
        if (!game) {
          return null;
        }
        return { recommendation, game };
      })
      .filter((value): value is { recommendation: Recommendation; game: Game } => value !== null);
  }, [displayedGames, recommendations]);
  const displayedNews = useMemo(() => (news.length > 0 ? news : fallbackNews), [fallbackNews, news]);
  const featuredGame = useMemo(() => todayLiveGames[0] ?? todayUpcomingGames[0] ?? todayGames[0], [todayGames, todayLiveGames, todayUpcomingGames]);
  const featuredWatchOptions = useMemo(() => {
    if (!featuredGame) return [];
    const specific = watchOptions.filter((o) => o.gameId === featuredGame.id);
    if (specific.length > 0) return specific.slice(0, 3);
    if (activeWatchGameId === featuredGame.id) return displayedWatchOptions.slice(0, 3);
    return fallbackWatchOptions.slice(0, 3);
  }, [activeWatchGameId, displayedWatchOptions, featuredGame, watchOptions]);

  const featuredGameReason = useMemo(() => {
    if (!featuredGame) return null;
    const rec = recommendations.find((r) => r.gameId === featuredGame.id);
    if (rec?.reason) return rec.reason;
    const involvesFavorite = favorites.some(
      (f) => featuredGame.homeTeam?.includes(f.split(" ").at(-1) ?? "") || featuredGame.awayTeam?.includes(f.split(" ").at(-1) ?? ""),
    );
    if (involvesFavorite) return "One of your favorite teams is playing.";
    return "High-interest matchup selected for today's slate.";
  }, [featuredGame, favorites, recommendations]);

  useEffect(() => {
    if (!activeWatchGameId) {
      return;
    }

    const abortController = new AbortController();

    async function loadWatchOptions() {
      const game = watchGameCandidates.find((item) => item.id === activeWatchGameId);
      if (!game) {
        return;
      }

      try {
        const title = encodeURIComponent(`${game.awayTeam} at ${game.homeTeam}`);
        const response = await fetch(`/api/watch?gameId=${game.id}&title=${title}`, {
          signal: abortController.signal,
        });
        if (!response.ok) {
          throw new Error(`Watch API returned ${response.status}`);
        }
        const payload = (await response.json()) as WatchApiResponse;
        setWatchOptions(payload.options ?? []);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        setWatchOptions([]);
      }
    }

    loadWatchOptions();

    return () => {
      abortController.abort();
    };
  }, [activeWatchGameId, watchGameCandidates]);

  const handleUseGeolocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoMessage("Geolocation is not supported in this browser.");
      return;
    }

    setGeoMessage("Checking your location...");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const reverseUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;
          const response = await fetch(reverseUrl);
          if (!response.ok) {
            throw new Error("Reverse geocode failed");
          }

          const payload = (await response.json()) as {
            address?: { postcode?: string };
          };

          const detectedZip = payload.address?.postcode?.slice(0, 5);
          if (detectedZip && /^\d{5}$/.test(detectedZip)) {
            setZipCode(detectedZip);
            setGeoMessage(`Detected ZIP ${detectedZip}. You can still edit it manually.`);
          } else {
            setGeoMessage("Could not determine ZIP from location. Keeping current ZIP.");
          }
        } catch {
          setGeoMessage("Could not determine ZIP from geolocation. Keeping current ZIP.");
        }
      },
      () => {
        setGeoMessage("Location permission denied. Keeping manual ZIP as primary.");
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
      },
    );
  };

  if (!hasHydratedPreferences) {
    return (
      <main className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6">
        <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
          <LoadingState label="Loading your personalized sports dashboard..." />
        </div>
      </main>
    );
  }

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      {collageTiles.length > 0 ? (
        <div className="logo-collage-bg" aria-hidden="true">
          {collageTiles.map((tile) => (
            <div
              key={tile.id}
              className="logo-collage-tile"
              style={{
                opacity: tile.opacity,
                transform: `translate(${tile.offsetX}px, ${tile.offsetY}px) rotate(${tile.rotate}deg) scale(${tile.scale})`,
              }}
            >
              <TeamLogo teamName={tile.teamName} size={46} />
            </div>
          ))}
        </div>
      ) : null}
      <main id="main-content" className="relative z-10 mx-auto max-w-6xl px-3 py-6 sm:px-6 sm:py-8">
      <header className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--panel)] shadow-sm">
        <div className="grid grid-cols-1 gap-6 p-6 sm:p-8 lg:grid-cols-[1.4fr_0.9fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">Mike Sports</p>
            <h1 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              One place to decide what matters in sports today.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--muted)] sm:text-base">
              Track your favorite teams, scan the biggest storylines, find where to watch, and get a ranked viewing plan without bouncing between apps.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {(() => {
                const toDisplay = showAllFavorites ? favorites : favorites.slice(0, 8);
                return toDisplay.map((option) => (
                  <span
                    key={option}
                    className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-900"
                  >
                    <TeamLogo teamName={option} size={20} />
                    {option}
                  </span>
                ));
              })()}
              {favorites.length > 8 && (
                <button
                  type="button"
                  onClick={() => setShowAllFavorites((v) => !v)}
                  className="rounded-full border border-[var(--border)] bg-white px-3 py-1 text-xs font-semibold text-[var(--muted)] transition hover:bg-slate-50"
                >
                  {showAllFavorites ? "Show less" : `+${favorites.length - 8} more`}
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => document.getElementById("preferences-section")?.scrollIntoView({ behavior: "smooth" })}
              className="mt-3 text-xs font-semibold text-[var(--brand)] underline transition hover:text-emerald-700"
            >
              Manage favorites
            </button>
          </div>

          <GameOfTheDay game={featuredGame} reason={featuredGameReason} watchOptions={featuredWatchOptions} />
        </div>
      </header>

      <TodaySchedule games={scheduledTodayGames} watchOptions={watchOptions} watchPlan={dailyWatchPlan} />
      <ScoresSection games={displayedGames} isLoading={isLoadingGames} error={gameError} />

      <NewsSection items={displayedNews} isLoading={isLoadingNews} error={newsError} page={newsPage} onLoadMore={() => setNewsPage((page) => page + 1)} />
      <TicketsSection zipCode={zipCode} ticketOptions={ticketOptions} scheduleGames={scheduleGames} />
      <RecommendationsSection items={recommendationGames} />
      <PreferencesSection
        zipCode={zipCode}
        geoMessage={geoMessage}
        favorites={favorites}
        onZipCodeChange={setZipCode}
        onUseGeolocation={handleUseGeolocation}
        onToggleFavorite={toggleFavorite}
        onMoveFavorite={moveFavorite}
      />
      </main>
    </>
  );
}
