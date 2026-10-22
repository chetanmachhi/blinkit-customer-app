import React from "react";
import {
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";
import { Screen } from "../../components/common/Screen";
import { AppText } from "../../components/common/AppText";
import { Button } from "../../components/common/Button";
import { AddressCard } from "../../components/address/AddressCard";
import { Skeleton } from "../../components/common/Skeleton";
import { EmptyState } from "../../components/common/EmptyState";
import {
  useAddressesQuery,
  useDeleteAddressMutation,
  useSetDefaultAddressMutation,
} from "../../queries/useAddressQuery";
import { useLocationStore } from "../../store/location.store";
import { colors, spacing } from "../../config/theme";
import { IAddress } from "../../api/types";
import { ArrowLeft, Plus } from "lucide-react-native";

type Props = NativeStackScreenProps<RootStackParamList, "AddressList">;

export const AddressListScreen: React.FC<Props> = ({ navigation }) => {
  const selectedAddress = useLocationStore((s) => s.selectedAddress);
  const setSelectedAddress = useLocationStore((s) => s.setSelectedAddress);

  const { data: addresses, isLoading } = useAddressesQuery();
  const deleteMutation = useDeleteAddressMutation();
  const setDefaultMutation = useSetDefaultAddressMutation();

  const handleSelectAddress = async (address: IAddress) => {
    await setSelectedAddress(address);
    navigation.goBack();
  };

  const handleEditAddress = (address: IAddress) => {
    navigation.navigate("AddEditAddress", { address });
  };

  const handleSetDefault = (addressId: string) => {
    setDefaultMutation.mutate(addressId);
  };

  const handleDelete = (addressId: string) => {
    deleteMutation.mutate(addressId);
  };

  return (
    <Screen edges={["top", "bottom"]} style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.backBtn}
        >
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <AppText variant="md" weight="bold" color={colors.text} style={styles.title}>
          Saved Addresses
        </AppText>
        <TouchableOpacity
          onPress={() => navigation.navigate("AddEditAddress")}
          style={styles.addBtn}
        >
          <Plus size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.skeletonContainer}>
          <Skeleton height={100} style={styles.skeletonItem} />
          <Skeleton height={100} style={styles.skeletonItem} />
        </View>
      ) : !addresses || addresses.length === 0 ? (
        <EmptyState
          title="No Addresses Saved"
          description="Add a delivery address to place orders quickly."
          actionTitle="Add New Address"
          onAction={() => navigation.navigate("AddEditAddress")}
        />
      ) : (
        <FlatList
          data={addresses}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <AddressCard
              address={item}
              isSelected={selectedAddress?._id === item._id}
              onSelect={handleSelectAddress}
              onEdit={handleEditAddress}
              onSetDefault={handleSetDefault}
              onDelete={handleDelete}
            />
          )}
        />
      )}

      <View style={styles.footer}>
        <Button
          title="Add New Address"
          onPress={() => navigation.navigate("AddEditAddress")}
          size="large"
          icon={<Plus size={18} color={colors.white} />}
        />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  backBtn: {
    padding: spacing.xs,
    marginRight: spacing.sm,
  },
  title: {
    flex: 1,
  },
  addBtn: {
    padding: spacing.xs,
  },
  skeletonContainer: {
    padding: spacing.lg,
  },
  skeletonItem: {
    marginBottom: spacing.md,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: 90,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
});
