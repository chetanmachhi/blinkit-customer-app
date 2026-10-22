import React from "react";
import {
  StyleProp,
  StyleSheet,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { colors, radii, spacing, typography } from "../../config/theme";
import { AppText } from "./AppText";
import { X } from "lucide-react-native";

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onClear?: () => void;
  showClearButton?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  leftIcon,
  rightIcon,
  value,
  onClear,
  showClearButton = false,
  style,
  ...props
}) => {
  const hasError = Boolean(error);

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <AppText variant="sm" weight="medium" color={colors.text} style={styles.label}>
          {label}
        </AppText>
      ) : null}

      <View
        style={[
          styles.inputContainer,
          hasError && styles.errorBorder,
        ]}
      >
        {leftIcon ? <View style={styles.leftIconContainer}>{leftIcon}</View> : null}

        <TextInput
          value={value}
          placeholderTextColor={colors.textLight}
          maxFontSizeMultiplier={1.2}
          style={[styles.input, style]}
          {...props}
        />

        {showClearButton && value && onClear ? (
          <TouchableOpacity
            onPress={onClear}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.clearButton}
          >
            <X size={16} color={colors.textMuted} />
          </TouchableOpacity>
        ) : null}

        {rightIcon ? <View style={styles.rightIconContainer}>{rightIcon}</View> : null}
      </View>

      {hasError ? (
        <AppText variant="xs" color={colors.danger} style={styles.errorText}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: spacing.md,
  },
  label: {
    marginBottom: spacing.xs,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  errorBorder: {
    borderColor: colors.danger,
  },
  leftIconContainer: {
    marginRight: spacing.sm,
  },
  rightIconContainer: {
    marginLeft: spacing.sm,
  },
  clearButton: {
    padding: spacing.xs,
  },
  input: {
    flex: 1,
    ...typography.base,
    color: colors.text,
    paddingVertical: spacing.sm,
  },
  errorText: {
    marginTop: spacing.xs,
  },
});
