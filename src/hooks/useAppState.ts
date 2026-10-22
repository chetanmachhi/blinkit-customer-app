import { useEffect, useState } from "react";
import { AppState, AppStateStatus } from "react-native";

export const useAppState = (): AppStateStatus => {
  const [appState, setAppState] = useState<AppStateStatus>(
    (AppState.currentState as AppStateStatus) || "active"
  );

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      setAppState(nextState);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return appState;
};
