import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";
import { Screen } from "../../components/common/Screen";
import { AppText } from "../../components/common/AppText";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";
import { Chip } from "../../components/common/Chip";
import {
  useCreateAddressMutation,
  useSetDefaultAddressMutation,
  useUpdateAddressMutation,
} from "../../queries/useAddressQuery";
import { useLocationStore } from "../../store/location.store";
import { useUiStore } from "../../store/ui.store";
import { colors, radii, spacing } from "../../config/theme";
import { AddressLabel, ICoordinates } from "../../api/types";
import {
  ArrowLeft,
  Briefcase,
  Home,
  LocateFixed,
  MapPin,
  MoreHorizontal,
  Phone,
  User,
} from "lucide-react-native";
import { getCurrentCoordinates, getDefaultCoordinates } from "../../utils/geo";
import { requestLocationPermission } from "../../utils/permissions";

type Props = NativeStackScreenProps<RootStackParamList, "AddEditAddress">;

export const AddEditAddressScreen: React.FC<Props> = ({ route, navigation }) => {
  const editingAddress = route.params?.address;
  const isEditing = Boolean(editingAddress);

  const fallbackCoords = useLocationStore((s) => s.coordinates) || getDefaultCoordinates();

  const [label, setLabel] = useState<AddressLabel>(
    editingAddress?.label || AddressLabel.HOME
  );
  const [receiverName, setReceiverName] = useState(
    editingAddress?.receiverName || ""
  );
  const [receiverPhone, setReceiverPhone] = useState(
    editingAddress?.receiverPhone || ""
  );
  const [addressLine, setAddressLine] = useState(
    editingAddress?.addressLine || ""
  );
  const [landmark, setLandmark] = useState(editingAddress?.landmark || "");
  const [city, setCity] = useState(editingAddress?.city || "");
  const [pincode, setPincode] = useState(editingAddress?.pincode || "");
  const [coordinates, setCoordinates] = useState<ICoordinates>(
    editingAddress?.coordinates || fallbackCoords
  );
  const [isDefault, setIsDefault] = useState(editingAddress?.isDefault || false);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [locating, setLocating] = useState(false);

  const createMutation = useCreateAddressMutation();
  const updateMutation = useUpdateAddressMutation();
  const setDefaultMutation = useSetDefaultAddressMutation();
  const showToast = useUiStore((s) => s.showToast);

  const validate = (): boolean => {
    const errs: { [key: string]: string } = {};

    if (!receiverName.trim() || receiverName.trim().length < 2) {
      errs.receiverName = "Name must be at least 2 characters";
    }

    const cleanPhone = receiverPhone.trim();
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      errs.receiverPhone = "Enter a valid 10-digit mobile number";
    }

    if (!addressLine.trim() || addressLine.trim().length < 5) {
      errs.addressLine = "Flat, floor, building name (min 5 chars)";
    }

    if (!city.trim() || city.trim().length < 2) {
      errs.city = "City is required";
    }

    if (!/^\d{6}$/.test(pincode.trim())) {
      errs.pincode = "Enter a valid 6-digit pincode";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleFetchCurrentLocation = async () => {
    try {
      setLocating(true);
      const perm = await requestLocationPermission();
      if (perm === "granted") {
        const coords = await getCurrentCoordinates();
        setCoordinates(coords);
        showToast("GPS location updated", "success");
      } else {
        showToast("Location permission denied", "error");
      }
    } catch {
      showToast("Could not determine current location", "error");
    } finally {
      setLocating(false);
    }
  };

  const handleSave = () => {
    if (!validate()) return;

    if (isEditing && editingAddress) {
      updateMutation.mutate(
        {
          addressId: editingAddress._id,
          data: {
            label,
            receiverName: receiverName.trim(),
            receiverPhone: receiverPhone.trim(),
            addressLine: addressLine.trim(),
            landmark: landmark.trim() || undefined,
            city: city.trim(),
            pincode: pincode.trim(),
            coordinates,
          },
        },
        {
          onSuccess: (updated) => {
            if (isDefault && !editingAddress.isDefault) {
              setDefaultMutation.mutate(updated._id);
            }
            navigation.goBack();
          },
        }
      );
    } else {
      createMutation.mutate(
        {
          label,
          receiverName: receiverName.trim(),
          receiverPhone: receiverPhone.trim(),
          addressLine: addressLine.trim(),
          landmark: landmark.trim() || undefined,
          city: city.trim(),
          pincode: pincode.trim(),
          coordinates,
        },
        {
          onSuccess: (created) => {
            if (isDefault) {
              setDefaultMutation.mutate(created._id);
            }
            navigation.goBack();
          },
        }
      );
    }
  };

  const isPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    setDefaultMutation.isPending;

  return (
    <Screen edges={["top", "bottom"]} scroll keyboardAware style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.backBtn}
        >
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <AppText variant="md" weight="bold" color={colors.text}>
          {isEditing ? "Edit Address" : "Add Delivery Address"}
        </AppText>
      </View>

      <View style={styles.form}>
        <AppText variant="xs" weight="semibold" color={colors.textMuted} style={styles.sectionTitle}>
          SAVE AS
        </AppText>
        <View style={styles.chipsRow}>
          <Chip
            label="Home"
            selected={label === AddressLabel.HOME}
            onPress={() => setLabel(AddressLabel.HOME)}
            icon={<Home size={14} color={label === AddressLabel.HOME ? colors.primaryDark : colors.text} />}
          />
          <Chip
            label="Work"
            selected={label === AddressLabel.WORK}
            onPress={() => setLabel(AddressLabel.WORK)}
            icon={<Briefcase size={14} color={label === AddressLabel.WORK ? colors.primaryDark : colors.text} />}
          />
          <Chip
            label="Other"
            selected={label === AddressLabel.OTHER}
            onPress={() => setLabel(AddressLabel.OTHER)}
            icon={<MoreHorizontal size={14} color={label === AddressLabel.OTHER ? colors.primaryDark : colors.text} />}
          />
        </View>

        <TouchableOpacity
          style={styles.gpsBanner}
          onPress={handleFetchCurrentLocation}
          disabled={locating}
        >
          <View style={styles.gpsIconContainer}>
            {locating ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <LocateFixed size={18} color={colors.primary} />
            )}
          </View>
          <View style={styles.gpsTextContainer}>
            <AppText variant="sm" weight="semibold" color={colors.primary}>
              Use precise GPS location
            </AppText>
            <AppText variant="xs" color={colors.textMuted}>
              {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
            </AppText>
          </View>
        </TouchableOpacity>

        <Input
          label="Receiver Name"
          value={receiverName}
          onChangeText={setReceiverName}
          placeholder="e.g. John Doe"
          error={errors.receiverName}
          leftIcon={<User size={18} color={colors.textMuted} />}
        />

        <Input
          label="10-Digit Mobile Number"
          value={receiverPhone}
          onChangeText={setReceiverPhone}
          placeholder="e.g. 9876543210"
          keyboardType="phone-pad"
          maxLength={10}
          error={errors.receiverPhone}
          leftIcon={<Phone size={18} color={colors.textMuted} />}
        />

        <Input
          label="House / Flat / Block / Street"
          value={addressLine}
          onChangeText={setAddressLine}
          placeholder="e.g. Flat 402, Building A, Sunrise Apts"
          error={errors.addressLine}
          leftIcon={<MapPin size={18} color={colors.textMuted} />}
        />

        <Input
          label="Landmark (Optional)"
          value={landmark}
          onChangeText={setLandmark}
          placeholder="e.g. Near City Hospital"
        />

        <View style={styles.twoColumnRow}>
          <View style={styles.halfWidth}>
            <Input
              label="City"
              value={city}
              onChangeText={setCity}
              placeholder="e.g. Mumbai"
              error={errors.city}
            />
          </View>
          <View style={styles.halfWidth}>
            <Input
              label="Pincode"
              value={pincode}
              onChangeText={setPincode}
              placeholder="e.g. 400001"
              keyboardType="number-pad"
              maxLength={6}
              error={errors.pincode}
            />
          </View>
        </View>

        <View style={styles.defaultRow}>
          <View style={styles.defaultTextContainer}>
            <AppText variant="sm" weight="semibold" color={colors.text}>
              Set as default address
            </AppText>
            <AppText variant="xs" color={colors.textMuted}>
              Use this address for instant 1-tap checkout
            </AppText>
          </View>
          <Switch
            value={isDefault}
            onValueChange={setIsDefault}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.white}
          />
        </View>

        <Button
          title={isEditing ? "Update Address" : "Save Address"}
          onPress={handleSave}
          loading={isPending}
          size="large"
          style={styles.submitBtn}
        />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  backBtn: {
    padding: spacing.xs,
    marginRight: spacing.sm,
  },
  form: {
    padding: spacing.lg,
  },
  sectionTitle: {
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  chipsRow: {
    flexDirection: "row",
    marginBottom: spacing.lg,
  },
  gpsBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    padding: spacing.md,
    borderRadius: radii.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primarySoft,
  },
  gpsIconContainer: {
    marginRight: spacing.md,
  },
  gpsTextContainer: {
    flex: 1,
  },
  twoColumnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfWidth: {
    width: "48%",
  },
  defaultRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    marginBottom: spacing.xl,
  },
  defaultTextContainer: {
    flex: 1,
    marginRight: spacing.md,
  },
  submitBtn: {
    marginTop: spacing.sm,
  },
});
