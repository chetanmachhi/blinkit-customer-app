import { useCallback, useRef } from "react";
import { useFocusEffect } from "@react-navigation/native";

export const useRefreshOnFocus = <T>(refetch: () => Promise<T>): void => {
  const isFirstRun = useRef(true);

  useFocusEffect(
    useCallback(() => {
      if (isFirstRun.current) {
        isFirstRun.current = false;
        return;
      }
      refetch();
    }, [refetch])
  );
};
