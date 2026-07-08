import { normalizeNewsApiArticles, normalizeSportsDbEvents } from "@/lib/api/normalize";

describe("normalizeSportsDbEvents", () => {
  it("maps league, status, and scores correctly", () => {
    const result = normalizeSportsDbEvents([
      {
        idEvent: "evt-1",
        strLeague: "UFC",
        dateEvent: "2026-07-12",
        strTime: "01:30:00",
        strStatus: "Final",
        strHomeTeam: "Main Card",
        strAwayTeam: "Co-Main",
        intHomeScore: "1",
        intAwayScore: "0",
        strVenue: "T-Mobile Arena",
      },
    ]);

    expect(result).toHaveLength(1);
    expect(result[0].league).toBe("UFC");
    expect(result[0].status).toBe("final");
    expect(result[0].homeScore).toBe(1);
    expect(result[0].startTimeIso).toBe("2026-07-12T01:30:00Z");
  });

  it("falls back unknown leagues and statuses safely", () => {
    const result = normalizeSportsDbEvents([
      {
        idEvent: "evt-2",
        strLeague: "Unknown League",
        dateEvent: "2026-07-13",
        strHomeTeam: "Home",
        strAwayTeam: "Away",
      },
    ]);

    expect(result[0].league).toBe("NFL");
    expect(result[0].status).toBe("scheduled");
    expect(result[0].startTimeIso).toBe("2026-07-13T00:00:00Z");
  });
});

describe("normalizeNewsApiArticles", () => {
  it("maps articles with related league metadata", () => {
    const result = normalizeNewsApiArticles(
      [
        {
          title: "Vikings training camp update",
          url: "https://example.com/story",
          publishedAt: "2026-07-12T08:00:00Z",
          source: { name: "Example Sports" },
        },
      ],
      "NFL",
    );

    expect(result).toHaveLength(1);
    expect(result[0].relatedLeague).toBe("NFL");
    expect(result[0].source).toBe("Example Sports");
  });
});
