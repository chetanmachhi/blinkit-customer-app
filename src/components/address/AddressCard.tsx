import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { AddressLabel, IAddress } from "../../api/types";
import { colors, radii, shadows, spacing } from "../../config/theme";
import { AppText } from "../common/AppText";
import { Badge } from "../common/Badge";
import { Briefcase, Check, Home, MapPin, Pencil, Trash2 } from "lucide-react-native";

export interface AddressCardProps {
  address: IAddress;
  isSelected?: boolean;
  onSelect?: (address: IAddress) => void;
  onEdit?: (address: IAddress) => void;
  onDelete?: (addressId: string) => void;
  onSetDefault?: (addressId: string) => void;
}

export const AddressCard: React.FC<AddressCardProps> = ({
  address,
  isSelected = false,
  onSelect,
  onEdit,
  onDelete,
  onSetDefault,
}) => {
  const getIcon = () => {
    switch (address.label) {
      case AddressLabel.HOME:
        return <Home size={18} color={colors.primary} />;
      case AddressLabel.WORK:
        return <Briefcase size={18} color={colors.primary} />;
      case AddressLabel.OTHER:
      default:
        return <MapPin size={18} color={colors.primary} />;
    }
  };

  return (
    <TouchableOpacity
      onPress={() => onSelect?.(address)}
      activeOpacity={0.88}
      style={[
        styles.card,
        isSelected && styles.selectedCard,
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.labelSection}>
          <View style={styles.iconBox}>{getIcon()}</View>
          <View style={styles.titleGroup}>
            <View style={styles.badgeRow}>
              <AppText variant="sm" weight="bold" color={colors.text}>
                {address.label.toUpperCase()}
              </AppText>
              {address.isDefault ? (
                <Badge label="DEFAULT" variant="success" style={styles.badge} />
              ) : null}
              {isSelected ? (
                <View style={styles.selectedPill}>
                  <Check size={12} color={colors.primary} strokeWidth={2.5} />
                  <AppText variant="xs" weight="bold" color={colors.primary} style={styles.selectedPillText}>
                    Selected
                  </AppText>
                </View>
              ) : null}
            </View>
          </View>
        </View>

        <View style={styles.actionsGroup}>
          {onEdit ? (
            <TouchableOpacity
              onPress={() => onEdit(address)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.editBtn}
            >
              <Pencil size={13} color={colors.primary} />
              <AppText variant="xs" weight="semibold" color={colors.primary} style={styles.actionText}>
                Edit
              </AppText>
            </TouchableOpacity>
          ) : null}

          {onDelete ? (
            <TouchableOpacity
              onPress={() => onDelete(address._id)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.deleteBtn}
            >
              <Trash2 size={14} color={colors.danger} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <View style={styles.contentSection}>
        <AppText variant="sm" weight="semibold" color={colors.text} style={styles.receiver}>
          {address.receiverName} • {address.receiverPhone}
        </AppText>

        <AppText variant="sm" color={colors.textMuted} numberOfLines={2} style={styles.addressLine}>
          {address.addressLine}
          {address.landmark ? `, Near ${address.landmark}` : ""}
        </AppText>

        <AppText variant="xs" color={colors.textLight}>
          {address.city} - {address.pincode}
        </AppText>
      </View>

      {!address.isDefault && onSetDefault ? (
        <TouchableOpacity
          onPress={() => onSetDefault(address._id)}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          style={styles.setDefaultBtn}
        >
          <AppText variant="xs" weight="semibold" color={colors.primary}>
            Set as default address
          </AppText>
        </TouchableOpacity>
      ) : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.subtle,
  },
  selectedCard: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  labelSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  titleGroup: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  badge: {
    marginLeft: 0,
  },
  selectedPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.full,
    gap: 3,
  },
  selectedPillText: {
    letterSpacing: 0.2,
  },
  actionsGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginLeft: spacing.sm,
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.sm,
    gap: 4,
  },
  actionText: {
    marginLeft: 1,
  },
  deleteBtn: {
    width: 28,
    height: 28,
    borderRadius: radii.sm,
    backgroundColor: colors.dangerSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  contentSection: {
    marginTop: spacing.sm,
    paddingLeft: 42,
  },
  receiver: {
    marginBottom: 2,
  },
  addressLine: {
    lineHeight: 19,
    marginBottom: 2,
  },
  setDefaultBtn: {
    marginTop: spacing.sm,
    paddingLeft: 42,
    alignSelf: "flex-start",
  },
});
