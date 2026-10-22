import { apiClient } from "./client";
import {
  CatalogSection,
  ICategory,
  IProduct,
  PaginatedResult,
  ProductSort,
  ResponseModel,
} from "./types";

export interface ProductQueryParams {
  storeId?: string;
  categoryId?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  q?: string;
  sort?: ProductSort;
  page?: number;
  limit?: number;
}

export const catalogApi = {
  async getCatalogHome(): Promise<CatalogSection[]> {
    const response = await apiClient.get<ResponseModel<CatalogSection[]>>(
      "/catalog/home"
    );
    return response.data.data || [];
  },

  async getCategories(
    parentId?: string | null
  ): Promise<PaginatedResult<ICategory>> {
    const params: Record<string, string> = { limit: "50" };
    if (parentId !== undefined && parentId !== null) {
      params.parentId = parentId;
    }
    const response = await apiClient.get<
      ResponseModel<PaginatedResult<ICategory>>
    >("/categories", { params });
    return response.data.data || { items: [], pagination: { page: 1, limit: 50, total: 0, totalPages: 1, hasNext: false } };
  },

  async getCategory(categoryId: string): Promise<ICategory> {
    const response = await apiClient.get<ResponseModel<ICategory>>(
      `/categories/${categoryId}`
    );
    return response.data.data!;
  },

  async getProducts(
    params: ProductQueryParams = {}
  ): Promise<PaginatedResult<IProduct>> {
    const response = await apiClient.get<
      ResponseModel<PaginatedResult<IProduct>>
    >("/products", { params });
    return response.data.data || { items: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 1, hasNext: false } };
  },

  async getProduct(productId: string): Promise<IProduct> {
    const response = await apiClient.get<ResponseModel<IProduct>>(
      `/products/${productId}`
    );
    return response.data.data!;
  },
};
