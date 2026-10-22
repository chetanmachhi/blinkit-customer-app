import React from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import { ICoupon } from "../../api/types";
import { useApplicableCouponsQuery } from "../../queries/useCouponQuery";
import { colors, radii, spacing } from "../../config/theme";
import { AppText } from "../common/AppText";
import { ModalSheet } from "../common/ModalSheet";
import { Skeleton } from "../common/Skeleton";
import { EmptyState } from "../common/EmptyState";
import { formatPaise } from "../../utils/money";
import { Tag } from "lucide-react-native";

export interface CouponSheetProps {
  visible: boolean;
  onClose: () => void;
  onApply: (code: string) => void;
  appliedCode?: string;
}

export const CouponSheet: React.FC<CouponSheetProps> = ({
  visible,
  onClose,
  onApply,
  appliedCode,
}) => {
  const { data: coupons, isLoading } = useApplicableCouponsQuery();

  const handleApply = (code: string) => {
    onApply(code);
    onClose();
  };

  const renderCouponItem = ({ item }: { item: ICoupon }) => {
    const isApplied =
      appliedCode?.toUpperCase() === item.code.toUpperCase();

    return (
      <View style={styles.couponCard}>
        <View style={styles.left}>
          <View style={styles.codeRow}>
            <Tag size={16} color={colors.primary} />
            <AppText variant="sm" weight="bold" color={colors.primaryDark} style={styles.code}>
              {item.code}
            </AppText>
          </View>
          <AppText variant="xs" color={colors.textMuted} style={styles.description}>
            {item.description}
          </AppText>
          {item.minOrderAmount > 0 ? (
            <AppText variant="xs" color={colors.textLight}>
              Min. order {formatPaise(item.minOrderAmount)}
            </AppText>
          ) : null}
        </View>

        <TouchableOpacity
          onPress={() => handleApply(item.code)}
          disabled={isApplied}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={[styles.applyButton, isApplied && styles.appliedButton]}
        >
          <AppText
            variant="sm"
            weight="bold"
            color={isApplied ? colors.textLight : colors.primary}
          >
            {isApplied ? "APPLIED" : "APPLY"}
          </AppText>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ModalSheet visible={visible} onClose={onClose} title="Apply Coupon">
      {isLoading ? (
        <View>
          <Skeleton height={60} style={styles.skeleton} />
          <Skeleton height={60} style={styles.skeleton} />
        </View>
      ) : !coupons || coupons.length === 0 ? (
        <EmptyState
          title="No Coupons Available"
          description="Check back later for exclusive discounts on your orders."
        />
      ) : (
        <FlatList
          data={coupons}
          keyExtractor={(item) => item._id}
          renderItem={renderCouponItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </ModalSheet>
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: spacing.xxl,
  },
  skeleton: {
    marginBottom: spacing.md,
  },
  couponCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.primary,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  left: {
    flex: 1,
    marginRight: spacing.sm,
  },
  codeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  code: {
    marginLeft: spacing.xs,
  },
  description: {
    marginTop: 4,
    marginBottom: 2,
  },
  applyButton: {
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
  },
  appliedButton: {
    opacity: 0.5,
  },
});
