import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { env } from "../config/env";
import { ResponseModel } from "./types";
import { ApiError } from "../utils/errors";
import {
  getTokens,
  saveTokens,
  clearTokens,
} from "../utils/secureStorage";

let inMemoryAccessToken: string | null = null;
let inMemoryStoreId: string | null = null;
let onAuthFailedCallback: (() => void) | null = null;

let refreshPromise: Promise<string | null> | null = null;

export const setClientAccessToken = (token: string | null): void => {
  inMemoryAccessToken = token;
};

export const setClientStoreId = (storeId: string | null): void => {
  inMemoryStoreId = storeId;
};

export const setOnAuthFailed = (callback: () => void): void => {
  onAuthFailedCallback = callback;
};

export const apiClient = axios.create({
  baseURL: env.API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (inMemoryAccessToken) {
      config.headers.Authorization = `Bearer ${inMemoryAccessToken}`;
    }
    const storeIdToUse = inMemoryStoreId || env.DEFAULT_STORE_ID;
    if (storeIdToUse) {
      config.headers["x-store-id"] = storeIdToUse;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const executeTokenRefresh = async (): Promise<string | null> => {
  try {
    const tokens = await getTokens();
    if (!tokens?.refreshToken) {
      return null;
    }

    const response = await axios.post<
      ResponseModel<{
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
      }>
    >(
      `${env.API_BASE_URL}/auth/refresh`,
      { refreshToken: tokens.refreshToken },
      { headers: { "Content-Type": "application/json" } }
    );

    const data = response.data?.data;
    if (data?.accessToken && data?.refreshToken) {
      setClientAccessToken(data.accessToken);
      await saveTokens(data.accessToken, data.refreshToken);
      return data.accessToken;
    }
    return null;
  } catch {
    await clearTokens();
    setClientAccessToken(null);
    if (onAuthFailedCallback) {
      onAuthFailedCallback();
    }
    return null;
  } finally {
    refreshPromise = null;
  }
};

apiClient.interceptors.response.use(
  (response) => {
    const envelope = response.data as ResponseModel;
    if (
      envelope &&
      typeof envelope.statusCode === "number" &&
      envelope.statusCode >= 400
    ) {
      throw new ApiError(
        envelope.message || "Request failed",
        envelope.statusCode,
        envelope.showMessage !== false,
        envelope.data
      );
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh") &&
      !originalRequest.url?.includes("/auth/verify-otp")
    ) {
      originalRequest._retry = true;

      if (!refreshPromise) {
        refreshPromise = executeTokenRefresh();
      }

      const newAccessToken = await refreshPromise;
      if (newAccessToken) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      }
    }

    const responseData = error.response?.data as ResponseModel | undefined;
    const statusCode = error.response?.status || 500;
    const message =
      responseData?.message ||
      error.message ||
      "An unexpected network error occurred";
    const showMessage = responseData?.showMessage ?? true;

    throw new ApiError(message, statusCode, showMessage, responseData?.data);
  }
);
