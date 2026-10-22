import React from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { colors, spacing } from "../../config/theme";
import { AppText } from "./AppText";
import { Button } from "./Button";
import { AlertCircle } from "lucide-react-native";

export interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = "Something went wrong while loading data.",
  onRetry,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconContainer}>
        <AlertCircle size={44} color={colors.danger} />
      </View>
      <AppText variant="md" weight="bold" color={colors.text} style={styles.title}>
        Oops! Something went wrong
      </AppText>
      <AppText variant="sm" color={colors.textMuted} style={styles.message}>
        {message}
      </AppText>
      {onRetry ? (
        <Button
          title="Try Again"
          onPress={onRetry}
          variant="outline"
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
  message: {
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  button: {
    minWidth: 140,
  },
});
