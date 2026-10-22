import { useQuery } from "@tanstack/react-query";
import { storeApi } from "../api/store.api";
import { queryKeys } from "./keys";
import { useLocationStore } from "../store/location.store";

export const useStoresQuery = () => {
  return useQuery({
    queryKey: queryKeys.store.all,
    queryFn: () => storeApi.getStores(),
    staleTime: 10 * 60 * 1000,
  });
};

export const useNearbyStoresQuery = (
  lat?: number,
  lng?: number,
  radiusKm: number = 10
) => {
  return useQuery({
    queryKey: queryKeys.store.nearby(lat || 0, lng || 0),
    queryFn: () => storeApi.getNearbyStores(lat!, lng!, radiusKm),
    enabled: lat !== undefined && lng !== undefined,
    staleTime: 5 * 60 * 1000,
  });
};

export const useStoreDetailQuery = (storeId?: string) => {
  return useQuery({
    queryKey: queryKeys.store.detail(storeId || ""),
    queryFn: () => storeApi.getStore(storeId!),
    enabled: !!storeId,
    staleTime: 10 * 60 * 1000,
  });
};

export const useStoreServiceabilityQuery = (
  storeId?: string,
  lat?: number,
  lng?: number
) => {
  const setServiceability = useLocationStore((s) => s.setServiceability);

  return useQuery({
    queryKey: queryKeys.store.serviceability(
      storeId || "",
      lat || 0,
      lng || 0
    ),
    queryFn: async () => {
      const result = await storeApi.getServiceability(storeId!, lat!, lng!);
      setServiceability(result);
      return result;
    },
    enabled: !!storeId && lat !== undefined && lng !== undefined,
    staleTime: 2 * 60 * 1000,
  });
};
