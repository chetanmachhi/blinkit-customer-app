import React from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { colors, spacing } from "../../config/theme";

export interface DividerProps {
  style?: StyleProp<ViewStyle>;
  color?: string;
  marginVertical?: number;
}

export const Divider: React.FC<DividerProps> = ({
  style,
  color = colors.border,
  marginVertical = spacing.sm,
}) => {
  return (
    <View
      style={[
        styles.divider,
        { backgroundColor: color, marginVertical },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  divider: {
    height: StyleSheet.hairlineWidth,
    width: "100%",
  },
});
