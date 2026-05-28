import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

import { BasketCard } from "@/components/BasketCard";
import { ProductCard } from "@/components/ProductCard";
import { SectionHeader } from "@/components/SectionHeader";
import { LocationBottomSheet } from "@/components/LocationBottomSheet";
import { useColors } from "@/hooks/useColors";
import { useHomeCountry } from "@/context/HomeCountryContext";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { useLocation } from "@/context/LocationContext";
import { ONBOARDING_OPTIONS, type HomeCountry } from "@/constants/personalization";
import { LANGUAGE_META, COUNTRY_SUGGESTED_LANGUAGE, type SupportedLanguage } from "@/lib/i18n";
import {
  HERO_COPY,
  HOME_SECTIONS,
  TRUST_ITEMS,
  MEAL_INSPIRATION_LABELS,
} from "@/constants/appContent";

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
  const { homeCountry, setHomeCountry, experience, shopifyProducts, productsLoading } = useHomeCountry();
  const { totalItems } = useCart();
  const { t, language, setLanguage } = useLanguage();
  const { deliveryLabel, selectedEmirate } = useLocation();
  const [locationSheetVisible, setLocationSheetVisible] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom + 60;

  if (!experience) return null;

  const heroImage = HERO_IMAGES[experience.heroImageKey];
  const hour = new Date().getHours();
  const timeGreeting =
    hour < 12 ? t("goodMorning") : hour < 17 ? t("goodAfternoon") : t("goodEvening");

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
            <View style={styles.pillRow}>
              <Pressable
                style={[styles.locationPill, { backgroundColor: colors.secondary, borderColor: colors.border }]}
                onPress={() => setLocationSheetVisible(true)}
              >
                <Ionicons name="location" size={12} color={colors.primary} />
                <Text style={[styles.locationText, { color: colors.foreground }]}>
                  {selectedEmirate ? selectedEmirate.name : t("chooseLocation")}
                </Text>
                <Ionicons name="chevron-down" size={11} color={colors.mutedForeground} />
              </Pressable>
              <Pressable
                style={[styles.countryPill, { backgroundColor: colors.secondary, borderColor: colors.border }]}
                onPress={() => setShowCountryPicker(true)}
              >
                <View style={styles.countryFlagBar}>
                  {experience.flagColors.map((c, i) => (
                    <View key={i} style={[styles.countryFlagStripe, { backgroundColor: c }]} />
                  ))}
                </View>
                <Text style={[styles.locationText, { color: colors.foreground }]}>{experience.name}</Text>
                <Ionicons name="chevron-down" size={11} color={colors.mutedForeground} />
              </Pressable>
            </View>
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
                {experience.nativeGreeting}
              </Text>
            </View>
            <Text style={[styles.heroTitle, { color: colors.foreground }]}>
              {HERO_COPY[homeCountry ?? "all"]?.title ?? HERO_COPY.all.title}
            </Text>
            <Text style={[styles.heroTagline, { color: colors.mutedForeground }]}>
              {HERO_COPY[homeCountry ?? "all"]?.tagline ?? HERO_COPY.all.tagline}
            </Text>
            <View style={styles.heroButtons}>
              <Pressable
                style={[styles.heroBtnPrimary, { backgroundColor: colors.primary }]}
                onPress={() => router.push("/(tabs)/orders")}
              >
                <Ionicons name="refresh" size={14} color="#FFFFFF" />
                <Text style={styles.heroBtnPrimaryText}>
                  {HERO_COPY[homeCountry ?? "all"]?.buyAgainLabel ?? "Buy Again"}
                </Text>
              </Pressable>
              <Pressable
                style={[styles.heroBtnSecondary, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => router.push("/(tabs)/search")}
              >
                <Text style={[styles.heroBtnSecondaryText, { color: colors.foreground }]}>
                  {HERO_COPY[homeCountry ?? "all"]?.exploreLabel ?? "Explore"}
                </Text>
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
            {experience.categories.map((cat, i) => (
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
            title={HOME_SECTIONS.baskets.title}
            subtitle={HOME_SECTIONS.baskets.subtitle(experience.name)}
            onSeeAll={() => router.push("/(tabs)/search")}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {experience.baskets.map((basket) => (
              <BasketCard key={basket.id} basket={basket} />
            ))}
          </ScrollView>
        </View>

        {/* Cravings Right Now */}
        <View style={styles.section}>
          <SectionHeader
            title={HOME_SECTIONS.cravings.title}
            subtitle={HOME_SECTIONS.cravings.subtitle}
            onSeeAll={() => router.push("/(tabs)/search")}
          />
          {productsLoading ? (
            <View style={styles.productsLoader}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {shopifyProducts.slice(0, 6).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </ScrollView>
          )}
        </View>

        {/* Meal Inspiration */}
        {lifestyleKeys.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title={HOME_SECTIONS.mealInspiration.title} subtitle={HOME_SECTIONS.mealInspiration.subtitle} />
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
                    <Text style={styles.inspirationLabel}>
                    {MEAL_INSPIRATION_LABELS[key] ?? formatLifestyleKey(key)}
                  </Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* More Products */}
        <View style={styles.section}>
          <SectionHeader
            title={HOME_SECTIONS.madeFor.title(experience.name)}
            subtitle={HOME_SECTIONS.madeFor.subtitle}
            onSeeAll={() => router.push("/(tabs)/search")}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {shopifyProducts.slice(4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </ScrollView>
        </View>

        {/* Trust Bar */}
        <View style={[styles.trustBar, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
          {TRUST_ITEMS.map((item) => (
            <View key={item.label} style={styles.trustItem}>
              <Ionicons name={item.iconName as any} size={18} color={colors.primary} />
              <Text style={[styles.trustText, { color: colors.mutedForeground }]}>{item.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <LocationBottomSheet
        visible={locationSheetVisible}
        onClose={() => setLocationSheetVisible(false)}
      />

      {/* Combined Country + Language Picker */}
      <Modal visible={showCountryPicker} animationType="slide" transparent>
        <Pressable style={styles.modalOverlay} onPress={() => setShowCountryPicker(false)} />
        <Animated.View
          entering={FadeInDown.duration(300)}
          style={[styles.modalSheet, { backgroundColor: colors.card }]}
        >
          <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
            <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Your Experience</Text>

            {/* Country section */}
            <Text style={[styles.modalSectionLabel, { color: colors.mutedForeground }]}>YOUR HOME COUNTRY</Text>
            {ONBOARDING_OPTIONS.map((option) => {
              const isSelected = homeCountry === option.id;
              return (
                <Pressable
                  key={option.id}
                  style={[
                    styles.modalOption,
                    {
                      backgroundColor: isSelected ? colors.secondary : "transparent",
                      borderColor: isSelected ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={async () => {
                    await setHomeCountry(option.id as HomeCountry);
                    const suggested = COUNTRY_SUGGESTED_LANGUAGE[option.id];
                    if (suggested) await setLanguage(suggested as SupportedLanguage);
                    setShowCountryPicker(false);
                  }}
                >
                  <View style={styles.optionFlagBar}>
                    {option.flagColors.map((c, i) => (
                      <View key={i} style={[styles.optionFlagStripe, { backgroundColor: c }]} />
                    ))}
                  </View>
                  <View style={styles.optionContent}>
                    <Text style={[styles.optionName, { color: isSelected ? colors.primary : colors.foreground }]}>
                      {option.name}
                    </Text>
                    <Text style={[styles.optionSub, { color: colors.mutedForeground }]} numberOfLines={1}>
                      {option.subtitle}
                    </Text>
                  </View>
                  {isSelected && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
                </Pressable>
              );
            })}

            {/* Language section */}
            <View style={[styles.modalDivider, { backgroundColor: colors.border }]} />
            <Text style={[styles.modalSectionLabel, { color: colors.mutedForeground }]}>LANGUAGE</Text>
            {(Object.keys(LANGUAGE_META) as SupportedLanguage[]).map((lang) => {
              const meta = LANGUAGE_META[lang];
              const isSelected = language === lang;
              return (
                <Pressable
                  key={lang}
                  style={[
                    styles.modalOption,
                    {
                      backgroundColor: isSelected ? colors.secondary : "transparent",
                      borderColor: isSelected ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={async () => {
                    await setLanguage(lang);
                    setShowCountryPicker(false);
                  }}
                >
                  <View style={styles.optionContent}>
                    <Text style={[styles.optionName, { color: isSelected ? colors.primary : colors.foreground }]}>
                      {meta.nativeLabel}
                    </Text>
                    <Text style={[styles.optionSub, { color: colors.mutedForeground }]}>
                      {meta.label}{meta.rtl ? " — RTL" : ""}
                    </Text>
                  </View>
                  {isSelected && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
                </Pressable>
              );
            })}
          </ScrollView>
        </Animated.View>
      </Modal>
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
  pillRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  countryPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  countryFlagBar: { width: 12, height: 12, borderRadius: 2, overflow: "hidden", flexDirection: "row" },
  countryFlagStripe: { flex: 1 },
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
  productsLoader: {
    height: 160,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 22,
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
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)" },
  modalSectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 10,
    marginTop: 4,
  },
  modalDivider: { height: 1, marginVertical: 18 },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingTop: 12,
    gap: 10,
  },
  modalHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 12 },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 8, letterSpacing: -0.3 },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1.5,
    paddingVertical: 12,
    paddingRight: 16,
    gap: 12,
    overflow: "hidden",
  },
  optionFlagBar: { width: 5, height: 52, flexDirection: "column" },
  optionFlagStripe: { flex: 1 },
  optionContent: { flex: 1, paddingLeft: 10 },
  optionName: { fontSize: 15, fontWeight: "700" },
  optionSub: { fontSize: 12, marginTop: 2 },
});
