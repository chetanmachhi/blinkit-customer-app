import React, { Component, ErrorInfo, ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { colors, spacing } from "../../config/theme";
import { AppText } from "./AppText";
import { Button } from "./Button";
import { AlertTriangle } from "lucide-react-native";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in component tree:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <AlertTriangle size={56} color={colors.danger} />
          <AppText variant="lg" weight="bold" color={colors.text} style={styles.title}>
            Something went wrong
          </AppText>
          <AppText variant="sm" color={colors.textMuted} style={styles.message}>
            {this.state.error?.message || "An unexpected error occurred."}
          </AppText>
          <Button
            title="Reload App"
            onPress={this.handleReset}
            variant="primary"
            size="medium"
            style={styles.button}
          />
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    padding: spacing.xxl,
  },
  title: {
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  message: {
    textAlign: "center",
    marginBottom: spacing.xl,
  },
  button: {
    minWidth: 160,
  },
});
