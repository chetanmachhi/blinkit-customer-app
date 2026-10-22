import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { IOrder, OrderStatus } from "../../api/types";
import { colors, radii, shadows, spacing } from "../../config/theme";
import { AppText } from "../common/AppText";
import { Badge } from "../common/Badge";
import { Button } from "../common/Button";
import { Divider } from "../common/Divider";
import { formatPaise } from "../../utils/money";
import { formatDate } from "../../utils/date";
import { getOrderStatusMeta } from "../../utils/orderStatus";
import { ChevronRight } from "lucide-react-native";

export interface OrderCardProps {
  order: IOrder;
  onPress: (order: IOrder) => void;
  onReorder: (orderId: string) => void;
  isReordering?: boolean;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onPress,
  onReorder,
  isReordering = false,
}) => {
  const statusMeta = getOrderStatusMeta(order.status);
  const itemsSummary = order.items
    .slice(0, 2)
    .map((i) => `${i.quantity}x ${i.name}`)
    .join(", ");
  const extraItemsCount = order.items.length - 2;

  const isTerminal =
    order.status === OrderStatus.DELIVERED ||
    order.status === OrderStatus.CANCELLED;

  return (
    <TouchableOpacity
      onPress={() => onPress(order)}
      activeOpacity={0.8}
      style={styles.card}
    >
      <View style={styles.topRow}>
        <View>
          <AppText variant="sm" weight="bold" color={colors.text}>
            Order #{order.orderNumber}
          </AppText>
          <AppText variant="xs" color={colors.textLight} style={styles.date}>
            {formatDate(order.createdAt)}
          </AppText>
        </View>

        <Badge
          label={statusMeta.label}
          variant={
            order.status === OrderStatus.DELIVERED
              ? "success"
              : order.status === OrderStatus.CANCELLED
              ? "danger"
              : "warning"
          }
        />
      </View>

      <Divider marginVertical={spacing.sm} />

      <View style={styles.itemsRow}>
        <AppText variant="sm" color={colors.textMuted} numberOfLines={1} style={styles.itemsText}>
          {itemsSummary}
          {extraItemsCount > 0 ? ` + ${extraItemsCount} more` : ""}
        </AppText>
        <ChevronRight size={16} color={colors.textLight} />
      </View>

      <View style={styles.bottomRow}>
        <View>
          <AppText variant="xs" color={colors.textMuted}>
            Total Amount
          </AppText>
          <AppText variant="sm" weight="bold" color={colors.text}>
            {formatPaise(order.bill?.grandTotal || order.totalAmount)}
          </AppText>
        </View>

        {isTerminal ? (
          <Button
            title="Reorder"
            onPress={() => onReorder(order._id)}
            variant="outline"
            size="small"
            loading={isReordering}
          />
        ) : (
          <Button
            title="Track Order"
            onPress={() => onPress(order)}
            variant="primary"
            size="small"
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.subtle,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  date: {
    marginTop: 2,
  },
  itemsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.xs,
  },
  itemsText: {
    flex: 1,
    marginRight: spacing.sm,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.sm,
  },
});
