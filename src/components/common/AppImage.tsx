import React, { useState } from "react";
import {
  Image,
  ImageProps,
  ImageStyle,
  StyleProp,
  StyleSheet,
  View,
} from "react-native";
import { colors, radii } from "../../config/theme";
import { UtensilsCrossed } from "lucide-react-native";

export interface AppImageProps extends Omit<ImageProps, "source"> {
  uri?: string;
  width: number;
  height: number;
  borderRadius?: number;
  style?: StyleProp<ImageStyle>;
}

export const AppImage: React.FC<AppImageProps> = ({
  uri,
  width,
  height,
  borderRadius = radii.sm,
  style,
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const containerDimensions = {
    width,
    height,
    borderRadius,
  };

  const iconSize = Math.max(16, Math.min(width, height) * 0.38);

  if (!uri || hasError) {
    return (
      <View style={[styles.container, containerDimensions, styles.fallbackContainer, style]}>
        <View style={styles.iconCircle}>
          <UtensilsCrossed size={iconSize} color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, containerDimensions, style]}>
      {!isLoaded ? (
        <View style={[styles.fallbackContainer, StyleSheet.absoluteFill]}>
          <View style={styles.iconCircle}>
            <UtensilsCrossed size={iconSize} color={colors.textLight} />
          </View>
        </View>
      ) : null}

      <Image
        source={{ uri }}
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          setHasError(true);
        }}
        resizeMode="cover"
        style={[containerDimensions, StyleSheet.absoluteFill]}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    backgroundColor: colors.borderLight,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  fallbackContainer: {
    backgroundColor: colors.borderLight,
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircle: {
    backgroundColor: colors.primarySoft,
    padding: 8,
    borderRadius: radii.full,
    alignItems: "center",
    justifyContent: "center",
  },
});
