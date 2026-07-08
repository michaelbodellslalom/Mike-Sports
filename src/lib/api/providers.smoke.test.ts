import { fetchNewsByQuery } from "@/lib/api/newsClient";
import { normalizeSportsDbEvents } from "@/lib/api/normalize";
import { fetchLeagueGames } from "@/lib/api/sportsClient";
import { fetchWatchOptionsByTitle } from "@/lib/api/watchClient";
import { clearHttpCache, getJson } from "@/lib/api/http";

describe("provider smoke tests", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    clearHttpCache();
    jest.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("caches repeated requests by cache key", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ value: 42 }),
    });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const one = await getJson<{ value: number }>("https://example.com/demo", {
      cacheKey: "demo",
      ttlMs: 60_000,
      fallbackData: { value: 0 },
    });

    const two = await getJson<{ value: number }>("https://example.com/demo", {
      cacheKey: "demo",
      ttlMs: 60_000,
      fallbackData: { value: 0 },
    });

    expect(one.value).toBe(42);
    expect(two.value).toBe(42);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("normalizes raw SportsDB events", () => {
    const normalized = normalizeSportsDbEvents([
      {
        idEvent: "123",
        strLeague: "NFL",
        dateEvent: "2026-09-12",
        strTime: "18:00:00",
        strStatus: "Final",
        strHomeTeam: "Minnesota Vikings",
        strAwayTeam: "Chicago Bears",
        intHomeScore: "27",
        intAwayScore: "21",
        strVenue: "U.S. Bank Stadium",
      },
    ]);

    expect(normalized).toHaveLength(1);
    expect(normalized[0].league).toBe("NFL");
    expect(normalized[0].status).toBe("final");
    expect(normalized[0].homeScore).toBe(27);
  });

  it("fetches and normalizes league games", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        events: [
          {
            idEvent: "123",
            strLeague: "NFL",
            dateEvent: "2026-09-12",
            strTime: "18:00:00",
            strStatus: "Live",
            strHomeTeam: "Minnesota Vikings",
            strAwayTeam: "Chicago Bears",
          },
        ],
      }),
    });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const games = await fetchLeagueGames("NFL");
    expect(games).toHaveLength(1);
    expect(games[0].status).toBe("live");
  });

  it("returns empty news list when API key is missing", async () => {
    const fetchMock = jest.fn();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    const items = await fetchNewsByQuery("vikings", "NFL");

    expect(items).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns empty watch options when API key is missing", async () => {
    const fetchMock = jest.fn();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    const options = await fetchWatchOptionsByTitle("game-1", "Minnesota Vikings");

    expect(options).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
