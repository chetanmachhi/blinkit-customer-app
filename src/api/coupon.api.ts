import { apiClient } from "./client";
import { ICoupon, ResponseModel } from "./types";

export const couponApi = {
  async getApplicableCoupons(): Promise<ICoupon[]> {
    const response = await apiClient.get<ResponseModel<ICoupon[]>>(
      "/coupons/applicable"
    );
    return response.data.data || [];
  },
};
