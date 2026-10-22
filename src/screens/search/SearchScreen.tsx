import React, { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";
import { Screen } from "../../components/common/Screen";
import { Input } from "../../components/common/Input";
import { ProductCard } from "../../components/product/ProductCard";
import { FloatingCartBar } from "../../components/cart/FloatingCartBar";
import { EmptyState } from "../../components/common/EmptyState";
import { Skeleton } from "../../components/common/Skeleton";
import { AppText } from "../../components/common/AppText";
import { useSearchStore } from "../../store/search.store";
import { useProductsQuery } from "../../queries/useCatalogQuery";
import {
  useCartDetailQuery,
  useDebouncedCart,
} from "../../queries/useCartQuery";
import { useRequireAuth } from "../../hooks/useRequireAuth";
import { useDebounce } from "../../hooks/useDebounce";
import { colors, spacing } from "../../config/theme";
import { IProduct, ProductSort } from "../../api/types";
import { ArrowLeft, Clock, Search, X } from "lucide-react-native";

type Props = NativeStackScreenProps<RootStackParamList, "Search">;

export const SearchScreen: React.FC<Props> = ({ navigation }) => {
  const [query, setQuery] = useState("");
  const [selectedSort, setSelectedSort] = useState<ProductSort | undefined>();
  const debouncedQuery = useDebounce(query, 350);

  const recentSearches = useSearchStore((s) => s.recentSearches);
  const loadRecentSearches = useSearchStore((s) => s.loadRecentSearches);
  const addRecentSearch = useSearchStore((s) => s.addRecentSearch);
  const removeRecentSearch = useSearchStore((s) => s.removeRecentSearch);
  const clearRecentSearches = useSearchStore((s) => s.clearRecentSearches);

  useEffect(() => {
    loadRecentSearches();
  }, [loadRecentSearches]);

  useEffect(() => {
    if (debouncedQuery.trim().length >= 2) {
      addRecentSearch(debouncedQuery.trim());
    }
  }, [debouncedQuery, addRecentSearch]);

  const { data: productsResult, isLoading } = useProductsQuery({
    q: debouncedQuery.trim() || undefined,
    sort: selectedSort,
  });

  const { itemQuantityMap } = useCartDetailQuery();
  const { updateQuantity } = useDebouncedCart();
  const { executeWithAuth } = useRequireAuth();

  const handleIncrement = (productId: string, newQty: number) => {
    executeWithAuth(() => {
      const product = productsResult?.items.find((p) => p._id === productId);
      updateQuantity(productId, newQty, product);
    });
  };

  const handleDecrement = (productId: string, newQty: number) => {
    executeWithAuth(() => {
      updateQuantity(productId, newQty);
    });
  };

  const handleProductPress = (product: IProduct) => {
    navigation.navigate("ProductDetail", { productId: product._id });
  };

  const products = productsResult?.items || [];
  const showRecent = query.trim().length === 0;

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
        <Input
          value={query}
          onChangeText={setQuery}
          onClear={() => setQuery("")}
          showClearButton
          autoFocus
          placeholder="Search grocery & more..."
          leftIcon={<Search size={18} color={colors.textLight} />}
          containerStyle={styles.searchBarContainer}
        />
      </View>

      {showRecent ? (
        <View style={styles.recentContainer}>
          {recentSearches.length > 0 ? (
            <>
              <View style={styles.recentHeader}>
                <AppText variant="sm" weight="bold" color={colors.text}>
                  Recent Searches
                </AppText>
                <TouchableOpacity onPress={clearRecentSearches}>
                  <AppText variant="xs" color={colors.primary} weight="semibold">
                    Clear All
                  </AppText>
                </TouchableOpacity>
              </View>
              {recentSearches.map((item) => (
                <View key={item} style={styles.recentRow}>
                  <TouchableOpacity
                    onPress={() => setQuery(item)}
                    style={styles.recentLeft}
                  >
                    <Clock size={16} color={colors.textLight} />
                    <AppText variant="sm" color={colors.text} style={styles.recentText}>
                      {item}
                    </AppText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => removeRecentSearch(item)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <X size={16} color={colors.textLight} />
                  </TouchableOpacity>
                </View>
              ))}
            </>
          ) : (
            <EmptyState
              title="Search for Products"
              description="Type the name of any grocery or household essential."
            />
          )}
        </View>
      ) : isLoading ? (
        <View style={styles.skeletonContainer}>
          <Skeleton height={140} style={styles.skeletonItem} />
          <Skeleton height={140} style={styles.skeletonItem} />
        </View>
      ) : products.length === 0 ? (
        <EmptyState
          title={`No results for "${query}"`}
          description="Try checking for spelling errors or searching for general categories."
        />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item._id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              quantity={itemQuantityMap[item._id] || 0}
              onPress={handleProductPress}
              onIncrement={handleIncrement}
              onDecrement={handleDecrement}
              isGrid
            />
          )}
        />
      )}

      <FloatingCartBar onPress={() => navigation.navigate("Cart")} />
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
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    backgroundColor: colors.surface,
  },
  backButton: {
    padding: spacing.xs,
    marginRight: spacing.xs,
    marginTop: -spacing.md,
  },
  searchBarContainer: {
    flex: 1,
    marginBottom: spacing.xs,
  },
  recentContainer: {
    padding: spacing.lg,
  },
  recentHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  recentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
  },
  recentLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  recentText: {
    marginLeft: spacing.sm,
  },
  skeletonContainer: {
    padding: spacing.lg,
  },
  skeletonItem: {
    marginBottom: spacing.md,
  },
  columnWrapper: {
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: 90,
  },
});
