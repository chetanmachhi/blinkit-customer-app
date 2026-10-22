import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { useUiStore } from "../../store/ui.store";
import { colors, spacing } from "../../config/theme";
import { AppText } from "./AppText";
import { WifiOff } from "lucide-react-native";

export const OfflineBanner: React.FC = () => {
  const isOffline = useUiStore((s) => s.isOffline);
  const setOffline = useUiStore((s) => s.setOffline);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const offline = !(state.isConnected && state.isInternetReachable !== false);
      setOffline(offline);
    });

    return () => {
      unsubscribe();
    };
  }, [setOffline]);

  if (!isOffline) return null;

  return (
    <View style={styles.banner}>
      <WifiOff size={16} color={colors.white} />
      <AppText variant="xs" weight="semibold" color={colors.white} style={styles.text}>
        No internet connection. Changes may not be saved.
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.danger,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  text: {
    marginLeft: spacing.xs,
  },
});
