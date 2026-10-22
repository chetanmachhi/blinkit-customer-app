import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orderApi } from "../api/order.api";
import { CreateOrderDto, OrderStatus } from "../api/types";
import { queryKeys } from "./keys";
import { useAuthStore } from "../store/auth.store";
import { useLocationStore } from "../store/location.store";
import { useUiStore } from "../store/ui.store";
import { ApiError } from "../utils/errors";
import { APP_CONFIG } from "../config/constants";

export const useOrdersQuery = (
  page: number = 1,
  limit: number = 10,
  status?: OrderStatus
) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: queryKeys.order.list({ page, limit, status }),
    queryFn: () => orderApi.getOrders(page, limit, status),
    enabled: isAuthenticated,
    staleTime: 60 * 1000,
  });
};

export const useOrderDetailQuery = (orderId?: string) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: queryKeys.order.detail(orderId || ""),
    queryFn: () => orderApi.getOrder(orderId!),
    enabled: isAuthenticated && !!orderId,
    staleTime: 30 * 1000,
  });
};

export const useOrderTrackingQuery = (
  orderId?: string,
  isTerminal: boolean = false
) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: queryKeys.order.track(orderId || ""),
    queryFn: () => orderApi.trackOrder(orderId!),
    enabled: isAuthenticated && !!orderId,
    refetchInterval: isTerminal ? false : APP_CONFIG.POLLING_INTERVAL_MS,
  });
};

export const useCreateOrderMutation = () => {
  const queryClient = useQueryClient();
  const showToast = useUiStore((s) => s.showToast);
  const activeStore = useLocationStore((s) => s.activeStore);
  const storeId = activeStore?._id;

  return useMutation({
    mutationFn: ({
      data,
      idempotencyKey,
    }: {
      data: CreateOrderDto;
      idempotencyKey?: string;
    }) => orderApi.createOrder(data, idempotencyKey),
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.detail(storeId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.order.list() });
      showToast("Order placed successfully!", "success");
    },
    onError: (err: ApiError) => {
      if (err.showMessage) {
        showToast(err.message, "error");
      }
    },
  });
};

export const useCancelOrderMutation = () => {
  const queryClient = useQueryClient();
  const showToast = useUiStore((s) => s.showToast);

  return useMutation({
    mutationFn: ({
      orderId,
      reason,
    }: {
      orderId: string;
      reason: string;
    }) => orderApi.cancelOrder(orderId, reason),
    onSuccess: (order) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.order.detail(order._id),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.order.track(order._id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.order.list() });
      showToast("Order cancelled", "info");
    },
    onError: (err: ApiError) => {
      if (err.showMessage) {
        showToast(err.message, "error");
      }
    },
  });
};

export const useReorderMutation = () => {
  const queryClient = useQueryClient();
  const showToast = useUiStore((s) => s.showToast);
  const activeStore = useLocationStore((s) => s.activeStore);
  const storeId = activeStore?._id;

  return useMutation({
    mutationFn: (orderId: string) => orderApi.reorder(orderId),
    onSuccess: (cart) => {
      queryClient.setQueryData(queryKeys.cart.detail(storeId), cart);
      showToast("Items added to your cart", "success");
    },
    onError: (err: ApiError) => {
      if (err.showMessage) {
        showToast(err.message, "error");
      }
    },
  });
};
