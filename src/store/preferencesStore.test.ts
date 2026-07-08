import { usePreferencesStore } from "./preferencesStore";

describe("usePreferencesStore", () => {
  beforeEach(() => {
    localStorage.clear();
    usePreferencesStore.setState({
      favorites: ["Minnesota Vikings"],
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
