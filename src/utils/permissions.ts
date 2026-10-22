import { Platform } from "react-native";
import {
  check,
  openSettings,
  PERMISSIONS,
  request,
  RESULTS,
} from "react-native-permissions";

export type PermissionStatusResult = "granted" | "denied" | "blocked";

const getLocationPermission = () => {
  return Platform.OS === "ios"
    ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
    : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
};

export const checkLocationPermission =
  async (): Promise<PermissionStatusResult> => {
    try {
      const permission = getLocationPermission();
      const result = await check(permission);
      if (result === RESULTS.GRANTED) return "granted";
      if (result === RESULTS.BLOCKED) return "blocked";
      return "denied";
    } catch {
      return "denied";
    }
  };

export const requestLocationPermission =
  async (): Promise<PermissionStatusResult> => {
    try {
      const permission = getLocationPermission();
      const result = await request(permission);
      if (result === RESULTS.GRANTED) return "granted";
      if (result === RESULTS.BLOCKED) return "blocked";
      return "denied";
    } catch {
      return "denied";
    }
  };

export const openAppSettings = async (): Promise<void> => {
  try {
    await openSettings();
  } catch {}
};
