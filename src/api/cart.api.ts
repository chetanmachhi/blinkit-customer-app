import { apiClient } from "./client";
import { CartView, ResponseModel } from "./types";

export const cartApi = {
  async getCart(): Promise<CartView> {
    const response = await apiClient.get<ResponseModel<CartView>>("/cart");
    return response.data.data!;
  },

  async upsertCartItem(
    productId: string,
    quantity: number
  ): Promise<CartView> {
    const response = await apiClient.post<ResponseModel<CartView>>(
      "/cart/items",
      { productId, quantity }
    );
    return response.data.data!;
  },

  async removeCartItem(productId: string): Promise<CartView> {
    const response = await apiClient.delete<ResponseModel<CartView>>(
      `/cart/items/${productId}`
    );
    return response.data.data!;
  },

  async clearCart(): Promise<void> {
    await apiClient.delete<ResponseModel<void>>("/cart/clear");
  },

  async applyCoupon(code: string): Promise<CartView> {
    const response = await apiClient.post<ResponseModel<CartView>>(
      "/cart/coupon",
      { code }
    );
    return response.data.data!;
  },

  async removeCoupon(): Promise<CartView> {
    const response = await apiClient.delete<ResponseModel<CartView>>(
      "/cart/coupon"
    );
    return response.data.data!;
  },
};
