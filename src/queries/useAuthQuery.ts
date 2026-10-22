import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../api/auth.api";
import { useAuthStore } from "../store/auth.store";
import { useUiStore } from "../store/ui.store";
import { ApiError } from "../utils/errors";

export const useRequestOtpMutation = () => {
  const showToast = useUiStore((s) => s.showToast);

  return useMutation({
    mutationFn: (phone: string) => authApi.requestOtp(phone),
    onSuccess: (data) => {
      showToast(data.message, "success");
    },
    onError: (err: ApiError) => {
      if (err.showMessage) {
        showToast(err.message, "error");
      }
    },
  });
};

export const useVerifyOtpMutation = () => {
  const setSession = useAuthStore((s) => s.setSession);
  const showToast = useUiStore((s) => s.showToast);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      phone,
      otp,
      name,
    }: {
      phone: string;
      otp: string;
      name?: string;
    }) => authApi.verifyOtp(phone, otp, name),
    onSuccess: async (data) => {
      const accessToken = data.accessToken || data.tokens?.accessToken;
      const refreshToken = data.refreshToken || data.tokens?.refreshToken;
      if (accessToken && refreshToken) {
        await setSession(data.user, accessToken, refreshToken);
      }
      queryClient.invalidateQueries();
      showToast("Welcome to InstantMart!", "success");
    },
    onError: (err: ApiError) => {
      if (err.showMessage) {
        showToast(err.message, "error");
      }
    },
  });
};

export const useLogoutMutation = () => {
  const clearSession = useAuthStore((s) => s.clearSession);
  const showToast = useUiStore((s) => s.showToast);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (refreshToken: string) => {
      try {
        await authApi.logout(refreshToken);
      } finally {
        await clearSession();
        queryClient.clear();
      }
    },
    onSuccess: () => {
      showToast("Logged out successfully", "info");
    },
  });
};

export const useLogoutAllMutation = () => {
  const clearSession = useAuthStore((s) => s.clearSession);
  const showToast = useUiStore((s) => s.showToast);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      try {
        await authApi.logoutAll();
      } finally {
        await clearSession();
        queryClient.clear();
      }
    },
    onSuccess: () => {
      showToast("All sessions logged out", "info");
    },
  });
};
