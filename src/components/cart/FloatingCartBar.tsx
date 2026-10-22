import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCartDetailQuery } from "../../queries/useCartQuery";
import { colors, radii, shadows, spacing } from "../../config/theme";
import { AppText } from "../common/AppText";
import { formatPaise } from "../../utils/money";
import { ChevronRight, ShoppingBag } from "lucide-react-native";

export interface FloatingCartBarProps {
  onPress: () => void;
  bottomOffset?: number;
}

export const FloatingCartBar: React.FC<FloatingCartBarProps> = ({
  onPress,
  bottomOffset,
}) => {
  const insets = useSafeAreaInsets();
  const { itemCount, bill } = useCartDetailQuery();

  if (itemCount === 0 || !bill) {
    return null;
  }

  const effectiveBottom =
    bottomOffset !== undefined ? bottomOffset : Math.max(insets.bottom, 8) + 8;

  return (
    <View
      pointerEvents="box-none"
      style={[styles.floatingWrapper, { bottom: effectiveBottom }]}
    >
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.92}
        style={styles.cartBar}
      >
        <View style={styles.leftGroup}>
          <View style={styles.iconWrap}>
            <ShoppingBag size={18} color={colors.white} />
          </View>
          <View>
            <AppText variant="sm" weight="bold" color={colors.white}>
              {itemCount} {itemCount === 1 ? "Item" : "Items"} • {formatPaise(bill.grandTotal)}
            </AppText>
            <AppText variant="xs" color={colors.primarySoft}>
              Extra savings applied
            </AppText>
          </View>
        </View>

        <View style={styles.rightGroup}>
          <View style={styles.viewCartPill}>
            <AppText variant="sm" weight="bold" color={colors.white} style={styles.viewCartText}>
              View Cart
            </AppText>
            <ChevronRight size={16} color={colors.white} />
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  floatingWrapper: {
    position: "absolute",
    left: spacing.sm,
    right: spacing.sm,
    zIndex: 1000,
  },
  cartBar: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    ...shadows.floating,
  },
  leftGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  rightGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewCartPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  viewCartText: {
    letterSpacing: 0.3,
  },
});
