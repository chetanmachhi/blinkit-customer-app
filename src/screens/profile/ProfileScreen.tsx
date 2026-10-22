import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";
import { Screen } from "../../components/common/Screen";
import { AppText } from "../../components/common/AppText";
import { Divider } from "../../components/common/Divider";
import { ModalSheet } from "../../components/common/ModalSheet";
import { Button } from "../../components/common/Button";
import { useAuthStore } from "../../store/auth.store";
import { useLocationStore } from "../../store/location.store";
import {
  useLogoutAllMutation,
  useLogoutMutation,
} from "../../queries/useAuthQuery";
import { useDeleteMeMutation } from "../../queries/useUserQuery";
import { getTokens } from "../../utils/secureStorage";
import { colors, radii, shadows, spacing } from "../../config/theme";
import {
  ChevronRight,
  Headphones,
  HelpCircle,
  Info,
  LogOut,
  MapPin,
  Store,
  Tag,
  Trash2,
  User,
} from "lucide-react-native";

type Props = NativeStackScreenProps<RootStackParamList>;

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const activeStore = useLocationStore((s) => s.activeStore);

  const [isStoreSheetOpen, setIsStoreSheetOpen] = useState(false);
  const [isSupportSheetOpen, setIsSupportSheetOpen] = useState(false);

  const logoutMutation = useLogoutMutation();
  const logoutAllMutation = useLogoutAllMutation();
  const deleteMeMutation = useDeleteMeMutation();

  const handleLogout = async () => {
    Alert.alert("Log Out", "Are you sure you want to log out of InstantMart?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          const tokens = await getTokens();
          logoutMutation.mutate(tokens?.refreshToken || "");
        },
      },
    ]);
  };

  const handleLogoutAll = () => {
    Alert.alert(
      "Log Out All Devices",
      "This will revoke all active sessions across all your devices.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out All",
          style: "destructive",
          onPress: () => logoutAllMutation.mutate(),
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Deactivate Account",
      "Are you sure you want to delete and deactivate your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Deactivate",
          style: "destructive",
          onPress: () => deleteMeMutation.mutate(),
        },
      ]
    );
  };

  return (
    <Screen edges={["top", "bottom"]} scroll style={styles.screen}>
      <View style={styles.header}>
        <AppText variant="lg" weight="bold" color={colors.text}>
          Account & Settings
        </AppText>
      </View>

      <View style={styles.content}>
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <User size={30} color={colors.primary} />
          </View>
          <View style={styles.userInfo}>
            {isAuthenticated && user ? (
              <>
                <AppText variant="md" weight="bold" color={colors.text}>
                  {user.name || "Customer"}
                </AppText>
                <AppText variant="xs" color={colors.textMuted} style={styles.phone}>
                  +91 {user.phone}
                </AppText>
                {user.email ? (
                  <AppText variant="xs" color={colors.textLight}>
                    {user.email}
                  </AppText>
                ) : null}
              </>
            ) : (
              <>
                <AppText variant="md" weight="bold" color={colors.text}>
                  Welcome Guest!
                </AppText>
                <AppText variant="xs" color={colors.textMuted} style={styles.phone}>
                  Log in to manage orders & saved addresses
                </AppText>
              </>
            )}
          </View>

          {isAuthenticated ? (
            <TouchableOpacity
              onPress={() => navigation.navigate("EditProfile")}
              style={styles.editBtn}
            >
              <AppText variant="xs" weight="bold" color={colors.primary}>
                Edit
              </AppText>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => navigation.navigate("AuthStack")}
              style={styles.loginBtn}
            >
              <AppText variant="xs" weight="bold" color={colors.white}>
                Login
              </AppText>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.menuSection}>
          {isAuthenticated ? (
            <TouchableOpacity
              onPress={() => navigation.navigate("AddressList")}
              style={styles.menuRow}
            >
              <View style={styles.menuLeft}>
                <MapPin size={20} color={colors.text} />
                <AppText variant="sm" weight="medium" color={colors.text} style={styles.menuText}>
                  Saved Addresses
                </AppText>
              </View>
              <ChevronRight size={18} color={colors.textLight} />
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            onPress={() => setIsStoreSheetOpen(true)}
            style={styles.menuRow}
          >
            <View style={styles.menuLeft}>
              <Store size={20} color={colors.text} />
              <AppText variant="sm" weight="medium" color={colors.text} style={styles.menuText}>
                Active Dark Store Info
              </AppText>
            </View>
            <ChevronRight size={18} color={colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setIsSupportSheetOpen(true)}
            style={styles.menuRow}
          >
            <View style={styles.menuLeft}>
              <Headphones size={20} color={colors.text} />
              <AppText variant="sm" weight="medium" color={colors.text} style={styles.menuText}>
                Help & Support
              </AppText>
            </View>
            <ChevronRight size={18} color={colors.textLight} />
          </TouchableOpacity>
        </View>

        {isAuthenticated ? (
          <View style={styles.dangerSection}>
            <TouchableOpacity onPress={handleLogout} style={styles.menuRow}>
              <View style={styles.menuLeft}>
                <LogOut size={20} color={colors.text} />
                <AppText variant="sm" weight="medium" color={colors.text} style={styles.menuText}>
                  Log Out
                </AppText>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleLogoutAll} style={styles.menuRow}>
              <View style={styles.menuLeft}>
                <LogOut size={20} color={colors.warning} />
                <AppText variant="sm" weight="medium" color={colors.warning} style={styles.menuText}>
                  Log Out from All Devices
                </AppText>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleDeleteAccount} style={styles.menuRow}>
              <View style={styles.menuLeft}>
                <Trash2 size={20} color={colors.danger} />
                <AppText variant="sm" weight="medium" color={colors.danger} style={styles.menuText}>
                  Delete Account
                </AppText>
              </View>
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={styles.versionContainer}>
          <AppText variant="xs" color={colors.textLight}>
            InstantMart App v1.0.0
          </AppText>
          <AppText variant="xs" color={colors.textLight}>
            High-Performance 10-Minute Delivery
          </AppText>
        </View>
      </View>

      <ModalSheet
        visible={isStoreSheetOpen}
        onClose={() => setIsStoreSheetOpen(false)}
        title="Fulfilling Dark Store"
      >
        {activeStore ? (
          <View style={styles.sheetBody}>
            <AppText variant="md" weight="bold" color={colors.text}>
              {activeStore.name}
            </AppText>
            <AppText variant="sm" color={colors.textMuted} style={styles.sheetMargin}>
              {activeStore.address}
            </AppText>
            <Divider marginVertical={spacing.md} />
            <View style={styles.detailRow}>
              <AppText variant="xs" color={colors.textMuted}>
                Store Contact
              </AppText>
              <AppText variant="sm" weight="semibold" color={colors.text}>
                +91 {activeStore.phone}
              </AppText>
            </View>
            <View style={styles.detailRow}>
              <AppText variant="xs" color={colors.textMuted}>
                Operating Hours
              </AppText>
              <AppText variant="sm" weight="semibold" color={colors.text}>
                {activeStore.opensAt} - {activeStore.closesAt}
              </AppText>
            </View>
            <View style={styles.detailRow}>
              <AppText variant="xs" color={colors.textMuted}>
                Average Packing Time
              </AppText>
              <AppText variant="sm" weight="semibold" color={colors.primary}>
                ~{activeStore.avgPrepMinutes} minutes
              </AppText>
            </View>
          </View>
        ) : (
          <AppText variant="sm" color={colors.textMuted}>
            No active store assigned.
          </AppText>
        )}
      </ModalSheet>

      <ModalSheet
        visible={isSupportSheetOpen}
        onClose={() => setIsSupportSheetOpen(false)}
        title="Help & Support"
      >
        <View style={styles.sheetBody}>
          <AppText variant="sm" weight="bold" color={colors.text}>
            Need Help with an Order?
          </AppText>
          <AppText variant="xs" color={colors.textMuted} style={styles.sheetMargin}>
            Our team is available 24/7 to help with any missing, damaged, or
            delayed grocery items.
          </AppText>
          <View style={styles.supportBox}>
            <AppText variant="sm" weight="bold" color={colors.primaryDark}>
              support@instantmart.local
            </AppText>
            <AppText variant="xs" color={colors.textMuted} style={styles.sheetMargin}>
              Toll-free: 1800-000-MART (6:00 AM to 12:00 AM)
            </AppText>
          </View>
        </View>
      </ModalSheet>
    </Screen>
  );
};

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
  },
  content: {
    padding: spacing.md,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.subtle,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: radii.full,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  userInfo: {
    flex: 1,
  },
  phone: {
    marginTop: 2,
  },
  editBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radii.sm,
    backgroundColor: colors.primarySoft,
  },
  loginBtn: {
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radii.sm,
    backgroundColor: colors.primary,
  },
  menuSection: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    ...shadows.subtle,
  },
  dangerSection: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    ...shadows.subtle,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuText: {
    marginLeft: spacing.md,
  },
  versionContainer: {
    alignItems: "center",
    marginTop: spacing.xl,
    marginBottom: spacing.xxl,
  },
  sheetBody: {
    paddingBottom: spacing.xxl,
  },
  sheetMargin: {
    marginTop: 4,
    marginBottom: spacing.sm,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  supportBox: {
    backgroundColor: colors.primarySoft,
    padding: spacing.md,
    borderRadius: radii.md,
    marginTop: spacing.sm,
  },
});
