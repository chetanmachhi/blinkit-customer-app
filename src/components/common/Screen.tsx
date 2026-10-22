import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StatusBarStyle,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { Edge, useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../config/theme";
import { useKeyboardHeight } from "../../hooks/useKeyboardHeight";

export interface ScreenProps {
  children: React.ReactNode;
  edges?: Edge[];
  backgroundColor?: string;
  statusBarStyle?: StatusBarStyle;
  statusBarColor?: string;
  scroll?: boolean;
  keyboardAware?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
}

export const Screen: React.FC<ScreenProps> = ({
  children,
  edges = ["top", "bottom"],
  backgroundColor = colors.background,
  statusBarStyle = "dark-content",
  statusBarColor = "transparent",
  scroll = false,
  keyboardAware = false,
  contentContainerStyle,
  style,
}) => {
  const insets = useSafeAreaInsets();
  const keyboardHeight = useKeyboardHeight();

  const paddingTop = edges.includes("top") ? insets.top : 0;
  const paddingBottom = edges.includes("bottom") ? insets.bottom : 0;
  const paddingLeft = edges.includes("left") ? insets.left : 0;
  const paddingRight = edges.includes("right") ? insets.right : 0;

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor,
    paddingTop,
    paddingBottom: keyboardAware && keyboardHeight > 0 ? keyboardHeight : paddingBottom,
    paddingLeft,
    paddingRight,
  };

  const content = scroll ? (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.inner, contentContainerStyle]}>{children}</View>
  );

  return (
    <View style={[containerStyle, style]}>
      <StatusBar barStyle={statusBarStyle} />
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  inner: {
    flex: 1,
  },
});
