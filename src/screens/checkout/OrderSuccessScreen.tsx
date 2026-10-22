import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";
import { Screen } from "../../components/common/Screen";
import { AppText } from "../../components/common/AppText";
import { Button } from "../../components/common/Button";
import { colors, radii, spacing } from "../../config/theme";
import { Check } from "lucide-react-native";

type Props = NativeStackScreenProps<RootStackParamList, "OrderSuccess">;

export const OrderSuccessScreen: React.FC<Props> = ({
  navigation,
  route,
}) => {
  const { orderId, orderNumber } = route.params;

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, opacityAnim]);

  return (
    <Screen edges={["top", "bottom"]} style={styles.screen}>
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.circle,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          <Check size={56} color={colors.white} strokeWidth={3} />
        </Animated.View>

        <AppText variant="xl" weight="bold" color={colors.text} style={styles.title}>
          Order Placed Successfully!
        </AppText>

        <AppText variant="sm" color={colors.textMuted} style={styles.orderNo}>
          Order #{orderNumber}
        </AppText>

        <AppText variant="sm" color={colors.text} style={styles.message}>
          Your order has been confirmed by the store. Our delivery partner is
          packing your groceries now.
        </AppText>
      </View>

      <View style={styles.footer}>
        <Button
          title="Track Order Live"
          onPress={() => navigation.replace("OrderTrack", { orderId })}
          size="large"
          style={styles.trackBtn}
        />
        <Button
          title="Back to Home"
          onPress={() => navigation.navigate("Main", { screen: "HomeTab" } as any)}
          variant="outline"
          size="medium"
        />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.surface,
    justifyContent: "space-between",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  circle: {
    width: 100,
    height: 100,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xl,
  },
  title: {
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  orderNo: {
    marginBottom: spacing.lg,
  },
  message: {
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: spacing.md,
  },
  footer: {
    padding: spacing.lg,
  },
  trackBtn: {
    marginBottom: spacing.sm,
  },
});
