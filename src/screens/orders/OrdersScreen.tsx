import React, { useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { RootStackParamList } from "../../navigation/types";
import { Screen } from "../../components/common/Screen";
import { AppText } from "../../components/common/AppText";
import { Chip } from "../../components/common/Chip";
import { OrderCard } from "../../components/order/OrderCard";
import { EmptyState } from "../../components/common/EmptyState";
import { Skeleton } from "../../components/common/Skeleton";
import { FloatingCartBar } from "../../components/cart/FloatingCartBar";
import {
  useOrdersQuery,
  useReorderMutation,
} from "../../queries/useOrderQuery";
import { useAuthStore } from "../../store/auth.store";
import { colors, spacing } from "../../config/theme";
import { IOrder, OrderStatus } from "../../api/types";

type Props = NativeStackScreenProps<RootStackParamList>;

const STATUS_FILTERS: Array<{ label: string; value: OrderStatus | undefined }> =
  [
    { label: "All Orders", value: undefined },
    { label: "Delivered", value: OrderStatus.DELIVERED },
    { label: "Active", value: OrderStatus.PLACED },
    { label: "Cancelled", value: OrderStatus.CANCELLED },
  ];

export const OrdersScreen: React.FC<Props> = ({ navigation }) => {
  const tabBarHeight = useBottomTabBarHeight();
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | undefined>();

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const { data: ordersResult, isLoading, refetch, isRefetching } =
    useOrdersQuery(1, 20, selectedStatus);

  const reorderMutation = useReorderMutation();

  const handleOrderPress = (order: IOrder) => {
    navigation.navigate("OrderDetail", { orderId: order._id });
  };

  const handleReorder = (orderId: string) => {
    reorderMutation.mutate(orderId, {
      onSuccess: () => {
        navigation.navigate("Cart");
      },
    });
  };

  if (!isAuthenticated) {
    return (
      <Screen edges={["top", "bottom"]}>
        <View style={styles.header}>
          <AppText variant="lg" weight="bold" color={colors.text}>
            Your Orders
          </AppText>
        </View>
        <EmptyState
          title="Login to View Orders"
          description="Log in with your phone number to check order history and live delivery tracking."
          actionTitle="Login / Sign Up"
          onAction={() => navigation.navigate("AuthStack")}
        />
      </Screen>
    );
  }

  const orders = ordersResult?.items || [];

  return (
    <Screen edges={["top"]} style={styles.screen}>
      <View style={styles.header}>
        <AppText variant="lg" weight="bold" color={colors.text}>
          Your Orders
        </AppText>
      </View>

      <View style={styles.filterBar}>
        {STATUS_FILTERS.map((f) => (
          <Chip
            key={f.label}
            label={f.label}
            selected={selectedStatus === f.value}
            onPress={() => setSelectedStatus(f.value)}
          />
        ))}
      </View>

      {isLoading ? (
        <View style={styles.skeletonContainer}>
          <Skeleton height={120} style={styles.skeletonItem} />
          <Skeleton height={120} style={styles.skeletonItem} />
          <Skeleton height={120} style={styles.skeletonItem} />
        </View>
      ) : orders.length === 0 ? (
        <EmptyState
          title="No Orders Found"
          description="You haven't placed any orders in this category."
          actionTitle="Browse Products"
          onAction={() => navigation.navigate("Main", { screen: "HomeTab" } as any)}
        />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item._id}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: 90 },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => {
                refetch();
              }}
              colors={[colors.primary]}
            />
          }
          renderItem={({ item }) => (
            <OrderCard
              order={item}
              onPress={handleOrderPress}
              onReorder={handleReorder}
              isReordering={reorderMutation.isPending}
            />
          )}
        />
      )}

      <FloatingCartBar
        bottomOffset={8}
        onPress={() => navigation.navigate("Cart")}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
  },
  filterBar: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  skeletonContainer: {
    padding: spacing.lg,
  },
  skeletonItem: {
    marginBottom: spacing.md,
  },
  listContent: {
    padding: spacing.lg,
  },
});
