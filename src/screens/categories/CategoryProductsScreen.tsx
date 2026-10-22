import React, { useState } from "react";
import {
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";
import { Screen } from "../../components/common/Screen";
import { AppText } from "../../components/common/AppText";
import { ProductCard } from "../../components/product/ProductCard";
import { FloatingCartBar } from "../../components/cart/FloatingCartBar";
import { Skeleton } from "../../components/common/Skeleton";
import { EmptyState } from "../../components/common/EmptyState";
import { ModalSheet } from "../../components/common/ModalSheet";
import {
  useCategoriesQuery,
  useProductsQuery,
} from "../../queries/useCatalogQuery";
import {
  useCartDetailQuery,
  useDebouncedCart,
} from "../../queries/useCartQuery";
import { useRequireAuth } from "../../hooks/useRequireAuth";
import { colors, radii, spacing } from "../../config/theme";
import { IProduct, ProductSort } from "../../api/types";
import { ArrowLeft, ArrowUpDown, Check } from "lucide-react-native";

type Props = NativeStackScreenProps<RootStackParamList, "CategoryProducts">;

const SORT_OPTIONS = [
  { label: "Featured & Popular", value: undefined },
  { label: "Price: Low to High", value: ProductSort.PRICE_ASC },
  { label: "Price: High to Low", value: ProductSort.PRICE_DESC },
  { label: "Highest Discount", value: ProductSort.DISCOUNT },
  { label: "Newest First", value: ProductSort.NEWEST },
];

export const CategoryProductsScreen: React.FC<Props> = ({
  navigation,
  route,
}) => {
  const { categoryId, categoryName } = route.params;

  const [selectedSubCatId, setSelectedSubCatId] = useState<string>(categoryId);
  const [selectedSort, setSelectedSort] = useState<ProductSort | undefined>();
  const [isSortOpen, setIsSortOpen] = useState(false);

  const { data: subcategoriesResult } = useCategoriesQuery(categoryId);
  const subcategories = subcategoriesResult?.items || [];

  const { data: productsResult, isLoading } = useProductsQuery({
    categoryId: selectedSubCatId,
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

  const railCategories: Array<{ _id: string; name: string }> = [
    { _id: categoryId, name: "All Items" },
    ...subcategories.map((c) => ({ _id: c._id, name: c.name })),
  ];

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
        <AppText variant="md" weight="bold" color={colors.text} style={styles.title}>
          {categoryName}
        </AppText>
        <TouchableOpacity
          onPress={() => setIsSortOpen(true)}
          style={styles.sortButton}
        >
          <ArrowUpDown size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        {subcategories.length > 0 ? (
          <View style={styles.leftRail}>
            {railCategories.map((cat) => {
              const isSelected = selectedSubCatId === cat._id;
              return (
                <TouchableOpacity
                  key={cat._id}
                  onPress={() => setSelectedSubCatId(cat._id)}
                  style={[
                    styles.railItem,
                    isSelected && styles.railItemSelected,
                  ]}
                >
                  <AppText
                    variant="xs"
                    weight={isSelected ? "bold" : "medium"}
                    color={isSelected ? colors.primaryDark : colors.textMuted}
                    style={styles.railText}
                  >
                    {cat.name}
                  </AppText>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : null}

        <View style={styles.productArea}>
          {isLoading ? (
            <View style={styles.loadingGrid}>
              <Skeleton width="48%" height={180} borderRadius={radii.md} />
              <Skeleton width="48%" height={180} borderRadius={radii.md} />
            </View>
          ) : !productsResult?.items || productsResult.items.length === 0 ? (
            <EmptyState
              title="No Products Found"
              description="Check another subcategory or come back later."
            />
          ) : (
            <FlatList
              data={productsResult.items}
              keyExtractor={(item) => item._id}
              numColumns={2}
              columnWrapperStyle={styles.columnWrapper}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
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
        </View>
      </View>

      <FloatingCartBar onPress={() => navigation.navigate("Cart")} />

      <ModalSheet
        visible={isSortOpen}
        onClose={() => setIsSortOpen(false)}
        title="Sort Products"
      >
        <View style={styles.sortList}>
          {SORT_OPTIONS.map((opt) => {
            const isSelected = selectedSort === opt.value;
            return (
              <TouchableOpacity
                key={opt.label}
                onPress={() => {
                  setSelectedSort(opt.value);
                  setIsSortOpen(false);
                }}
                style={styles.sortRow}
              >
                <AppText
                  variant="sm"
                  weight={isSelected ? "bold" : "regular"}
                  color={isSelected ? colors.primary : colors.text}
                >
                  {opt.label}
                </AppText>
                {isSelected ? (
                  <Check size={18} color={colors.primary} />
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>
      </ModalSheet>
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
  backButton: {
    padding: 4,
    marginRight: spacing.sm,
  },
  title: {
    flex: 1,
  },
  sortButton: {
    padding: spacing.xs,
  },
  body: {
    flex: 1,
    flexDirection: "row",
  },
  leftRail: {
    width: 90,
    backgroundColor: colors.surface,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: colors.border,
  },
  railItem: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
  },
  railItemSelected: {
    backgroundColor: colors.primarySoft,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  railText: {
    textAlign: "center",
  },
  productArea: {
    flex: 1,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.xs,
  },
  columnWrapper: {
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  listContent: {
    paddingBottom: 90,
  },
  loadingGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: spacing.md,
  },
  sortList: {
    paddingBottom: spacing.xl,
  },
  sortRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
  },
});
