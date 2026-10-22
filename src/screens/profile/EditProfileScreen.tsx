import React, { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";
import { Screen } from "../../components/common/Screen";
import { AppText } from "../../components/common/AppText";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";
import { useAuthStore } from "../../store/auth.store";
import { useUpdateMeMutation } from "../../queries/useUserQuery";
import { colors, spacing } from "../../config/theme";
import { ArrowLeft, Mail, User } from "lucide-react-native";

type Props = NativeStackScreenProps<RootStackParamList, "EditProfile">;

export const EditProfileScreen: React.FC<Props> = ({ navigation }) => {
  const user = useAuthStore((s) => s.user);

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");

  const updateMeMutation = useUpdateMeMutation();

  const handleSave = () => {
    updateMeMutation.mutate(
      {
        name: name.trim() || undefined,
        email: email.trim() || undefined,
      },
      {
        onSuccess: () => {
          navigation.goBack();
        },
      }
    );
  };

  return (
    <Screen edges={["top", "bottom"]} keyboardAware style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.backBtn}
        >
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <AppText variant="md" weight="bold" color={colors.text}>
          Edit Profile
        </AppText>
      </View>

      <View style={styles.content}>
        <Input
          label="Full Name"
          value={name}
          onChangeText={setName}
          placeholder="Enter your name"
          leftIcon={<User size={18} color={colors.textMuted} />}
        />

        <Input
          label="Email Address"
          value={email}
          onChangeText={setEmail}
          placeholder="name@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          leftIcon={<Mail size={18} color={colors.textMuted} />}
        />

        <View style={styles.disabledField}>
          <AppText variant="xs" color={colors.textLight} style={styles.fieldLabel}>
            Registered Mobile (Cannot be changed)
          </AppText>
          <AppText variant="sm" weight="semibold" color={colors.textMuted}>
            +91 {user?.phone}
          </AppText>
        </View>

        <Button
          title="Save Changes"
          onPress={handleSave}
          loading={updateMeMutation.isPending}
          size="large"
          style={styles.saveBtn}
        />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  backBtn: {
    padding: spacing.xs,
    marginRight: spacing.sm,
  },
  content: {
    padding: spacing.lg,
  },
  disabledField: {
    backgroundColor: colors.borderLight,
    padding: spacing.md,
    borderRadius: spacing.sm,
    marginBottom: spacing.xl,
  },
  fieldLabel: {
    marginBottom: 2,
  },
  saveBtn: {
    marginTop: spacing.md,
  },
});
