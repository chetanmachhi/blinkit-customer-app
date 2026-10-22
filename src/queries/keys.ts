export const queryKeys = {
  user: {
    me: ["user", "me"] as const,
  },
  address: {
    all: ["addresses"] as const,
  },
  store: {
    all: ["stores"] as const,
    nearby: (lat: number, lng: number) =>
      ["stores", "nearby", { lat, lng }] as const,
    detail: (storeId: string) => ["stores", "detail", storeId] as const,
    serviceability: (storeId: string, lat: number, lng: number) =>
      ["stores", "serviceability", storeId, { lat, lng }] as const,
  },
  catalog: {
    home: (storeId?: string) => ["catalog", "home", storeId] as const,
    categories: (parentId?: string | null) =>
      ["catalog", "categories", { parentId }] as const,
    category: (categoryId: string) =>
      ["catalog", "category", categoryId] as const,
    products: (params: Record<string, any>) =>
      ["catalog", "products", params] as const,
    product: (productId: string) => ["catalog", "product", productId] as const,
  },
  cart: {
    detail: (storeId?: string) => ["cart", storeId] as const,
  },
  coupon: {
    applicable: (storeId?: string) => ["coupons", "applicable", storeId] as const,
  },
  order: {
    list: (params?: Record<string, any>) => ["orders", "list", params] as const,
    detail: (orderId: string) => ["orders", "detail", orderId] as const,
    track: (orderId: string) => ["orders", "track", orderId] as const,
  },
};
