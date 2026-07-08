import { usePreferencesStore } from "./preferencesStore";

describe("usePreferencesStore", () => {
  beforeEach(() => {
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
});
