import { buildDailyWatchPlan } from "@/lib/watchPlan";
import {
  expectedPlanFavoritePrefix,
  fixtureFavorites,
  fixtureGames,
} from "@/test/fixtures/plannerFixtures";

describe("buildDailyWatchPlan", () => {
  it("prioritizes favorites first in output order", () => {
    const plan = buildDailyWatchPlan(fixtureGames, fixtureFavorites, 8);
    const prefix = plan.slice(0, expectedPlanFavoritePrefix.length).map((entry) => entry.gameId);

    expect(prefix).toEqual(expectedPlanFavoritePrefix);
  });

  it("assigns sequential ranks", () => {
    const plan = buildDailyWatchPlan(fixtureGames, fixtureFavorites, 8);

    plan.forEach((entry, index) => {
      expect(entry.rank).toBe(index + 1);
    });
  });

  it("includes non-empty reasons for every plan item", () => {
    const plan = buildDailyWatchPlan(fixtureGames, fixtureFavorites, 8);

    expect(plan.length).toBeGreaterThan(0);
    plan.forEach((entry) => {
      expect(entry.reason.length).toBeGreaterThan(10);
    });
  });
});
