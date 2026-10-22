import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RootStackParamList } from "../../navigation/types";
import { Screen } from "../../components/common/Screen";
import { AppText } from "../../components/common/AppText";
import { Button } from "../../components/common/Button";
import { EmptyState } from "../../components/common/EmptyState";
import { CartItemRow } from "../../components/cart/CartItemRow";
import { BillSummaryCard } from "../../components/cart/BillSummaryCard";
import { CouponSheet } from "../../components/cart/CouponSheet";
import {
  useApplyCouponMutation,
  useCartDetailQuery,
  useClearCartMutation,
  useDebouncedCart,
  useRemoveCouponMutation,
} from "../../queries/useCartQuery";
import { useLocationStore } from "../../store/location.store";
import { colors, radii, shadows, spacing } from "../../config/theme";
import { formatPaise } from "../../utils/money";
import { ArrowLeft, ChevronRight, MapPin, Tag, Trash2 } from "lucide-react-native";

type Props = NativeStackScreenProps<RootStackParamList, "Cart">;

export const CartScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [isCouponSheetVisible, setIsCouponSheetVisible] = useState(false);

  const activeStore = useLocationStore((s) => s.activeStore);
  const selectedAddress = useLocationStore((s) => s.selectedAddress);

  const { cart, itemCount, bill, isLoading } = useCartDetailQuery();
  const { updateQuantity } = useDebouncedCart();
  const clearCartMutation = useClearCartMutation();
  const applyCouponMutation = useApplyCouponMutation();
  const removeCouponMutation = useRemoveCouponMutation();

  const handleIncrement = (productId: string, currentQty: number) => {
    const item = cart?.items.find((i) => i.productId === productId);
    updateQuantity(productId, currentQty + 1, item);
  };

  const handleDecrement = (productId: string, currentQty: number) => {
    updateQuantity(productId, Math.max(0, currentQty - 1));
  };

  const handleApplyCoupon = (code: string) => {
    applyCouponMutation.mutate(code);
  };

  const handleRemoveCoupon = () => {
    removeCouponMutation.mutate();
  };

  if (!cart || cart.items.length === 0) {
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
            My Cart
          </AppText>
        </View>
        <EmptyState
          title="Your Cart is Empty"
          description="Looks like you haven't added anything to your cart yet."
          actionTitle="Start Shopping"
          onAction={() => navigation.navigate("Main", { screen: "HomeTab" } as any)}
        />
      </Screen>
    );
  }

  const hasUnavailableItems = cart.items.some(
    (i) => !i.isAvailable || i.stock <= 0
  );

  return (
    <Screen edges={["top"]} style={styles.screen}>
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
            My Cart ({itemCount} {itemCount === 1 ? "Item" : "Items"})
          </AppText>
          <AppText variant="xs" color={colors.textMuted}>
            Delivery to {selectedAddress ? selectedAddress.label : "Current Location"}
          </AppText>
        </View>
        <TouchableOpacity
          onPress={() => clearCartMutation.mutate()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.clearBtn}
        >
          <Trash2 size={18} color={colors.textLight} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <TouchableOpacity
          onPress={() => navigation.navigate("Location")}
          activeOpacity={0.8}
          style={styles.addressBar}
        >
          <MapPin size={18} color={colors.primary} />
          <View style={styles.addressBarText}>
            <AppText variant="xs" weight="bold" color={colors.text}>
              Deliver to {selectedAddress ? selectedAddress.receiverName : "You"}
            </AppText>
            <AppText variant="xs" color={colors.textMuted} numberOfLines={1}>
              {selectedAddress
                ? `${selectedAddress.addressLine}, ${selectedAddress.city}`
                : "Choose delivery address"}
            </AppText>
          </View>
          <ChevronRight size={18} color={colors.textLight} />
        </TouchableOpacity>

        <View style={styles.itemsSection}>
          {cart.items.map((item) => (
            <CartItemRow
              key={item.productId}
              item={item}
              onIncrement={handleIncrement}
              onDecrement={handleDecrement}
            />
          ))}
        </View>

        <View style={styles.couponCard}>
          <View style={styles.couponLeft}>
            <Tag size={18} color={colors.primary} />
            <View style={styles.couponTextWrap}>
              <AppText variant="sm" weight="bold" color={colors.text}>
                {cart.couponCode ? `Coupon "${cart.couponCode}" Applied` : "Avail Coupons & Offers"}
              </AppText>
              <AppText variant="xs" color={colors.textMuted}>
                {cart.couponCode
                  ? "Great! You saved extra on this order"
                  : "Check applicable promo codes"}
              </AppText>
            </View>
          </View>

          {cart.couponCode ? (
            <TouchableOpacity onPress={handleRemoveCoupon}>
              <AppText variant="sm" weight="bold" color={colors.danger}>
                Remove
              </AppText>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => setIsCouponSheetVisible(true)}>
              <AppText variant="sm" weight="bold" color={colors.primary}>
                Apply
              </AppText>
            </TouchableOpacity>
          )}
        </View>

        {bill ? <BillSummaryCard bill={bill} store={activeStore} /> : null}
      </ScrollView>

      <View
        style={[
          styles.stickyFooter,
          { paddingBottom: Math.max(insets.bottom, 12) },
        ]}
      >
        <View style={styles.footerPriceWrap}>
          <AppText variant="xs" color={colors.textMuted}>
            Total Payable
          </AppText>
          <AppText variant="lg" weight="bold" color={colors.text}>
            {formatPaise(bill?.grandTotal || 0)}
          </AppText>
        </View>

        <Button
          title={hasUnavailableItems ? "Update Cart to Proceed" : "Proceed to Checkout"}
          onPress={() => navigation.navigate("Checkout")}
          disabled={hasUnavailableItems}
          size="large"
          style={styles.checkoutBtn}
        />
      </View>

      <CouponSheet
        visible={isCouponSheetVisible}
        onClose={() => setIsCouponSheetVisible(false)}
        onApply={handleApplyCoupon}
        appliedCode={cart.couponCode}
      />
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
  clearBtn: {
    padding: spacing.xs,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  addressBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radii.md,
    marginBottom: spacing.md,
    ...shadows.subtle,
  },
  addressBarText: {
    flex: 1,
    marginLeft: spacing.sm,
    marginRight: spacing.sm,
  },
  itemsSection: {
    borderRadius: radii.md,
    overflow: "hidden",
    marginBottom: spacing.md,
    ...shadows.subtle,
  },
  couponCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.subtle,
  },
  couponLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  couponTextWrap: {
    marginLeft: spacing.sm,
  },
  stickyFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...shadows.floating,
  },
  footerPriceWrap: {
    marginRight: spacing.md,
  },
  checkoutBtn: {
    flex: 1,
  },
});
