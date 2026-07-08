import { buildRecommendations } from "@/lib/recommendations";
import {
  expectedRecommendationTopId,
  fixtureFavorites,
  fixtureGames,
} from "@/test/fixtures/plannerFixtures";

describe("buildRecommendations", () => {
  it("filters out favorite matchups from recommendation output", () => {
    const recommendations = buildRecommendations(fixtureGames, ["Minnesota Vikings"]);
    const ids = recommendations.map((item) => item.gameId);

    expect(ids).not.toContain("fav-live");
    expect(ids).not.toContain("fav-next");
  });

  it("includes reason labels for each recommendation", () => {
    const recommendations = buildRecommendations(fixtureGames, fixtureFavorites);

    expect(recommendations.length).toBeGreaterThan(0);
    expect(recommendations[0].reason.length).toBeGreaterThan(10);
  });

  it("keeps deterministic top recommendation for fixtures", () => {
    const recommendations = buildRecommendations(fixtureGames, fixtureFavorites);
    expect(recommendations[0].gameId).toBe(expectedRecommendationTopId);
  });

  it("sorts recommendations by descending score", () => {
    const recommendations = buildRecommendations(fixtureGames, fixtureFavorites);

    for (let index = 1; index < recommendations.length; index += 1) {
      expect(recommendations[index - 1].score).toBeGreaterThanOrEqual(recommendations[index].score);
    }
  });
});
