import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { initialFavoriteOptions } from "@/data/favorites";

type WatchPriority = "favorites-first" | "best-games-first";

type PreferencesState = {
  favorites: string[];
  favoriteRanks: Record<string, number>;
  zipCode: string;
  watchPriority: WatchPriority;
  setFavorites: (favorites: string[]) => void;
  toggleFavorite: (favorite: string) => void;
  rankFavorite: (favorite: string, rank: number) => void;
  moveFavorite: (favorite: string, direction: "up" | "down") => void;
  setZipCode: (zipCode: string) => void;
  setWatchPriority: (priority: WatchPriority) => void;
};

const createStorage = () => {
  if (typeof window === "undefined") {
    return {
      getItem: () => null,
      setItem: () => undefined,
      removeItem: () => undefined,
    };
  }
  return window.localStorage;
};

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set, get) => ({
      favorites: [...initialFavoriteOptions],
      favoriteRanks: initialFavoriteOptions.reduce(
        (acc, fav, idx) => ({ ...acc, [fav]: idx }),
        {}
      ),
      zipCode: "80222",
      watchPriority: "favorites-first",
      setFavorites: (favorites) => set({ favorites }),
      toggleFavorite: (favorite) => {
        const { favorites, favoriteRanks } = get();
        const next = favorites.includes(favorite)
          ? favorites.filter((item) => item !== favorite)
          : [...favorites, favorite];
        // If adding, add to end with highest rank + 1
        if (!favorites.includes(favorite)) {
          const maxRank = Math.max(...Object.values(favoriteRanks), -1);
          favoriteRanks[favorite] = maxRank + 1;
        }
        set({ favorites: next, favoriteRanks });
      },
      rankFavorite: (favorite, rank) => {
        const { favoriteRanks } = get();
        set({ favoriteRanks: { ...favoriteRanks, [favorite]: rank } });
      },
      moveFavorite: (favorite, direction) => {
        const { favorites, favoriteRanks } = get();
        const index = favorites.indexOf(favorite);
        if (index === -1) return;
        if (direction === "up" && index === 0) return;
        if (direction === "down" && index === favorites.length - 1) return;

        const targetIndex = direction === "up" ? index - 1 : index + 1;
        const targetFav = favorites[targetIndex];

        // Swap ranks
        const tempRank = favoriteRanks[favorite];
        favoriteRanks[favorite] = favoriteRanks[targetFav];
        favoriteRanks[targetFav] = tempRank;

        set({ favoriteRanks });
      },
      setZipCode: (zipCode) => set({ zipCode }),
      setWatchPriority: (watchPriority) => set({ watchPriority }),
    }),
    {
      name: "mike-sports-preferences",
      storage: createJSONStorage(createStorage),
      partialize: (state) => ({
        favorites: state.favorites,
        favoriteRanks: state.favoriteRanks,
        zipCode: state.zipCode,
        watchPriority: state.watchPriority,
      }),
    },
  ),
);
