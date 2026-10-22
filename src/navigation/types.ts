import { NavigatorScreenParams } from "@react-navigation/native";
import { IAddress } from "../api/types";

export type AuthStackParamList = {
  Login: undefined;
  OtpVerify: { phone: string; devOtp?: string };
};

export type MainTabParamList = {
  HomeTab: undefined;
  CategoriesTab: undefined;
  OrdersTab: undefined;
  ProfileTab: undefined;
};

export type RootStackParamList = {
  Bootstrap: undefined;
  Location: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
  AuthStack: NavigatorScreenParams<AuthStackParamList> | undefined;
  CategoryProducts: { categoryId: string; categoryName: string };
  ProductDetail: { productId: string };
  Search: undefined;
  Cart: undefined;
  Checkout: undefined;
  OrderSuccess: { orderId: string; orderNumber: string };
  OrderDetail: { orderId: string };
  OrderTrack: { orderId: string };
  EditProfile: undefined;
  AddressList: undefined;
  AddEditAddress: { address?: IAddress } | undefined;
};
