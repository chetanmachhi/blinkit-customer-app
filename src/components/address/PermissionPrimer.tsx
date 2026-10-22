import React from "react";
import { StyleSheet, View } from "react-native";
import { colors, radii, spacing } from "../../config/theme";
import { AppText } from "../common/AppText";
import { Button } from "../common/Button";
import { MapPin } from "lucide-react-native";

export interface PermissionPrimerProps {
  onContinue: () => void;
  onManualSelect: () => void;
  loading?: boolean;
  manualLoading?: boolean;
}

export const PermissionPrimer: React.FC<PermissionPrimerProps> = ({
  onContinue,
  onManualSelect,
  loading = false,
  manualLoading = false,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <MapPin size={40} color={colors.primary} />
      </View>

      <AppText variant="lg" weight="bold" color={colors.text} style={styles.title}>
        Enable Location for 10-Minute Delivery
      </AppText>

      <AppText variant="sm" color={colors.textMuted} style={styles.description}>
        We use your exact location to find the nearest dark store, check
        serviceability, and deliver your groceries in minutes.
      </AppText>

      <Button
        title="Use Current Location"
        onPress={onContinue}
        loading={loading}
        size="large"
        style={styles.primaryBtn}
      />

      <Button
        title="Select Location Manually"
        onPress={onManualSelect}
        loading={manualLoading}
        variant="outline"
        size="medium"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: spacing.xl,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: radii.full,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  title: {
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  description: {
    textAlign: "center",
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  primaryBtn: {
    width: "100%",
    marginBottom: spacing.md,
  },
});
