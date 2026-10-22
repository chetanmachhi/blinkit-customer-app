import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";
import { useAuthStore } from "../../store/auth.store";
import { useLocationStore } from "../../store/location.store";
import { getTokens } from "../../utils/secureStorage";
import { storage } from "../../utils/storage";
import { STORAGE_KEYS } from "../../config/constants";
import { userApi } from "../../api/user.api";
import { storeApi } from "../../api/store.api";
import { setClientAccessToken, setClientStoreId } from "../../api/client";
import { colors } from "../../config/theme";
import { AppText } from "../../components/common/AppText";
import { IAddress, ICoordinates, IStore } from "../../api/types";
import { getDefaultCoordinates } from "../../utils/geo";
import { env } from "../../config/env";

type Props = NativeStackScreenProps<RootStackParamList, "Bootstrap">;

export const BootstrapScreen: React.FC<Props> = ({ navigation }) => {
  const setUser = useAuthStore((s) => s.setUser);
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const setBootstrapped = useAuthStore((s) => s.setBootstrapped);
  const setActiveStore = useLocationStore((s) => s.setActiveStore);
  const setCoordinates = useLocationStore((s) => s.setCoordinates);
  const setSelectedAddress = useLocationStore((s) => s.setSelectedAddress);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const tokens = await getTokens();
        if (tokens?.accessToken) {
          setClientAccessToken(tokens.accessToken);
          setAccessToken(tokens.accessToken);
          try {
            const user = await userApi.getMe();
            setUser(user);
          } catch {
            setUser(null);
          }
        }

        const savedAddress = await storage.get<IAddress>(
          STORAGE_KEYS.SELECTED_ADDRESS
        );
        if (savedAddress) {
          await setSelectedAddress(savedAddress);
        }

        const savedCoords = await storage.get<ICoordinates>(
          STORAGE_KEYS.COORDINATES
        );
        const effectiveCoords =
          savedCoords || (savedAddress ? savedAddress.coordinates : getDefaultCoordinates());
        await setCoordinates(effectiveCoords);

        let store = await storage.get<IStore>(STORAGE_KEYS.ACTIVE_STORE);
        if (!store) {
          const nearbyStores = await storeApi.getNearbyStores(
            effectiveCoords.lat,
            effectiveCoords.lng,
            15
          );
          if (nearbyStores.length > 0) {
            store = nearbyStores[0];
          } else if (env.DEFAULT_STORE_ID) {
            store = await storeApi.getStore(env.DEFAULT_STORE_ID);
          } else {
            const allStores = await storeApi.getStores();
            store = allStores[0] || null;
          }
        }

        if (store) {
          await setActiveStore(store);
          setClientStoreId(store._id);
        }

        setBootstrapped(true);

        if (!store) {
          navigation.replace("Location");
        } else {
          navigation.replace("Main", { screen: "HomeTab" });
        }
      } catch (err) {
        setBootstrapped(true);
        navigation.replace("Main", { screen: "HomeTab" });
      }
    };

    bootstrap();
  }, [
    navigation,
    setAccessToken,
    setActiveStore,
    setBootstrapped,
    setCoordinates,
    setSelectedAddress,
    setUser,
  ]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.white} />
      <AppText variant="md" weight="bold" color={colors.white} style={styles.text}>
        InstantMart
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    marginTop: 16,
    letterSpacing: 0.5,
  },
});
