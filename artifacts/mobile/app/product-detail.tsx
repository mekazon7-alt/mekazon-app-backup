import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useRecentlyViewed } from "@/context/RecentlyViewedContext";
import type { Product } from "@/constants/personalization";

const { width: SW } = Dimensions.get("window");

const PRODUCT_IMAGES: Record<string, ReturnType<typeof require>> = {
  "product-royco": require("@/assets/images/product-royco.png"),
  "product-unga": require("@/assets/images/product-unga.png"),
  "product-teff": require("@/assets/images/product-teff.png"),
  "product-berbere": require("@/assets/images/product-berbere.png"),
  "product-coffee": require("@/assets/images/product-coffee.png"),
  "lifestyle-matooke": require("@/assets/images/lifestyle-matooke.png"),
  "lifestyle-injera": require("@/assets/images/lifestyle-injera.png"),
  "lifestyle-spices": require("@/assets/images/lifestyle-spices.png"),
  "lifestyle-ugali": require("@/assets/images/lifestyle-ugali.png"),
};

// Parse bullet points from tags (e.g. "protein-rich" -> "Protein rich")
function tagToBullet(tag: string): string {
  return tag
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/^(Mekazon|Ugandan.shop|Kenyan.shop|Ethiopian.shop|Beauty)$/i, "")
    .trim();
}

function getBullets(product: Product): string[] {
  // Use description sentences as bullets (split by ". " or "·")
  const desc = product.description || "";
  const parts = desc.split(/\.\s+|·/).map((s) => s.trim()).filter((s) => s.length > 4 && s.length < 80);
  return parts.slice(0, 3);
}

export default function ProductDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ product: string }>();
  const { addItem, items, updateQuantity } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { addRecentlyViewed } = useRecentlyViewed();

  const [product, setProduct] = useState<Product | null>(null);
  const addBtnScale = useSharedValue(1);

  useEffect(() => {
    if (params.product) {
      try {
        const p = JSON.parse(decodeURIComponent(params.product)) as Product;
        setProduct(p);
        addRecentlyViewed(p);
      } catch {}
    }
  }, [params.product]);

  if (!product) return null;

  const cartItem = items.find((i) => i.id === product.id);
  const wishlisted = isWishlisted(product.id);
  const localImage = product.imageKey ? PRODUCT_IMAGES[product.imageKey] : null;
  const isProductImg = product.imageKey?.startsWith("product-");
  const bullets = getBullets(product);
  const hasDiscount = !!product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPct = hasDiscount
    ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
    : 0;

  const topPad = Platform.OS === "web" ? 20 : insets.top;
  const bottomPad = Platform.OS === "web" ? 20 : insets.bottom;

  const handleAdd = () => {
    addBtnScale.value = withSpring(0.92, {}, () => { addBtnScale.value = withSpring(1); });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addItem(product);
  };

  const handleWishlist = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleWishlist(product);
  };

  const addBtnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: addBtnScale.value }],
  }));

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <Pressable style={[styles.iconBtn, { backgroundColor: colors.secondary }]} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color={colors.foreground} />
        </Pressable>
        <Pressable
          style={[styles.iconBtn, { backgroundColor: wishlisted ? "#FFF0EC" : colors.secondary }]}
          onPress={handleWishlist}
        >
          <Ionicons
            name={wishlisted ? "heart" : "heart-outline"}
            size={20}
            color={wishlisted ? "#C4541A" : colors.mutedForeground}
          />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: bottomPad + 120 }}>
        {/* Product Image */}
        <Animated.View entering={FadeIn.duration(300)}>
          <View style={[
            styles.imageContainer,
            { backgroundColor: localImage && isProductImg ? "#F4F6EE" : product.cardColor + "22" }
          ]}>
            {localImage ? (
              <Image
                source={localImage}
                style={isProductImg ? styles.productImgContain : styles.productImgCover}
                contentFit={isProductImg ? "contain" : "cover"}
              />
            ) : product.remoteImageUrl ? (
              <Image source={{ uri: product.remoteImageUrl }} style={styles.productImgCover} contentFit="cover" />
            ) : (
              <View style={[styles.colorBlock, { backgroundColor: product.cardColor }]} />
            )}

            {/* Discount badge */}
            {hasDiscount && (
              <Animated.View entering={FadeInDown.delay(200)} style={styles.discountBadge}>
                <Text style={styles.discountBadgeText}>-{discountPct}%</Text>
              </Animated.View>
            )}

            {/* Tag badge */}
            {product.tag && !hasDiscount && (
              <View style={[styles.tagBadge, { backgroundColor: colors.accent }]}>
                <Text style={[styles.tagBadgeText, { color: colors.accentForeground }]}>{product.tag}</Text>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Product Info */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.infoSection}>
          {/* Vendor */}
          {product.vendor ? (
            <Text style={[styles.vendor, { color: colors.mutedForeground }]}>{product.vendor}</Text>
          ) : null}

          {/* Name */}
          <Text style={[styles.productName, { color: colors.foreground }]}>{product.name}</Text>

          {/* Unit */}
          <Text style={[styles.unit, { color: colors.mutedForeground }]}>{product.unit}</Text>

          {/* Price row */}
          <View style={styles.priceRow}>
            <View>
              <Text style={[styles.currency, { color: colors.mutedForeground }]}>AED</Text>
              <Text style={[styles.price, { color: colors.foreground }]}>{product.price.toFixed(0)}</Text>
            </View>
            {hasDiscount && (
              <View style={styles.compareGroup}>
                <Text style={[styles.compareAt, { color: colors.mutedForeground }]}>
                  AED {product.compareAtPrice!.toFixed(0)}
                </Text>
                <View style={[styles.savingPill, { backgroundColor: "#E8F5E9" }]}>
                  <Text style={styles.savingPillText}>Save AED {(product.compareAtPrice! - product.price).toFixed(0)}</Text>
                </View>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Bullet points */}
        {bullets.length > 0 && (
          <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.bulletsSection}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Why you'll love it</Text>
            {bullets.map((b, i) => (
              <View key={i} style={styles.bulletRow}>
                <View style={[styles.bulletDot, { backgroundColor: colors.primary }]} />
                <Text style={[styles.bulletText, { color: colors.foreground }]}>{b}</Text>
              </View>
            ))}
          </Animated.View>
        )}

        {/* Full description */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.descSection}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>About this product</Text>
          <Text style={[styles.descText, { color: colors.mutedForeground }]}>{product.description}</Text>
        </Animated.View>

        {/* Delivery info */}
        <Animated.View entering={FadeInDown.delay(400).duration(400)} style={[styles.deliveryCard, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
          <View style={styles.deliveryRow}>
            <Ionicons name="time-outline" size={16} color={colors.primary} />
            <Text style={[styles.deliveryText, { color: colors.foreground }]}>Next-day delivery across UAE</Text>
          </View>
          <View style={styles.deliveryRow}>
            <Ionicons name="flash-outline" size={16} color={colors.accent} />
            <Text style={[styles.deliveryText, { color: colors.foreground }]}>Express 2hr delivery in Dubai</Text>
          </View>
          <View style={styles.deliveryRow}>
            <Ionicons name="shield-checkmark-outline" size={16} color={colors.primary} />
            <Text style={[styles.deliveryText, { color: colors.foreground }]}>Secure checkout · Cash on delivery available</Text>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Bottom Add to Cart */}
      <View style={[styles.bottomBar, { paddingBottom: bottomPad + 8, backgroundColor: colors.background, borderTopColor: colors.border }]}>
        {cartItem ? (
          <View style={[styles.qtyRow, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
            <Pressable
              style={[styles.qtyBtn, { backgroundColor: colors.background }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); updateQuantity(product.id, cartItem.quantity - 1); }}
            >
              <Ionicons name={cartItem.quantity === 1 ? "trash-outline" : "remove"} size={18} color={cartItem.quantity === 1 ? colors.destructive : colors.foreground} />
            </Pressable>
            <Text style={[styles.qtyCount, { color: colors.foreground }]}>{cartItem.quantity} in cart</Text>
            <Pressable
              style={[styles.qtyBtn, { backgroundColor: colors.primary }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); updateQuantity(product.id, cartItem.quantity + 1); }}
            >
              <Ionicons name="add" size={18} color="#FFFFFF" />
            </Pressable>
          </View>
        ) : (
          <Animated.View style={[addBtnStyle, { flex: 1 }]}>
            <Pressable style={[styles.addBtn, { backgroundColor: colors.primary }]} onPress={handleAdd}>
              <Ionicons name="bag-add-outline" size={20} color="#FFFFFF" />
              <Text style={styles.addBtnText}>Add to Cart · AED {product.price.toFixed(0)}</Text>
            </Pressable>
          </Animated.View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: "center", justifyContent: "center",
  },
  imageContainer: {
    width: SW,
    height: SW * 0.85,
    alignItems: "center",
    justifyContent: "center",
  },
  productImgContain: { width: "75%", height: "75%" },
  productImgCover: { width: "100%", height: "100%" },
  colorBlock: { width: 80, height: 80, borderRadius: 40, opacity: 0.5 },
  discountBadge: {
    position: "absolute", top: 56, right: 16,
    backgroundColor: "#C4541A",
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 20,
  },
  discountBadgeText: { color: "#FFF", fontWeight: "800", fontSize: 13 },
  tagBadge: {
    position: "absolute", top: 56, right: 16,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 20,
  },
  tagBadgeText: { fontWeight: "700", fontSize: 11 },
  infoSection: { paddingHorizontal: 22, paddingTop: 20, paddingBottom: 16 },
  vendor: { fontSize: 12, fontWeight: "600", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 },
  productName: { fontSize: 24, fontWeight: "800", letterSpacing: -0.5, lineHeight: 30, marginBottom: 4 },
  unit: { fontSize: 14, marginBottom: 16 },
  priceRow: { flexDirection: "row", alignItems: "flex-end", gap: 16 },
  currency: { fontSize: 11, fontWeight: "600", marginBottom: 1 },
  price: { fontSize: 32, fontWeight: "800", letterSpacing: -1 },
  compareGroup: { gap: 4, paddingBottom: 4 },
  compareAt: { fontSize: 16, textDecorationLine: "line-through" },
  savingPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, alignSelf: "flex-start" },
  savingPillText: { fontSize: 12, fontWeight: "700", color: "#2E7D32" },
  divider: { height: 1, marginHorizontal: 22, marginBottom: 20 },
  bulletsSection: { paddingHorizontal: 22, marginBottom: 20 },
  sectionTitle: { fontSize: 15, fontWeight: "700", marginBottom: 12 },
  bulletRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 10 },
  bulletDot: { width: 7, height: 7, borderRadius: 4, marginTop: 5, flexShrink: 0 },
  bulletText: { flex: 1, fontSize: 14, lineHeight: 20 },
  descSection: { paddingHorizontal: 22, marginBottom: 20 },
  descText: { fontSize: 14, lineHeight: 22 },
  deliveryCard: {
    marginHorizontal: 22, borderRadius: 14, padding: 16,
    gap: 10, borderWidth: 1, marginBottom: 24,
  },
  deliveryRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  deliveryText: { fontSize: 13, fontWeight: "500", flex: 1 },
  bottomBar: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    paddingHorizontal: 20, paddingTop: 12,
    borderTopWidth: 1,
    flexDirection: "row",
    gap: 12,
  },
  addBtn: {
    flex: 1, flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 10,
    borderRadius: 16, paddingVertical: 17,
  },
  addBtnText: { fontSize: 16, fontWeight: "700", color: "#FFFFFF" },
  qtyRow: {
    flex: 1, flexDirection: "row", alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 16, borderWidth: 1, padding: 6,
  },
  qtyBtn: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
  },
  qtyCount: { fontSize: 15, fontWeight: "700" },
});