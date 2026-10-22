import { OrderStatus } from "../api/types";
import { colors } from "../config/theme";

export interface StatusMeta {
  label: string;
  color: string;
  bgColor: string;
  description: string;
  stepIndex: number;
  isTerminal: boolean;
}

export const getOrderStatusMeta = (status: OrderStatus): StatusMeta => {
  switch (status) {
    case OrderStatus.PLACED:
      return {
        label: "Order Placed",
        color: colors.primary,
        bgColor: colors.primarySoft,
        description: "Your order has been received by the store",
        stepIndex: 1,
        isTerminal: false,
      };
    case OrderStatus.ACCEPTED:
      return {
        label: "Order Accepted",
        color: colors.primaryDark,
        bgColor: colors.primarySoft,
        description: "Store has accepted your order and preparing items",
        stepIndex: 2,
        isTerminal: false,
      };
    case OrderStatus.PREPARING:
      return {
        label: "Packing Items",
        color: colors.warning,
        bgColor: colors.warningSoft,
        description: "Your grocery bag is being packed with care",
        stepIndex: 3,
        isTerminal: false,
      };
    case OrderStatus.OUT_FOR_DELIVERY:
      return {
        label: "Out for Delivery",
        color: colors.discountBadge,
        bgColor: "#EDE9FE",
        description: "Delivery partner is on the way to your location",
        stepIndex: 4,
        isTerminal: false,
      };
    case OrderStatus.DELIVERED:
      return {
        label: "Delivered",
        color: colors.success,
        bgColor: colors.successSoft,
        description: "Order has been safely delivered to you",
        stepIndex: 5,
        isTerminal: true,
      };
    case OrderStatus.CANCELLED:
      return {
        label: "Cancelled",
        color: colors.danger,
        bgColor: colors.dangerSoft,
        description: "This order was cancelled",
        stepIndex: 0,
        isTerminal: true,
      };
    default:
      return {
        label: "Unknown",
        color: colors.textMuted,
        bgColor: colors.borderLight,
        description: "",
        stepIndex: 0,
        isTerminal: false,
      };
  }
};
