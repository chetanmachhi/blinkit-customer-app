import React, { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { NativeStackNavigationProp, NativeStackScreenProps } from "@react-navigation/native-stack";
import { AuthStackParamList, RootStackParamList } from "../../navigation/types";
import { Screen } from "../../components/common/Screen";
import { AppText } from "../../components/common/AppText";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";
import { useRequestOtpMutation } from "../../queries/useAuthQuery";
import { colors, radii, spacing } from "../../config/theme";
import { ArrowLeft, Phone, ShieldCheck } from "lucide-react-native";

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const requestOtpMutation = useRequestOtpMutation();

  const handleClose = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    const parent = navigation.getParent<NativeStackNavigationProp<RootStackParamList>>();
    if (parent && parent.canGoBack()) {
      parent.goBack();
      return;
    }
    navigation.navigate("Main" as any);
  };

  const handleSendOtp = () => {
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }
    setError("");

    requestOtpMutation.mutate(cleanPhone, {
      onSuccess: (data) => {
        navigation.navigate("OtpVerify", {
          phone: cleanPhone,
          devOtp: data.devOtp,
        });
      },
    });
  };

  return (
    <Screen edges={["top", "bottom"]} keyboardAware style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleClose}
          style={styles.backButton}
        >
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.brandBadge}>
          <ShieldCheck size={28} color={colors.primary} />
        </View>

        <AppText variant="xl" weight="bold" color={colors.text} style={styles.title}>
          India's Fastest Grocery Delivery
        </AppText>
        <AppText variant="sm" color={colors.textMuted} style={styles.subtitle}>
          Enter your 10-digit phone number to log in or create an account
        </AppText>

        <Input
          label="Mobile Number"
          value={phone}
          onChangeText={(text) => {
            setPhone(text);
            if (error) setError("");
          }}
          placeholder="Enter 10-digit mobile number"
          keyboardType="phone-pad"
          maxLength={10}
          error={error}
          leftIcon={<Phone size={18} color={colors.textMuted} />}
          containerStyle={styles.phoneInput}
        />

        <Button
          title="Continue"
          onPress={handleSendOtp}
          loading={requestOtpMutation.isPending}
          disabled={phone.replace(/\D/g, "").length < 10}
          size="large"
          style={styles.continueButton}
        />

        <View style={styles.termsContainer}>
          <AppText variant="xs" color={colors.textLight} style={styles.termsText}>
            By continuing, you agree to our Terms of Service & Privacy Policy
          </AppText>
        </View>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.surface,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: "center",
  },
  brandBadge: {
    width: 56,
    height: 56,
    borderRadius: radii.md,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  title: {
    marginBottom: spacing.xs,
  },
  subtitle: {
    marginBottom: spacing.xl,
  },
  phoneInput: {
    marginBottom: spacing.xl,
  },
  continueButton: {
    marginBottom: spacing.lg,
  },
  termsContainer: {
    alignItems: "center",
    marginTop: spacing.md,
  },
  termsText: {
    textAlign: "center",
    lineHeight: 16,
  },
});
