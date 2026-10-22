import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from "./types";
import { BootstrapScreen } from "../screens/bootstrap/BootstrapScreen";
import { LocationScreen } from "../screens/location/LocationScreen";
import { MainTabs } from "./MainTabs";
import { AuthStack } from "./AuthStack";
import { CategoryProductsScreen } from "../screens/categories/CategoryProductsScreen";
import { ProductDetailScreen } from "../screens/product/ProductDetailScreen";
import { SearchScreen } from "../screens/search/SearchScreen";
import { CartScreen } from "../screens/cart/CartScreen";
import { CheckoutScreen } from "../screens/checkout/CheckoutScreen";
import { OrderSuccessScreen } from "../screens/checkout/OrderSuccessScreen";
import { OrderDetailScreen } from "../screens/orders/OrderDetailScreen";
import { OrderTrackScreen } from "../screens/orders/OrderTrackScreen";
import { EditProfileScreen } from "../screens/profile/EditProfileScreen";
import { AddressListScreen } from "../screens/profile/AddressListScreen";
import { AddEditAddressScreen } from "../screens/profile/AddEditAddressScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Bootstrap"
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="Bootstrap" component={BootstrapScreen} />
        <Stack.Screen name="Location" component={LocationScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen
          name="AuthStack"
          component={AuthStack}
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
          }}
        />
        <Stack.Screen
          name="CategoryProducts"
          component={CategoryProductsScreen}
        />
        <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
        <Stack.Screen
          name="Search"
          component={SearchScreen}
          options={{ animation: "fade" }}
        />
        <Stack.Screen name="Cart" component={CartScreen} />
        <Stack.Screen name="Checkout" component={CheckoutScreen} />
        <Stack.Screen
          name="OrderSuccess"
          component={OrderSuccessScreen}
          options={{ gestureEnabled: false }}
        />
        <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
        <Stack.Screen name="OrderTrack" component={OrderTrackScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="AddressList" component={AddressListScreen} />
        <Stack.Screen name="AddEditAddress" component={AddEditAddressScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
