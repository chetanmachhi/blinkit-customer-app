export enum Role {
  CUSTOMER = "customer",
  ADMIN = "admin",
}

export enum OrderStatus {
  PLACED = "placed",
  ACCEPTED = "accepted",
  PREPARING = "preparing",
  OUT_FOR_DELIVERY = "out_for_delivery",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
}

export enum PaymentMethod {
  COD = "cod",
  ONLINE = "online",
}

export enum PaymentStatus {
  PENDING = "pending",
  PAID = "paid",
  FAILED = "failed",
  REFUNDED = "refunded",
}

export enum CouponType {
  PERCENT = "percent",
  FLAT = "flat",
}

export enum AddressLabel {
  HOME = "home",
  WORK = "work",
  OTHER = "other",
}

export enum ProductSort {
  PRICE_ASC = "price_asc",
  PRICE_DESC = "price_desc",
  NEWEST = "newest",
  DISCOUNT = "discount",
}

export interface ResponseModel<T = any> {
  statusCode: number;
  showMessage: boolean;
  message: string;
  data?: T;
}

export interface PaginationResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: PaginationResponse;
}

export interface IUser {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  role: Role;
  storeIds: string[];
  isActive: boolean;
  isPhoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: IUser;
  accessToken: string;
  refreshToken: string;
  tokens?: AuthTokens;
}

export interface RequestOtpResponse {
  success: boolean;
  message: string;
  devOtp?: string;
}

export interface ICoordinates {
  lat: number;
  lng: number;
}

export interface IAddress {
  _id: string;
  userId: string;
  label: AddressLabel;
  receiverName: string;
  receiverPhone: string;
  addressLine: string;
  landmark?: string;
  city: string;
  pincode: string;
  coordinates: ICoordinates;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAddressDto {
  label?: AddressLabel;
  receiverName: string;
  receiverPhone: string;
  addressLine: string;
  landmark?: string;
  city: string;
  pincode: string;
  coordinates: ICoordinates;
}

export interface UpdateAddressDto {
  label?: AddressLabel;
  receiverName?: string;
  receiverPhone?: string;
  addressLine?: string;
  landmark?: string;
  city?: string;
  pincode?: string;
  coordinates?: ICoordinates;
}

export interface IStore {
  _id: string;
  name: string;
  phone: string;
  address: string;
  isActive: boolean;
  location: ICoordinates;
  deliveryRadiusKm: number;
  minOrderAmount: number;
  deliveryFee: number;
  freeDeliveryAbove: number;
  handlingFee: number;
  avgPrepMinutes: number;
  opensAt: string;
  closesAt: string;
  timezone: string;
  createdAt: string;
  updatedAt: string;
  distanceKm?: number;
}

export interface StoreServiceability {
  serviceable: boolean;
  distanceKm: number;
  isOpen: boolean;
  etaMinutes: number | null;
  deliveryFee: number;
  minOrderAmount: number;
}

export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  imageUrl: string;
  parentId?: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IProduct {
  _id: string;
  storeId: string;
  categoryId: string;
  name: string;
  description: string;
  brand: string;
  unit: string;
  mrp: number;
  price: number;
  stock: number;
  maxPerOrder: number;
  imageUrl: string;
  images: string[];
  tags: string[];
  isAvailable: boolean;
  discountPercent: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartLineView {
  productId: string;
  name: string;
  imageUrl: string;
  unit: string;
  mrp: number;
  price: number;
  quantity: number;
  lineTotal: number;
  maxPerOrder: number;
  stock: number;
  isAvailable: boolean;
  flag?: "unavailable" | "out_of_stock" | "quantity_reduced";
}

export interface BillSummary {
  itemTotal: number;
  discount: number;
  deliveryFee: number;
  handlingFee: number;
  grandTotal: number;
}

export interface CartView {
  _id: string;
  storeId: string;
  items: CartLineView[];
  couponCode?: string;
  bill: BillSummary;
  itemCount: number;
}

export interface ICoupon {
  _id: string;
  code: string;
  description: string;
  type: CouponType;
  value: number;
  maxDiscount?: number;
  minOrderAmount: number;
  validFrom: string;
  validTo: string;
  usageLimit?: number;
  perUserLimit: number;
  usedCount: number;
  storeId?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IOrderItem {
  productId: string;
  name: string;
  imageUrl: string;
  unit: string;
  mrp: number;
  price: number;
  quantity: number;
  lineTotal: number;
}

export interface IStatusHistoryEntry {
  status: OrderStatus;
  at: string;
  note?: string;
}

export interface IDeliveryAddress {
  label?: string;
  addressLine: string;
  landmark?: string;
  coordinates: ICoordinates;
}

export interface IOrder {
  _id: string;
  orderNumber: string;
  userId: string;
  storeId: string;
  customer: {
    name: string;
    phone: string;
  };
  items: IOrderItem[];
  bill: BillSummary;
  totalAmount: number;
  couponCode?: string;
  status: OrderStatus;
  statusHistory: IStatusHistoryEntry[];
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  deliveryAddress: IDeliveryAddress;
  notes?: string;
  cancelReason?: string;
  idempotencyKey?: string;
  estimatedDeliveryAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderTrackingInfo {
  status: OrderStatus;
  statusHistory: IStatusHistoryEntry[];
  estimatedDeliveryAt?: string;
}

export interface CatalogSection {
  category: ICategory;
  products: IProduct[];
}

export interface CreateOrderDto {
  addressId?: string;
  deliveryAddress?: IDeliveryAddress;
  paymentMethod: PaymentMethod;
  notes?: string;
}
