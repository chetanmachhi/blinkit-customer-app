import React, { useCallback, useEffect } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";
import { Screen } from "../../components/common/Screen";
import { HomeHeader } from "../../components/home/HomeHeader";
import { BannerCarousel } from "../../components/home/BannerCarousel";
import { CategoryGrid } from "../../components/home/CategoryGrid";
import { ProductRail } from "../../components/home/ProductRail";
import { FloatingCartBar } from "../../components/cart/FloatingCartBar";
import { Skeleton } from "../../components/common/Skeleton";
import { AppText } from "../../components/common/AppText";
import { useLocationStore } from "../../store/location.store";
import { useCatalogHomeQuery, useCategoriesQuery } from "../../queries/useCatalogQuery";
import {
  useCartDetailQuery,
  useDebouncedCart,
} from "../../queries/useCartQuery";
import { useRequireAuth } from "../../hooks/useRequireAuth";
import { colors, radii, spacing } from "../../config/theme";
import { ICategory, IProduct } from "../../api/types";
import { AlertTriangle, Clock } from "lucide-react-native";
import { storeApi } from "../../api/store.api";
import { setClientStoreId } from "../../api/client";
import { env } from "../../config/env";

type Props = NativeStackScreenProps<RootStackParamList>;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const activeStore = useLocationStore((s) => s.activeStore);
  const setActiveStore = useLocationStore((s) => s.setActiveStore);
  const selectedAddress = useLocationStore((s) => s.selectedAddress);
  const serviceability = useLocationStore((s) => s.serviceability);
  const isServiceable = useLocationStore((s) => s.isServiceable);

  useEffect(() => {
    if (!activeStore) {
      const storeIdToFetch = env.DEFAULT_STORE_ID;
      if (storeIdToFetch) {
        storeApi.getStore(storeIdToFetch).then((st) => {
          if (st) {
            setActiveStore(st);
            setClientStoreId(st._id);
          }
        }).catch(() => {});
      } else {
        storeApi.getStores().then((all) => {
          if (all.length > 0) {
            setActiveStore(all[0]);
            setClientStoreId(all[0]._id);
          }
        }).catch(() => {});
      }
    }
  }, [activeStore, setActiveStore]);

  const { data: sections, isLoading: isCatalogLoading, refetch: refetchCatalog, isRefetching } =
    useCatalogHomeQuery();
  const { data: categoriesResult, isLoading: isCategoriesLoading, refetch: refetchCategories } =
    useCategoriesQuery();
  const { itemQuantityMap } = useCartDetailQuery();

  const { updateQuantity } = useDebouncedCart();
  const { executeWithAuth } = useRequireAuth();

  const handleRefresh = useCallback(async () => {
    await Promise.all([refetchCatalog(), refetchCategories()]);
  }, [refetchCatalog, refetchCategories]);

  const handleIncrement = useCallback((productId: string, newQty: number) => {
    executeWithAuth(() => {
      let matchedProduct: IProduct | undefined;
      if (sections) {
        for (const s of sections) {
          const found = s.products.find((p) => p._id === productId);
          if (found) {
            matchedProduct = found;
            break;
          }
        }
      }
      updateQuantity(productId, newQty, matchedProduct);
    });
  }, [executeWithAuth, sections, updateQuantity]);

  const handleDecrement = useCallback((productId: string, newQty: number) => {
    executeWithAuth(() => {
      updateQuantity(productId, newQty);
    });
  }, [executeWithAuth, updateQuantity]);

  const handleProductPress = useCallback((product: IProduct) => {
    navigation.navigate("ProductDetail", { productId: product._id });
  }, [navigation]);

  const handleSelectCategory = useCallback((cat: ICategory) => {
    navigation.navigate("CategoryProducts", {
      categoryId: cat._id,
      categoryName: cat.name,
    });
  }, [navigation]);

  const isStoreClosed = serviceability && !serviceability.isOpen;

  return (
    <Screen edges={[]} style={styles.screen}>
      <HomeHeader
        store={activeStore}
        selectedAddress={selectedAddress}
        onAddressPress={() => navigation.navigate("Location")}
        onProfilePress={() => navigation.navigate("Main", { screen: "ProfileTab" } as any)}
        onSearchPress={() => navigation.navigate("Search")}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
          />
        }
      >
        {!isServiceable ? (
          <View style={styles.warningBanner}>
            <AlertTriangle size={18} color={colors.danger} />
            <AppText variant="xs" weight="bold" color={colors.danger} style={styles.bannerText}>
              Delivery currently unavailable in your selected location.
            </AppText>
          </View>
        ) : null}

        {isStoreClosed ? (
          <View style={styles.closedBanner}>
            <Clock size={18} color={colors.warning} />
            <AppText variant="xs" weight="bold" color={colors.warning} style={styles.bannerText}>
              Store is currently closed. Opens at {activeStore?.opensAt}.
            </AppText>
          </View>
        ) : null}

        <BannerCarousel
          onBannerPress={() => {
            navigation.navigate("Search");
          }}
        />

        <View style={styles.sectionHeader}>
          <AppText variant="md" weight="bold" color={colors.text}>
            Explore by Category
          </AppText>
        </View>

        {isCategoriesLoading ? (
          <View style={styles.skeletonRow}>
            <Skeleton width={70} height={70} borderRadius={radii.md} />
            <Skeleton width={70} height={70} borderRadius={radii.md} />
            <Skeleton width={70} height={70} borderRadius={radii.md} />
            <Skeleton width={70} height={70} borderRadius={radii.md} />
          </View>
        ) : (
          <CategoryGrid
            categories={categoriesResult?.items || []}
            onSelectCategory={handleSelectCategory}
          />
        )}

        {isCatalogLoading ? (
          <View style={styles.railsLoading}>
            <Skeleton height={20} width={160} style={styles.skeletonRailTitle} />
            <View style={styles.skeletonRow}>
              <Skeleton width={140} height={180} borderRadius={radii.md} />
              <Skeleton width={140} height={180} borderRadius={radii.md} />
            </View>
          </View>
        ) : (
          sections?.map((section) => (
            <ProductRail
              key={section.category._id}
              category={section.category}
              products={section.products}
              itemQuantityMap={itemQuantityMap}
              onProductPress={handleProductPress}
              onIncrement={handleIncrement}
              onDecrement={handleDecrement}
              onSeeAllPress={handleSelectCategory}
            />
          ))
        )}
      </ScrollView>

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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 90,
  },
  warningBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.dangerSoft,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: radii.md,
  },
  closedBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.warningSoft,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: radii.md,
  },
  bannerText: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  sectionHeader: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  skeletonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: spacing.lg,
    marginVertical: spacing.md,
  },
  railsLoading: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  skeletonRailTitle: {
    marginBottom: spacing.md,
  },
});
