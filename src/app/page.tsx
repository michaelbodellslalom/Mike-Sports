"use client";

import { useEffect, useMemo, useState } from "react";

import { EmptyState } from "@/components/state/EmptyState";
import { ErrorState } from "@/components/state/ErrorState";
import { LoadingState } from "@/components/state/LoadingState";
import { initialFavoriteOptions } from "@/data/favorites";
import { inferLeagueFromFavorite } from "@/lib/favoritesToLeague";
import { providerConfig } from "@/lib/api/providers";
import { formatLocalDateTime, isWithinScheduleWindow, type ScheduleWindow } from "@/lib/dateTime";
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

function formatGameLine(game: Game): string {
  if (game.status === "final" || game.status === "live") {
    return `${game.awayTeam} ${game.awayScore ?? 0} at ${game.homeTeam} ${game.homeScore ?? 0}`;
  }
  return `${game.awayTeam} at ${game.homeTeam}`;
}

export default function Home() {
  const { favorites, toggleFavorite, zipCode, setZipCode } = usePreferencesStore();
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

  const selectedCount = useMemo(() => favorites.length, [favorites.length]);
  const selectedLeague = useMemo<LeagueCode>(() => {
    const first = favorites[0] ?? "Minnesota Vikings";
    return inferLeagueFromFavorite(first);
  }, [favorites]);

  useEffect(() => {
    let cancelled = false;

    async function loadScores() {
      setIsLoadingGames(true);
      setGameError(null);
      try {
        const response = await fetch(`/api/sports?league=${selectedLeague}`);
        if (!response.ok) {
          throw new Error(`Sports API returned ${response.status}`);
        }
        const payload = (await response.json()) as SportsApiResponse;
        if (!cancelled) {
          setGames(payload.games ?? []);
        }
      } catch (error) {
        if (!cancelled) {
          setGameError(error instanceof Error ? error.message : "Unable to load scores");
          setGames([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingGames(false);
        }
      }
    }

    loadScores();

    return () => {
      cancelled = true;
    };
  }, [selectedLeague]);

  useEffect(() => {
    let cancelled = false;
    const query = favorites[0] ?? "Minnesota Vikings";

    async function loadNews() {
      setIsLoadingNews(true);
      setNewsError(null);
      try {
        const encodedQuery = encodeURIComponent(query);
        const response = await fetch(`/api/news?q=${encodedQuery}&league=${selectedLeague}`);
        if (!response.ok) {
          throw new Error(`News API returned ${response.status}`);
        }
        const payload = (await response.json()) as NewsApiResponse;
        if (!cancelled) {
          setNews(payload.items ?? []);
        }
      } catch (error) {
        if (!cancelled) {
          setNewsError(error instanceof Error ? error.message : "Unable to load news");
          setNews([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingNews(false);
        }
      }
    }

    loadNews();

    return () => {
      cancelled = true;
    };
  }, [favorites, selectedLeague]);

  const liveGames = useMemo(() => games.filter((game) => game.status === "live"), [games]);
  const upcomingGames = useMemo(() => games.filter((game) => game.status === "scheduled"), [games]);
  const scheduleGames = useMemo(
    () => upcomingGames.filter((game) => isWithinScheduleWindow(game.startTimeIso, scheduleWindow)),
    [upcomingGames, scheduleWindow],
  );
  const watchGameCandidates = useMemo(() => games.slice(0, 8), [games]);
  const activeWatchGameId = useMemo(() => {
    if (watchGameCandidates.length === 0) {
      return "";
    }
    if (watchGameCandidates.some((game) => game.id === selectedWatchGameId)) {
      return selectedWatchGameId;
    }
    return watchGameCandidates[0].id;
  }, [selectedWatchGameId, watchGameCandidates]);
  const displayedWatchOptions = activeWatchGameId ? watchOptions : [];
  const ticketOptions = useMemo(() => buildTicketOptions(scheduleGames.slice(0, 6), zipCode), [scheduleGames, zipCode]);
  const recommendations = useMemo<Recommendation[]>(() => {
    return buildRecommendations(games, favorites).slice(0, 6);
  }, [favorites, games]);
  const dailyWatchPlan = useMemo<WatchPlanEntry[]>(() => {
    const sourceGames = scheduleGames.length > 0 ? scheduleGames : games;
    return buildDailyWatchPlan(sourceGames, favorites, 8);
  }, [favorites, games, scheduleGames]);
  const recommendationGames = useMemo(() => {
    const map = new Map(games.map((game) => [game.id, game]));
    return recommendations
      .map((recommendation) => {
        const game = map.get(recommendation.gameId);
        if (!game) {
          return null;
        }
        return { recommendation, game };
      })
      .filter((value): value is { recommendation: Recommendation; game: Game } => value !== null);
  }, [games, recommendations]);

  useEffect(() => {
    if (!activeWatchGameId) {
      return;
    }

    let cancelled = false;

    async function loadWatchOptions() {
      const game = watchGameCandidates.find((item) => item.id === activeWatchGameId);
      if (!game) {
        return;
      }

      setIsLoadingWatch(true);
      setWatchError(null);

      try {
        const title = encodeURIComponent(`${game.awayTeam} at ${game.homeTeam}`);
        const response = await fetch(`/api/watch?gameId=${game.id}&title=${title}`);
        if (!response.ok) {
          throw new Error(`Watch API returned ${response.status}`);
        }
        const payload = (await response.json()) as WatchApiResponse;
        if (!cancelled) {
          setWatchOptions(payload.options ?? []);
        }
      } catch (error) {
        if (!cancelled) {
          setWatchError(error instanceof Error ? error.message : "Unable to load watch options");
          setWatchOptions([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingWatch(false);
        }
      }
    }

    loadWatchOptions();

    return () => {
      cancelled = true;
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
    <main className="mx-auto max-w-6xl px-3 py-6 sm:px-6 sm:py-8">
      <header className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--brand)]">Mike Sports</p>
        <h1 className="mt-2 text-3xl font-bold">Implementation Kickoff</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          App foundation is live. This screen currently verifies provider selection and preference persistence.
        </p>
      </header>

      <section className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4 sm:mt-6 sm:p-6">
        <h2 className="text-lg font-semibold">Today snapshot</h2>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-[var(--border)] bg-white p-3">
            <p className="text-xs uppercase tracking-wide text-[var(--muted)]">League view</p>
            <p className="mt-1 text-xl font-bold">{selectedLeague}</p>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-white p-3">
            <p className="text-xs uppercase tracking-wide text-[var(--muted)]">Live now</p>
            <p className="mt-1 text-xl font-bold">{liveGames.length}</p>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-white p-3">
            <p className="text-xs uppercase tracking-wide text-[var(--muted)]">Upcoming</p>
            <p className="mt-1 text-xl font-bold">{upcomingGames.length}</p>
          </div>
        </div>
      </section>

      <section className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4 sm:mt-6 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Scores</h2>
          <span className="text-xs text-[var(--muted)]">Source: {providerConfig.sports.provider}</span>
        </div>
        <div className="mt-3 space-y-2">
          {isLoadingGames ? <LoadingState label="Loading latest games..." /> : null}
          {gameError ? <ErrorState message={gameError} /> : null}
          {!isLoadingGames && !gameError && games.length === 0 ? (
            <EmptyState message="No games found for this league right now." />
          ) : null}
          {!isLoadingGames && !gameError
            ? games.slice(0, 8).map((game) => (
                <article
                  key={game.id}
                  className="rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm"
                >
                  <p className="font-medium">{formatGameLine(game)}</p>
                  <p className="mt-1 text-xs uppercase tracking-wide text-[var(--muted)]">
                    {game.status} • {formatLocalDateTime(game.startTimeIso)}
                  </p>
                </article>
              ))
            : null}
        </div>
      </section>

      <section className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4 sm:mt-6 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">News</h2>
          <span className="text-xs text-[var(--muted)]">Source: {providerConfig.news.provider}</span>
        </div>
        <div className="mt-3 space-y-2">
          {isLoadingNews ? <LoadingState label="Loading headlines..." /> : null}
          {newsError ? <ErrorState message={newsError} /> : null}
          {!isLoadingNews && !newsError && news.length === 0 ? (
            <EmptyState message="No headlines returned. Add NEWS API key to see live feed." />
          ) : null}
          {!isLoadingNews && !newsError
            ? news.slice(0, 6).map((item) => (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm hover:bg-slate-50"
                >
                  <p className="font-medium">{item.title}</p>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {item.source} • {formatLocalDateTime(item.publishedAtIso)}
                  </p>
                </a>
              ))
            : null}
        </div>
      </section>

      <section className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4 sm:mt-6 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Schedule</h2>
          <div className="flex gap-2">
            {(["day", "week", "month"] as const).map((window) => (
              <button
                key={window}
                type="button"
                onClick={() => setScheduleWindow(window)}
                className={`rounded-md border px-3 py-1 text-xs font-semibold uppercase ${
                  scheduleWindow === window
                    ? "border-[var(--brand)] bg-emerald-50 text-emerald-900"
                    : "border-[var(--border)] bg-white"
                }`}
              >
                {window}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 space-y-2">
          {scheduleGames.length === 0 ? (
            <EmptyState message={`No scheduled games in the next ${scheduleWindow}.`} />
          ) : (
            scheduleGames.slice(0, 8).map((game) => (
              <article key={game.id} className="rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm">
                <p className="font-medium">{game.awayTeam} at {game.homeTeam}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">{formatLocalDateTime(game.startTimeIso)}</p>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4 sm:mt-6 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Where to watch</h2>
          <span className="text-xs text-[var(--muted)]">Source: {providerConfig.watch.provider}</span>
        </div>

        {watchGameCandidates.length > 0 ? (
          <div className="mt-3">
            <label htmlFor="watch-game" className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
              Matchup
            </label>
            <select
              id="watch-game"
              value={activeWatchGameId}
              onChange={(event) => setSelectedWatchGameId(event.target.value)}
              className="mt-1 w-full rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm"
            >
              {watchGameCandidates.map((game) => (
                <option key={game.id} value={game.id}>
                  {game.awayTeam} at {game.homeTeam}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <div className="mt-3 space-y-2">
          {isLoadingWatch ? <LoadingState label="Loading watch options..." /> : null}
          {watchError ? <ErrorState message={watchError} /> : null}
          {!isLoadingWatch && !watchError && displayedWatchOptions.length === 0 ? (
            <EmptyState message="No watch options available yet. Add WATCHMODE API key to enable coverage data." />
          ) : null}
          {!isLoadingWatch && !watchError
            ? displayedWatchOptions.slice(0, 6).map((option, index) => (
                <article
                  key={`${option.gameId}-${option.network ?? option.streamingService ?? index}`}
                  className="rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm"
                >
                  <p className="font-medium">{option.network ?? option.streamingService ?? "Unknown source"}</p>
                  <p className="mt-1 text-xs text-[var(--muted)]">{option.notes ?? "Coverage details"}</p>
                </article>
              ))
            : null}
        </div>
      </section>

      <section className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4 sm:mt-6 sm:p-6">
        <h2 className="text-lg font-semibold">Tickets near {zipCode}</h2>
        <div className="mt-3 space-y-2">
          {ticketOptions.length === 0 ? (
            <EmptyState message="No ticket links available for the current schedule window." />
          ) : (
            ticketOptions.map((ticket) => {
              const game = scheduleGames.find((item) => item.id === ticket.gameId);
              return (
                <a
                  key={`${ticket.gameId}-${ticket.provider}`}
                  href={ticket.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm hover:bg-slate-50"
                >
                  <p className="font-medium">
                    {game ? `${game.awayTeam} at ${game.homeTeam}` : "Open matchup tickets"}
                  </p>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {ticket.provider} search for ZIP {zipCode}
                  </p>
                </a>
              );
            })
          )}
        </div>
      </section>

      <section className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4 sm:mt-6 sm:p-6">
        <h2 className="text-lg font-semibold">Recommended games beyond favorites</h2>
        <p className="mt-1 text-xs text-[var(--muted)]">
          Reason labels explain why each game is suggested.
        </p>

        <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
          {recommendationGames.length === 0 ? (
            <EmptyState message="No recommendation candidates yet. As more games load, suggestions will appear here." />
          ) : (
            recommendationGames.map(({ recommendation, game }) => (
              <article key={recommendation.gameId} className="rounded-lg border border-[var(--border)] bg-white p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold">{game.awayTeam} at {game.homeTeam}</p>
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                    Score {Math.max(0, Math.round(recommendation.score))}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[var(--muted)]">{formatLocalDateTime(game.startTimeIso)} • {game.league}</p>
                <p className="mt-2 text-sm text-[var(--text)]">{recommendation.reason}</p>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4 sm:mt-6 sm:p-6">
        <h2 className="text-lg font-semibold">Daily watch plan</h2>
        <p className="mt-1 text-xs text-[var(--muted)]">
          Ordered by favorites first, then high-interest options, then overlap reduction.
        </p>

        <div className="mt-3 space-y-2">
          {dailyWatchPlan.length === 0 ? (
            <EmptyState message="No watch plan entries yet. As games load, this list will populate." />
          ) : (
            dailyWatchPlan.map((entry) => {
              const game = games.find((item) => item.id === entry.gameId);
              return (
                <article key={entry.gameId} className="rounded-lg border border-[var(--border)] bg-white p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">#{entry.rank}</p>
                    <p className="text-xs text-[var(--muted)]">{formatLocalDateTime(entry.plannedStartIso)}</p>
                  </div>
                  <p className="mt-1 text-sm font-medium">
                    {game ? `${game.awayTeam} at ${game.homeTeam}` : entry.gameId}
                  </p>
                  <p className="mt-1 text-xs text-[var(--muted)]">{entry.reason}</p>
                </article>
              );
            })
          )}
        </div>
      </section>

      <section className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4 sm:mt-6 sm:p-6">
        <h2 className="text-lg font-semibold">Provider choices</h2>
        <ul className="mt-3 space-y-2 text-sm text-[var(--muted)]">
          <li>Sports: {providerConfig.sports.provider}</li>
          <li>News: {providerConfig.news.provider}</li>
          <li>Watch coverage: {providerConfig.watch.provider}</li>
        </ul>
      </section>

      <section className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4 sm:mt-6 sm:p-6">
        <h2 className="text-lg font-semibold">Preferences bootstrap</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">Selected favorites: {selectedCount}</p>
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
          <span className="text-xs text-[var(--muted)]">{geoMessage}</span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {initialFavoriteOptions.map((option) => {
            const selected = favorites.includes(option);
            return (
              <button
                key={option}
                type="button"
                onClick={() => toggleFavorite(option)}
                className={`rounded-lg border px-3 py-2 text-left text-sm transition ${
                  selected
                    ? "border-[var(--brand)] bg-emerald-50 text-emerald-900"
                    : "border-[var(--border)] bg-white text-[var(--text)]"
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      </section>
    </main>
  );
}
