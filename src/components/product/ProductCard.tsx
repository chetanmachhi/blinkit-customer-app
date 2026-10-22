import React, { memo, useEffect, useRef, useState } from "react";
import {
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { IProduct } from "../../api/types";
import { colors, radii, shadows, spacing } from "../../config/theme";
import { AppText } from "../common/AppText";
import { AppImage } from "../common/AppImage";
import { Badge } from "../common/Badge";
import { QuantityStepper } from "./QuantityStepper";
import { formatPaise } from "../../utils/money";

export interface ProductCardProps {
  product: IProduct;
  quantity: number;
  onPress: (product: IProduct) => void;
  onIncrement: (productId: string, newQty: number) => void;
  onDecrement: (productId: string, newQty: number) => void;
  width?: number;
  isGrid?: boolean;
  style?: StyleProp<ViewStyle>;
}

const ProductCardComponent: React.FC<ProductCardProps> = ({
  product,
  quantity,
  onPress,
  onIncrement,
  onDecrement,
  width = 160,
  isGrid = false,
  style,
}) => {
  const [localQty, setLocalQty] = useState(quantity);
  const lastTapTimeRef = useRef(0);

  useEffect(() => {
    if (Date.now() - lastTapTimeRef.current > 600) {
      setLocalQty(quantity);
    }
  }, [quantity]);

  const hasDiscount = product.discountPercent > 0;
  const isOutOfStock = product.stock <= 0 || !product.isAvailable;
  const maxQty = Math.min(product.stock, product.maxPerOrder);

  const handleCardPress = () => {
    onPress(product);
  };

  const handleIncrement = () => {
    const nextQty = Math.min(localQty + 1, maxQty);
    lastTapTimeRef.current = Date.now();
    setLocalQty(nextQty);
    onIncrement(product._id, nextQty);
  };

  const handleDecrement = () => {
    const nextQty = Math.max(0, localQty - 1);
    lastTapTimeRef.current = Date.now();
    setLocalQty(nextQty);
    onDecrement(product._id, nextQty);
  };

  return (
    <TouchableOpacity
      onPress={handleCardPress}
      activeOpacity={0.9}
      style={[
        styles.card,
        isGrid ? styles.gridCard : { width, marginRight: spacing.md },
        style,
      ]}
    >
      <View style={styles.imageContainer}>
        <AppImage
          uri={product.imageUrl}
          width={isGrid ? 130 : width - spacing.md * 2}
          height={100}
          borderRadius={radii.sm}
        />
        {hasDiscount ? (
          <Badge
            label={`${product.discountPercent}% OFF`}
            variant="discount"
            style={styles.discountBadge}
          />
        ) : null}
      </View>

      <View style={styles.infoContainer}>
        <AppText variant="xs" color={colors.textLight}>
          {product.unit}
        </AppText>
        <AppText
          variant="sm"
          weight="semibold"
          numberOfLines={2}
          color={colors.text}
          style={styles.name}
        >
          {product.name}
        </AppText>

        <View style={styles.bottomRow}>
          <View style={styles.priceContainer}>
            <AppText variant="sm" weight="bold" color={colors.text}>
              {formatPaise(product.price)}
            </AppText>
            {hasDiscount ? (
              <AppText variant="xs" color={colors.textLight} style={styles.mrp}>
                {formatPaise(product.mrp)}
              </AppText>
            ) : null}
          </View>

          {isOutOfStock ? (
            <Badge label="Out of Stock" variant="neutral" />
          ) : (
            <QuantityStepper
              quantity={localQty}
              onIncrement={handleIncrement}
              onDecrement={handleDecrement}
              maxQuantity={maxQty}
            />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export const ProductCard = memo(ProductCardComponent);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    marginBottom: spacing.md,
    ...shadows.subtle,
  },
  gridCard: {
    flex: 1,
    marginRight: 0,
  },
  imageContainer: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    backgroundColor: colors.surface,
    borderRadius: radii.sm,
  },
  discountBadge: {
    position: "absolute",
    top: 2,
    left: 2,
  },
  infoContainer: {
    marginTop: spacing.sm,
    flex: 1,
    justifyContent: "space-between",
  },
  name: {
    marginTop: 2,
    marginBottom: spacing.sm,
    minHeight: 34,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.xs,
  },
  priceContainer: {
    flexDirection: "column",
  },
  mrp: {
    textDecorationLine: "line-through",
  },
});
