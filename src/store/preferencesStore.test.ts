import { usePreferencesStore } from "./preferencesStore";

describe("usePreferencesStore", () => {
  beforeEach(() => {
    localStorage.clear();
    usePreferencesStore.setState({
      favorites: ["Minnesota Vikings"],
      favoriteRanks: { "Minnesota Vikings": 0 },
      zipCode: "80222",
      watchPriority: "favorites-first",
    });
  });

  it("toggles favorites", () => {
    usePreferencesStore.getState().toggleFavorite("Minnesota Vikings");
    expect(usePreferencesStore.getState().favorites).toEqual([]);

    usePreferencesStore.getState().toggleFavorite("UFC");
    expect(usePreferencesStore.getState().favorites).toContain("UFC");
  });

  it("adds new favorites to the end of ranked order", () => {
    usePreferencesStore.getState().setFavorites(["Minnesota Vikings", "PGA"]);
    usePreferencesStore.getState().toggleFavorite("UFC");

    expect(usePreferencesStore.getState().favorites).toEqual(["Minnesota Vikings", "PGA", "UFC"]);
    expect(usePreferencesStore.getState().favoriteRanks).toEqual({
      "Minnesota Vikings": 0,
      PGA: 1,
      UFC: 2,
    });
  });

  it("reorders favorites and keeps ranks synchronized", () => {
    usePreferencesStore.getState().setFavorites(["Minnesota Vikings", "PGA", "UFC"]);
    usePreferencesStore.getState().moveFavorite("UFC", "up");

    expect(usePreferencesStore.getState().favorites).toEqual(["Minnesota Vikings", "UFC", "PGA"]);
    expect(usePreferencesStore.getState().favoriteRanks).toEqual({
      "Minnesota Vikings": 0,
      UFC: 1,
      PGA: 2,
    });
  });

  it("updates zip code", () => {
    usePreferencesStore.getState().setZipCode("55401");
    expect(usePreferencesStore.getState().zipCode).toBe("55401");
  });

  it("persists updated preferences in local storage", () => {
    usePreferencesStore.getState().setFavorites(["UFC", "PGA"]);
    usePreferencesStore.getState().setZipCode("55401");

    const raw = localStorage.getItem("mike-sports-preferences");
    expect(raw).not.toBeNull();

    const parsed = JSON.parse(raw ?? "{}");
    expect(parsed.state.favorites).toEqual(["UFC", "PGA"]);
    expect(parsed.state.zipCode).toBe("55401");
  });
});
