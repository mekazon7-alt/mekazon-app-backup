import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import React, { useRef } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
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

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { countryConfig } = useHomeCountry();
  const { totalItems } = useCart();
  const scrollRef = useRef<ScrollView>(null);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom + 60;

  if (!countryConfig) return null;

  const heroImage = HERO_IMAGES[countryConfig.heroImageKey];

  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <ScrollView
      ref={scrollRef}
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: bottomPad }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <View>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>{timeGreeting}</Text>
          <Text style={[styles.tagline, { color: colors.foreground }]}>{countryConfig.tagline}</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable style={[styles.iconBtn, { backgroundColor: colors.secondary }]}>
            <Ionicons name="notifications-outline" size={22} color={colors.foreground} />
          </Pressable>
          <Pressable style={[styles.iconBtn, { backgroundColor: colors.secondary }]}>
            <Ionicons name="bag-outline" size={22} color={colors.foreground} />
            {totalItems > 0 && (
              <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                <Text style={[styles.badgeText, { color: colors.primaryForeground }]}>{totalItems}</Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>

      <View style={styles.heroBanner}>
        <Image
          source={heroImage}
          style={styles.heroImage}
          contentFit="cover"
        />
        <LinearGradient
          colors={["transparent", "rgba(10,10,10,0.88)"]}
          style={styles.heroGradient}
        >
          <View style={styles.heroContent}>
            <Text style={styles.heroNative}>{countryConfig.nativeGreeting}</Text>
            <Text style={styles.heroTitle}>{countryConfig.heroTitle}</Text>
            <Text style={styles.heroSubtitle}>{countryConfig.heroSubtitle}</Text>
          </View>
        </LinearGradient>
      </View>

      <View style={styles.categoriesSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
          {countryConfig.categories.map((cat) => (
            <Pressable key={cat} style={[styles.categoryChip, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
              <Text style={[styles.categoryText, { color: colors.foreground }]}>{cat}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <SectionHeader
          title="Your Baskets"
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
        <SectionHeader
          title={`Made for ${countryConfig.name}`}
          subtitle="Authentic products, sourced for you"
          onSeeAll={() => {}}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
          {countryConfig.products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </ScrollView>
      </View>

      <View style={[styles.nudgeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Ionicons name="time-outline" size={20} color={colors.primary} />
        <Text style={[styles.nudgeText, { color: colors.mutedForeground }]}>
          {countryConfig.notificationHint}
        </Text>
        <Pressable>
          <Ionicons name="chevron-forward" size={18} color={colors.primary} />
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 13,
    fontWeight: "500",
  },
  tagline: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.4,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: "row",
    gap: 10,
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
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
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  heroBanner: {
    marginHorizontal: 20,
    height: 200,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 20,
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
  },
  heroContent: {
    padding: 18,
  },
  heroNative: {
    fontSize: 11,
    fontWeight: "600",
    color: "#F5C400",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
    lineHeight: 18,
  },
  categoriesSection: {
    marginBottom: 24,
  },
  categoriesScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 24,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: "600",
  },
  section: {
    marginBottom: 28,
  },
  horizontalScroll: {
    paddingHorizontal: 20,
    paddingBottom: 4,
  },
  nudgeCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
  },
  nudgeText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});
