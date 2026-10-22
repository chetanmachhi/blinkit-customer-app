import { apiClient } from "./client";
import {
  IStore,
  ResponseModel,
  StoreServiceability,
} from "./types";

export const storeApi = {
  async getStores(): Promise<IStore[]> {
    const response = await apiClient.get<ResponseModel<IStore[]>>("/stores");
    return response.data.data || [];
  },

  async getNearbyStores(
    lat: number,
    lng: number,
    radiusKm: number = 10
  ): Promise<IStore[]> {
    const response = await apiClient.get<ResponseModel<IStore[]>>(
      "/stores/nearby",
      {
        params: { lat, lng, radiusKm },
      }
    );
    return response.data.data || [];
  },

  async getStore(storeId: string): Promise<IStore> {
    const response = await apiClient.get<ResponseModel<IStore>>(
      `/stores/${storeId}`
    );
    return response.data.data!;
  },

  async getServiceability(
    storeId: string,
    lat: number,
    lng: number
  ): Promise<StoreServiceability> {
    const response = await apiClient.get<
      ResponseModel<StoreServiceability>
    >(`/stores/${storeId}/serviceability`, {
      params: { lat, lng },
    });
    return response.data.data!;
  },
};
