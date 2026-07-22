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

function buildRanksFromFavorites(favorites: string[]): Record<string, number> {
  return favorites.reduce<Record<string, number>>((acc, favorite, index) => {
    acc[favorite] = index;
    return acc;
  }, {});
}

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
      favoriteRanks: buildRanksFromFavorites(initialFavoriteOptions),
      zipCode: "80222",
      watchPriority: "favorites-first",
      setFavorites: (favorites) =>
        set({
          favorites,
          favoriteRanks: buildRanksFromFavorites(favorites),
        }),
      toggleFavorite: (favorite) => {
        const { favorites } = get();
        const nextFavorites = favorites.includes(favorite)
          ? favorites.filter((item) => item !== favorite)
          : [...favorites, favorite];
        set({
          favorites: nextFavorites,
          favoriteRanks: buildRanksFromFavorites(nextFavorites),
        });
      },
      rankFavorite: (favorite, rank) => {
        const { favorites } = get();
        const currentIndex = favorites.indexOf(favorite);
        if (currentIndex === -1) return;
        const clampedRank = Math.max(0, Math.min(rank, favorites.length - 1));
        if (clampedRank === currentIndex) return;

        const reordered = [...favorites];
        reordered.splice(currentIndex, 1);
        reordered.splice(clampedRank, 0, favorite);

        set({
          favorites: reordered,
          favoriteRanks: buildRanksFromFavorites(reordered),
        });
      },
      moveFavorite: (favorite, direction) => {
        const { favorites } = get();
        const index = favorites.indexOf(favorite);
        if (index === -1) return;
        if (direction === "up" && index === 0) return;
        if (direction === "down" && index === favorites.length - 1) return;

        const targetIndex = direction === "up" ? index - 1 : index + 1;
        const reordered = [...favorites];
        [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];

        set({
          favorites: reordered,
          favoriteRanks: buildRanksFromFavorites(reordered),
        });
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
