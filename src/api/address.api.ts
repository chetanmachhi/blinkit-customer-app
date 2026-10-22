import { apiClient } from "./client";
import {
  CreateAddressDto,
  IAddress,
  ResponseModel,
  UpdateAddressDto,
} from "./types";

export const addressApi = {
  async getAddresses(): Promise<IAddress[]> {
    const response = await apiClient.get<ResponseModel<IAddress[]>>(
      "/addresses"
    );
    return response.data.data || [];
  },

  async createAddress(data: CreateAddressDto): Promise<IAddress> {
    const response = await apiClient.post<ResponseModel<IAddress>>(
      "/addresses",
      data
    );
    return response.data.data!;
  },

  async updateAddress(
    addressId: string,
    data: UpdateAddressDto
  ): Promise<IAddress> {
    const response = await apiClient.patch<ResponseModel<IAddress>>(
      `/addresses/${addressId}`,
      data
    );
    return response.data.data!;
  },

  async setDefaultAddress(addressId: string): Promise<IAddress> {
    const response = await apiClient.patch<ResponseModel<IAddress>>(
      `/addresses/${addressId}/default`
    );
    return response.data.data!;
  },

  async deleteAddress(addressId: string): Promise<void> {
    await apiClient.delete<ResponseModel<void>>(`/addresses/${addressId}`);
  },
};
