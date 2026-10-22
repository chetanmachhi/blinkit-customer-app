import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";
import { Screen } from "../../components/common/Screen";
import { AppText } from "../../components/common/AppText";
import { TrackingTimeline } from "../../components/order/TrackingTimeline";
import { Button } from "../../components/common/Button";
import { Skeleton } from "../../components/common/Skeleton";
import { ErrorState } from "../../components/common/ErrorState";
import {
  useOrderDetailQuery,
  useOrderTrackingQuery,
} from "../../queries/useOrderQuery";
import { colors, radii, shadows, spacing } from "../../config/theme";
import { OrderStatus } from "../../api/types";
import { formatDate } from "../../utils/date";
import { ArrowLeft, Clock, MapPin } from "lucide-react-native";

type Props = NativeStackScreenProps<RootStackParamList, "OrderTrack">;

export const OrderTrackScreen: React.FC<Props> = ({ navigation, route }) => {
  const { orderId } = route.params;

  const { data: order } = useOrderDetailQuery(orderId);
  const isTerminal =
    order?.status === OrderStatus.DELIVERED ||
    order?.status === OrderStatus.CANCELLED;

  const {
    data: trackingInfo,
    isLoading,
    isError,
    refetch,
  } = useOrderTrackingQuery(orderId, isTerminal);

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
            Tracking Order
          </AppText>
        </View>
        <View style={styles.loadingContainer}>
          <Skeleton height={100} style={styles.loadingMargin} />
          <Skeleton height={200} style={styles.loadingMargin} />
        </View>
      </Screen>
    );
  }

  if (isError || !trackingInfo) {
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
          message="Could not connect to tracking service."
          onRetry={refetch}
        />
      </Screen>
    );
  }

  const etaText = trackingInfo.estimatedDeliveryAt
    ? formatDate(trackingInfo.estimatedDeliveryAt, "hh:mm A")
    : "10-15 minutes";

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
            Live Order Tracking
          </AppText>
          <AppText variant="xs" color={colors.textMuted}>
            {order ? `Order #${order.orderNumber}` : ""}
          </AppText>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.etaCard}>
          <View style={styles.etaIconCircle}>
            <Clock size={28} color={colors.primary} />
          </View>
          <View style={styles.etaInfo}>
            <AppText variant="xs" weight="semibold" color={colors.primaryDark}>
              ESTIMATED ARRIVAL
            </AppText>
            <AppText variant="xl" weight="bold" color={colors.text}>
              {etaText}
            </AppText>
          </View>
        </View>

        <View style={styles.timelineCard}>
          <AppText variant="md" weight="bold" color={colors.text} style={styles.timelineTitle}>
            Delivery Status
          </AppText>
          <TrackingTimeline
            currentStatus={trackingInfo.status}
            statusHistory={trackingInfo.statusHistory}
          />
        </View>

        {order ? (
          <View style={styles.addressCard}>
            <View style={styles.addressHeader}>
              <MapPin size={18} color={colors.primary} />
              <AppText variant="sm" weight="bold" color={colors.text} style={styles.addressTitle}>
                Delivering to
              </AppText>
            </View>
            <AppText variant="sm" color={colors.textMuted}>
              {order.deliveryAddress.addressLine}
              {order.deliveryAddress.landmark
                ? `, Near ${order.deliveryAddress.landmark}`
                : ""}
            </AppText>
          </View>
        ) : null}

        <Button
          title="View Full Order Summary"
          onPress={() => navigation.navigate("OrderDetail", { orderId })}
          variant="outline"
          size="medium"
          style={styles.summaryBtn}
        />
      </View>
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
  etaCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderRadius: radii.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  etaIconCircle: {
    width: 52,
    height: 52,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  etaInfo: {
    flex: 1,
  },
  timelineCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.subtle,
  },
  timelineTitle: {
    marginBottom: spacing.md,
  },
  addressCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.subtle,
  },
  addressHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  addressTitle: {
    marginLeft: spacing.xs,
  },
  summaryBtn: {
    marginBottom: spacing.xl,
  },
});
