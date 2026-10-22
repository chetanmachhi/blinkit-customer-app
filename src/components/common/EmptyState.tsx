import React from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { colors, spacing } from "../../config/theme";
import { AppText } from "./AppText";
import { Button } from "./Button";
import { PackageOpen } from "lucide-react-native";

export interface EmptyStateProps {
  title: string;
  description?: string;
  actionTitle?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionTitle,
  onAction,
  icon,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconContainer}>
        {icon || <PackageOpen size={48} color={colors.textLight} />}
      </View>
      <AppText variant="md" weight="bold" color={colors.text} style={styles.title}>
        {title}
      </AppText>
      {description ? (
        <AppText
          variant="sm"
          color={colors.textMuted}
          style={styles.description}
        >
          {description}
        </AppText>
      ) : null}
      {actionTitle && onAction ? (
        <Button
          title={actionTitle}
          onPress={onAction}
          variant="primary"
          size="medium"
          style={styles.button}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xxl,
  },
  iconContainer: {
    marginBottom: spacing.md,
  },
  title: {
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  description: {
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  button: {
    minWidth: 160,
  },
});
