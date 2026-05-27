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

  const lifestyleKeys = ["lifestyle-ugali", "lifestyle-injera", "lifestyle-matooke", "lifestyle-coffee", "lifestyle-spices"] as const;
  const availableLifestyle = lifestyleKeys.filter((k) => LIFESTYLE_IMAGES[k]);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomPad }}
      >
        <View style={[styles.header, { paddingTop: topPad + 10 }]}>
          <View>
            <View style={[styles.locationPill, { backgroundColor: colors.secondary }]}>
              <Ionicons name="location" size={12} color={colors.primary} />
              <Text style={[styles.locationText, { color: colors.foreground }]}>Dubai, UAE</Text>
              <Ionicons name="chevron-down" size={12} color={colors.mutedForeground} />
            </View>
            <Text style={[styles.greeting, { color: colors.foreground }]}>{timeGreeting}</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable style={[styles.iconBtn, { backgroundColor: colors.secondary }]}>
              <Ionicons name="notifications-outline" size={20} color={colors.foreground} />
            </Pressable>
            <Pressable style={[styles.iconBtn, { backgroundColor: colors.secondary }]}>
              <Ionicons name="bag-outline" size={20} color={colors.foreground} />
              {totalItems > 0 && (
                <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                  <Text style={[styles.badgeText, { color: colors.primaryForeground }]}>{totalItems}</Text>
                </View>
              )}
            </Pressable>
          </View>
        </View>

        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.heroBanner}>
          <Image source={heroImage} style={styles.heroImage} contentFit="cover" />
          <LinearGradient
            colors={["rgba(250,247,242,0)", "rgba(250,247,242,0.15)", "rgba(250,247,242,0.96)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.heroGradient}
          />
          <View style={styles.heroContent}>
            <Text style={[styles.heroNative, { color: colors.primary }]}>
              {countryConfig.nativeGreeting}
            </Text>
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
              <Pressable style={[styles.heroBtnSecondary, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                <Text style={[styles.heroBtnSecondaryText, { color: colors.foreground }]}>Explore</Text>
                <Ionicons name="arrow-forward" size={14} color={colors.foreground} />
              </Pressable>
            </View>
          </View>
        </Animated.View>

        <View style={styles.searchRow}>
          <Pressable style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="search" size={16} color={colors.mutedForeground} />
            <Text style={[styles.searchPlaceholder, { color: colors.mutedForeground }]}>
              Search for products, meals, brands...
            </Text>
            <View style={[styles.searchFilter, { backgroundColor: colors.primary }]}>
              <Ionicons name="options" size={14} color="#FFFFFF" />
            </View>
          </Pressable>
        </View>

        <View style={styles.categoriesSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
            {countryConfig.categories.map((cat) => (
              <Pressable
                key={cat.name}
                style={[styles.categoryChip, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <Ionicons
                  name={CATEGORY_ICONS[cat.icon] ?? "grid-outline"}
                  size={15}
                  color={colors.primary}
                />
                <Text style={[styles.categoryText, { color: colors.foreground }]}>{cat.name}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <SectionHeader
            title="My Baskets"
            subtitle={`Curated for ${countryConfig.name}`}
            onSeeAll={() => {}}
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
            {countryConfig.baskets.map((basket) => (
              <BasketCard key={basket.id} basket={basket} />
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Cravings Right Now" subtitle="What people in Dubai are buying" onSeeAll={() => {}} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
            {countryConfig.products.slice(0, 6).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </ScrollView>
        </View>

        {availableLifestyle.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="Meal Inspiration" subtitle="Recipes you'll want to cook tonight" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
              {availableLifestyle.map((key) => (
                <Pressable key={key} style={styles.inspirationCard}>
                  <Image source={LIFESTYLE_IMAGES[key]} style={styles.inspirationImage} contentFit="cover" />
                  <LinearGradient
                    colors={["transparent", "rgba(28,21,16,0.75)"]}
                    style={styles.inspirationGradient}
                  />
                  <Text style={styles.inspirationLabel}>{formatLifestyleKey(key)}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={[styles.section, { marginBottom: 0 }]}>
          <SectionHeader
            title={`Made for ${countryConfig.name}`}
            subtitle="Authentic products, sourced for you"
            onSeeAll={() => {}}
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
            {countryConfig.products.slice(4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </ScrollView>
        </View>

        <View style={[styles.trustBar, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
          {[
            { icon: "shield-checkmark-outline", label: "Quality" },
            { icon: "flash-outline", label: "Fast Delivery" },
            { icon: "people-outline", label: "Trusted by Thousands" },
          ].map((item) => (
            <View key={item.label} style={styles.trustItem}>
              <Ionicons name={item.icon as any} size={16} color={colors.primary} />
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
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  locationPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginBottom: 6,
  },
  locationText: {
    fontSize: 12,
    fontWeight: "600",
  },
  greeting: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: 6,
    right: 6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: { fontSize: 10, fontWeight: "700" },
  heroBanner: {
    marginHorizontal: 20,
    height: 280,
    borderRadius: 22,
    overflow: "hidden",
    marginBottom: 20,
    shadowColor: "#1C1510",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  heroImage: { ...StyleSheet.absoluteFillObject },
  heroGradient: { ...StyleSheet.absoluteFillObject },
  heroContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  heroNative: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.6,
    lineHeight: 30,
    marginBottom: 4,
  },
  heroTagline: {
    fontSize: 14,
    marginBottom: 16,
  },
  heroButtons: {
    flexDirection: "row",
    gap: 10,
  },
  heroBtnPrimary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 24,
  },
  heroBtnPrimaryText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  heroBtnSecondary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 24,
    borderWidth: 1,
  },
  heroBtnSecondaryText: {
    fontSize: 13,
    fontWeight: "700",
  },
  searchRow: {
    paddingHorizontal: 20,
    marginBottom: 18,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 14,
    paddingLeft: 14,
    paddingRight: 6,
    paddingVertical: 10,
    borderWidth: 1,
    shadowColor: "#1C1510",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 14,
  },
  searchFilter: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  categoriesSection: { marginBottom: 22 },
  categoriesScroll: { paddingHorizontal: 20, gap: 8 },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 24,
    borderWidth: 1,
    shadowColor: "#1C1510",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: "600",
  },
  section: { marginBottom: 28 },
  horizontalScroll: { paddingHorizontal: 20, paddingBottom: 4 },
  inspirationCard: {
    width: 160,
    height: 140,
    borderRadius: 16,
    overflow: "hidden",
    marginRight: 12,
  },
  inspirationImage: { ...StyleSheet.absoluteFillObject },
  inspirationGradient: { ...StyleSheet.absoluteFillObject },
  inspirationLabel: {
    position: "absolute",
    bottom: 10,
    left: 12,
    right: 12,
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  trustBar: {
    marginHorizontal: 20,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-around",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
  },
  trustItem: {
    alignItems: "center",
    gap: 4,
  },
  trustText: {
    fontSize: 10,
    fontWeight: "600",
  },
});
