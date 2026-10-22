import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { ICategory } from "../../api/types";
import { colors, radii, spacing } from "../../config/theme";
import { AppText } from "../common/AppText";
import { AppImage } from "../common/AppImage";

export interface CategoryGridProps {
  categories: ICategory[];
  onSelectCategory: (category: ICategory) => void;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  categories,
  onSelectCategory,
}) => {
  return (
    <View style={styles.grid}>
      {categories.map((cat) => (
        <TouchableOpacity
          key={cat._id}
          onPress={() => onSelectCategory(cat)}
          activeOpacity={0.8}
          style={styles.categoryItem}
        >
          <View style={styles.imageWrap}>
            <AppImage
              uri={cat.imageUrl}
              width={56}
              height={56}
              borderRadius={radii.md}
            />
          </View>
          <AppText
            variant="xs"
            weight="medium"
            color={colors.text}
            numberOfLines={2}
            style={styles.name}
          >
            {cat.name}
          </AppText>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: spacing.md,
  },
  categoryItem: {
    width: "25%",
    alignItems: "center",
    paddingHorizontal: 4,
    marginBottom: spacing.md,
  },
  imageWrap: {
    backgroundColor: colors.borderLight,
    borderRadius: radii.md,
    padding: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    textAlign: "center",
    marginTop: spacing.xs,
    minHeight: 28,
  },
});
