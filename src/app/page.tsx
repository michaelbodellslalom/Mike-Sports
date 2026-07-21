"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import { EmptyState } from "@/components/state/EmptyState";
import { ErrorState } from "@/components/state/ErrorState";
import { LoadingState } from "@/components/state/LoadingState";
import {
  fallbackGamesByLeague,
  fallbackNewsByLeague,
  fallbackRecommendations,
  fallbackTicketOptions,
  fallbackWatchOptions,
  fallbackWatchPlan,
} from "@/data/fallbackContent";
import { initialFavoriteOptions, allAvailableOptions } from "@/data/favorites";
import { inferLeagueFromFavorite } from "@/lib/favoritesToLeague";
import { providerConfig } from "@/lib/api/providers";
import { formatLocalDateTime, isWithinScheduleWindow, type ScheduleWindow } from "@/lib/dateTime";
import { buildRecommendations } from "@/lib/recommendations";
import { buildTicketOptions } from "@/lib/tickets";
import { buildDailyWatchPlan } from "@/lib/watchPlan";
import { getTeamLogo } from "@/lib/teamLogos";
import { getNetworkInfo } from "@/lib/networkInfo";
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

function formatGameLine(game: Game): string {
  if (game.status === "final" || game.status === "live") {
    return `${game.awayTeam} ${game.awayScore ?? 0} at ${game.homeTeam} ${game.homeScore ?? 0}`;
  }
  return `${game.awayTeam} at ${game.homeTeam}`;
}

function fallbackGameLabel(gameId: string): string {
  if (gameId.includes("rec-1")) {
    return "Lakers at Celtics";
  }
  if (gameId.includes("rec-2")) {
    return "Avalanche at Wild";
  }
  if (gameId.includes("plan-1")) {
    return "Minnesota Vikings featured game";
  }
  if (gameId.includes("plan-2")) {
    return "National prime-time matchup";
  }
  if (gameId.includes("plan-3")) {
    return "Late-night watch window";
  }
  return "Featured matchup";
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

const leagueColors: Record<string, string> = {
  NFL: "#4f3f9a",
  MLB: "#002d72",
  NHL: "#00517a",
  NBA: "#c9082a",
  NCAAF: "#862334",
  NCAAB: "#862334",
  PGA: "#1a7a40",
  UFC: "#cc0000",
};

const sportBadges: Record<string, { text: string; bg: string; fg: string }> = {
  PGA: { text: "PGA", bg: "#1a7a40", fg: "#fff" },
  "PGA Tour": { text: "PGA", bg: "#1a7a40", fg: "#fff" },
  UFC: { text: "UFC", bg: "#cc0000", fg: "#fff" },
  NFL: { text: "NFL", bg: "#003087", fg: "#fff" },
  NBA: { text: "NBA", bg: "#1d428a", fg: "#fff" },
  MLB: { text: "MLB", bg: "#12144d", fg: "#fff" },
  NHL: { text: "NHL", bg: "#111111", fg: "#fff" },
  MLS: { text: "MLS", bg: "#1a5c3a", fg: "#fff" },
  WNBA: { text: "WNB", bg: "#c4122e", fg: "#fff" },
  NCAAF: { text: "CFB", bg: "#8b0000", fg: "#fff" },
  NCAAB: { text: "CBK", bg: "#1a1a1a", fg: "#fff" },
};

function TeamLogo({ teamName, size = 28 }: { teamName: string | null | undefined; size?: number }) {
  const [imgError, setImgError] = useState(false);
  if (!teamName) return null;
  const src = getTeamLogo(teamName);
  const badge = sportBadges[teamName];
  const initials = teamName
    .split(" ")
    .slice(-2)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  if (src && !imgError) {
    return (
      <Image
        src={src}
        alt={teamName}
        width={size}
        height={size}
        className="shrink-0 object-contain"
        aria-hidden="true"
        unoptimized
        onError={() => setImgError(true)}
      />
    );
  }
  if (badge) {
    return (
      <span
        className="inline-flex shrink-0 items-center justify-center rounded-full text-[10px] font-black tracking-tight"
        style={{ backgroundColor: badge.bg, color: badge.fg, width: size, height: size }}
        aria-hidden="true"
      >
        {badge.text}
      </span>
    );
  }
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-600"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}

function NetworkBadge({ name }: { name: string }) {
  const info = getNetworkInfo(name);
  return (
    <span
      className="inline-flex shrink-0 items-center rounded px-2 py-0.5 text-xs font-bold tracking-wide"
      style={{ backgroundColor: info.bgColor, color: info.textColor }}
    >
      {name}
    </span>
  );
}

function LeagueDot({ league }: { league?: LeagueCode }) {
  const color = league ? (leagueColors[league] ?? "#94a3b8") : "#94a3b8";
  return (
    <div
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
      style={{ backgroundColor: color }}
      aria-hidden="true"
    >
      {league?.slice(0, 3) ?? "—"}
    </div>
  );
}

export default function Home() {
  const { favorites, favoriteRanks, toggleFavorite, zipCode, setZipCode, moveFavorite } = usePreferencesStore();
  const [games, setGames] = useState<Game[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [watchOptions, setWatchOptions] = useState<WatchOption[]>([]);
  const [isLoadingGames, setIsLoadingGames] = useState(false);
  const [isLoadingNews, setIsLoadingNews] = useState(false);
  const [isLoadingWatch, setIsLoadingWatch] = useState(false);
  const [gameError, setGameError] = useState<string | null>(null);
  const [newsError, setNewsError] = useState<string | null>(null);
  const [watchError, setWatchError] = useState<string | null>(null);
  const [geoMessage, setGeoMessage] = useState<string>("Use geolocation to suggest a local ZIP.");
  const [scheduleWindow, setScheduleWindow] = useState<ScheduleWindow>("day");
  const [selectedWatchGameId, setSelectedWatchGameId] = useState<string>("");
  const [showAllFavorites, setShowAllFavorites] = useState(false);
  const [newsPage, setNewsPage] = useState(1);

  const selectedCount = useMemo(() => favorites.length, [favorites.length]);
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

  const liveGames = useMemo(() => games.filter((game) => game.status === "live"), [games]);
  const upcomingGames = useMemo(() => games.filter((game) => game.status === "scheduled"), [games]);
  // Blend real games with fallback games for variety, prioritizing real games
  const displayedGames = useMemo(() => {
    if (games.length > 0) {
      // Mix real games with fallback games for better variety
      return [...games, ...fallbackGames.filter((fg) => !games.some((g) => g.id === fg.id))];
    }
    return fallbackGames;
  }, [fallbackGames, games]);
  const displayedLiveGames = useMemo(() => displayedGames.filter((game) => game.status === "live"), [displayedGames]);
  const displayedUpcomingGames = useMemo(() => displayedGames.filter((game) => game.status === "scheduled"), [displayedGames]);
  const displayedCompletedGames = useMemo(() => displayedGames.filter((game) => game.status === "final"), [displayedGames]);

  // Today's games only
  const todayGames = useMemo(() => displayedGames.filter((game) => isGameToday(game.startTimeIso)), [displayedGames]);
  const todayLiveGames = useMemo(() => todayGames.filter((game) => game.status === "live"), [todayGames]);
  const todayUpcomingGames = useMemo(() => todayGames.filter((game) => game.status === "scheduled"), [todayGames]);
  const todayCompletedGames = useMemo(() => todayGames.filter((game) => game.status === "final"), [todayGames]);

  // Schedule section: 3-5 games spread throughout the day (prioritize live, then upcoming)
  const scheduledTodayGames = useMemo(() => spreadGamesInTimeSlots([...todayLiveGames, ...todayUpcomingGames, ...todayCompletedGames]), [todayLiveGames, todayUpcomingGames, todayCompletedGames]);

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
    const generated = buildTicketOptions(scheduleGames.slice(0, 6), zipCode);
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
          .map((fav, idx) => ({ fav, rank: favoriteRanks[fav] ?? Infinity }))
          .filter((f) => a.gameId?.includes?.(f.fav) || a.gameId === f.fav)
          .map((f) => f.rank)
      );
      const bTeamRank = Math.min(
        ...favorites
          .map((fav, idx) => ({ fav, rank: favoriteRanks[fav] ?? Infinity }))
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
  }, [displayedGames, favorites, scheduleGames]);
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

      setIsLoadingWatch(true);
      setWatchError(null);

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
        setWatchError(error instanceof Error ? error.message : "Unable to load watch options");
        setWatchOptions([]);
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoadingWatch(false);
        }
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

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <main id="main-content" className="mx-auto max-w-6xl px-3 py-6 sm:px-6 sm:py-8">
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
                  <button
                    key={option}
                    type="button"
                    onClick={() => toggleFavorite(option)}
                    aria-pressed={true}
                    title="Click to remove"
                    className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-900 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                  >
                    <TeamLogo teamName={option} size={20} />
                    {option}
                  </button>
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

          <div className="rounded-2xl border border-[var(--border)] bg-slate-950 p-5 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">Game of the day</p>
            {featuredGame ? (
              <>
                <div className="mt-3 flex items-center gap-4">
                  <div className="flex shrink-0 flex-col items-center gap-1">
                    <TeamLogo teamName={featuredGame.awayTeam} size={40} />
                    <span className="text-[11px] font-bold text-slate-500">@</span>
                    <TeamLogo teamName={featuredGame.homeTeam} size={40} />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base font-bold leading-snug">
                      {featuredGame.awayTeam}
                    </h2>
                    <p className="text-xs text-slate-500">at</p>
                    <h2 className="text-base font-bold leading-snug">
                      {featuredGame.homeTeam}
                    </h2>
                  </div>
                </div>

                <div className="mt-3 rounded-lg border border-white/10 bg-white/5 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                      featuredGame.status === "live"
                        ? "bg-red-500 text-white"
                        : featuredGame.status === "final"
                        ? "bg-slate-600 text-slate-200"
                        : "bg-slate-700 text-slate-300"
                    }`}>
                      {featuredGame.status === "live" ? "● Live" : featuredGame.status === "final" ? "Final" : "Upcoming"}
                    </span>
                    {featuredGame.venue ? (
                      <p className="truncate text-[11px] text-slate-400">📍 {featuredGame.venue}</p>
                    ) : null}
                  </div>

                  {featuredGame.status === "live" || featuredGame.status === "final" ? (
                    <div className="mt-2 flex items-center justify-around">
                      <div className="text-center">
                        <p className="text-[11px] text-slate-400">{featuredGame.awayTeam.split(" ").at(-1)}</p>
                        <p className="text-3xl font-bold tabular-nums">{featuredGame.awayScore ?? 0}</p>
                      </div>
                      <span className="text-lg text-slate-600">—</span>
                      <div className="text-center">
                        <p className="text-[11px] text-slate-400">{featuredGame.homeTeam.split(" ").at(-1)}</p>
                        <p className="text-3xl font-bold tabular-nums">{featuredGame.homeScore ?? 0}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm font-semibold text-slate-200" suppressHydrationWarning>
                      {formatLocalDateTime(featuredGame.startTimeIso)}
                    </p>
                  )}
                  {featuredWatchOptions.length > 0 && (
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] text-slate-500">Watch on</span>
                      {featuredWatchOptions.map((opt, i) => (
                        <NetworkBadge key={i} name={opt.network ?? opt.streamingService ?? "Unknown"} />
                      ))}
                    </div>
                  )}
                </div>

                {featuredGameReason ? (
                  <p className="mt-3 rounded-lg bg-white/10 px-3 py-2 text-xs leading-relaxed text-slate-200">
                    <span className="font-semibold text-emerald-300">Recommended because</span> {featuredGameReason.replace(/^Because /, "").replace(/\.$/, "").toLowerCase()}.
                  </p>
                ) : null}
              </>
            ) : (
              <>
                <h2 className="mt-3 text-2xl font-bold">Tonight&apos;s slate loading</h2>
                <p className="mt-2 text-sm text-slate-300">Scores and schedules will populate here.</p>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="dashboard-section mt-5 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4 sm:mt-6 sm:p-6" aria-labelledby="schedule-title">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="schedule-title" className="text-lg font-semibold">Today&apos;s Schedule</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">3-5 games spread throughout the day, ranked by your favorites</p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {scheduledTodayGames.length === 0 ? (
            <EmptyState message="No games scheduled for today." />
          ) : (
            scheduledTodayGames.map((game, idx) => {
              const watchOpts = watchOptions.filter((o) => o.gameId === game.id);
              const entry = dailyWatchPlan.find((e) => e.gameId === game.id);
              return (
                <article key={game.id} className="flex items-stretch gap-3 rounded-lg border border-[var(--border)] bg-white overflow-hidden">
                  <div className="flex w-12 shrink-0 flex-col items-center justify-center bg-gradient-to-b from-emerald-50 to-emerald-100 font-bold text-emerald-700">
                    <span className="text-lg">#{idx + 1}</span>
                  </div>
                  <div className="flex flex-1 items-center gap-0.5 px-3 py-2">
                    <TeamLogo teamName={game.awayTeam} size={28} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{game.awayTeam} @ {game.homeTeam}</p>
                      <p className="text-xs text-[var(--muted)]" suppressHydrationWarning>{formatLocalDateTime(game.startTimeIso)}</p>
                      {entry && <p className="mt-1 text-xs text-emerald-700 font-medium">{entry.reason}</p>}
                    </div>
                    <TeamLogo teamName={game.homeTeam} size={28} />
                  </div>
                  {watchOpts.length > 0 && (
                    <div className="flex flex-wrap items-center justify-end gap-1 px-3 py-2 bg-slate-50 border-l border-[var(--border)]">
                      {watchOpts.slice(0, 2).map((opt) => (
                        <NetworkBadge key={`${game.id}-${opt.network ?? opt.streamingService}`} name={opt.network ?? opt.streamingService ?? "Unknown"} />
                      ))}
                    </div>
                  )}
                </article>
              );
            })
          )}
        </div>
      </section>

      <section className="dashboard-section mt-5 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4 sm:mt-6 sm:p-6" aria-labelledby="scores-title" aria-busy={isLoadingGames}>
        <div className="flex items-center justify-between gap-3">
          <h2 id="scores-title" className="text-lg font-semibold">Scores</h2>
          <span className="text-xs text-[var(--muted)]">Source: {providerConfig.sports.provider}</span>
        </div>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Live, final, and next-up matchups tied to your current league view.
        </p>
        <div className="mt-3 space-y-2">
          {isLoadingGames ? <LoadingState label="Loading latest games..." /> : null}
          {gameError ? <ErrorState message={gameError} /> : null}
          {!isLoadingGames && !gameError
            ? displayedGames
                .filter((game) => game.awayTeam && game.homeTeam)
                .sort((a, b) => {
                  // Priority: Live > Final > Scheduled
                  const statusOrder = { live: 0, final: 1, scheduled: 2 };
                  const aOrder = statusOrder[a.status] ?? 3;
                  const bOrder = statusOrder[b.status] ?? 3;
                  if (aOrder !== bOrder) return aOrder - bOrder;
                  // Then sort by date/time (earliest first)
                  return new Date(a.startTimeIso).getTime() - new Date(b.startTimeIso).getTime();
                })
                .slice(0, 8)
                .map((game) => {
                  const getStatusColor = (status: string): string => {
                    const statusLower = status.toLowerCase();
                    if (statusLower === 'live' || statusLower === 'in_play') {
                      return 'bg-orange-100 text-orange-900';
                    } else if (statusLower === 'scheduled' || statusLower === 'upcoming') {
                      return 'bg-blue-100 text-blue-900';
                    } else if (statusLower === 'final' || statusLower === 'finished' || statusLower === 'completed') {
                      return 'bg-green-100 text-green-900';
                    }
                    return 'bg-slate-100 text-slate-900';
                  };

                  return (
                    <article
                      key={game.id}
                      className="flex items-center justify-between gap-2 rounded-lg border border-[var(--border)] bg-white px-3 py-3 text-sm shadow-sm"
                    >
                      <div className="flex items-center gap-0.5 min-w-0">
                        <TeamLogo teamName={game.awayTeam} size={28} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{formatGameLine(game)}</p>
                          <p className="mt-0.5 text-xs uppercase tracking-wide text-[var(--muted)]" suppressHydrationWarning>
                            {formatLocalDateTime(game.startTimeIso)}{game.venue ? ` • ${game.venue}` : ""}
                          </p>
                        </div>
                        <TeamLogo teamName={game.homeTeam} size={28} />
                      </div>
                      <span className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold uppercase ${getStatusColor(game.status)}`}>
                        {game.status}
                      </span>
                    </article>
                  );
                })
            : null}
        </div>
      </section>

      <section className="dashboard-section mt-5 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4 sm:mt-6 sm:p-6" aria-labelledby="news-title" aria-busy={isLoadingNews}>
        <div className="flex items-center justify-between gap-3">
          <h2 id="news-title" className="text-lg font-semibold">News</h2>
          <span className="text-xs text-[var(--muted)]">Source: {providerConfig.news.provider}</span>
        </div>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Headlines are filtered toward your favorites, with curated fallback copy when live keys are missing.
        </p>
        <div className="mt-3 space-y-2">
          {isLoadingNews ? <LoadingState label="Loading headlines..." /> : null}
          {newsError ? <ErrorState message={newsError} /> : null}
          {!isLoadingNews && !newsError
            ? displayedNews.slice(0, newsPage * 5).map((item) => (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-stretch overflow-hidden rounded-lg border border-[var(--border)] bg-white text-sm hover:bg-slate-50"
                >
                  {item.imageUrl ? (
                    <div className="w-20 shrink-0 overflow-hidden bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.imageUrl}
                        alt=""
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.parentElement!.style.display = "none";
                        }}
                        aria-hidden="true"
                      />
                    </div>
                  ) : (
                    <div className="flex w-16 shrink-0 items-center justify-center bg-slate-100">
                      <LeagueDot league={item.relatedLeague} />
                    </div>
                  )}
                  <div className="flex-1 px-3 py-2">
                    <p className="font-medium leading-snug">{item.title}</p>
                    <p className="mt-1 text-xs text-[var(--muted)]" suppressHydrationWarning>
                      {item.source} • {formatLocalDateTime(item.publishedAtIso)}
                    </p>
                  </div>
                </a>
              ))
            : null}
        </div>
        {!isLoadingNews && !newsError && displayedNews.length > newsPage * 5 && (
          <button
            type="button"
            onClick={() => setNewsPage((p) => p + 1)}
            className="mt-4 w-full rounded-lg border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--brand)] transition hover:bg-emerald-50"
          >
            Load more articles ({displayedNews.length - newsPage * 5} remaining)
          </button>
        )}
      </section>


      <section className="dashboard-section mt-5 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4 sm:mt-6 sm:p-6" aria-labelledby="tickets-title">
        <h2 id="tickets-title" className="text-lg font-semibold">Tickets near {zipCode}</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Browse tickets for your favorite games across multiple providers
        </p>
        <div className="mt-4 space-y-3">
          {ticketOptions.length === 0 ? (
            <EmptyState message="No ticket links available for the current schedule window." />
          ) : (
            ticketOptions.map((ticket) => {
              const game = scheduleGames.find((item) => item.id === ticket.gameId);
              const providerColors: Record<string, string> = {
                ticketmaster: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
                stubhub: 'bg-orange-50 border-orange-200 hover:bg-orange-100',
                vividseats: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
              };
              const providerBadgeColors: Record<string, string> = {
                ticketmaster: 'bg-blue-500 text-white',
                stubhub: 'bg-orange-500 text-white',
                vividseats: 'bg-purple-500 text-white',
              };
              const colorClass = providerColors[ticket.provider.toLowerCase()] || 'bg-slate-50 border-slate-200 hover:bg-slate-100';
              const badgeClass = providerBadgeColors[ticket.provider.toLowerCase()] || 'bg-slate-400 text-white';
              
              return (
                <a
                  key={`${ticket.gameId}-${ticket.provider}`}
                  href={ticket.url}
                  target="_blank"
                  rel="noreferrer"
                  className={`group block rounded-lg border border-[var(--border)] transition ${colorClass}`}
                >
                  <div className="flex items-start justify-between gap-3 p-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">
                        {game ? `${game.awayTeam} at ${game.homeTeam}` : 'Open matchup tickets'}
                      </p>
                      <p className="mt-1 text-xs text-[var(--muted)]">
                        Get tickets for ZIP {zipCode}
                      </p>
                    </div>
                    <span className={`${badgeClass} flex shrink-0 items-center rounded px-2.5 py-1 text-xs font-semibold`}>
                      {ticket.provider}
                    </span>
                  </div>
                </a>
              );
            })
          )}
        </div>
        
        {ticketOptions.length > 0 && (
          <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
            <p className="text-xs text-emerald-900">
              💡 <strong>Pro tip:</strong> Compare prices across providers to find the best deal for your game
            </p>
          </div>
        )}
      </section>

      <section className="dashboard-section mt-5 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4 sm:mt-6 sm:p-6" aria-labelledby="recommendations-title">
        <h2 id="recommendations-title" className="text-lg font-semibold">Recommended games beyond favorites</h2>
        <p className="mt-1 text-xs text-[var(--muted)]">
          Reason labels explain why each game is suggested.
        </p>

        <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
          {recommendationGames.length === 0 ? (
            <EmptyState message="No recommendation candidates yet. As more games load, suggestions will appear here." />
          ) : (
            recommendationGames.map(({ recommendation, game }) => (
              <article key={recommendation.gameId} className="rounded-lg border border-[var(--border)] bg-white p-3">
                <div className="flex items-center gap-2">
                  <TeamLogo teamName={game.awayTeam} size={28} />
                  <span className="text-xs text-slate-400">@</span>
                  <TeamLogo teamName={game.homeTeam} size={28} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold truncate">{game.awayTeam} at {game.homeTeam}</p>
                      <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                        Score {Math.max(0, Math.round(recommendation.score))}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="mt-1 text-xs text-[var(--muted)]" suppressHydrationWarning>{formatLocalDateTime(game.startTimeIso)} • {game.league}</p>
                <p className="mt-2 text-sm text-[var(--text)]">{recommendation.reason}</p>
              </article>
            ))
          )}
        </div>
      </section>


      <section className="dashboard-section mt-5 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4 sm:mt-6 sm:p-6" id="preferences-section" aria-labelledby="preferences-title">
        <h2 id="preferences-title" className="text-lg font-semibold">My Preferences</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">Customize your sports dashboard</p>

        <label className="mt-4 block text-sm font-medium" htmlFor="zipcode">
          ZIP code
        </label>
        <input
          id="zipcode"
          value={zipCode}
          onChange={(event) => setZipCode(event.target.value)}
          className="mt-1 w-40 rounded-md border border-[var(--border)] px-3 py-2 text-sm"
          inputMode="numeric"
          maxLength={5}
        />
        <p className="mt-1 text-xs text-[var(--muted)]">Default should be 80222.</p>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleUseGeolocation}
            className="rounded-md border border-[var(--border)] bg-white px-3 py-2 text-xs font-semibold"
          >
            Use my location
          </button>
          <span role="status" aria-live="polite" className="text-xs text-[var(--muted)]">{geoMessage}</span>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-semibold">Your Favorites ({selectedCount})</h3>
          <p className="mt-1 text-xs text-[var(--muted)]">Ranked by importance. Drag or use arrows to reorder. These rankings impact your recommendations.</p>
          <div className="mt-3 space-y-1">
            {allAvailableOptions.map((option, index) => {
              const selected = favorites.includes(option);
              if (!selected) return null;
              const favoriteIndex = favorites.indexOf(option);
              return (
                <div
                  key={option}
                  className="flex items-center justify-between gap-2 rounded-lg border border-[var(--brand)] bg-emerald-50 px-3 py-2 text-left text-sm transition"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-700">#{favoriteIndex + 1}</span>
                    <TeamLogo teamName={option} size={20} />
                    <span className="flex-1">{option}</span>
                  </span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => moveFavorite(option, "up")}
                      disabled={favoriteIndex === 0}
                      className="rounded px-2 py-1 text-xs font-bold text-emerald-700 transition disabled:opacity-25 hover:bg-emerald-200"
                      aria-label="Move up"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveFavorite(option, "down")}
                      disabled={favoriteIndex === favorites.length - 1}
                      className="rounded px-2 py-1 text-xs font-bold text-emerald-700 transition disabled:opacity-25 hover:bg-emerald-200"
                      aria-label="Move down"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleFavorite(option)}
                      aria-pressed={true}
                      className="rounded px-2 py-1 text-xs font-bold text-emerald-700 transition hover:bg-emerald-200"
                    >
                      −
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-semibold">Available to Add ({allAvailableOptions.length - selectedCount})</h3>
          <p className="mt-1 text-xs text-[var(--muted)]">Click to add to your dashboard</p>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {allAvailableOptions.map((option) => {
              const selected = favorites.includes(option);
              if (selected) return null;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => toggleFavorite(option)}
                  aria-pressed={false}
                  className="flex items-center justify-between gap-2 rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-left text-sm transition hover:border-[var(--brand)] hover:bg-emerald-50"
                >
                  <span className="flex items-center gap-2">
                    <TeamLogo teamName={option} size={20} />
                    {option}
                  </span>
                  <span className="text-lg font-bold text-gray-400">+</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>
      </main>
    </>
  );
}
