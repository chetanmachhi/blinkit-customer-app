import React, { useState } from "react";
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { colors, radii, shadows, spacing } from "../../config/theme";
import { AppText } from "../common/AppText";
import { Sparkles, Zap } from "lucide-react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const BANNER_WIDTH = SCREEN_WIDTH - spacing.lg * 2;

const BANNERS = [
  {
    id: "1",
    title: "10-Minute Grocery Delivery",
    subtitle: "Fresh dairy, produce & snacks delivered to your door",
    tag: "SUPERFAST",
    bgColor: colors.primaryDark,
    accentColor: colors.headerYellow,
  },
  {
    id: "2",
    title: "Flat ₹50 Off First Order",
    subtitle: "Use code WELCOME50 on orders above ₹199",
    tag: "WELCOME OFFER",
    bgColor: "#4C1D95",
    accentColor: colors.headerYellowLight,
  },
  {
    id: "3",
    title: "Fresh Morning Bakery & Milk",
    subtitle: "Stocked fresh daily before 7:00 AM",
    tag: "DAILY ESSENTIALS",
    bgColor: "#1E3A8A",
    accentColor: "#93C5FD",
  },
];

export interface BannerCarouselProps {
  onBannerPress?: (bannerId: string) => void;
}

export const BannerCarousel: React.FC<BannerCarouselProps> = ({
  onBannerPress,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slide = Math.round(
      event.nativeEvent.contentOffset.x / BANNER_WIDTH
    );
    if (slide !== activeIndex) {
      setActiveIndex(slide);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        snapToInterval={BANNER_WIDTH + spacing.md}
        decelerationRate="fast"
        contentContainerStyle={styles.scrollContent}
      >
        {BANNERS.map((banner) => (
          <TouchableOpacity
            key={banner.id}
            onPress={() => onBannerPress?.(banner.id)}
            activeOpacity={0.9}
            style={[styles.bannerCard, { backgroundColor: banner.bgColor }]}
          >
            <View style={styles.bannerTagRow}>
              <Zap size={14} color={banner.accentColor} />
              <AppText
                variant="xs"
                weight="bold"
                color={banner.accentColor}
                style={styles.tagText}
              >
                {banner.tag}
              </AppText>
            </View>

            <AppText
              variant="md"
              weight="bold"
              color={colors.white}
              style={styles.bannerTitle}
            >
              {banner.title}
            </AppText>

            <AppText variant="xs" color={colors.primarySoft}>
              {banner.subtitle}
            </AppText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.pagination}>
        {BANNERS.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === activeIndex ? styles.activeDot : styles.inactiveDot,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },
  bannerCard: {
    width: BANNER_WIDTH,
    borderRadius: radii.md,
    padding: spacing.lg,
    marginRight: spacing.md,
    minHeight: 110,
    justifyContent: "center",
    ...shadows.card,
  },
  bannerTagRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  tagText: {
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  bannerTitle: {
    marginBottom: 4,
  },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.sm,
  },
  dot: {
    height: 4,
    borderRadius: radii.full,
    marginHorizontal: 3,
  },
  activeDot: {
    width: 16,
    backgroundColor: colors.primary,
  },
  inactiveDot: {
    width: 6,
    backgroundColor: colors.border,
  },
});
