import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userApi } from "../api/user.api";
import { queryKeys } from "./keys";
import { useAuthStore } from "../store/auth.store";
import { useUiStore } from "../store/ui.store";
import { ApiError } from "../utils/errors";

export const useUserMeQuery = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setUser = useAuthStore((s) => s.setUser);

  return useQuery({
    queryKey: queryKeys.user.me,
    queryFn: async () => {
      const user = await userApi.getMe();
      setUser(user);
      return user;
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
};

export const useUpdateMeMutation = () => {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  const showToast = useUiStore((s) => s.showToast);

  return useMutation({
    mutationFn: (data: { name?: string; email?: string }) =>
      userApi.updateMe(data),
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      queryClient.setQueryData(queryKeys.user.me, updatedUser);
      showToast("Profile updated successfully", "success");
    },
    onError: (err: ApiError) => {
      if (err.showMessage) {
        showToast(err.message, "error");
      }
    },
  });
};

export const useDeleteMeMutation = () => {
  const clearSession = useAuthStore((s) => s.clearSession);
  const showToast = useUiStore((s) => s.showToast);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => userApi.deleteMe(),
    onSuccess: async () => {
      await clearSession();
      queryClient.clear();
      showToast("Account deactivated", "info");
    },
    onError: (err: ApiError) => {
      if (err.showMessage) {
        showToast(err.message, "error");
      }
    },
  });
};
