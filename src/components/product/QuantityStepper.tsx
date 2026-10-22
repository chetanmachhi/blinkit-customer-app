import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { colors, radii, spacing } from "../../config/theme";
import { AppText } from "../common/AppText";
import { Minus, Plus } from "lucide-react-native";

export interface QuantityStepperProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  maxQuantity?: number;
  disabled?: boolean;
}

export const QuantityStepper: React.FC<QuantityStepperProps> = ({
  quantity,
  onIncrement,
  onDecrement,
  maxQuantity = 10,
  disabled = false,
}) => {
  if (quantity === 0) {
    return (
      <TouchableOpacity
        onPress={onIncrement}
        disabled={disabled}
        activeOpacity={0.8}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={[styles.addButton, disabled && styles.disabledButton]}
      >
        <AppText
          variant="sm"
          weight="bold"
          color={disabled ? colors.textLight : colors.primary}
        >
          ADD
        </AppText>
      </TouchableOpacity>
    );
  }

  const canIncrement = quantity < maxQuantity && !disabled;

  return (
    <View style={styles.stepperContainer}>
      <TouchableOpacity
        onPress={onDecrement}
        disabled={disabled}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={styles.stepperButton}
      >
        <Minus size={14} color={colors.white} strokeWidth={3} />
      </TouchableOpacity>

      <AppText variant="sm" weight="bold" color={colors.white} style={styles.quantityText}>
        {quantity}
      </AppText>

      <TouchableOpacity
        onPress={onIncrement}
        disabled={!canIncrement}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={[styles.stepperButton, !canIncrement && styles.disabledStepperBtn]}
      >
        <Plus size={14} color={colors.white} strokeWidth={3} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  addButton: {
    minWidth: 72,
    minHeight: 34,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
    borderRadius: radii.sm,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
  },
  disabledButton: {
    borderColor: colors.border,
    backgroundColor: colors.borderLight,
  },
  stepperContainer: {
    minWidth: 76,
    minHeight: 34,
    backgroundColor: colors.primary,
    borderRadius: radii.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 2,
  },
  stepperButton: {
    width: 26,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  disabledStepperBtn: {
    opacity: 0.5,
  },
  quantityText: {
    minWidth: 18,
    textAlign: "center",
  },
});
