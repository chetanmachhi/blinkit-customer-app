import { apiClient } from "./client";
import {
  AuthResponse,
  AuthTokens,
  RequestOtpResponse,
  ResponseModel,
} from "./types";

export const authApi = {
  async requestOtp(phone: string): Promise<RequestOtpResponse> {
    const response = await apiClient.post<ResponseModel<RequestOtpResponse>>(
      "/auth/request-otp",
      { phone }
    );
    return response.data.data!;
  },

  async verifyOtp(
    phone: string,
    otp: string,
    name?: string
  ): Promise<AuthResponse> {
    const response = await apiClient.post<ResponseModel<AuthResponse>>(
      "/auth/verify-otp",
      { phone, otp, name }
    );
    return response.data.data!;
  },

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    const response = await apiClient.post<ResponseModel<AuthTokens>>(
      "/auth/refresh",
      { refreshToken }
    );
    return response.data.data!;
  },

  async logout(refreshToken: string): Promise<void> {
    await apiClient.post<ResponseModel<void>>("/auth/logout", {
      refreshToken,
    });
  },

  async logoutAll(): Promise<void> {
    await apiClient.post<ResponseModel<void>>("/auth/logout-all");
  },
};
