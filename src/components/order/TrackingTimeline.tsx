import React from "react";
import { StyleSheet, View } from "react-native";
import { IStatusHistoryEntry, OrderStatus } from "../../api/types";
import { colors, radii, spacing } from "../../config/theme";
import { AppText } from "../common/AppText";
import { formatDate } from "../../utils/date";
import { getOrderStatusMeta } from "../../utils/orderStatus";
import { Check } from "lucide-react-native";

export interface TrackingTimelineProps {
  currentStatus: OrderStatus;
  statusHistory: IStatusHistoryEntry[];
}

const STEPS = [
  OrderStatus.PLACED,
  OrderStatus.ACCEPTED,
  OrderStatus.PREPARING,
  OrderStatus.OUT_FOR_DELIVERY,
  OrderStatus.DELIVERED,
];

export const TrackingTimeline: React.FC<TrackingTimelineProps> = ({
  currentStatus,
  statusHistory,
}) => {
  const currentMeta = getOrderStatusMeta(currentStatus);
  const isCancelled = currentStatus === OrderStatus.CANCELLED;

  if (isCancelled) {
    return (
      <View style={styles.cancelledBox}>
        <AppText variant="md" weight="bold" color={colors.danger}>
          Order Cancelled
        </AppText>
        <AppText variant="xs" color={colors.textMuted} style={styles.cancelledDesc}>
          This order was cancelled and any refund has been initiated.
        </AppText>
      </View>
    );
  }

  const historyMap = new Map<string, IStatusHistoryEntry>();
  for (const item of statusHistory) {
    historyMap.set(item.status, item);
  }

  return (
    <View style={styles.timeline}>
      {STEPS.map((step, index) => {
        const stepMeta = getOrderStatusMeta(step);
        const isCompleted = currentMeta.stepIndex >= stepMeta.stepIndex;
        const isCurrent = currentMeta.stepIndex === stepMeta.stepIndex;
        const historyItem = historyMap.get(step);
        const isLast = index === STEPS.length - 1;

        return (
          <View key={step} style={styles.stepRow}>
            <View style={styles.indicatorCol}>
              <View
                style={[
                  styles.circle,
                  isCompleted ? styles.completedCircle : styles.pendingCircle,
                  isCurrent && styles.currentCircle,
                ]}
              >
                {isCompleted ? (
                  <Check size={12} color={colors.white} strokeWidth={3} />
                ) : (
                  <View style={styles.pendingDot} />
                )}
              </View>

              {!isLast ? (
                <View
                  style={[
                    styles.line,
                    isCompleted && currentMeta.stepIndex > stepMeta.stepIndex
                      ? styles.completedLine
                      : styles.pendingLine,
                  ]}
                />
              ) : null}
            </View>

            <View style={styles.contentCol}>
              <View style={styles.titleRow}>
                <AppText
                  variant="sm"
                  weight={isCurrent ? "bold" : isCompleted ? "semibold" : "medium"}
                  color={isCompleted ? colors.text : colors.textLight}
                >
                  {stepMeta.label}
                </AppText>
                {historyItem ? (
                  <AppText variant="xs" color={colors.textLight}>
                    {formatDate(historyItem.at, "hh:mm A")}
                  </AppText>
                ) : null}
              </View>
              <AppText
                variant="xs"
                color={isCurrent ? colors.primaryDark : colors.textMuted}
                style={styles.stepDesc}
              >
                {stepMeta.description}
              </AppText>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  timeline: {
    paddingVertical: spacing.md,
  },
  stepRow: {
    flexDirection: "row",
    minHeight: 56,
  },
  indicatorCol: {
    alignItems: "center",
    width: 24,
    marginRight: spacing.md,
  },
  circle: {
    width: 22,
    height: 22,
    borderRadius: radii.full,
    alignItems: "center",
    justifyContent: "center",
  },
  completedCircle: {
    backgroundColor: colors.primary,
  },
  currentCircle: {
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: colors.primarySoft,
  },
  pendingCircle: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
  },
  pendingDot: {
    width: 6,
    height: 6,
    borderRadius: radii.full,
    backgroundColor: colors.border,
  },
  line: {
    width: 2,
    flex: 1,
    marginVertical: 4,
  },
  completedLine: {
    backgroundColor: colors.primary,
  },
  pendingLine: {
    backgroundColor: colors.border,
  },
  contentCol: {
    flex: 1,
    paddingBottom: spacing.md,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  stepDesc: {
    marginTop: 2,
  },
  cancelledBox: {
    padding: spacing.md,
    backgroundColor: colors.dangerSoft,
    borderRadius: radii.md,
    alignItems: "center",
  },
  cancelledDesc: {
    marginTop: 4,
    textAlign: "center",
  },
});
