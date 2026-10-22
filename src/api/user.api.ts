import { apiClient } from "./client";
import { IUser, ResponseModel } from "./types";

export const userApi = {
  async getMe(): Promise<IUser> {
    const response = await apiClient.get<ResponseModel<IUser>>("/users/me");
    return response.data.data!;
  },

  async updateMe(data: { name?: string; email?: string }): Promise<IUser> {
    const response = await apiClient.patch<ResponseModel<IUser>>(
      "/users/me",
      data
    );
    return response.data.data!;
  },

  async deleteMe(): Promise<void> {
    await apiClient.delete<ResponseModel<void>>("/users/me");
  },
};
