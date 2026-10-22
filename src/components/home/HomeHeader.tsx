import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, radii, shadows, spacing } from "../../config/theme";
import { AppText } from "../common/AppText";
import { ChevronDown, Search, User } from "lucide-react-native";
import { IAddress, IStore } from "../../api/types";
import { formatEtaMinutes } from "../../utils/date";

export interface HomeHeaderProps {
  store?: IStore | null;
  selectedAddress?: IAddress | null;
  onAddressPress: () => void;
  onProfilePress: () => void;
  onSearchPress: () => void;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({
  store,
  selectedAddress,
  onAddressPress,
  onProfilePress,
  onSearchPress,
}) => {
  const insets = useSafeAreaInsets();
  const eta = formatEtaMinutes(store?.avgPrepMinutes);

  const addressLine = selectedAddress
    ? `${selectedAddress.addressLine}, ${selectedAddress.city}`
    : store
    ? `Near ${store.name}`
    : "Select Delivery Location";

  return (
    <View style={[styles.headerContainer, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.topRow}>
        <TouchableOpacity
          onPress={onAddressPress}
          activeOpacity={0.8}
          style={styles.locationButton}
        >
          <View>
            <View style={styles.etaRow}>
              <AppText variant="md" weight="bold" color={colors.text}>
                Delivery in {eta}
              </AppText>
            </View>
            <View style={styles.addressRow}>
              <AppText
                variant="sm"
                weight="medium"
                color={colors.text}
                numberOfLines={1}
                style={styles.addressText}
              >
                {addressLine}
              </AppText>
              <ChevronDown size={16} color={colors.text} />
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onProfilePress}
          activeOpacity={0.8}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.profileButton}
        >
          <User size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={onSearchPress}
        activeOpacity={0.9}
        style={styles.searchBar}
      >
        <Search size={18} color={colors.textMuted} style={styles.searchIcon} />
        <AppText variant="sm" color={colors.textMuted}>
          Search "milk, eggs, chips, bread..."
        </AppText>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: colors.headerYellow,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomLeftRadius: radii.lg,
    borderBottomRightRadius: radii.lg,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  locationButton: {
    flex: 1,
    marginRight: spacing.md,
  },
  etaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  addressText: {
    maxWidth: 240,
    marginRight: 4,
  },
  profileButton: {
    width: 38,
    height: 38,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.subtle,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    minHeight: 46,
    ...shadows.card,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
});
