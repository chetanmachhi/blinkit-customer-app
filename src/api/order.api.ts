import { apiClient } from "./client";
import {
  CartView,
  CreateOrderDto,
  IOrder,
  OrderStatus,
  OrderTrackingInfo,
  PaginatedResult,
  ResponseModel,
} from "./types";

export const orderApi = {
  async createOrder(
    data: CreateOrderDto,
    idempotencyKey?: string
  ): Promise<IOrder> {
    const headers: Record<string, string> = {};
    if (idempotencyKey) {
      headers["Idempotency-Key"] = idempotencyKey;
    }
    const response = await apiClient.post<ResponseModel<IOrder>>(
      "/orders",
      data,
      { headers }
    );
    return response.data.data!;
  },

  async getOrders(
    page: number = 1,
    limit: number = 10,
    status?: OrderStatus
  ): Promise<PaginatedResult<IOrder>> {
    const params: Record<string, any> = { page, limit };
    if (status) {
      params.status = status;
    }
    const response = await apiClient.get<
      ResponseModel<PaginatedResult<IOrder>>
    >("/orders", { params });
    return (
      response.data.data || {
        items: [],
        pagination: { page, limit, total: 0, totalPages: 1, hasNext: false },
      }
    );
  },

  async getOrder(orderId: string): Promise<IOrder> {
    const response = await apiClient.get<ResponseModel<IOrder>>(
      `/orders/${orderId}`
    );
    return response.data.data!;
  },

  async trackOrder(orderId: string): Promise<OrderTrackingInfo> {
    const response = await apiClient.get<
      ResponseModel<OrderTrackingInfo>
    >(`/orders/${orderId}/track`);
    return response.data.data!;
  },

  async cancelOrder(orderId: string, reason: string): Promise<IOrder> {
    const response = await apiClient.post<ResponseModel<IOrder>>(
      `/orders/${orderId}/cancel`,
      { reason }
    );
    return response.data.data!;
  },

  async reorder(orderId: string): Promise<CartView> {
    const response = await apiClient.post<ResponseModel<CartView>>(
      `/orders/${orderId}/reorder`
    );
    return response.data.data!;
  },
};
