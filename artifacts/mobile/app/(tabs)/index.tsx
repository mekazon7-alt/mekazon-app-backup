import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, {
  useState,
  useCallback,
  useRef,
  useMemo,
  useEffect,
} from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ScrollView as ScrollViewType,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BasketCard } from "@/components/BasketCard";
import { ProductCard } from "@/components/ProductCard";
import { SectionHeader } from "@/components/SectionHeader";
import { LocationBottomSheet } from "@/components/LocationBottomSheet";
import { useColors } from "@/hooks/useColors";
import { useHomeCountry } from "@/context/HomeCountryContext";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { useLocation } from "@/context/LocationContext";
import { useAppContent } from "@/context/AppContentContext";
import type { AdminPromo } from "@/types/appContent";
import { useImageStore } from "@/context/ImageStoreContext";
import { getProductsByCollectionHandle } from "@/services/shopify/client";
import { shopifyProductsToProducts } from "@/services/shopify/transforms";
import {
  ONBOARDING_OPTIONS,
  type HomeCountry,
  type Product,
} from "@/constants/personalization";
import {
  LANGUAGE_META,
  COUNTRY_SUGGESTED_LANGUAGE,
  type SupportedLanguage,
} from "@/lib/i18n";
import { HERO_COPY, HOME_SECTIONS, TRUST_ITEMS } from "@/constants/appContent";
import type { AdminMeal, AdminCategory } from "@/types/appContent";

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

const READY_FOOD_IMAGES: Record<string, ReturnType<typeof require>> = {
  uganda: require("@/assets/images/lifestyle-matooke.png"),
  kenya: require("@/assets/images/lifestyle-ugali.png"),
  ethiopia: require("@/assets/images/lifestyle-injera.png"),
  other: require("@/assets/images/lifestyle-spices.png"),
  all: require("@/assets/images/lifestyle-spices.png"),
};

const READY_FOOD_COPY: Record<string, { dish: string; teaser: string }> = {
  uganda: {
    dish: "Rolex, Matoke & More",
    teaser:
      "Ugandan street food and home-cooked favourites, fresh from partner kitchens.",
  },
  kenya: {
    dish: "Nyama Choma, Ugali & More",
    teaser: "Nairobi favourites cooked fresh and delivered to your door.",
  },
  ethiopia: {
    dish: "Injera, Tibs & More",
    teaser:
      "Authentic Ethiopian platters from trusted restaurant partners in the UAE.",
  },
  other: {
    dish: "Jollof, Suya & More",
    teaser:
      "West and Central African cuisine from partner restaurants across the UAE.",
  },
  all: {
    dish: "African Kitchen Coming Soon",
    teaser:
      "Fresh, authentic African meals from partner restaurants — delivered.",
  },
};

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    homeCountry,
    setHomeCountry,
    experience,
    shopifyProducts,
    productsLoading,
  } = useHomeCountry();
  const { totalItems } = useCart();
  const { t, language, setLanguage } = useLanguage();
  const { deliveryLabel, selectedEmirate } = useLocation();
  const {
    getBasketsForCountry,
    getMealsForCountry,
    getCategoriesForCountry,
    getActivePromos,
  } = useAppContent();
  const [dismissedPromoId, setDismissedPromoId] = useState<string | null>(null);
  const { uriMap } = useImageStore();

  const [locationSheetVisible, setLocationSheetVisible] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<AdminMeal | null>(null);
  const [showAllBaskets, setShowAllBaskets] = useState(false);
  const [showAllMeals, setShowAllMeals] = useState(false);
  const [showReadyFood, setShowReadyFood] = useState(false);
  const [showDeals, setShowDeals] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [basketScrollX, setBasketScrollX] = useState(0);
  const basketScrollRef = useRef<ScrollViewType>(null);
  const [mealScrollX, setMealScrollX] = useState(0);
  const mealScrollRef = useRef<ScrollViewType>(null);
  const [cravingsScrollX, setCravingsScrollX] = useState(0);
  const cravingsScrollRef = useRef<ScrollViewType>(null);
  const [madeForScrollX, setMadeForScrollX] = useState(0);
  const madeForScrollRef = useRef<ScrollViewType>(null);

  // When a category has a shopifyCollectionHandle, fetch from that specific collection
  const [collectionProducts, setCollectionProducts] = useState<
    Product[] | null
  >(null);
  const [collectionLoading, setCollectionLoading] = useState(false);

  const adminBaskets = homeCountry
    ? getBasketsForCountry(homeCountry)
    : (experience?.baskets ?? []);
  const adminMeals = homeCountry ? getMealsForCountry(homeCountry) : [];
  const adminCategories: AdminCategory[] = homeCountry
    ? getCategoriesForCountry(homeCountry)
    : [];
  const activePromos: AdminPromo[] = homeCountry
    ? getActivePromos(homeCountry)
    : [];
  const currentPromo =
    activePromos.find((p) => p.id !== dismissedPromoId) ?? null;

  const BASKET_CARD_STEP = 262;
  const scrollBaskets = useCallback(
    (dir: "left" | "right") => {
      const next =
        dir === "right"
          ? basketScrollX + BASKET_CARD_STEP
          : Math.max(0, basketScrollX - BASKET_CARD_STEP);
      basketScrollRef.current?.scrollTo({ x: next, animated: true });
      setBasketScrollX(next);
    },
    [basketScrollX],
  );

  const MEAL_CARD_STEP = 190;
  const scrollMeals = useCallback(
    (dir: "left" | "right") => {
      const next =
        dir === "right"
          ? mealScrollX + MEAL_CARD_STEP
          : Math.max(0, mealScrollX - MEAL_CARD_STEP);
      mealScrollRef.current?.scrollTo({ x: next, animated: true });
      setMealScrollX(next);
    },
    [mealScrollX],
  );

  const PRODUCT_CARD_STEP = 164;
  const scrollCravings = useCallback(
    (dir: "left" | "right") => {
      const next =
        dir === "right"
          ? cravingsScrollX + PRODUCT_CARD_STEP
          : Math.max(0, cravingsScrollX - PRODUCT_CARD_STEP);
      cravingsScrollRef.current?.scrollTo({ x: next, animated: true });
      setCravingsScrollX(next);
    },
    [cravingsScrollX],
  );

  const scrollMadeFor = useCallback(
    (dir: "left" | "right") => {
      const next =
        dir === "right"
          ? madeForScrollX + PRODUCT_CARD_STEP
          : Math.max(0, madeForScrollX - PRODUCT_CARD_STEP);
      madeForScrollRef.current?.scrollTo({ x: next, animated: true });
      setMadeForScrollX(next);
    },
    [madeForScrollX],
  );

  const firstCat = adminCategories[0]?.name ?? "";
  const activeCat = selectedCategory || firstCat;

  // If the active category has a Shopify collection handle, fetch from that collection.
  // This lets each country's "Staples" (or any category) point to a different Shopify collection.
  useEffect(() => {
    const catObj = adminCategories.find((c) => c.name === activeCat);
    const handle = catObj?.shopifyCollectionHandle;
    if (!handle) {
      setCollectionProducts(null);
      return;
    }
    let cancelled = false;
    setCollectionLoading(true);
    getProductsByCollectionHandle(handle, { first: 24 })
      .then((nodes) => {
        if (!cancelled) setCollectionProducts(shopifyProductsToProducts(nodes));
      })
      .catch(() => {
        if (!cancelled) setCollectionProducts(null);
      })
      .finally(() => {
        if (!cancelled) setCollectionLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeCat, adminCategories]);

  const filteredProducts = useMemo(() => {
    // If a Shopify collection was fetched for this category, use those products directly
    if (collectionProducts !== null) return collectionProducts;
    if (!activeCat || activeCat === firstCat) return shopifyProducts;
    const catObj = adminCategories.find((c) => c.name === activeCat);
    const keywords = catObj?.keywords ?? [];
    if (keywords.length === 0) return shopifyProducts;
    const lower = keywords.map((k) => k.toLowerCase());
    return shopifyProducts.filter((p) =>
      lower.some(
        (kw) =>
          p.name.toLowerCase().includes(kw) ||
          p.description.toLowerCase().includes(kw),
      ),
    );
  }, [
    activeCat,
    firstCat,
    shopifyProducts,
    adminCategories,
    collectionProducts,
  ]);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom + 60;

  if (!experience)
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );

  const heroStoredUri = uriMap["hero:" + homeCountry];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const heroImage: any = heroStoredUri
    ? { uri: heroStoredUri }
    : HERO_IMAGES[experience.heroImageKey];
  // Use UAE (Asia/Dubai, UTC+4) time for the greeting, regardless of device timezone
  const uaeHour = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Dubai" }),
  ).getHours();
  const timeGreeting =
    uaeHour >= 5 && uaeHour < 12
      ? t("goodMorning")
      : uaeHour >= 12 && uaeHour < 17
        ? t("goodAfternoon")
        : t("goodEvening");

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
                style={[
                  styles.locationPill,
                  {
                    backgroundColor: colors.secondary,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setLocationSheetVisible(true)}
              >
                <Ionicons name="location" size={12} color={colors.primary} />
                <Text
                  style={[styles.locationText, { color: colors.foreground }]}
                >
                  {selectedEmirate ? selectedEmirate.name : t("chooseLocation")}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={11}
                  color={colors.mutedForeground}
                />
              </Pressable>
              <Pressable
                style={[
                  styles.countryPill,
                  {
                    backgroundColor: colors.secondary,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setShowCountryPicker(true)}
              >
                <View style={styles.countryFlagBar}>
                  {experience.flagColors.map((c, i) => (
                    <View
                      key={i}
                      style={[styles.countryFlagStripe, { backgroundColor: c }]}
                    />
                  ))}
                </View>
                <Text
                  style={[styles.locationText, { color: colors.foreground }]}
                >
                  {experience.name}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={11}
                  color={colors.mutedForeground}
                />
              </Pressable>
            </View>
            <Text style={[styles.greeting, { color: colors.foreground }]}>
              {timeGreeting}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Pressable
              style={[
                styles.iconBtn,
                {
                  backgroundColor: colors.secondary,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => router.push("/(tabs)/profile")}
            >
              <Ionicons
                name="person-outline"
                size={20}
                color={colors.foreground}
              />
            </Pressable>
            <Pressable
              style={[
                styles.iconBtn,
                {
                  backgroundColor: colors.secondary,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => router.push("/(tabs)/cart")}
            >
              <Ionicons
                name="bag-outline"
                size={20}
                color={colors.foreground}
              />
              {totalItems > 0 && (
                <View
                  style={[styles.badge, { backgroundColor: colors.accent }]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      { color: colors.accentForeground },
                    ]}
                  >
                    {totalItems}
                  </Text>
                </View>
              )}
            </Pressable>
          </View>
        </View>

        {/* Hero Banner */}
        <Animated.View
          entering={FadeInDown.delay(80).duration(500)}
          style={styles.heroBanner}
        >
          <Image
            source={heroImage}
            style={styles.heroImage}
            contentFit="cover"
          />
          <LinearGradient
            colors={[
              "rgba(247,248,242,0)",
              "rgba(247,248,242,0.08)",
              "rgba(247,248,242,0.97)",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.heroContent}>
            <View
              style={[styles.heroBadge, { backgroundColor: colors.secondary }]}
            >
              <View
                style={[
                  styles.heroBadgeDot,
                  { backgroundColor: colors.primary },
                ]}
              />
              <Text style={[styles.heroBadgeText, { color: colors.primary }]}>
                {experience.nativeGreeting}
              </Text>
            </View>
            <Text style={[styles.heroTitle, { color: colors.foreground }]}>
              {HERO_COPY[homeCountry ?? "all"]?.title ?? HERO_COPY.all.title}
            </Text>
            <Text
              style={[styles.heroTagline, { color: colors.mutedForeground }]}
            >
              {HERO_COPY[homeCountry ?? "all"]?.tagline ??
                HERO_COPY.all.tagline}
            </Text>
            <View style={styles.heroButtons}>
              <Pressable
                style={[
                  styles.heroBtnPrimary,
                  { backgroundColor: colors.primary },
                ]}
                onPress={() => router.push("/(tabs)/search")}
              >
                <Ionicons name="storefront-outline" size={14} color="#FFFFFF" />
                <Text style={styles.heroBtnPrimaryText}>
                  {HERO_COPY[homeCountry ?? "all"]?.buyAgainLabel ?? "Shop Now"}
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.heroBtnSecondary,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
                onPress={() => router.push("/(tabs)/orders")}
              >
                <Text
                  style={[
                    styles.heroBtnSecondaryText,
                    { color: colors.foreground },
                  ]}
                >
                  {HERO_COPY[homeCountry ?? "all"]?.exploreLabel ?? "My Orders"}
                </Text>
                <Ionicons
                  name="arrow-forward"
                  size={13}
                  color={colors.foreground}
                />
              </Pressable>
            </View>
          </View>
        </Animated.View>

        {/* Search */}
        <View style={styles.searchRow}>
          <Pressable
            style={[
              styles.searchBar,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
            onPress={() => router.push("/(tabs)/search")}
          >
            <Ionicons
              name="search-outline"
              size={16}
              color={colors.mutedForeground}
            />
            <Text
              style={[
                styles.searchPlaceholder,
                { color: colors.mutedForeground },
              ]}
            >
              Search products, meals, brands...
            </Text>
            <View
              style={[
                styles.searchFilterBtn,
                {
                  backgroundColor: colors.secondary,
                  borderColor: colors.border,
                },
              ]}
            >
              <Ionicons
                name="options-outline"
                size={14}
                color={colors.primary}
              />
            </View>
          </Pressable>
        </View>

        {/* Promo Banner — only shown when admin has activated a promo */}
        {currentPromo && (
          <Pressable
            style={[
              styles.promoBanner,
              { backgroundColor: currentPromo.bgColor },
            ]}
            onPress={() => {
              setDismissedPromoId(currentPromo.id);
              if (currentPromo.ctaTarget === "search")
                router.push("/(tabs)/search");
              else if (currentPromo.ctaTarget === "orders")
                router.push("/(tabs)/orders");
            }}
          >
            <View style={styles.promoBannerLeft}>
              {currentPromo.badgeText ? (
                <View style={styles.promoBadge}>
                  <Text style={styles.promoBadgeText}>
                    {currentPromo.badgeText}
                  </Text>
                </View>
              ) : null}
              <Text style={styles.promoBannerTitle}>{currentPromo.title}</Text>
              {currentPromo.subtitle ? (
                <Text style={styles.promoBannerSub}>
                  {currentPromo.subtitle}
                </Text>
              ) : null}
              {currentPromo.ctaLabel ? (
                <Text style={styles.promoBannerCta}>
                  {currentPromo.ctaLabel} →
                </Text>
              ) : null}
            </View>
            <Pressable
              style={styles.promoDismiss}
              onPress={() => setDismissedPromoId(currentPromo.id)}
              hitSlop={10}
            >
              <Text style={styles.promoDismissText}>×</Text>
            </Pressable>
          </Pressable>
        )}

        {/* Categories — flex-wrap so all chips are always fully visible, no cut-off */}
        {adminCategories.length > 0 && (
          <View style={styles.categoriesSection}>
            <View style={styles.categoriesWrap}>
              {adminCategories.map((cat) => {
                const isActive = cat.name === activeCat;
                return (
                  <Pressable
                    key={cat.id}
                    style={[
                      styles.categoryChip,
                      isActive
                        ? {
                            backgroundColor: colors.primary,
                            borderColor: colors.primary,
                          }
                        : {
                            backgroundColor: colors.card,
                            borderColor: colors.border,
                          },
                    ]}
                    onPress={() => {
                      if (cat.name === "Ready Food") {
                        setShowReadyFood(true);
                        return;
                      }
                      if (cat.name === "Deals") {
                        setShowDeals(true);
                        return;
                      }
                      setSelectedCategory(isActive ? "" : cat.name);
                    }}
                  >
                    <Ionicons
                      name={CATEGORY_ICONS[cat.icon] ?? "grid-outline"}
                      size={13}
                      color={isActive ? "#FFFFFF" : colors.primary}
                    />
                    <Text
                      style={[
                        styles.categoryText,
                        { color: isActive ? "#FFFFFF" : colors.foreground },
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            {collectionLoading && (
              <ActivityIndicator
                size="small"
                color={colors.primary}
                style={{ marginTop: 6, marginLeft: 22 }}
              />
            )}
          </View>
        )}

        {/* My Baskets */}
        {adminBaskets.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title={HOME_SECTIONS.baskets.title}
              subtitle={HOME_SECTIONS.baskets.subtitle(experience.name)}
              onSeeAll={() => setShowAllBaskets(true)}
            />
            <View style={styles.basketScrollWrapper}>
              <ScrollView
                ref={basketScrollRef}
                horizontal
                nestedScrollEnabled
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScroll}
                onScroll={(e) =>
                  setBasketScrollX(e.nativeEvent.contentOffset.x)
                }
                onMomentumScrollEnd={(e) =>
                  setBasketScrollX(e.nativeEvent.contentOffset.x)
                }
                scrollEventThrottle={32}
              >
                {adminBaskets.map((basket) => (
                  <BasketCard key={basket.id} basket={basket} />
                ))}
              </ScrollView>
              {basketScrollX > 10 && (
                <Pressable
                  style={[
                    styles.basketArrow,
                    styles.basketArrowLeft,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => scrollBaskets("left")}
                >
                  <Ionicons
                    name="chevron-back"
                    size={16}
                    color={colors.foreground}
                  />
                </Pressable>
              )}
              {adminBaskets.length > 1 && (
                <Pressable
                  style={[
                    styles.basketArrow,
                    styles.basketArrowRight,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => scrollBaskets("right")}
                >
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={colors.foreground}
                  />
                </Pressable>
              )}
            </View>
          </View>
        )}

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
          ) : filteredProducts.length === 0 ? (
            <View style={styles.productsLoader}>
              <Text
                style={{
                  color: "#728054",
                  fontSize: 13,
                  textAlign: "center",
                  paddingHorizontal: 20,
                }}
              >
                Nothing here yet — check back soon
              </Text>
            </View>
          ) : (
            <View style={styles.basketScrollWrapper}>
              <ScrollView
                ref={cravingsScrollRef}
                horizontal
                nestedScrollEnabled
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScroll}
                onScroll={(e) =>
                  setCravingsScrollX(e.nativeEvent.contentOffset.x)
                }
                onMomentumScrollEnd={(e) =>
                  setCravingsScrollX(e.nativeEvent.contentOffset.x)
                }
                scrollEventThrottle={32}
              >
                {filteredProducts.slice(0, 4).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </ScrollView>
              {cravingsScrollX > 10 && (
                <Pressable
                  style={[
                    styles.basketArrow,
                    styles.basketArrowLeft,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => scrollCravings("left")}
                >
                  <Ionicons
                    name="chevron-back"
                    size={16}
                    color={colors.foreground}
                  />
                </Pressable>
              )}
              {filteredProducts.length > 2 && (
                <Pressable
                  style={[
                    styles.basketArrow,
                    styles.basketArrowRight,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => scrollCravings("right")}
                >
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={colors.foreground}
                  />
                </Pressable>
              )}
            </View>
          )}
        </View>

        {/* Meal Inspiration */}
        {adminMeals.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title={HOME_SECTIONS.mealInspiration.title}
              subtitle={HOME_SECTIONS.mealInspiration.subtitle}
              onSeeAll={() => setShowAllMeals(true)}
            />
            <View style={styles.basketScrollWrapper}>
              <ScrollView
                ref={mealScrollRef}
                horizontal
                nestedScrollEnabled
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScroll}
                onScroll={(e) => setMealScrollX(e.nativeEvent.contentOffset.x)}
                onMomentumScrollEnd={(e) =>
                  setMealScrollX(e.nativeEvent.contentOffset.x)
                }
                scrollEventThrottle={32}
              >
                {adminMeals.map((meal) => {
                  const mealStoredUri = uriMap["meal:" + meal.id];
                  const image = mealStoredUri
                    ? { uri: mealStoredUri }
                    : LIFESTYLE_IMAGES[meal.lifestyleImageKey];
                  if (!image) return null;
                  return (
                    <Pressable
                      key={meal.id}
                      style={styles.inspirationCard}
                      onPress={() => setSelectedMeal(meal)}
                    >
                      <Image
                        source={image}
                        style={styles.inspirationImage}
                        contentFit="cover"
                      />
                      <LinearGradient
                        colors={["transparent", "rgba(20,24,16,0.72)"]}
                        style={StyleSheet.absoluteFill}
                      />
                      <View style={styles.inspirationTextWrap}>
                        <Text style={styles.inspirationLabel}>{meal.name}</Text>
                        <View style={styles.inspirationCta}>
                          <Text style={styles.inspirationCtaText}>
                            See recipe
                          </Text>
                          <Ionicons
                            name="arrow-forward"
                            size={10}
                            color="rgba(255,255,255,0.9)"
                          />
                        </View>
                      </View>
                    </Pressable>
                  );
                })}
              </ScrollView>
              {mealScrollX > 10 && (
                <Pressable
                  style={[
                    styles.basketArrow,
                    styles.basketArrowLeft,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => scrollMeals("left")}
                >
                  <Ionicons
                    name="chevron-back"
                    size={16}
                    color={colors.foreground}
                  />
                </Pressable>
              )}
              {adminMeals.length > 1 && (
                <Pressable
                  style={[
                    styles.basketArrow,
                    styles.basketArrowRight,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => scrollMeals("right")}
                >
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={colors.foreground}
                  />
                </Pressable>
              )}
            </View>
          </View>
        )}

        {/* More Products */}
        <View style={styles.section}>
          <SectionHeader
            title={HOME_SECTIONS.madeFor.title(experience.name)}
            subtitle={HOME_SECTIONS.madeFor.subtitle}
            onSeeAll={() => router.push("/(tabs)/search")}
          />
          <View style={styles.basketScrollWrapper}>
            <ScrollView
              ref={madeForScrollRef}
              horizontal
              nestedScrollEnabled
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
              onScroll={(e) => setMadeForScrollX(e.nativeEvent.contentOffset.x)}
              onMomentumScrollEnd={(e) =>
                setMadeForScrollX(e.nativeEvent.contentOffset.x)
              }
              scrollEventThrottle={32}
            >
              {filteredProducts.slice(6).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </ScrollView>
            {madeForScrollX > 10 && (
              <Pressable
                style={[
                  styles.basketArrow,
                  styles.basketArrowLeft,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
                onPress={() => scrollMadeFor("left")}
              >
                <Ionicons
                  name="chevron-back"
                  size={16}
                  color={colors.foreground}
                />
              </Pressable>
            )}
            {filteredProducts.slice(6).length > 2 && (
              <Pressable
                style={[
                  styles.basketArrow,
                  styles.basketArrowRight,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
                onPress={() => scrollMadeFor("right")}
              >
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={colors.foreground}
                />
              </Pressable>
            )}
          </View>
        </View>

        {/* Trust Bar */}
        <View
          style={[
            styles.trustBar,
            { backgroundColor: colors.secondary, borderColor: colors.border },
          ]}
        >
          {TRUST_ITEMS.map((item) => (
            <View key={item.label} style={styles.trustItem}>
              <Ionicons
                name={item.iconName as any}
                size={18}
                color={colors.primary}
              />
              <Text
                style={[styles.trustText, { color: colors.mutedForeground }]}
              >
                {item.label}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <LocationBottomSheet
        visible={locationSheetVisible}
        onClose={() => setLocationSheetVisible(false)}
      />

      {/* Country + Language Picker */}
      <Modal
        visible={showCountryPicker}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCountryPicker(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowCountryPicker(false)}
        />
        <Animated.View
          entering={FadeInDown.duration(300)}
          style={[styles.modalSheet, { backgroundColor: colors.card }]}
        >
          <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
            <View
              style={[styles.modalHandle, { backgroundColor: colors.border }]}
            />
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>
              Your Experience
            </Text>

            <Text
              style={[
                styles.modalSectionLabel,
                { color: colors.mutedForeground },
              ]}
            >
              YOUR HOME COUNTRY
            </Text>
            {ONBOARDING_OPTIONS.map((option) => {
              const isSelected = homeCountry === option.id;
              return (
                <Pressable
                  key={option.id}
                  style={[
                    styles.modalOption,
                    {
                      backgroundColor: isSelected
                        ? colors.secondary
                        : "transparent",
                      borderColor: isSelected ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={async () => {
                    await setHomeCountry(option.id as HomeCountry);
                    const suggested = COUNTRY_SUGGESTED_LANGUAGE[option.id];
                    if (suggested)
                      await setLanguage(suggested as SupportedLanguage);
                    setShowCountryPicker(false);
                    setSelectedCategory("");
                  }}
                >
                  <View style={styles.optionFlagBar}>
                    {option.flagColors.map((c, i) => (
                      <View
                        key={i}
                        style={[
                          styles.optionFlagStripe,
                          { backgroundColor: c },
                        ]}
                      />
                    ))}
                  </View>
                  <View style={styles.optionContent}>
                    <Text
                      style={[
                        styles.optionName,
                        {
                          color: isSelected
                            ? colors.primary
                            : colors.foreground,
                        },
                      ]}
                    >
                      {option.name}
                    </Text>
                    <Text
                      style={[
                        styles.optionSub,
                        { color: colors.mutedForeground },
                      ]}
                      numberOfLines={1}
                    >
                      {option.subtitle}
                    </Text>
                  </View>
                  {isSelected && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={colors.primary}
                    />
                  )}
                </Pressable>
              );
            })}

            <View
              style={[styles.modalDivider, { backgroundColor: colors.border }]}
            />
            <Text
              style={[
                styles.modalSectionLabel,
                { color: colors.mutedForeground },
              ]}
            >
              LANGUAGE
            </Text>
            {(Object.keys(LANGUAGE_META) as SupportedLanguage[]).map((lang) => {
              const meta = LANGUAGE_META[lang];
              const isSelected = language === lang;
              return (
                <Pressable
                  key={lang}
                  style={[
                    styles.modalOption,
                    {
                      backgroundColor: isSelected
                        ? colors.secondary
                        : "transparent",
                      borderColor: isSelected ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={async () => {
                    await setLanguage(lang);
                    setShowCountryPicker(false);
                  }}
                >
                  <View style={styles.optionContent}>
                    <Text
                      style={[
                        styles.optionName,
                        {
                          color: isSelected
                            ? colors.primary
                            : colors.foreground,
                        },
                      ]}
                    >
                      {meta.nativeLabel}
                    </Text>
                    <Text
                      style={[
                        styles.optionSub,
                        { color: colors.mutedForeground },
                      ]}
                    >
                      {meta.label}
                      {meta.rtl ? " — RTL" : ""}
                    </Text>
                  </View>
                  {isSelected && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={colors.primary}
                    />
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        </Animated.View>
      </Modal>

      {/* All Baskets Modal */}
      <Modal
        visible={showAllBaskets}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAllBaskets(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowAllBaskets(false)}
        />
        <Animated.View
          entering={FadeInDown.duration(300)}
          style={[
            styles.modalSheet,
            { backgroundColor: colors.background, maxHeight: "88%" },
          ]}
        >
          <View
            style={[styles.modalHandle, { backgroundColor: colors.border }]}
          />
          <Text style={[styles.modalTitle, { color: colors.foreground }]}>
            {HOME_SECTIONS.baskets.title}
          </Text>
          <Text
            style={[
              styles.modalSectionLabel,
              { color: colors.mutedForeground },
            ]}
          >
            {HOME_SECTIONS.baskets.subtitle(experience.name).toUpperCase()}
          </Text>
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ flex: 1, marginTop: 4 }}
          >
            {adminBaskets.map((basket) => (
              <View
                key={basket.id}
                style={[styles.basketListItem, { borderColor: colors.border }]}
              >
                <BasketCard basket={basket} />
              </View>
            ))}
            <View style={{ height: 40 }} />
          </ScrollView>
        </Animated.View>
      </Modal>

      {/* All Meals Modal */}
      <Modal
        visible={showAllMeals}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAllMeals(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowAllMeals(false)}
        />
        <Animated.View
          entering={FadeInDown.duration(300)}
          style={[
            styles.modalSheet,
            { backgroundColor: colors.background, maxHeight: "88%" },
          ]}
        >
          <View
            style={[styles.modalHandle, { backgroundColor: colors.border }]}
          />
          <Text style={[styles.modalTitle, { color: colors.foreground }]}>
            Meal Inspiration
          </Text>
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ flex: 1, marginTop: 4 }}
          >
            {adminMeals.map((meal) => {
              const mealStoredUri = uriMap["meal:" + meal.id];
              const image = mealStoredUri
                ? { uri: mealStoredUri }
                : LIFESTYLE_IMAGES[meal.lifestyleImageKey];
              if (!image) return null;
              return (
                <Pressable
                  key={meal.id}
                  style={[
                    styles.mealListItem,
                    { borderBottomColor: colors.border },
                  ]}
                  onPress={() => {
                    setShowAllMeals(false);
                    setSelectedMeal(meal);
                  }}
                >
                  <Image
                    source={image}
                    style={styles.mealListThumb}
                    contentFit="cover"
                  />
                  <View style={{ flex: 1, paddingLeft: 14 }}>
                    <Text
                      style={[
                        styles.name,
                        { color: colors.foreground, fontSize: 15 },
                      ]}
                      numberOfLines={1}
                    >
                      {meal.name}
                    </Text>
                    <Text
                      style={{
                        color: colors.mutedForeground,
                        fontSize: 12,
                        marginTop: 3,
                        lineHeight: 18,
                      }}
                      numberOfLines={2}
                    >
                      {meal.description}
                    </Text>
                    <Text
                      style={{
                        color: colors.mutedForeground,
                        fontSize: 11,
                        marginTop: 5,
                      }}
                    >
                      {meal.prepTime} prep · {meal.cookTime} cook
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={colors.mutedForeground}
                  />
                </Pressable>
              );
            })}
            <View style={{ height: 40 }} />
          </ScrollView>
        </Animated.View>
      </Modal>

      {/* Ready Food Coming Soon Modal */}
      {(() => {
        const key = homeCountry ?? "all";
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const heroImg: any = READY_FOOD_IMAGES[key] ?? READY_FOOD_IMAGES.all;
        const copy = READY_FOOD_COPY[key] ?? READY_FOOD_COPY.all;
        return (
          <Modal
            visible={showReadyFood}
            animationType="slide"
            transparent
            onRequestClose={() => setShowReadyFood(false)}
          >
            <Pressable
              style={styles.modalOverlay}
              onPress={() => setShowReadyFood(false)}
            />
            <Animated.View
              entering={FadeInDown.duration(300)}
              style={[
                styles.modalSheet,
                { backgroundColor: colors.background },
              ]}
            >
              <View
                style={[styles.modalHandle, { backgroundColor: colors.border }]}
              />
              {/* Food image — clear, steamy, appetising — "Coming Soon" overlaid in corner */}
              <View style={styles.readyFoodHeroWrap}>
                <Image
                  source={heroImg}
                  style={styles.readyFoodHero}
                  contentFit="cover"
                />
                <LinearGradient
                  colors={["transparent", "rgba(15,18,10,0.55)"]}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.readyFoodComingSoonBadge}>
                  <Text style={styles.readyFoodComingSoonText}>
                    Coming Soon
                  </Text>
                </View>
              </View>
              <Text
                style={[styles.readyFoodDish, { color: colors.foreground }]}
              >
                {copy.dish}
              </Text>
              <Text
                style={{
                  color: colors.mutedForeground,
                  fontSize: 14,
                  lineHeight: 22,
                  marginTop: 6,
                }}
              >
                {copy.teaser}
              </Text>
              <Text
                style={{
                  color: colors.mutedForeground,
                  fontSize: 13,
                  lineHeight: 20,
                  marginTop: 10,
                }}
              >
                We are building partnerships with African restaurants across the
                UAE. Be the first to know when it launches.
              </Text>
              <Pressable
                style={[
                  styles.readyFoodBtn,
                  { backgroundColor: colors.primary },
                ]}
                onPress={() => setShowReadyFood(false)}
              >
                <Text style={styles.readyFoodBtnText}>Got It</Text>
              </Pressable>
            </Animated.View>
          </Modal>
        );
      })()}

      {/* Deals Coming Soon Modal */}
      <Modal
        visible={showDeals}
        animationType="slide"
        transparent
        onRequestClose={() => setShowDeals(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowDeals(false)}
        />
        <Animated.View
          entering={FadeInDown.duration(300)}
          style={[styles.modalSheet, { backgroundColor: colors.background }]}
        >
          <View
            style={[styles.modalHandle, { backgroundColor: colors.border }]}
          />
          <View style={styles.readyFoodHeroWrap}>
            <Image
              source={LIFESTYLE_IMAGES["lifestyle-spices"]}
              style={styles.readyFoodHero}
              contentFit="cover"
            />
            <LinearGradient
              colors={["transparent", "rgba(15,18,10,0.55)"]}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.readyFoodComingSoonBadge}>
              <Text style={styles.readyFoodComingSoonText}>Coming Soon</Text>
            </View>
          </View>
          <Text style={[styles.readyFoodDish, { color: colors.foreground }]}>
            Deals & Weekly Offers
          </Text>
          <Text
            style={{
              color: colors.mutedForeground,
              fontSize: 14,
              lineHeight: 22,
              marginTop: 6,
            }}
          >
            We are curating exclusive weekly deals and bundles for the African
            diaspora community in the UAE.
          </Text>
          <Text
            style={{
              color: colors.mutedForeground,
              fontSize: 13,
              lineHeight: 20,
              marginTop: 10,
            }}
          >
            Check back soon — great prices on your favourite products are on the
            way.
          </Text>
          <Pressable
            style={[styles.readyFoodBtn, { backgroundColor: colors.primary }]}
            onPress={() => setShowDeals(false)}
          >
            <Text style={styles.readyFoodBtnText}>Got It</Text>
          </Pressable>
        </Animated.View>
      </Modal>

      {/* Meal Recipe Modal */}
      <Modal
        visible={!!selectedMeal}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedMeal(null)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setSelectedMeal(null)}
        />
        {selectedMeal &&
          (() => {
            const recipeStoredUri = uriMap["meal:" + selectedMeal.id];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const image: any = recipeStoredUri
              ? { uri: recipeStoredUri }
              : LIFESTYLE_IMAGES[selectedMeal.lifestyleImageKey];
            return (
              <Animated.View
                entering={FadeInDown.duration(300)}
                style={[
                  styles.recipeSheet,
                  { backgroundColor: colors.background },
                ]}
              >
                <View style={styles.recipeHeroWrap}>
                  {image && (
                    <Image
                      source={image}
                      style={styles.recipeHeroImage}
                      contentFit="cover"
                    />
                  )}
                  <LinearGradient
                    colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.55)"]}
                    style={StyleSheet.absoluteFill}
                  />
                  <Pressable
                    style={[
                      styles.recipeCloseBtn,
                      { backgroundColor: "rgba(0,0,0,0.35)" },
                    ]}
                    onPress={() => setSelectedMeal(null)}
                  >
                    <Ionicons name="close" size={20} color="#FFFFFF" />
                  </Pressable>
                  <View style={styles.recipeHeroContent}>
                    <Text style={styles.recipeHeroTitle}>
                      {selectedMeal.name}
                    </Text>
                    <View style={styles.recipeMeta}>
                      <View style={styles.recipeMetaItem}>
                        <Ionicons
                          name="time-outline"
                          size={13}
                          color="rgba(255,255,255,0.85)"
                        />
                        <Text style={styles.recipeMetaText}>
                          {selectedMeal.prepTime} prep
                        </Text>
                      </View>
                      <View style={styles.recipeMetaItem}>
                        <Ionicons
                          name="flame-outline"
                          size={13}
                          color="rgba(255,255,255,0.85)"
                        />
                        <Text style={styles.recipeMetaText}>
                          {selectedMeal.cookTime} cook
                        </Text>
                      </View>
                      <View style={styles.recipeMetaItem}>
                        <Ionicons
                          name="people-outline"
                          size={13}
                          color="rgba(255,255,255,0.85)"
                        />
                        <Text style={styles.recipeMetaText}>
                          Serves {selectedMeal.servings}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                <ScrollView
                  style={{ flex: 1 }}
                  contentContainerStyle={styles.recipeBody}
                  showsVerticalScrollIndicator={false}
                >
                  <Text
                    style={[
                      styles.recipeDescription,
                      { color: colors.mutedForeground },
                    ]}
                  >
                    {selectedMeal.description}
                  </Text>

                  <Text
                    style={[
                      styles.recipeSectionTitle,
                      { color: colors.foreground },
                    ]}
                  >
                    Ingredients
                  </Text>
                  {selectedMeal.ingredients.map((ing, i) => (
                    <View key={i} style={styles.ingredientRow}>
                      <View
                        style={[
                          styles.ingredientDot,
                          { backgroundColor: colors.primary },
                        ]}
                      />
                      <Text
                        style={[
                          styles.ingredientText,
                          { color: colors.foreground },
                        ]}
                      >
                        {ing}
                      </Text>
                    </View>
                  ))}

                  <Text
                    style={[
                      styles.recipeSectionTitle,
                      { color: colors.foreground },
                    ]}
                  >
                    Method
                  </Text>
                  {selectedMeal.steps.map((step, i) => (
                    <View key={i} style={styles.stepRow}>
                      <View
                        style={[
                          styles.stepNumber,
                          {
                            backgroundColor: colors.secondary,
                            borderColor: colors.border,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.stepNumberText,
                            { color: colors.primary },
                          ]}
                        >
                          {i + 1}
                        </Text>
                      </View>
                      <Text
                        style={[styles.stepText, { color: colors.foreground }]}
                      >
                        {step}
                      </Text>
                    </View>
                  ))}

                  {selectedMeal.tip && (
                    <View
                      style={[
                        styles.recipeTip,
                        {
                          backgroundColor: colors.secondary,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <Ionicons
                        name="bulb-outline"
                        size={16}
                        color={colors.primary}
                      />
                      <Text
                        style={[
                          styles.recipeTipText,
                          { color: colors.foreground },
                        ]}
                      >
                        {selectedMeal.tip}
                      </Text>
                    </View>
                  )}
                </ScrollView>
              </Animated.View>
            );
          })()}
      </Modal>
    </View>
  );
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
  countryFlagBar: {
    width: 12,
    height: 12,
    borderRadius: 2,
    overflow: "hidden",
    flexDirection: "row",
  },
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
  heroBadgeDot: { width: 6, height: 6, borderRadius: 3 },
  heroBadgeText: { fontSize: 11, fontWeight: "700", letterSpacing: 0.3 },
  heroTitle: {
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.7,
    lineHeight: 32,
    marginBottom: 5,
  },
  heroTagline: { fontSize: 14, marginBottom: 18, fontWeight: "500" },
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
  searchRow: { paddingHorizontal: 22, marginBottom: 12 },
  promoBanner: {
    marginHorizontal: 22,
    marginBottom: 16,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  promoBannerLeft: { flex: 1, gap: 4 },
  promoBadge: {
    backgroundColor: "rgba(255,255,255,0.25)",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 4,
  },
  promoBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  promoBannerTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
    lineHeight: 19,
  },
  promoBannerSub: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    lineHeight: 16,
  },
  promoBannerCta: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: 4,
  },
  promoDismiss: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  promoDismissText: {
    fontSize: 20,
    color: "rgba(255,255,255,0.7)",
    lineHeight: 24,
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
  basketScrollWrapper: { position: "relative" },
  basketArrow: {
    position: "absolute",
    top: "35%",
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    zIndex: 10,
  },
  basketArrowLeft: { left: 6 },
  basketArrowRight: { right: 6 },
  basketListItem: { marginBottom: 14 },
  mealListItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  mealListThumb: {
    width: 72,
    height: 72,
    borderRadius: 12,
    flexShrink: 0,
  },
  name: { fontSize: 18, fontWeight: "800", letterSpacing: -0.5 },
  readyFoodHeroWrap: {
    width: "100%",
    height: 200,
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 16,
  },
  readyFoodHero: {
    width: "100%",
    height: "100%",
  },
  readyFoodComingSoonBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(200, 88, 28, 0.92)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  readyFoodComingSoonText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  readyFoodDish: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  readyFoodBtn: {
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    marginTop: 18,
  },
  readyFoodBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
  categoriesSection: { marginBottom: 26 },
  categoriesWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 22,
    gap: 8,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 1,
  },
  categoryText: { fontSize: 12, fontWeight: "600" },
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
  inspirationCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  inspirationCtaText: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 11,
    fontWeight: "600",
  },
  recipeSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "88%",
    overflow: "hidden",
  },
  recipeHeroWrap: { height: 210, position: "relative" },
  recipeHeroImage: { width: "100%", height: "100%" },
  recipeCloseBtn: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  recipeHeroContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  recipeHeroTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.6,
    marginBottom: 8,
  },
  recipeMeta: { flexDirection: "row", gap: 14 },
  recipeMetaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  recipeMetaText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.85)",
    fontWeight: "500",
  },
  recipeBody: { padding: 22, paddingBottom: 40, gap: 6 },
  recipeDescription: { fontSize: 14, lineHeight: 21, marginBottom: 16 },
  recipeSectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: -0.3,
    marginTop: 16,
    marginBottom: 10,
  },
  ingredientRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 8,
  },
  ingredientDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
    flexShrink: 0,
  },
  ingredientText: { flex: 1, fontSize: 14, lineHeight: 20 },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 14,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    flexShrink: 0,
    marginTop: 1,
  },
  stepNumberText: { fontSize: 13, fontWeight: "800" },
  stepText: { flex: 1, fontSize: 14, lineHeight: 21 },
  recipeTip: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginTop: 16,
  },
  recipeTipText: { flex: 1, fontSize: 13, lineHeight: 19, fontStyle: "italic" },
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
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
    letterSpacing: -0.3,
  },
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
