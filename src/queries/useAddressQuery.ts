import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addressApi } from "../api/address.api";
import { CreateAddressDto, IAddress, UpdateAddressDto } from "../api/types";
import { queryKeys } from "./keys";
import { useAuthStore } from "../store/auth.store";
import { useLocationStore } from "../store/location.store";
import { useUiStore } from "../store/ui.store";
import { ApiError } from "../utils/errors";

export const useAddressesQuery = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: queryKeys.address.all,
    queryFn: () => addressApi.getAddresses(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateAddressMutation = () => {
  const queryClient = useQueryClient();
  const showToast = useUiStore((s) => s.showToast);
  const setSelectedAddress = useLocationStore((s) => s.setSelectedAddress);

  return useMutation({
    mutationFn: (data: CreateAddressDto) => addressApi.createAddress(data),
    onSuccess: (newAddress) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.address.all });
      setSelectedAddress(newAddress);
      showToast("Address saved", "success");
    },
    onError: (err: ApiError) => {
      if (err.showMessage) {
        showToast(err.message, "error");
      }
    },
  });
};

export const useUpdateAddressMutation = () => {
  const queryClient = useQueryClient();
  const showToast = useUiStore((s) => s.showToast);

  return useMutation({
    mutationFn: ({
      addressId,
      data,
    }: {
      addressId: string;
      data: UpdateAddressDto;
    }) => addressApi.updateAddress(addressId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.address.all });
      showToast("Address updated", "success");
    },
    onError: (err: ApiError) => {
      if (err.showMessage) {
        showToast(err.message, "error");
      }
    },
  });
};

export const useSetDefaultAddressMutation = () => {
  const queryClient = useQueryClient();
  const showToast = useUiStore((s) => s.showToast);
  const setSelectedAddress = useLocationStore((s) => s.setSelectedAddress);

  return useMutation({
    mutationFn: (addressId: string) => addressApi.setDefaultAddress(addressId),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.address.all });
      setSelectedAddress(updated);
      showToast("Default address updated", "success");
    },
    onError: (err: ApiError) => {
      if (err.showMessage) {
        showToast(err.message, "error");
      }
    },
  });
};

export const useDeleteAddressMutation = () => {
  const queryClient = useQueryClient();
  const showToast = useUiStore((s) => s.showToast);
  const selectedAddress = useLocationStore((s) => s.selectedAddress);
  const setSelectedAddress = useLocationStore((s) => s.setSelectedAddress);

  return useMutation({
    mutationFn: (addressId: string) => addressApi.deleteAddress(addressId),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.address.all });
      if (selectedAddress?._id === deletedId) {
        setSelectedAddress(null);
      }
      showToast("Address deleted", "info");
    },
    onError: (err: ApiError) => {
      if (err.showMessage) {
        showToast(err.message, "error");
      }
    },
  });
};
