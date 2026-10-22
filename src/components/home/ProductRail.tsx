import React, { memo } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import { ICategory, IProduct } from "../../api/types";
import { colors, spacing } from "../../config/theme";
import { AppText } from "../common/AppText";
import { ProductCard } from "../product/ProductCard";
import { ChevronRight } from "lucide-react-native";

export interface ProductRailProps {
  category: ICategory;
  products: IProduct[];
  itemQuantityMap: Record<string, number>;
  onProductPress: (product: IProduct) => void;
  onIncrement: (productId: string, newQty: number) => void;
  onDecrement: (productId: string, newQty: number) => void;
  onSeeAllPress: (category: ICategory) => void;
}

const ProductRailComponent: React.FC<ProductRailProps> = ({
  category,
  products,
  itemQuantityMap,
  onProductPress,
  onIncrement,
  onDecrement,
  onSeeAllPress,
}) => {
  if (!products || products.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <AppText variant="md" weight="bold" color={colors.text}>
          {category.name}
        </AppText>
        <TouchableOpacity
          onPress={() => onSeeAllPress(category)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.seeAllBtn}
        >
          <AppText variant="sm" weight="semibold" color={colors.primary}>
            See All
          </AppText>
          <ChevronRight size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={products}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            quantity={itemQuantityMap[item._id] || 0}
            onPress={onProductPress}
            onIncrement={onIncrement}
            onDecrement={onDecrement}
            width={150}
          />
        )}
      />
    </View>
  );
};

export const ProductRail = memo(ProductRailComponent);

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  seeAllBtn: {
    flexDirection: "row",
    alignItems: "center",
  },
  listContent: {
    paddingLeft: spacing.lg,
  },
});
