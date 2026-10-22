import { useCallback, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cartApi } from "../api/cart.api";
import { CartLineView, CartView } from "../api/types";
import { queryKeys } from "./keys";
import { useAuthStore } from "../store/auth.store";
import { useLocationStore } from "../store/location.store";
import { useUiStore } from "../store/ui.store";
import { ApiError } from "../utils/errors";

const cartDebounceTimers: Record<string, ReturnType<typeof setTimeout>> = {};
const pendingTargetQuantities: Record<string, number> = {};

export const useCartDetailQuery = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const activeStore = useLocationStore((s) => s.activeStore);
  const storeId = activeStore?._id;

  const query = useQuery({
    queryKey: queryKeys.cart.detail(storeId),
    queryFn: () => cartApi.getCart(),
    enabled: isAuthenticated && !!storeId,
    staleTime: 30 * 1000,
  });

  const itemQuantityMap = useMemo(() => {
    const map: Record<string, number> = {};
    if (query.data?.items) {
      for (const item of query.data.items) {
        map[item.productId] = item.quantity;
      }
    }
    return map;
  }, [query.data?.items]);

  return {
    ...query,
    cart: query.data,
    itemQuantityMap,
    itemCount: query.data?.itemCount || 0,
    bill: query.data?.bill,
  };
};

export const useUpsertCartItemMutation = () => {
  const queryClient = useQueryClient();
  const activeStore = useLocationStore((s) => s.activeStore);
  const showToast = useUiStore((s) => s.showToast);
  const storeId = activeStore?._id;

  return useMutation({
    mutationFn: ({
      productId,
      quantity,
    }: {
      productId: string;
      quantity: number;
    }) => cartApi.upsertCartItem(productId, quantity),

    onMutate: async ({ productId, quantity }) => {
      const cartKey = queryKeys.cart.detail(storeId);
      await queryClient.cancelQueries({ queryKey: cartKey });

      const previousCart = queryClient.getQueryData<CartView>(cartKey);

      if (previousCart) {
        const existingIndex = previousCart.items.findIndex(
          (i) => i.productId === productId
        );
        let updatedItems = [...previousCart.items];

        if (quantity === 0) {
          updatedItems = updatedItems.filter((i) => i.productId !== productId);
        } else if (existingIndex >= 0) {
          const item = { ...updatedItems[existingIndex], quantity };
          item.lineTotal = item.price * quantity;
          updatedItems[existingIndex] = item;
        } else {
          updatedItems.push({
            productId,
            name: "Item",
            imageUrl: "",
            price: 0,
            mrp: 0,
            unit: "1 unit",
            quantity,
            lineTotal: 0,
            maxPerOrder: 10,
            isAvailable: true,
            stock: 99,
          });
        }

        const totalItemsCount = updatedItems.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
        const itemTotal = updatedItems.reduce(
          (sum, item) => sum + item.lineTotal,
          0
        );

        queryClient.setQueryData<CartView>(cartKey, {
          ...previousCart,
          items: updatedItems,
          itemCount: totalItemsCount,
          bill: {
            ...previousCart.bill,
            itemTotal,
            grandTotal: Math.max(
              0,
              itemTotal -
                (previousCart.bill?.discount || 0) +
                (previousCart.bill?.deliveryFee || 0) +
                (previousCart.bill?.handlingFee || 0)
            ),
          },
        });
      }

      return { previousCart };
    },

    onError: (err: ApiError, _, context) => {
      const cartKey = queryKeys.cart.detail(storeId);
      if (context?.previousCart) {
        queryClient.setQueryData(cartKey, context.previousCart);
      }
      if (err.statusCode === 409) {
        queryClient.invalidateQueries({ queryKey: cartKey });
      }
      if (err.showMessage) {
        showToast(err.message, "error");
      }
    },

    onSuccess: (updatedCart) => {
      const cartKey = queryKeys.cart.detail(storeId);
      queryClient.setQueryData(cartKey, updatedCart);
    },
  });
};

export const useDebouncedCart = () => {
  const queryClient = useQueryClient();
  const activeStore = useLocationStore((s) => s.activeStore);
  const showToast = useUiStore((s) => s.showToast);
  const storeId = activeStore?._id;

  const updateQuantity = useCallback(
    (
      productId: string,
      quantity: number,
      productSnapshot?: {
        name?: string;
        price?: number;
        mrp?: number;
        unit?: string;
        imageUrl?: string;
        stock?: number;
        maxPerOrder?: number;
      }
    ) => {
      pendingTargetQuantities[productId] = quantity;

      const cartKey = queryKeys.cart.detail(storeId);
      const previousCart = queryClient.getQueryData<CartView>(cartKey);

      if (previousCart) {
        const existingIndex = previousCart.items.findIndex(
          (i) => i.productId === productId
        );
        let updatedItems = [...previousCart.items];

        if (quantity <= 0) {
          updatedItems = updatedItems.filter((i) => i.productId !== productId);
        } else if (existingIndex >= 0) {
          const item = { ...updatedItems[existingIndex], quantity };
          item.lineTotal = item.price * quantity;
          updatedItems[existingIndex] = item;
        } else {
          const itemPrice = productSnapshot?.price || 0;
          updatedItems.push({
            productId,
            name: productSnapshot?.name || "Item",
            imageUrl: productSnapshot?.imageUrl || "",
            price: itemPrice,
            mrp: productSnapshot?.mrp || itemPrice,
            unit: productSnapshot?.unit || "1 unit",
            quantity,
            lineTotal: itemPrice * quantity,
            maxPerOrder: productSnapshot?.maxPerOrder || 10,
            isAvailable: true,
            stock: productSnapshot?.stock || 99,
          });
        }

        const totalItemsCount = updatedItems.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
        const itemTotal = updatedItems.reduce(
          (sum, item) => sum + item.lineTotal,
          0
        );

        queryClient.setQueryData<CartView>(cartKey, {
          ...previousCart,
          items: updatedItems,
          itemCount: totalItemsCount,
          bill: {
            ...previousCart.bill,
            itemTotal,
            grandTotal: Math.max(
              0,
              itemTotal -
                (previousCart.bill?.discount || 0) +
                (previousCart.bill?.deliveryFee || 0) +
                (previousCart.bill?.handlingFee || 0)
            ),
          },
        });
      }

      if (cartDebounceTimers[productId]) {
        clearTimeout(cartDebounceTimers[productId]);
      }

      cartDebounceTimers[productId] = setTimeout(async () => {
        delete cartDebounceTimers[productId];
        const targetQty = pendingTargetQuantities[productId] ?? quantity;
        try {
          const updated = await cartApi.upsertCartItem(productId, targetQty);
          if (pendingTargetQuantities[productId] === targetQty) {
            delete pendingTargetQuantities[productId];
            queryClient.setQueryData(cartKey, updated);
          }
        } catch (err: any) {
          delete pendingTargetQuantities[productId];
          if (previousCart) {
            queryClient.setQueryData(cartKey, previousCart);
          }
          queryClient.invalidateQueries({ queryKey: cartKey });
          if (err?.message) {
            showToast(err.message, "error");
          }
        }
      }, 300);
    },
    [queryClient, storeId, showToast]
  );

  return { updateQuantity };
};

export const useRemoveCartItemMutation = () => {
  const queryClient = useQueryClient();
  const activeStore = useLocationStore((s) => s.activeStore);
  const showToast = useUiStore((s) => s.showToast);
  const storeId = activeStore?._id;

  return useMutation({
    mutationFn: (productId: string) => cartApi.removeCartItem(productId),
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(queryKeys.cart.detail(storeId), updatedCart);
    },
    onError: (err: ApiError) => {
      if (err.showMessage) {
        showToast(err.message, "error");
      }
    },
  });
};

export const useClearCartMutation = () => {
  const queryClient = useQueryClient();
  const activeStore = useLocationStore((s) => s.activeStore);
  const showToast = useUiStore((s) => s.showToast);
  const storeId = activeStore?._id;

  return useMutation({
    mutationFn: () => cartApi.clearCart(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.detail(storeId) });
      showToast("Cart cleared", "info");
    },
    onError: (err: ApiError) => {
      if (err.showMessage) {
        showToast(err.message, "error");
      }
    },
  });
};

export const useApplyCouponMutation = () => {
  const queryClient = useQueryClient();
  const activeStore = useLocationStore((s) => s.activeStore);
  const showToast = useUiStore((s) => s.showToast);
  const storeId = activeStore?._id;

  return useMutation({
    mutationFn: (code: string) => cartApi.applyCoupon(code),
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(queryKeys.cart.detail(storeId), updatedCart);
      showToast("Coupon applied successfully", "success");
    },
    onError: (err: ApiError) => {
      if (err.showMessage) {
        showToast(err.message, "error");
      }
    },
  });
};

export const useRemoveCouponMutation = () => {
  const queryClient = useQueryClient();
  const activeStore = useLocationStore((s) => s.activeStore);
  const showToast = useUiStore((s) => s.showToast);
  const storeId = activeStore?._id;

  return useMutation({
    mutationFn: () => cartApi.removeCoupon(),
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(queryKeys.cart.detail(storeId), updatedCart);
      showToast("Coupon removed", "info");
    },
    onError: (err: ApiError) => {
      if (err.showMessage) {
        showToast(err.message, "error");
      }
    },
  });
};
