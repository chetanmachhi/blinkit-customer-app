import React, { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";
import { Screen } from "../../components/common/Screen";
import { AppText } from "../../components/common/AppText";
import { PermissionPrimer } from "../../components/address/PermissionPrimer";
import { AddressCard } from "../../components/address/AddressCard";
import { useLocationStore } from "../../store/location.store";
import { useAddressesQuery } from "../../queries/useAddressQuery";
import {
  openAppSettings,
  requestLocationPermission,
} from "../../utils/permissions";
import { getCurrentCoordinates, getDefaultCoordinates } from "../../utils/geo";
import { storeApi } from "../../api/store.api";
import { useUiStore } from "../../store/ui.store";
import { colors, radii, spacing } from "../../config/theme";
import { IAddress, IStore } from "../../api/types";
import { ArrowLeft, MapPin } from "lucide-react-native";
import { setClientStoreId } from "../../api/client";

type Props = NativeStackScreenProps<RootStackParamList, "Location">;

export const LocationScreen: React.FC<Props> = ({ navigation }) => {
  const [isLocating, setIsLocating] = useState(false);
  const [isManualLoading, setIsManualLoading] = useState(false);
  const [storesList, setStoresList] = useState<IStore[]>([]);
  const setActiveStore = useLocationStore((s) => s.setActiveStore);
  const setCoordinates = useLocationStore((s) => s.setCoordinates);
  const setSelectedAddress = useLocationStore((s) => s.setSelectedAddress);
  const showToast = useUiStore((s) => s.showToast);

  const { data: savedAddresses } = useAddressesQuery();

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const stores = await storeApi.getStores();
        if (stores && stores.length > 0) {
          setStoresList(stores);
        }
      } catch {}
    };
    fetchStores();
  }, []);

  const handleUseCurrentLocation = async () => {
    setIsLocating(true);
    try {
      const status = await requestLocationPermission();
      if (status === "blocked") {
        showToast("Location permission blocked. Please enable in Settings.", "error");
        await openAppSettings();
        setIsLocating(false);
        return;
      }
      if (status === "denied") {
        showToast("Location permission was denied.", "warning");
        setIsLocating(false);
        return;
      }

      const coords = await getCurrentCoordinates();
      await setCoordinates(coords);

      let storeToSelect: IStore | null = null;
      try {
        const nearby = await storeApi.getNearbyStores(coords.lat, coords.lng, 25);
        if (nearby.length > 0) {
          storeToSelect = nearby[0];
        }
      } catch {}

      if (!storeToSelect) {
        if (storesList.length > 0) {
          storeToSelect = storesList[0];
        } else {
          const all = await storeApi.getStores();
          if (all.length > 0) {
            setStoresList(all);
            storeToSelect = all[0];
          }
        }
        showToast("Connected to Indiranagar Dark Store (Demo Location)", "info");
      }

      if (storeToSelect) {
        await setActiveStore(storeToSelect);
        setClientStoreId(storeToSelect._id);
        navigation.navigate("Main", { screen: "HomeTab" });
      } else {
        showToast("No active stores found. Please ensure backend is running.", "error");
      }
    } catch {
      showToast("Unable to fetch GPS. Using default location.", "info");
      const fallback = getDefaultCoordinates();
      await setCoordinates(fallback);
      if (storesList.length > 0) {
        await setActiveStore(storesList[0]);
        setClientStoreId(storesList[0]._id);
        navigation.navigate("Main", { screen: "HomeTab" });
      }
    } finally {
      setIsLocating(false);
    }
  };

  const handleManualSelect = async () => {
    setIsManualLoading(true);
    try {
      const fallback = getDefaultCoordinates();
      await setCoordinates(fallback);

      let available = storesList;
      if (available.length === 0) {
        available = await storeApi.getStores();
        setStoresList(available);
      }

      if (available.length > 0) {
        const store = available[0];
        await setActiveStore(store);
        setClientStoreId(store._id);
        showToast(`Selected ${store.name}`, "success");
        navigation.navigate("Main", { screen: "HomeTab" });
      } else {
        showToast("No active stores found. Please check backend connection.", "error");
      }
    } catch {
      showToast("Could not load stores from server.", "error");
    } finally {
      setIsManualLoading(false);
    }
  };

  const handleSelectStore = async (store: IStore) => {
    await setActiveStore(store);
    setClientStoreId(store._id);
    if (store.location) {
      await setCoordinates({
        lng: store.location.lng,
        lat: store.location.lat,
      });
    }
    navigation.navigate("Main", { screen: "HomeTab" });
  };

  const handleSelectSavedAddress = async (address: IAddress) => {
    await setSelectedAddress(address);
    try {
      const nearby = await storeApi.getNearbyStores(
        address.coordinates.lat,
        address.coordinates.lng,
        25
      );
      if (nearby.length > 0) {
        await setActiveStore(nearby[0]);
        setClientStoreId(nearby[0]._id);
      } else if (storesList.length > 0) {
        await setActiveStore(storesList[0]);
        setClientStoreId(storesList[0]._id);
      }
    } catch {}
    navigation.navigate("Main", { screen: "HomeTab" });
  };

  return (
    <Screen edges={["top", "bottom"]} scroll>
      <View style={styles.header}>
        {navigation.canGoBack() ? (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <ArrowLeft size={22} color={colors.text} />
          </TouchableOpacity>
        ) : null}
        <AppText variant="md" weight="bold" color={colors.text}>
          Choose Location
        </AppText>
      </View>

      <PermissionPrimer
        onContinue={handleUseCurrentLocation}
        onManualSelect={handleManualSelect}
        loading={isLocating}
        manualLoading={isManualLoading}
      />

      {savedAddresses && savedAddresses.length > 0 ? (
        <View style={styles.section}>
          <AppText variant="sm" weight="bold" color={colors.text} style={styles.sectionTitle}>
            Saved Addresses
          </AppText>
          {savedAddresses.map((addr) => (
            <AddressCard
              key={addr._id}
              address={addr}
              onSelect={handleSelectSavedAddress}
              onEdit={(a) => navigation.navigate("AddEditAddress", { address: a })}
            />
          ))}
        </View>
      ) : null}

      {storesList.length > 0 ? (
        <View style={styles.section}>
          <AppText variant="sm" weight="bold" color={colors.text} style={styles.sectionTitle}>
            Available Dark Stores
          </AppText>
          {storesList.map((store) => (
            <TouchableOpacity
              key={store._id}
              onPress={() => handleSelectStore(store)}
              style={styles.storeRow}
            >
              <View style={styles.storeIconWrap}>
                <MapPin size={18} color={colors.primary} />
              </View>
              <View style={styles.storeInfo}>
                <AppText variant="sm" weight="bold" color={colors.text}>
                  {store.name}
                </AppText>
                <AppText variant="xs" color={colors.textMuted} numberOfLines={1}>
                  {store.address}
                </AppText>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    marginRight: spacing.md,
    padding: 4,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  storeRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  storeIconWrap: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  storeInfo: {
    flex: 1,
  },
});
