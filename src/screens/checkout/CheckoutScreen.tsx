import React, { useRef, useState } from "react";
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
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";
import { BillSummaryCard } from "../../components/cart/BillSummaryCard";
import { AddressCard } from "../../components/address/AddressCard";
import { useCartDetailQuery } from "../../queries/useCartQuery";
import { useAddressesQuery } from "../../queries/useAddressQuery";
import { useCreateOrderMutation } from "../../queries/useOrderQuery";
import { useLocationStore } from "../../store/location.store";
import { useUiStore } from "../../store/ui.store";
import { generateIdempotencyKey } from "../../utils/idempotency";
import { colors, radii, shadows, spacing } from "../../config/theme";
import { PaymentMethod } from "../../api/types";
import { formatPaise } from "../../utils/money";
import { ArrowLeft, Check, CreditCard, DollarSign, Plus } from "lucide-react-native";

type Props = NativeStackScreenProps<RootStackParamList, "Checkout">;

export const CheckoutScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    PaymentMethod.COD
  );

  const idempotencyKeyRef = useRef<string>(generateIdempotencyKey());

  const activeStore = useLocationStore((s) => s.activeStore);
  const selectedAddress = useLocationStore((s) => s.selectedAddress);
  const setSelectedAddress = useLocationStore((s) => s.setSelectedAddress);
  const showToast = useUiStore((s) => s.showToast);

  const { cart, bill } = useCartDetailQuery();
  const { data: addresses } = useAddressesQuery();
  const createOrderMutation = useCreateOrderMutation();

  const handlePlaceOrder = () => {
    if (!selectedAddress) {
      showToast("Please select a delivery address", "error");
      return;
    }

    createOrderMutation.mutate(
      {
        data: {
          addressId: selectedAddress._id,
          deliveryAddress: {
            label: selectedAddress.label,
            addressLine: selectedAddress.addressLine,
            landmark: selectedAddress.landmark,
            coordinates: selectedAddress.coordinates,
          },
          paymentMethod,
          notes: notes.trim() || undefined,
        },
        idempotencyKey: idempotencyKeyRef.current,
      },
      {
        onSuccess: (order) => {
          navigation.replace("OrderSuccess", {
            orderId: order._id,
            orderNumber: order.orderNumber,
          });
        },
      }
    );
  };

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
        <AppText variant="md" weight="bold" color={colors.text}>
          Review & Checkout
        </AppText>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.sectionHeader}>
          <AppText variant="sm" weight="bold" color={colors.text}>
            Delivery Address
          </AppText>
          <TouchableOpacity
            onPress={() => navigation.navigate("AddEditAddress")}
            style={styles.addAddressBtn}
          >
            <Plus size={16} color={colors.primary} />
            <AppText variant="xs" weight="bold" color={colors.primary} style={styles.addText}>
              Add New
            </AppText>
          </TouchableOpacity>
        </View>

        {selectedAddress ? (
          <AddressCard
            address={selectedAddress}
            isSelected
            onEdit={(a) => navigation.navigate("AddEditAddress", { address: a })}
          />
        ) : (
          <TouchableOpacity
            onPress={() => navigation.navigate("AddressList")}
            style={styles.noAddressBox}
          >
            <AppText variant="sm" color={colors.primary}>
              Select an address from your saved list
            </AppText>
          </TouchableOpacity>
        )}

        <View style={styles.sectionHeader}>
          <AppText variant="sm" weight="bold" color={colors.text}>
            Payment Option
          </AppText>
        </View>

        <TouchableOpacity
          onPress={() => setPaymentMethod(PaymentMethod.COD)}
          activeOpacity={0.8}
          style={[
            styles.paymentOption,
            paymentMethod === PaymentMethod.COD && styles.paymentOptionSelected,
          ]}
        >
          <View style={styles.paymentLeft}>
            <DollarSign size={20} color={colors.primary} />
            <View style={styles.paymentTextWrap}>
              <AppText variant="sm" weight="bold" color={colors.text}>
                Cash on Delivery (COD)
              </AppText>
              <AppText variant="xs" color={colors.textMuted}>
                Pay cash or UPI to delivery partner upon arrival
              </AppText>
            </View>
          </View>
          {paymentMethod === PaymentMethod.COD ? (
            <Check size={20} color={colors.primary} />
          ) : null}
        </TouchableOpacity>

        <View style={[styles.paymentOption, styles.paymentOptionDisabled]}>
          <View style={styles.paymentLeft}>
            <CreditCard size={20} color={colors.textLight} />
            <View style={styles.paymentTextWrap}>
              <AppText variant="sm" weight="medium" color={colors.textLight}>
                Online Payment (UPI, Cards, NetBanking)
              </AppText>
              <AppText variant="xs" color={colors.textLight}>
                Coming soon in next release
              </AppText>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <AppText variant="sm" weight="bold" color={colors.text}>
            Delivery Notes (Optional)
          </AppText>
        </View>

        <Input
          value={notes}
          onChangeText={setNotes}
          placeholder="e.g. Ring the bell twice, leave with guard..."
          maxLength={150}
        />

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
          title="Place Order"
          onPress={handlePlaceOrder}
          loading={createOrderMutation.isPending}
          size="large"
          style={styles.placeOrderBtn}
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
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 110,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  addAddressBtn: {
    flexDirection: "row",
    alignItems: "center",
  },
  addText: {
    marginLeft: 2,
  },
  noAddressBox: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radii.md,
    alignItems: "center",
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.primary,
    marginBottom: spacing.md,
  },
  paymentOption: {
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
  paymentOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  paymentOptionDisabled: {
    opacity: 0.6,
  },
  paymentLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  paymentTextWrap: {
    marginLeft: spacing.md,
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
  placeOrderBtn: {
    flex: 1,
  },
});
