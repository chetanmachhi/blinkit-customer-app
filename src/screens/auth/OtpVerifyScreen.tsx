import React, { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { CommonActions } from "@react-navigation/native";
import { NativeStackNavigationProp, NativeStackScreenProps } from "@react-navigation/native-stack";
import { AuthStackParamList, RootStackParamList } from "../../navigation/types";
import { Screen } from "../../components/common/Screen";
import { AppText } from "../../components/common/AppText";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";
import {
  useRequestOtpMutation,
  useVerifyOtpMutation,
} from "../../queries/useAuthQuery";
import { useAuthStore } from "../../store/auth.store";
import { colors, radii, spacing } from "../../config/theme";
import { APP_CONFIG } from "../../config/constants";
import { ArrowLeft } from "lucide-react-native";

type Props = NativeStackScreenProps<AuthStackParamList, "OtpVerify">;

export const OtpVerifyScreen: React.FC<Props> = ({ navigation, route }) => {
  const { phone, devOtp } = route.params;

  const [otp, setOtp] = useState(devOtp || "");
  const [name, setName] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(APP_CONFIG.OTP_RESEND_SECONDS);

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const verifyOtpMutation = useVerifyOtpMutation();
  const requestOtpMutation = useRequestOtpMutation();

  const inputRefs = useRef<(any | null)[]>([]);

  const handleNavigateAway = () => {
    try {
      const parent = navigation.getParent<NativeStackNavigationProp<RootStackParamList>>();
      if (parent && parent.canGoBack()) {
        parent.goBack();
        return;
      }
    } catch {}

    try {
      navigation.navigate("Main" as any);
    } catch {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "Main" }],
        })
      );
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      handleNavigateAway();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const interval = setInterval(() => {
      setSecondsLeft((s) => s - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsLeft]);

  const handleOtpChange = (text: string, index: number) => {
    const cleanChar = text.slice(-1);
    const newOtp = otp.split("");
    newOtp[index] = cleanChar;
    const combined = newOtp.join("");
    setOtp(combined);

    if (cleanChar && index < APP_CONFIG.OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    if (otp.length < APP_CONFIG.OTP_LENGTH || verifyOtpMutation.isPending) return;
    verifyOtpMutation.mutate(
      {
        phone,
        otp,
        name: name.trim() || undefined,
      },
      {
        onSuccess: () => {
          handleNavigateAway();
        },
      }
    );
  };

  const handleResend = () => {
    if (secondsLeft > 0) return;
    requestOtpMutation.mutate(phone, {
      onSuccess: (data) => {
        setSecondsLeft(APP_CONFIG.OTP_RESEND_SECONDS);
        if (data.devOtp) {
          setOtp(data.devOtp);
        }
      },
    });
  };

  return (
    <Screen edges={["top", "bottom"]} keyboardAware style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <AppText variant="xl" weight="bold" color={colors.text} style={styles.title}>
          Verify OTP
        </AppText>
        <AppText variant="sm" color={colors.textMuted} style={styles.subtitle}>
          We sent a 6-digit verification code to +91 {phone}
        </AppText>

        {devOtp ? (
          <View style={styles.devOtpBanner}>
            <AppText variant="xs" weight="bold" color={colors.primaryDark}>
              DEV OTP: {devOtp} (Auto-filled)
            </AppText>
          </View>
        ) : null}

        <View style={styles.otpBoxesRow}>
          {Array.from({ length: APP_CONFIG.OTP_LENGTH }).map((_, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              value={otp[index] || ""}
              onChangeText={(text) => handleOtpChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              textContentType="oneTimeCode"
              autoComplete="sms-otp"
              maxFontSizeMultiplier={1.2}
              style={[
                styles.otpBox,
                Boolean(otp[index]) && styles.otpBoxFilled,
              ]}
            />
          ))}
        </View>

        <Input
          label="Your Name (Optional if you already have an account)"
          value={name}
          onChangeText={setName}
          placeholder="Enter your full name"
          containerStyle={styles.nameInput}
        />

        <Button
          title="Verify & Continue"
          onPress={handleVerify}
          loading={verifyOtpMutation.isPending}
          disabled={otp.length < APP_CONFIG.OTP_LENGTH || verifyOtpMutation.isPending}
          size="large"
          style={styles.verifyButton}
        />

        <View style={styles.resendRow}>
          {secondsLeft > 0 ? (
            <AppText variant="xs" color={colors.textMuted}>
              Resend code in {secondsLeft}s
            </AppText>
          ) : (
            <TouchableOpacity onPress={handleResend}>
              <AppText variant="sm" weight="bold" color={colors.primary}>
                Resend OTP
              </AppText>
            </TouchableOpacity>
          )}
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
  title: {
    marginBottom: spacing.xs,
  },
  subtitle: {
    marginBottom: spacing.lg,
  },
  devOtpBanner: {
    backgroundColor: colors.primarySoft,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radii.sm,
    marginBottom: spacing.lg,
    alignSelf: "flex-start",
  },
  otpBoxesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xl,
  },
  otpBox: {
    width: 46,
    height: 52,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.md,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    backgroundColor: colors.surface,
  },
  otpBoxFilled: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  nameInput: {
    marginBottom: spacing.xl,
  },
  verifyButton: {
    marginBottom: spacing.lg,
  },
  resendRow: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm,
  },
});
