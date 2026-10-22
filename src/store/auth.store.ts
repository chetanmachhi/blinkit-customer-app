import { create } from "zustand";
import { IUser } from "../api/types";
import { setClientAccessToken } from "../api/client";
import { clearTokens, saveTokens } from "../utils/secureStorage";
import { storage } from "../utils/storage";
import { STORAGE_KEYS } from "../config/constants";

interface AuthState {
  user: IUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isBootstrapped: boolean;
  setSession: (
    user: IUser,
    accessToken: string,
    refreshToken: string
  ) => Promise<void>;
  setAccessToken: (token: string | null) => void;
  setUser: (user: IUser | null) => void;
  clearSession: () => Promise<void>;
  setBootstrapped: (val: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isBootstrapped: false,

  setSession: async (user, accessToken, refreshToken) => {
    setClientAccessToken(accessToken);
    await saveTokens(accessToken, refreshToken);
    await storage.set(STORAGE_KEYS.USER, user);
    set({
      user,
      accessToken,
      isAuthenticated: true,
    });
  },

  setAccessToken: (accessToken) => {
    setClientAccessToken(accessToken);
    set({
      accessToken,
      isAuthenticated: !!accessToken,
    });
  },

  setUser: (user) => {
    if (user) {
      storage.set(STORAGE_KEYS.USER, user);
    } else {
      storage.remove(STORAGE_KEYS.USER);
    }
    set({ user });
  },

  clearSession: async () => {
    setClientAccessToken(null);
    await clearTokens();
    await storage.remove(STORAGE_KEYS.USER);
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    });
  },

  setBootstrapped: (isBootstrapped) => {
    set({ isBootstrapped });
  },
}));
