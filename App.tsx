import React from "react";
import { StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { Toast } from "./src/components/common/Toast";
import { OfflineBanner } from "./src/components/common/OfflineBanner";
import { ErrorBoundary } from "./src/components/common/ErrorBoundary";
import { ApiError } from "./src/utils/errors";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
      retry: (failureCount, error) => {
        if (failureCount >= 2) return false;
        if (error instanceof ApiError) {
          if (error.statusCode >= 400 && error.statusCode < 500) {
            return false;
          }
        }
        return true;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});

function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <StatusBar barStyle="dark-content" />
          <OfflineBanner />
          <RootNavigator />
          <Toast />
        </ErrorBoundary>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

export default App;
