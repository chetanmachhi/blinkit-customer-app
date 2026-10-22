import { create } from "zustand";
import { storage } from "../utils/storage";
import { APP_CONFIG, STORAGE_KEYS } from "../config/constants";

interface SearchState {
  recentSearches: string[];
  loadRecentSearches: () => Promise<void>;
  addRecentSearch: (query: string) => Promise<void>;
  removeRecentSearch: (query: string) => Promise<void>;
  clearRecentSearches: () => Promise<void>;
}

export const useSearchStore = create<SearchState>((set, get) => ({
  recentSearches: [],

  loadRecentSearches: async () => {
    const list =
      (await storage.get<string[]>(STORAGE_KEYS.RECENT_SEARCHES)) || [];
    set({ recentSearches: list });
  },

  addRecentSearch: async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;

    const current = get().recentSearches.filter(
      (item) => item.toLowerCase() !== trimmed.toLowerCase()
    );
    const updated = [trimmed, ...current].slice(
      0,
      APP_CONFIG.MAX_RECENT_SEARCHES
    );

    await storage.set(STORAGE_KEYS.RECENT_SEARCHES, updated);
    set({ recentSearches: updated });
  },

  removeRecentSearch: async (query: string) => {
    const updated = get().recentSearches.filter((item) => item !== query);
    await storage.set(STORAGE_KEYS.RECENT_SEARCHES, updated);
    set({ recentSearches: updated });
  },

  clearRecentSearches: async () => {
    await storage.remove(STORAGE_KEYS.RECENT_SEARCHES);
    set({ recentSearches: [] });
  },
}));
