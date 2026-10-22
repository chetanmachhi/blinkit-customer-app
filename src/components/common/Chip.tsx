import React from "react";
import {
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import { colors, radii, spacing } from "../../config/theme";
import { AppText } from "./AppText";

export interface ChipProps {
  label: string;
  selected?: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  icon?: React.ReactNode;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  onPress,
  style,
  icon,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.chip,
        selected ? styles.selectedChip : styles.unselectedChip,
        style,
      ]}
    >
      {icon}
      <AppText
        variant="sm"
        weight={selected ? "semibold" : "medium"}
        color={selected ? colors.primaryDark : colors.text}
        style={icon ? styles.textWithIcon : undefined}
      >
        {label}
      </AppText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radii.full,
    borderWidth: 1,
    minHeight: 32,
    marginRight: spacing.sm,
  },
  unselectedChip: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  selectedChip: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  textWithIcon: {
    marginLeft: spacing.xs,
  },
});
