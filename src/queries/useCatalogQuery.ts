import { useQuery } from "@tanstack/react-query";
import { catalogApi, ProductQueryParams } from "../api/catalog.api";
import { queryKeys } from "./keys";
import { useLocationStore } from "../store/location.store";
import { env } from "../config/env";

export const useCatalogHomeQuery = () => {
  const activeStore = useLocationStore((s) => s.activeStore);
  const storeId = activeStore?._id || env.DEFAULT_STORE_ID;

  return useQuery({
    queryKey: queryKeys.catalog.home(storeId),
    queryFn: () => catalogApi.getCatalogHome(),
    enabled: !!storeId,
    staleTime: 3 * 60 * 1000,
  });
};

export const useCategoriesQuery = (parentId?: string | null) => {
  return useQuery({
    queryKey: queryKeys.catalog.categories(parentId),
    queryFn: () => catalogApi.getCategories(parentId),
    staleTime: 10 * 60 * 1000,
  });
};

export const useCategoryDetailQuery = (categoryId?: string) => {
  return useQuery({
    queryKey: queryKeys.catalog.category(categoryId || ""),
    queryFn: () => catalogApi.getCategory(categoryId!),
    enabled: !!categoryId,
    staleTime: 10 * 60 * 1000,
  });
};

export const useProductsQuery = (params: ProductQueryParams = {}) => {
  const activeStore = useLocationStore((s) => s.activeStore);
  const effectiveParams = {
    ...params,
    storeId: params.storeId || activeStore?._id || env.DEFAULT_STORE_ID,
  };

  return useQuery({
    queryKey: queryKeys.catalog.products(effectiveParams),
    queryFn: () => catalogApi.getProducts(effectiveParams),
    enabled: !!effectiveParams.storeId,
    staleTime: 2 * 60 * 1000,
  });
};

export const useProductDetailQuery = (productId?: string) => {
  return useQuery({
    queryKey: queryKeys.catalog.product(productId || ""),
    queryFn: () => catalogApi.getProduct(productId!),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
  });
};
