import { create } from "zustand";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastConfig {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface UiState {
  toast: ToastConfig | null;
  isOffline: boolean;
  showToast: (
    message: string,
    type?: ToastType,
    duration?: number
  ) => void;
  hideToast: () => void;
  setOffline: (isOffline: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  toast: null,
  isOffline: false,

  showToast: (message, type = "info", duration = 3000) => {
    const id = Date.now().toString();
    set({ toast: { id, message, type, duration } });
  },

  hideToast: () => {
    set({ toast: null });
  },

  setOffline: (isOffline) => {
    set({ isOffline });
  },
}));
