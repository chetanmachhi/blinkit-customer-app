import React from "react";
import { StyleSheet, View } from "react-native";
import { BillSummary, IStore } from "../../api/types";
import { colors, radii, shadows, spacing } from "../../config/theme";
import { AppText } from "../common/AppText";
import { Divider } from "../common/Divider";
import { formatPaise } from "../../utils/money";
import { Sparkles, Truck } from "lucide-react-native";

export interface BillSummaryCardProps {
  bill: BillSummary;
  store?: IStore | null;
}

export const BillSummaryCard: React.FC<BillSummaryCardProps> = ({
  bill,
  store,
}) => {
  const freeDeliveryAbove = store?.freeDeliveryAbove || 0;
  const isFreeDelivery = bill.deliveryFee === 0;
  const neededForFree = freeDeliveryAbove > 0 ? freeDeliveryAbove - bill.itemTotal : 0;

  return (
    <View style={styles.card}>
      <AppText variant="md" weight="bold" color={colors.text} style={styles.title}>
        Bill Summary
      </AppText>

      {neededForFree > 0 && !isFreeDelivery ? (
        <View style={styles.freeDeliveryHint}>
          <Truck size={16} color={colors.primary} />
          <AppText variant="xs" weight="medium" color={colors.primaryDark} style={styles.hintText}>
            Add {formatPaise(neededForFree)} more for FREE delivery
          </AppText>
        </View>
      ) : null}

      <View style={styles.row}>
        <AppText variant="sm" color={colors.textMuted}>
          Item Total
        </AppText>
        <AppText variant="sm" weight="medium" color={colors.text}>
          {formatPaise(bill.itemTotal)}
        </AppText>
      </View>

      {bill.discount > 0 ? (
        <View style={styles.row}>
          <View style={styles.discountLabelRow}>
            <Sparkles size={14} color={colors.primary} />
            <AppText variant="sm" color={colors.primary} style={styles.discountLabel}>
              Coupon Discount
            </AppText>
          </View>
          <AppText variant="sm" weight="semibold" color={colors.primary}>
            -{formatPaise(bill.discount)}
          </AppText>
        </View>
      ) : null}

      <View style={styles.row}>
        <AppText variant="sm" color={colors.textMuted}>
          Delivery Fee
        </AppText>
        <AppText variant="sm" weight="medium" color={isFreeDelivery ? colors.primary : colors.text}>
          {isFreeDelivery ? "FREE" : formatPaise(bill.deliveryFee)}
        </AppText>
      </View>

      <View style={styles.row}>
        <AppText variant="sm" color={colors.textMuted}>
          Handling & Packaging Fee
        </AppText>
        <AppText variant="sm" weight="medium" color={colors.text}>
          {formatPaise(bill.handlingFee)}
        </AppText>
      </View>

      <Divider marginVertical={spacing.md} />

      <View style={styles.totalRow}>
        <AppText variant="md" weight="bold" color={colors.text}>
          Grand Total
        </AppText>
        <AppText variant="md" weight="bold" color={colors.text}>
          {formatPaise(bill.grandTotal)}
        </AppText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginVertical: spacing.md,
    ...shadows.subtle,
  },
  title: {
    marginBottom: spacing.md,
  },
  freeDeliveryHint: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.sm,
    marginBottom: spacing.md,
  },
  hintText: {
    marginLeft: spacing.xs,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  discountLabelRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  discountLabel: {
    marginLeft: 4,
  },
  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
