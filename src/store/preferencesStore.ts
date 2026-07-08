import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { initialFavoriteOptions } from "@/data/favorites";

type WatchPriority = "favorites-first" | "best-games-first";

type PreferencesState = {
  favorites: string[];
  zipCode: string;
  watchPriority: WatchPriority;
  setFavorites: (favorites: string[]) => void;
  toggleFavorite: (favorite: string) => void;
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
      zipCode: "80222",
      watchPriority: "favorites-first",
      setFavorites: (favorites) => set({ favorites }),
      toggleFavorite: (favorite) => {
        const { favorites } = get();
        const next = favorites.includes(favorite)
          ? favorites.filter((item) => item !== favorite)
          : [...favorites, favorite];
        set({ favorites: next });
      },
      setZipCode: (zipCode) => set({ zipCode }),
      setWatchPriority: (watchPriority) => set({ watchPriority }),
    }),
    {
      name: "mike-sports-preferences",
      storage: createJSONStorage(createStorage),
      partialize: (state) => ({
        favorites: state.favorites,
        zipCode: state.zipCode,
        watchPriority: state.watchPriority,
      }),
    },
  ),
);
