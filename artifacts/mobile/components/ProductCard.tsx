import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { useColors } from "@/hooks/useColors";
import type { Product } from "@/constants/personalization";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useCartAnimation } from "@/context/CartAnimationContext";
import { useRef } from "react";
import { View as RNView } from "react-native";
import { USE_MOCK } from "@/services/shopify/client";

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

interface ProductCardProps {
  product: Product;
  cardStyle?: ViewStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ProductCard({ product, cardStyle }: ProductCardProps) {
  const colors = useColors();
  const { addItem, items } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const scale = useSharedValue(1);
  const addScale = useSharedValue(1);
  const cartItem = items.find((i) => i.id === product.id);
  const productImage = product.imageKey ? PRODUCT_IMAGES[product.imageKey] : null;
  const { triggerFly } = useCartAnimation();
  const cardRef = useRef<any>(null);
  const wishlisted = isWishlisted(product.id);

  const hasDiscount = !!product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPct = hasDiscount
    ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
    : 0;

  const cardAnimStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const addAnimStyle = useAnimatedStyle(() => ({ transform: [{ scale: addScale.value }] }));

  // Tap card → open product detail
  const handleCardPress = () => {
    scale.value = withSpring(0.96, {}, () => { scale.value = withSpring(1); });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: "/product-detail",
      params: { product: encodeURIComponent(JSON.stringify(product)) },
    });
  };

  // Tap + button → add to cart directly
  const handleAdd = (e: any) => {
    e.stopPropagation?.();
    addScale.value = withSpring(0.85, {}, () => { addScale.value = withSpring(1); });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Trigger fly animation from card position
    if (cardRef.current) {
      cardRef.current.measure((_x: number, _y: number, w: number, h: number, px: number, py: number) => {
        triggerFly({
          imageUrl: product.remoteImageUrl,
          imageKey: product.imageKey,
          startX: px + w / 2 - 26,
          startY: py + h / 2 - 26,
        });
      });
    }
    addItem(product);
  };

  const isProductStyle = product.imageKey?.startsWith("product-");
  const hasRemoteImage = !productImage && !!product.remoteImageUrl;

  return (
    <AnimatedPressable
      ref={cardRef}
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }, cardAnimStyle, cardStyle]}
      onPress={handleCardPress}
    >
      <View style={[
        styles.imageArea,
        {
          backgroundColor: productImage || hasRemoteImage
            ? isProductStyle ? "#F4F6EE" : colors.muted
            : product.cardColor + "22",
        },
      ]}>
        {productImage ? (
          <Image
            source={productImage}
            style={isProductStyle ? styles.productImageContain : styles.productImageCover}
            contentFit={isProductStyle ? "contain" : "cover"}
          />
        ) : hasRemoteImage ? (
          <Image source={{ uri: product.remoteImageUrl }} style={styles.productImageCover} contentFit="cover" />
        ) : (
          <View style={[styles.colorDot, { backgroundColor: product.cardColor }]} />
        )}

        {/* Discount badge takes priority over tag */}
        {hasDiscount ? (
          <View style={styles.discountBadge}>
            <Text style={styles.discountBadgeText}>-{discountPct}%</Text>
          </View>
        ) : product.tag ? (
          <View style={[styles.tag, { backgroundColor: colors.accent }]}>
            <Text style={[styles.tagText, { color: colors.accentForeground }]}>{product.tag}</Text>
          </View>
        ) : null}

        {USE_MOCK && (
          <View style={styles.demoBadge}>
            <Text style={styles.demoBadgeText}>Demo</Text>
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={2}>{product.name}</Text>
        <Text style={[styles.unit, { color: colors.mutedForeground }]}>{product.unit}</Text>
        <View style={styles.bottom}>
          {USE_MOCK ? (
            <View style={styles.mockPriceWrap}>
              <Text style={[styles.mockPriceLabel, { color: colors.mutedForeground }]}>Connect Shopify</Text>
            </View>
          ) : (
            <View>
              {hasDiscount && (
                <Text style={[styles.compareAt, { color: colors.mutedForeground }]}>
                  AED {product.compareAtPrice!.toFixed(0)}
                </Text>
              )}
              <View style={styles.priceRow}>
                <Text style={[styles.currency, { color: colors.mutedForeground }]}>AED</Text>
                <Text style={[styles.price, { color: hasDiscount ? colors.accent : colors.foreground }]}>
                  {product.price.toFixed(0)}
                </Text>
              </View>
            </View>
          )}
          <Animated.View style={addAnimStyle}>
            <Pressable
              style={[
                styles.addBtn,
                {
                  backgroundColor: cartItem ? colors.primary : colors.secondary,
                  borderColor: cartItem ? colors.primary : colors.border,
                },
              ]}
              onPress={handleAdd}
            >
              {cartItem ? (
                <Text style={[styles.addBtnCount, { color: colors.primaryForeground }]}>{cartItem.quantity}</Text>
              ) : (
                <Ionicons name="add" size={18} color={colors.mutedForeground} />
              )}
            </Pressable>
          </Animated.View>
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 152, borderRadius: 18, borderWidth: 1,
    overflow: "hidden", marginRight: 12,
    shadowColor: "#1E2414", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  imageArea: { height: 120, width: "100%", alignItems: "center", justifyContent: "center" },
  productImageContain: { width: "85%", height: "85%" },
  productImageCover: { width: "100%", height: "100%" },
  colorDot: { width: 48, height: 48, borderRadius: 24, opacity: 0.7 },
  tag: { position: "absolute", top: 8, left: 8, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  tagText: { fontSize: 10, fontWeight: "700", letterSpacing: 0.3 },
  discountBadge: {
    position: "absolute", top: 8, left: 8,
    backgroundColor: "#C4541A",
    paddingHorizontal: 7, paddingVertical: 3, borderRadius: 20,
  },
  discountBadgeText: { fontSize: 10, fontWeight: "800", color: "#FFF" },
  info: { padding: 12 },
  name: { fontSize: 13, fontWeight: "600", lineHeight: 18, marginBottom: 2 },
  unit: { fontSize: 11, marginBottom: 10 },
  bottom: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" },
  compareAt: { fontSize: 10, textDecorationLine: "line-through", marginBottom: 1 },
  priceRow: { flexDirection: "row", alignItems: "flex-end", gap: 1 },
  currency: { fontSize: 10, fontWeight: "500", marginBottom: 1 },
  price: { fontSize: 17, fontWeight: "800", letterSpacing: -0.4 },
  demoBadge: {
    position: "absolute", top: 8, right: 8,
    backgroundColor: "rgba(200, 88, 28, 0.88)",
    paddingHorizontal: 7, paddingVertical: 3, borderRadius: 10,
  },
  demoBadgeText: { fontSize: 9, fontWeight: "700", color: "#FFFFFF", letterSpacing: 0.5 },
  mockPriceWrap: { justifyContent: "flex-end", paddingBottom: 2 },
  mockPriceLabel: { fontSize: 10, fontWeight: "600", letterSpacing: -0.1 },
  addBtn: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: "center", justifyContent: "center", borderWidth: 1,
  },
  addBtnCount: { fontSize: 13, fontWeight: "700" },
});