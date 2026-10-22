import { useCallback } from "react";
import { useNavigation } from "@react-navigation/native";
import { useAuthStore } from "../store/auth.store";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";

export const useRequireAuth = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const executeWithAuth = useCallback(
    (action: () => void): boolean => {
      if (isAuthenticated) {
        action();
        return true;
      }
      navigation.navigate("AuthStack");
      return false;
    },
    [isAuthenticated, navigation]
  );

  return { executeWithAuth, isAuthenticated };
};
