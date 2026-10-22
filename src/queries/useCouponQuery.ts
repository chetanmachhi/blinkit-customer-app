import { useQuery } from "@tanstack/react-query";
import { couponApi } from "../api/coupon.api";
import { queryKeys } from "./keys";
import { useLocationStore } from "../store/location.store";

export const useApplicableCouponsQuery = () => {
  const activeStore = useLocationStore((s) => s.activeStore);
  const storeId = activeStore?._id;

  return useQuery({
    queryKey: queryKeys.coupon.applicable(storeId),
    queryFn: () => couponApi.getApplicableCoupons(),
    enabled: !!storeId,
    staleTime: 5 * 60 * 1000,
  });
};
