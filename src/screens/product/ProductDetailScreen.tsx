import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";
import { Screen } from "../../components/common/Screen";
import { AppText } from "../../components/common/AppText";
import { AppImage } from "../../components/common/AppImage";
import { Badge } from "../../components/common/Badge";
import { QuantityStepper } from "../../components/product/QuantityStepper";
import { FloatingCartBar } from "../../components/cart/FloatingCartBar";
import { Skeleton } from "../../components/common/Skeleton";
import { ErrorState } from "../../components/common/ErrorState";
import { useProductDetailQuery } from "../../queries/useCatalogQuery";
import {
  useCartDetailQuery,
  useDebouncedCart,
} from "../../queries/useCartQuery";
import { useRequireAuth } from "../../hooks/useRequireAuth";
import { colors, radii, shadows, spacing } from "../../config/theme";
import { formatPaise } from "../../utils/money";
import { ArrowLeft, Clock, ShieldCheck } from "lucide-react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type Props = NativeStackScreenProps<RootStackParamList, "ProductDetail">;

export const ProductDetailScreen: React.FC<Props> = ({
  navigation,
  route,
}) => {
  const { productId } = route.params;

  const { data: product, isLoading, isError, refetch } =
    useProductDetailQuery(productId);
  const { itemQuantityMap } = useCartDetailQuery();
  const { updateQuantity } = useDebouncedCart();
  const { executeWithAuth } = useRequireAuth();

  const serverQuantity = product ? itemQuantityMap[product._id] || 0 : 0;
  const [localQty, setLocalQty] = useState(serverQuantity);
  const lastTapTimeRef = useRef(0);

  useEffect(() => {
    if (Date.now() - lastTapTimeRef.current > 600) {
      setLocalQty(serverQuantity);
    }
  }, [serverQuantity]);

  const maxQty = product ? Math.min(product.stock, product.maxPerOrder) : 10;

  const handleIncrement = () => {
    if (!product) return;
    const nextQty = Math.min(localQty + 1, maxQty);
    lastTapTimeRef.current = Date.now();
    setLocalQty(nextQty);
    executeWithAuth(() => {
      updateQuantity(product._id, nextQty, product);
    });
  };

  const handleDecrement = () => {
    if (!product) return;
    const nextQty = Math.max(0, localQty - 1);
    lastTapTimeRef.current = Date.now();
    setLocalQty(nextQty);
    executeWithAuth(() => {
      updateQuantity(product._id, nextQty);
    });
  };

  if (isLoading) {
    return (
      <Screen edges={["top", "bottom"]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <ArrowLeft size={22} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <Skeleton width={SCREEN_WIDTH - 32} height={260} borderRadius={radii.md} />
          <Skeleton width={180} height={28} style={styles.loadingMargin} />
          <Skeleton width={100} height={20} style={styles.loadingMargin} />
        </View>
      </Screen>
    );
  }

  if (isError || !product) {
    return (
      <Screen edges={["top", "bottom"]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <ArrowLeft size={22} color={colors.text} />
          </TouchableOpacity>
        </View>
        <ErrorState
          message="Could not load product details."
          onRetry={refetch}
        />
      </Screen>
    );
  }

  const hasDiscount = product.discountPercent > 0;
  const isOutOfStock = product.stock <= 0 || !product.isAvailable;
  const images =
    product.images && product.images.length > 0
      ? product.images
      : [product.imageUrl];

  return (
    <Screen edges={["top", "bottom"]} style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.backButton}
        >
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.gallery}
        >
          {images.map((imgUri, index) => (
            <View key={index} style={styles.gallerySlide}>
              <AppImage
                uri={imgUri}
                width={SCREEN_WIDTH - spacing.lg * 2}
                height={260}
                borderRadius={radii.md}
              />
            </View>
          ))}
        </ScrollView>

        <View style={styles.detailsCard}>
          <View style={styles.topMeta}>
            <AppText variant="xs" weight="semibold" color={colors.textLight}>
              {product.brand ? `${product.brand} • ` : ""}
              {product.unit}
            </AppText>
            {hasDiscount ? (
              <Badge
                label={`${product.discountPercent}% OFF`}
                variant="discount"
              />
            ) : null}
          </View>

          <AppText variant="lg" weight="bold" color={colors.text} style={styles.name}>
            {product.name}
          </AppText>

          <View style={styles.priceRow}>
            <AppText variant="xl" weight="bold" color={colors.text}>
              {formatPaise(product.price)}
            </AppText>
            {hasDiscount ? (
              <AppText variant="sm" color={colors.textLight} style={styles.mrp}>
                {formatPaise(product.mrp)}
              </AppText>
            ) : null}
          </View>

          <View style={styles.stockNoticeRow}>
            {isOutOfStock ? (
              <Badge label="Currently Out of Stock" variant="danger" />
            ) : (
              <AppText variant="xs" color={colors.textMuted}>
                Maximum {product.maxPerOrder} units per order
              </AppText>
            )}
          </View>

          <View style={styles.actionRow}>
            {isOutOfStock ? (
              <AppText variant="sm" weight="semibold" color={colors.danger}>
                Item unavailable in current store
              </AppText>
            ) : (
              <QuantityStepper
                quantity={localQty}
                onIncrement={handleIncrement}
                onDecrement={handleDecrement}
                maxQuantity={maxQty}
              />
            )}
          </View>

          <View style={styles.infoBullets}>
            <View style={styles.bulletRow}>
              <Clock size={16} color={colors.primary} />
              <AppText variant="xs" color={colors.text} style={styles.bulletText}>
                Delivery in 10-15 minutes from nearest dark store
              </AppText>
            </View>
            <View style={styles.bulletRow}>
              <ShieldCheck size={16} color={colors.primary} />
              <AppText variant="xs" color={colors.text} style={styles.bulletText}>
                100% Genuine & Quality Checked Products
              </AppText>
            </View>
          </View>

          {product.description ? (
            <View style={styles.descriptionSection}>
              <AppText variant="sm" weight="bold" color={colors.text} style={styles.descTitle}>
                Product Details
              </AppText>
              <AppText variant="sm" color={colors.textMuted} style={styles.descText}>
                {product.description}
              </AppText>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <FloatingCartBar onPress={() => navigation.navigate("Cart")} />
    </Screen>
  );
};

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.xs,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  gallery: {
    backgroundColor: colors.surface,
  },
  gallerySlide: {
    width: SCREEN_WIDTH,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.lg,
  },
  detailsCard: {
    backgroundColor: colors.surface,
    marginTop: spacing.sm,
    padding: spacing.lg,
    borderRadius: radii.lg,
    ...shadows.subtle,
  },
  topMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  name: {
    marginVertical: spacing.xs,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginVertical: spacing.sm,
    gap: spacing.sm,
  },
  mrp: {
    textDecorationLine: "line-through",
  },
  stockNoticeRow: {
    marginVertical: spacing.xs,
  },
  actionRow: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    alignItems: "flex-start",
  },
  infoBullets: {
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderLight,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
    gap: spacing.sm,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  bulletText: {
    marginLeft: spacing.sm,
  },
  descriptionSection: {
    marginTop: spacing.md,
  },
  descTitle: {
    marginBottom: spacing.xs,
  },
  descText: {
    lineHeight: 20,
  },
  loadingContainer: {
    padding: spacing.lg,
    alignItems: "center",
  },
  loadingMargin: {
    marginTop: spacing.md,
  },
});
