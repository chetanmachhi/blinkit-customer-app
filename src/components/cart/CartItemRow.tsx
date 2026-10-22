import React from "react";
import { StyleSheet, View } from "react-native";
import { CartLineView } from "../../api/types";
import { colors, radii, spacing } from "../../config/theme";
import { AppText } from "../common/AppText";
import { AppImage } from "../common/AppImage";
import { QuantityStepper } from "../product/QuantityStepper";
import { Badge } from "../common/Badge";
import { formatPaise } from "../../utils/money";

export interface CartItemRowProps {
  item: CartLineView;
  onIncrement: (productId: string, currentQty: number) => void;
  onDecrement: (productId: string, currentQty: number) => void;
}

export const CartItemRow: React.FC<CartItemRowProps> = ({
  item,
  onIncrement,
  onDecrement,
}) => {
  const getFlagBadge = () => {
    if (!item.isAvailable || item.flag === "unavailable") {
      return <Badge label="Unavailable" variant="danger" />;
    }
    if (item.flag === "out_of_stock" || item.stock <= 0) {
      return <Badge label="Out of Stock" variant="danger" />;
    }
    if (item.flag === "quantity_reduced") {
      return <Badge label={`Reduced to ${item.stock}`} variant="warning" />;
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <AppImage
        uri={item.imageUrl}
        width={60}
        height={60}
        borderRadius={radii.sm}
      />

      <View style={styles.middle}>
        <AppText variant="sm" weight="semibold" numberOfLines={1} color={colors.text}>
          {item.name}
        </AppText>
        <AppText variant="xs" color={colors.textMuted} style={styles.unit}>
          {item.unit}
        </AppText>

        <View style={styles.priceRow}>
          <AppText variant="sm" weight="bold" color={colors.text}>
            {formatPaise(item.price)}
          </AppText>
          {item.mrp > item.price ? (
            <AppText variant="xs" color={colors.textLight} style={styles.mrp}>
              {formatPaise(item.mrp)}
            </AppText>
          ) : null}
        </View>

        {getFlagBadge()}
      </View>

      <View style={styles.right}>
        <QuantityStepper
          quantity={item.quantity}
          onIncrement={() => onIncrement(item.productId, item.quantity)}
          onDecrement={() => onDecrement(item.productId, item.quantity)}
          maxQuantity={Math.min(item.stock, item.maxPerOrder)}
        />
        <AppText variant="sm" weight="bold" color={colors.text} style={styles.lineTotal}>
          {formatPaise(item.lineTotal)}
        </AppText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  middle: {
    flex: 1,
    marginLeft: spacing.md,
    marginRight: spacing.sm,
  },
  unit: {
    marginTop: 2,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 4,
  },
  mrp: {
    marginLeft: spacing.sm,
    textDecorationLine: "line-through",
  },
  right: {
    alignItems: "flex-end",
  },
  lineTotal: {
    marginTop: spacing.xs,
  },
});
