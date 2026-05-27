import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BasketCard } from "@/components/BasketCard";
import { ProductCard } from "@/components/ProductCard";
import { SectionHeader } from "@/components/SectionHeader";
import { useColors } from "@/hooks/useColors";
import { useHomeCountry } from "@/context/HomeCountryContext";
import { useCart } from "@/context/CartContext";

const HERO_IMAGES: Record<string, ReturnType<typeof require>> = {
  "hero-uganda": require("@/assets/images/hero-uganda.png"),
  "hero-kenya": require("@/assets/images/hero-kenya.png"),
  "hero-ethiopia": require("@/assets/images/hero-ethiopia.png"),
  "hero-pan-african": require("@/assets/images/hero-pan-african.png"),
};

const LIFESTYLE_IMAGES: Record<string, ReturnType<typeof require>> = {
  "lifestyle-ugali": require("@/assets/images/lifestyle-ugali.png"),
  "lifestyle-injera": require("@/assets/images/lifestyle-injera.png"),
  "lifestyle-matooke": require("@/assets/images/lifestyle-matooke.png"),
  "lifestyle-coffee": require("@/assets/images/lifestyle-coffee.png"),
  "lifestyle-spices": require("@/assets/images/lifestyle-spices.png"),
};

const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  leaf: "leaf-outline",
  nutrition: "nutrition-outline",
  flask: "flask-outline",
  "color-palette": "color-palette-outline",
  cafe: "cafe-outline",
  pricetag: "pricetag-outline",
  globe: "globe-outline",
  "fast-food": "fast-food-outline",
};

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { countryConfig } = useHomeCountry();
  const { totalItems } = useCart();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom + 60;

  if (!countryConfig) return null;

  const heroImage = HERO_IMAGES[countryConfig.heroImageKey];
  const hour = new Date().getHours();
  const timeGreeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const lifestyleKeys = (["lifestyle-ugali", "lifestyle-injera", "lifestyle-matooke", "lifestyle-coffee", "lifestyle-spices"] as const).filter(
    (k) => LIFESTYLE_IMAGES[k]
  );

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomPad }}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: topPad + 12 }]}>
          <View style={styles.headerLeft}>
            <Pressable style={[styles.locationPill, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
              <Ionicons name="location" size={12} color={colors.primary} />
              <Text style={[styles.locationText, { color: colors.foreground }]}>Dubai, UAE</Text>
              <Ionicons name="chevron-down" size={11} color={colors.mutedForeground} />
            </Pressable>
            <Text style={[styles.greeting, { color: colors.foreground }]}>{timeGreeting}</Text>
          </View>
          <View style={styles.headerRight}>
            <Pressable style={[styles.iconBtn, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
              <Ionicons name="notifications-outline" size={20} color={colors.foreground} />
            </Pressable>
            <Pressable style={[styles.iconBtn, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
              <Ionicons name="bag-outline" size={20} color={colors.foreground} />
              {totalItems > 0 && (
                <View style={[styles.badge, { backgroundColor: colors.accent }]}>
                  <Text style={[styles.badgeText, { color: colors.accentForeground }]}>{totalItems}</Text>
                </View>
              )}
            </Pressable>
          </View>
        </View>

        {/* Hero Banner */}
        <Animated.View entering={FadeInDown.delay(80).duration(500)} style={styles.heroBanner}>
          <Image source={heroImage} style={styles.heroImage} contentFit="cover" />
          <LinearGradient
            colors={["rgba(247,248,242,0)", "rgba(247,248,242,0.08)", "rgba(247,248,242,0.97)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.heroContent}>
            <View style={[styles.heroBadge, { backgroundColor: colors.secondary }]}>
              <View style={[styles.heroBadgeDot, { backgroundColor: colors.primary }]} />
              <Text style={[styles.heroBadgeText, { color: colors.primary }]}>
                {countryConfig.nativeGreeting}
              </Text>
            </View>
            <Text style={[styles.heroTitle, { color: colors.foreground }]}>
              Your home basket{"\n"}is ready.
            </Text>
            <Text style={[styles.heroTagline, { color: colors.mutedForeground }]}>
              Food that feels like home.
            </Text>
            <View style={styles.heroButtons}>
              <Pressable style={[styles.heroBtnPrimary, { backgroundColor: colors.primary }]}>
                <Ionicons name="refresh" size={14} color="#FFFFFF" />
                <Text style={styles.heroBtnPrimaryText}>Buy Again</Text>
              </Pressable>
              <Pressable style={[styles.heroBtnSecondary, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.heroBtnSecondaryText, { color: colors.foreground }]}>Explore</Text>
                <Ionicons name="arrow-forward" size={13} color={colors.foreground} />
              </Pressable>
            </View>
          </View>
        </Animated.View>

        {/* Search */}
        <View style={styles.searchRow}>
          <Pressable style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="search-outline" size={16} color={colors.mutedForeground} />
            <Text style={[styles.searchPlaceholder, { color: colors.mutedForeground }]}>
              Search products, meals, brands...
            </Text>
            <View style={[styles.searchFilterBtn, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
              <Ionicons name="options-outline" size={14} color={colors.primary} />
            </View>
          </Pressable>
        </View>

        {/* Categories */}
        <View style={styles.categoriesSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            {countryConfig.categories.map((cat, i) => (
              <Pressable
                key={cat.name}
                style={[
                  styles.categoryChip,
                  i === 0
                    ? { backgroundColor: colors.primary, borderColor: colors.primary }
                    : { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <Ionicons
                  name={CATEGORY_ICONS[cat.icon] ?? "grid-outline"}
                  size={14}
                  color={i === 0 ? "#FFFFFF" : colors.primary}
                />
                <Text
                  style={[
                    styles.categoryText,
                    { color: i === 0 ? "#FFFFFF" : colors.foreground },
                  ]}
                >
                  {cat.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* My Baskets */}
        <View style={styles.section}>
          <SectionHeader
            title="My Baskets"
            subtitle={`Curated for ${countryConfig.name}`}
            onSeeAll={() => {}}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {countryConfig.baskets.map((basket) => (
              <BasketCard key={basket.id} basket={basket} />
            ))}
          </ScrollView>
        </View>

        {/* Cravings Right Now */}
        <View style={styles.section}>
          <SectionHeader
            title="Cravings Right Now"
            subtitle="Popular in your community today"
            onSeeAll={() => {}}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {countryConfig.products.slice(0, 6).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </ScrollView>
        </View>

        {/* Meal Inspiration */}
        {lifestyleKeys.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="Meal Inspiration" subtitle="Dishes to cook this week" />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {lifestyleKeys.map((key) => (
                <Pressable key={key} style={styles.inspirationCard}>
                  <Image source={LIFESTYLE_IMAGES[key]} style={styles.inspirationImage} contentFit="cover" />
                  <LinearGradient
                    colors={["transparent", "rgba(20,24,16,0.65)"]}
                    style={StyleSheet.absoluteFill}
                  />
                  <View style={styles.inspirationTextWrap}>
                    <Text style={styles.inspirationLabel}>{formatLifestyleKey(key)}</Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* More Products */}
        <View style={styles.section}>
          <SectionHeader
            title={`Made for ${countryConfig.name}`}
            subtitle="Authentic, sourced just for you"
            onSeeAll={() => {}}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {countryConfig.products.slice(4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </ScrollView>
        </View>

        {/* Trust Bar */}
        <View style={[styles.trustBar, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
          {(
            [
              { icon: "shield-checkmark-outline", label: "Quality" },
              { icon: "flash-outline", label: "Fast Delivery" },
              { icon: "people-outline", label: "Trusted by Thousands" },
            ] as const
          ).map((item) => (
            <View key={item.label} style={styles.trustItem}>
              <Ionicons name={item.icon} size={18} color={colors.primary} />
              <Text style={[styles.trustText, { color: colors.mutedForeground }]}>{item.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function formatLifestyleKey(key: string): string {
  return key
    .replace("lifestyle-", "")
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 22,
    paddingBottom: 16,
  },
  headerLeft: { gap: 6 },
  locationPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  locationText: { fontSize: 12, fontWeight: "600" },
  greeting: { fontSize: 24, fontWeight: "800", letterSpacing: -0.6 },
  headerRight: { flexDirection: "row", gap: 10, marginTop: 4 },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  badge: {
    position: "absolute",
    top: 7,
    right: 7,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: { fontSize: 10, fontWeight: "700" },
  heroBanner: {
    marginHorizontal: 22,
    height: 286,
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 22,
    shadowColor: "#1E2414",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  heroImage: { ...StyleSheet.absoluteFillObject },
  heroContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 22,
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  heroBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.7,
    lineHeight: 32,
    marginBottom: 5,
  },
  heroTagline: {
    fontSize: 14,
    marginBottom: 18,
    fontWeight: "500",
  },
  heroButtons: { flexDirection: "row", gap: 10 },
  heroBtnPrimary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: "#1E2414",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  heroBtnPrimaryText: { fontSize: 13, fontWeight: "700", color: "#FFFFFF" },
  heroBtnSecondary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
  },
  heroBtnSecondaryText: { fontSize: 13, fontWeight: "700" },
  searchRow: {
    paddingHorizontal: 22,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 16,
    paddingLeft: 16,
    paddingRight: 8,
    paddingVertical: 12,
    borderWidth: 1,
    shadowColor: "#1E2414",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  searchPlaceholder: { flex: 1, fontSize: 14 },
  searchFilterBtn: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  categoriesSection: { marginBottom: 26 },
  categoriesScroll: { paddingHorizontal: 22, gap: 8 },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 24,
    borderWidth: 1,
  },
  categoryText: { fontSize: 13, fontWeight: "600" },
  section: { marginBottom: 32 },
  horizontalScroll: { paddingHorizontal: 22, paddingBottom: 4 },
  inspirationCard: {
    width: 164,
    height: 148,
    borderRadius: 18,
    overflow: "hidden",
    marginRight: 12,
    shadowColor: "#1E2414",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  inspirationImage: { ...StyleSheet.absoluteFillObject },
  inspirationTextWrap: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  inspirationLabel: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  trustBar: {
    marginHorizontal: 22,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-around",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
  },
  trustItem: { alignItems: "center", gap: 6 },
  trustText: { fontSize: 11, fontWeight: "600" },
});
