import React from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { colors, radii, spacing } from "../../config/theme";
import { AppText } from "./AppText";

export interface BadgeProps {
  label: string;
  variant?: "discount" | "success" | "warning" | "danger" | "neutral";
  style?: StyleProp<ViewStyle>;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = "discount",
  style,
}) => {
  const getColors = () => {
    switch (variant) {
      case "discount":
        return { bg: colors.discountBadge, text: colors.white };
      case "success":
        return { bg: colors.successSoft, text: colors.success };
      case "warning":
        return { bg: colors.warningSoft, text: colors.warning };
      case "danger":
        return { bg: colors.dangerSoft, text: colors.danger };
      case "neutral":
        return { bg: colors.borderLight, text: colors.textMuted };
    }
  };

  const { bg, text } = getColors();

  return (
    <View style={[styles.badge, { backgroundColor: bg }, style]}>
      <AppText variant="xs" weight="bold" color={text}>
        {label}
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingVertical: 2,
    paddingHorizontal: spacing.xs + 2,
    borderRadius: radii.sm,
    alignSelf: "flex-start",
    alignItems: "center",
    justifyContent: "center",
  },
});
