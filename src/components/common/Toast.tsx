import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUiStore } from "../../store/ui.store";
import { colors, radii, shadows, spacing } from "../../config/theme";
import { AppText } from "./AppText";
import { AlertCircle, AlertTriangle, CheckCircle, Info } from "lucide-react-native";

export const Toast: React.FC = () => {
  const toast = useUiStore((s) => s.toast);
  const hideToast = useUiStore((s) => s.hideToast);
  const insets = useSafeAreaInsets();
  const translateYAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (toast) {
      Animated.spring(translateYAnim, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 6,
      }).start();

      const timer = setTimeout(() => {
        handleDismiss();
      }, toast.duration || 3000);

      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleDismiss = () => {
    Animated.timing(translateYAnim, {
      toValue: -150,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      hideToast();
    });
  };

  if (!toast) return null;

  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return <CheckCircle size={18} color={colors.success} />;
      case "error":
        return <AlertCircle size={18} color={colors.danger} />;
      case "warning":
        return <AlertTriangle size={18} color={colors.warning} />;
      case "info":
      default:
        return <Info size={18} color={colors.primary} />;
    }
  };

  const getBgColor = () => {
    switch (toast.type) {
      case "success":
        return colors.successSoft;
      case "error":
        return colors.dangerSoft;
      case "warning":
        return colors.warningSoft;
      case "info":
      default:
        return colors.primarySoft;
    }
  };

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        {
          top: insets.top + spacing.sm,
          backgroundColor: colors.surface,
          transform: [{ translateY: translateYAnim }],
        },
      ]}
    >
      <TouchableOpacity
        onPress={handleDismiss}
        activeOpacity={0.9}
        style={[styles.toastInner, { borderColor: getBgColor() }]}
      >
        <View style={styles.iconWrap}>{getIcon()}</View>
        <AppText variant="sm" weight="medium" color={colors.text} style={styles.text}>
          {toast.message}
        </AppText>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: "absolute",
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 9999,
    borderRadius: radii.md,
    ...shadows.floating,
  },
  toastInner: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    borderLeftWidth: 4,
  },
  iconWrap: {
    marginRight: spacing.sm,
  },
  text: {
    flex: 1,
  },
});
