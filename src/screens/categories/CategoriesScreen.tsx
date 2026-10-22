import React from "react";
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
import { AppImage } from "../../components/common/AppImage";
import { Skeleton } from "../../components/common/Skeleton";
import { FloatingCartBar } from "../../components/cart/FloatingCartBar";
import { useCategoriesQuery } from "../../queries/useCatalogQuery";
import { colors, radii, shadows, spacing } from "../../config/theme";
import { ICategory } from "../../api/types";
import { ChevronRight } from "lucide-react-native";

type Props = NativeStackScreenProps<RootStackParamList>;

export const CategoriesScreen: React.FC<Props> = ({ navigation }) => {
  const { data: categoriesResult, isLoading } = useCategoriesQuery();

  const handleCategoryPress = (category: ICategory) => {
    navigation.navigate("CategoryProducts", {
      categoryId: category._id,
      categoryName: category.name,
    });
  };

  const renderItem = ({ item }: { item: ICategory }) => {
    return (
      <TouchableOpacity
        onPress={() => handleCategoryPress(item)}
        activeOpacity={0.8}
        style={styles.card}
      >
        <AppImage
          uri={item.imageUrl}
          width={64}
          height={64}
          borderRadius={radii.md}
        />
        <View style={styles.info}>
          <AppText variant="md" weight="bold" color={colors.text}>
            {item.name}
          </AppText>
          <AppText variant="xs" color={colors.textMuted} style={styles.subtitle}>
            Explore freshest quality items
          </AppText>
        </View>
        <ChevronRight size={20} color={colors.textLight} />
      </TouchableOpacity>
    );
  };

  return (
    <Screen edges={["top"]} style={styles.screen}>
      <View style={styles.header}>
        <AppText variant="lg" weight="bold" color={colors.text}>
          All Categories
        </AppText>
      </View>

      {isLoading ? (
        <View style={styles.skeletonContainer}>
          <Skeleton height={80} style={styles.skeletonItem} />
          <Skeleton height={80} style={styles.skeletonItem} />
          <Skeleton height={80} style={styles.skeletonItem} />
        </View>
      ) : (
        <FlatList
          data={categoriesResult?.items || []}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: 90,
  },
  skeletonContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  skeletonItem: {
    marginBottom: spacing.md,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.subtle,
  },
  info: {
    flex: 1,
    marginLeft: spacing.md,
  },
  subtitle: {
    marginTop: 2,
  },
});
