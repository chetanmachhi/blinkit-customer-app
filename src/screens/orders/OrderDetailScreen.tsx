import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";
import { Screen } from "../../components/common/Screen";
import { AppText } from "../../components/common/AppText";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { Divider } from "../../components/common/Divider";
import { AppImage } from "../../components/common/AppImage";
import { ModalSheet } from "../../components/common/ModalSheet";
import { Input } from "../../components/common/Input";
import { Skeleton } from "../../components/common/Skeleton";
import { ErrorState } from "../../components/common/ErrorState";
import {
  useCancelOrderMutation,
  useOrderDetailQuery,
  useReorderMutation,
} from "../../queries/useOrderQuery";
import { colors, radii, shadows, spacing } from "../../config/theme";
import { OrderStatus } from "../../api/types";
import { formatPaise } from "../../utils/money";
import { formatDate } from "../../utils/date";
import { getOrderStatusMeta } from "../../utils/orderStatus";
import { ArrowLeft, Clock, MapPin } from "lucide-react-native";

type Props = NativeStackScreenProps<RootStackParamList, "OrderDetail">;

export const OrderDetailScreen: React.FC<Props> = ({
  navigation,
  route,
}) => {
  const { orderId } = route.params;

  const [isCancelSheetVisible, setIsCancelSheetVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const { data: order, isLoading, isError, refetch } =
    useOrderDetailQuery(orderId);
  const cancelOrderMutation = useCancelOrderMutation();
  const reorderMutation = useReorderMutation();

  const handleCancelOrder = () => {
    if (!cancelReason.trim()) return;
    cancelOrderMutation.mutate(
      { orderId, reason: cancelReason.trim() },
      {
        onSuccess: () => {
          setIsCancelSheetVisible(false);
        },
      }
    );
  };

  const handleReorder = () => {
    reorderMutation.mutate(orderId, {
      onSuccess: () => {
        navigation.navigate("Cart");
      },
    });
  };

  if (isLoading) {
    return (
      <Screen edges={["top", "bottom"]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <ArrowLeft size={22} color={colors.text} />
          </TouchableOpacity>
          <AppText variant="md" weight="bold" color={colors.text}>
            Order Details
          </AppText>
        </View>
        <View style={styles.loadingContainer}>
          <Skeleton height={80} style={styles.loadingMargin} />
          <Skeleton height={140} style={styles.loadingMargin} />
        </View>
      </Screen>
    );
  }

  if (isError || !order) {
    return (
      <Screen edges={["top", "bottom"]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <ArrowLeft size={22} color={colors.text} />
          </TouchableOpacity>
        </View>
        <ErrorState
          message="Could not load order details."
          onRetry={refetch}
        />
      </Screen>
    );
  }

  const statusMeta = getOrderStatusMeta(order.status);
  const canCancel = order.status === OrderStatus.PLACED;
  const isTerminal =
    order.status === OrderStatus.DELIVERED ||
    order.status === OrderStatus.CANCELLED;

  return (
    <Screen edges={["top", "bottom"]} scroll style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.backBtn}
        >
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <AppText variant="md" weight="bold" color={colors.text}>
            Order #{order.orderNumber}
          </AppText>
          <AppText variant="xs" color={colors.textMuted}>
            Placed on {formatDate(order.createdAt)}
          </AppText>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.statusRow}>
            <View>
              <AppText variant="sm" weight="bold" color={colors.text}>
                {statusMeta.label}
              </AppText>
              <AppText variant="xs" color={colors.textMuted} style={styles.statusDesc}>
                {statusMeta.description}
              </AppText>
            </View>
            <Badge
              label={statusMeta.label.toUpperCase()}
              variant={
                order.status === OrderStatus.DELIVERED
                  ? "success"
                  : order.status === OrderStatus.CANCELLED
                  ? "danger"
                  : "warning"
              }
            />
          </View>

          {!isTerminal ? (
            <Button
              title="Track Live Status"
              onPress={() => navigation.navigate("OrderTrack", { orderId })}
              variant="outline"
              size="small"
              style={styles.trackBtn}
            />
          ) : null}
        </View>

        <View style={styles.card}>
          <AppText variant="sm" weight="bold" color={colors.text} style={styles.cardTitle}>
            Items ({order.items.length})
          </AppText>
          {order.items.map((item) => (
            <View key={item.productId} style={styles.itemRow}>
              <AppImage
                uri={item.imageUrl}
                width={48}
                height={48}
                borderRadius={radii.sm}
              />
              <View style={styles.itemInfo}>
                <AppText variant="sm" weight="semibold" numberOfLines={1} color={colors.text}>
                  {item.name}
                </AppText>
                <AppText variant="xs" color={colors.textMuted}>
                  {item.unit} • Qty: {item.quantity}
                </AppText>
              </View>
              <AppText variant="sm" weight="bold" color={colors.text}>
                {formatPaise(item.lineTotal)}
              </AppText>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <View style={styles.addressHeader}>
            <MapPin size={18} color={colors.primary} />
            <AppText variant="sm" weight="bold" color={colors.text} style={styles.addressTitle}>
              Delivery Location
            </AppText>
          </View>
          <AppText variant="sm" color={colors.textMuted} style={styles.addressText}>
            {order.deliveryAddress.addressLine}
            {order.deliveryAddress.landmark ? `, Near ${order.deliveryAddress.landmark}` : ""}
          </AppText>
        </View>

        <View style={styles.card}>
          <AppText variant="sm" weight="bold" color={colors.text} style={styles.cardTitle}>
            Payment & Bill Summary
          </AppText>
          <View style={styles.billRow}>
            <AppText variant="sm" color={colors.textMuted}>
              Payment Mode
            </AppText>
            <AppText variant="sm" weight="bold" color={colors.text}>
              {order.paymentMethod.toUpperCase()} ({order.paymentStatus})
            </AppText>
          </View>
          <View style={styles.billRow}>
            <AppText variant="sm" color={colors.textMuted}>
              Item Total
            </AppText>
            <AppText variant="sm" color={colors.text}>
              {formatPaise(order.bill?.itemTotal || 0)}
            </AppText>
          </View>
          {order.bill?.discount ? (
            <View style={styles.billRow}>
              <AppText variant="sm" color={colors.primary}>
                Coupon Discount
              </AppText>
              <AppText variant="sm" weight="bold" color={colors.primary}>
                -{formatPaise(order.bill.discount)}
              </AppText>
            </View>
          ) : null}
          <View style={styles.billRow}>
            <AppText variant="sm" color={colors.textMuted}>
              Delivery & Handling
            </AppText>
            <AppText variant="sm" color={colors.text}>
              {formatPaise(
                (order.bill?.deliveryFee || 0) + (order.bill?.handlingFee || 0)
              )}
            </AppText>
          </View>
          <Divider marginVertical={spacing.sm} />
          <View style={styles.billRow}>
            <AppText variant="md" weight="bold" color={colors.text}>
              Grand Total
            </AppText>
            <AppText variant="md" weight="bold" color={colors.text}>
              {formatPaise(order.bill?.grandTotal || order.totalAmount)}
            </AppText>
          </View>
        </View>

        <View style={styles.actionsBox}>
          {canCancel ? (
            <Button
              title="Cancel Order"
              onPress={() => setIsCancelSheetVisible(true)}
              variant="danger"
              size="large"
              style={styles.actionBtn}
            />
          ) : null}

          {isTerminal ? (
            <Button
              title="Reorder All Items"
              onPress={handleReorder}
              loading={reorderMutation.isPending}
              variant="primary"
              size="large"
              style={styles.actionBtn}
            />
          ) : null}
        </View>
      </View>

      <ModalSheet
        visible={isCancelSheetVisible}
        onClose={() => setIsCancelSheetVisible(false)}
        title="Cancel Order"
      >
        <AppText variant="sm" color={colors.textMuted} style={styles.cancelSheetDesc}>
          Please share why you want to cancel this order:
        </AppText>

        <Input
          value={cancelReason}
          onChangeText={setCancelReason}
          placeholder="e.g. Changed my mind, ordered by mistake..."
          autoFocus
        />

        <Button
          title="Confirm Cancellation"
          onPress={handleCancelOrder}
          loading={cancelOrderMutation.isPending}
          disabled={!cancelReason.trim()}
          variant="danger"
          size="medium"
          style={styles.confirmCancelBtn}
        />
      </ModalSheet>
    </Screen>
  );
};

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  backBtn: {
    padding: spacing.xs,
    marginRight: spacing.sm,
  },
  headerTitleWrap: {
    flex: 1,
  },
  loadingContainer: {
    padding: spacing.lg,
  },
  loadingMargin: {
    marginBottom: spacing.md,
  },
  content: {
    padding: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.subtle,
  },
  cardTitle: {
    marginBottom: spacing.sm,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statusDesc: {
    marginTop: 2,
    maxWidth: 220,
  },
  trackBtn: {
    marginTop: spacing.md,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
  },
  itemInfo: {
    flex: 1,
    marginLeft: spacing.sm,
    marginRight: spacing.sm,
  },
  addressHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  addressTitle: {
    marginLeft: spacing.xs,
  },
  addressText: {
    lineHeight: 20,
  },
  billRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  actionsBox: {
    marginTop: spacing.sm,
    marginBottom: spacing.xxl,
  },
  actionBtn: {
    marginBottom: spacing.md,
  },
  cancelSheetDesc: {
    marginBottom: spacing.md,
  },
  confirmCancelBtn: {
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
});
