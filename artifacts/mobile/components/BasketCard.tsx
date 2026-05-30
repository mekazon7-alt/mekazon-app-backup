import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import type { Basket } from "@/constants/personalization";
import { useCart } from "@/context/CartContext";
import { useColors } from "@/hooks/useColors";
import { useImageStore } from "@/context/ImageStoreContext";

const LIFESTYLE_IMAGES: Record<string, ReturnType<typeof require>> = {
  "lifestyle-ugali": require("@/assets/images/lifestyle-ugali.png"),
  "lifestyle-injera": require("@/assets/images/lifestyle-injera.png"),
  "lifestyle-matooke": require("@/assets/images/lifestyle-matooke.png"),
  "lifestyle-coffee": require("@/assets/images/lifestyle-coffee.png"),
  "lifestyle-spices": require("@/assets/images/lifestyle-spices.png"),
  "hero-pan-african": require("@/assets/images/hero-pan-african.png"),
  "hero-kenya": require("@/assets/images/hero-kenya.png"),
};

interface BasketCardProps {
  basket: Basket;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function BasketCard({ basket }: BasketCardProps) {
  const scale = useSharedValue(1);
  const colors = useColors();
  const { uriMap } = useImageStore();
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  const storedUri = uriMap["basket:" + basket.id];
  const lifestyleImage = storedUri
    ? { uri: storedUri }
    : basket.lifestyleImageKey
      ? LIFESTYLE_IMAGES[basket.lifestyleImageKey]
      : null;

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePress = () => {
    scale.value = withSpring(0.97, {}, () => { scale.value = withSpring(1); });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowDetail(true);
  };

  const handleAddToCart = () => {
    addItem({
      id: basket.id,
      name: basket.name,
      description: basket.tagline ?? "",
      price: basket.price,
      currency: basket.currency ?? "AED",
      unit: "basket",
      cardColor: basket.cardColor ?? "#C8581C",
      tag: "Basket",
    });
    setAdded(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <>
      <AnimatedPressable style={[styles.card, animStyle]} onPress={handlePress}>
        {lifestyleImage ? (
          <Image source={lifestyleImage} style={styles.bgImage} contentFit="cover" />
        ) : (
          <View style={[styles.bgColor, { backgroundColor: basket.cardColor }]} />
        )}
        <LinearGradient
          colors={["rgba(255,255,255,0)", "rgba(20,24,16,0.62)"]}
          start={{ x: 0, y: 0.3 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.content}>
          <View style={styles.topBadge}>
            <View style={styles.basketBadge}>
              <Ionicons name="basket-outline" size={11} color="rgba(255,255,255,0.9)" />
              <Text style={styles.basketBadgeText}>Basket</Text>
            </View>
          </View>
          <View style={styles.bottomContent}>
            <Text style={styles.name} numberOfLines={1}>{basket.name}</Text>
            <Text style={styles.tagline} numberOfLines={1}>{basket.tagline}</Text>
            <View style={styles.footer}>
              <Text style={styles.price}>AED {basket.price.toFixed(0)}</Text>
              <Pressable
                style={[styles.addBtn, added && styles.addBtnAdded]}
                onPress={(e) => { e.stopPropagation(); handleAddToCart(); }}
                hitSlop={8}
              >
                <Ionicons name={added ? "checkmark" : "add"} size={14} color={added ? "#FFFFFF" : "#1E2414"} />
                <Text style={[styles.addBtnText, added && styles.addBtnTextAdded]}>
                  {added ? "Added" : "Add"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </AnimatedPressable>

      {/* Basket Detail Sheet */}
      <Modal visible={showDetail} animationType="slide" transparent statusBarTranslucent onRequestClose={() => setShowDetail(false)}>
        <Pressable style={styles.overlay} onPress={() => setShowDetail(false)} />
        <Animated.View
          entering={FadeInDown.duration(300)}
          style={[styles.sheet, { backgroundColor: colors.background }]}
        >
          {/* Hero image */}
          <View style={styles.sheetHero}>
            {lifestyleImage ? (
              <Image source={lifestyleImage} style={styles.sheetHeroImage} contentFit="cover" />
            ) : (
              <View style={[styles.sheetHeroImage, { backgroundColor: basket.cardColor }]} />
            )}
            <LinearGradient
              colors={["transparent", "rgba(15,18,10,0.7)"]}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.sheetHeroContent}>
              <View style={styles.basketBadge}>
                <Ionicons name="basket-outline" size={11} color="rgba(255,255,255,0.9)" />
                <Text style={styles.basketBadgeText}>Basket</Text>
              </View>
              <Text style={styles.sheetName}>{basket.name}</Text>
              <Text style={styles.sheetTagline}>{basket.tagline}</Text>
            </View>
            <Pressable
              style={[styles.closeBtn, { backgroundColor: colors.card }]}
              onPress={() => setShowDetail(false)}
              hitSlop={8}
            >
              <Ionicons name="close" size={18} color={colors.foreground} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.sheetBody}
          >
            {/* Included items */}
            <Text style={[styles.includedLabel, { color: colors.mutedForeground }]}>
              INCLUDED IN THIS BASKET
            </Text>
            {basket.items.map((item, idx) => (
              <View
                key={idx}
                style={[styles.itemRow, { borderBottomColor: colors.border }]}
              >
                <View style={[styles.itemDot, { backgroundColor: basket.cardColor + "55" }]}>
                  <Ionicons name="checkmark" size={12} color={basket.cardColor} />
                </View>
                <Text style={[styles.itemText, { color: colors.foreground }]}>{item}</Text>
              </View>
            ))}

            {/* Price + CTA */}
            <View style={[styles.sheetFooter, { borderTopColor: colors.border }]}>
              <View>
                <Text style={[styles.totalLabel, { color: colors.mutedForeground }]}>Total</Text>
                <Text style={[styles.totalPrice, { color: colors.foreground }]}>
                  AED {basket.price.toFixed(0)}
                </Text>
              </View>
              <Pressable
                style={[
                  styles.sheetAddBtn,
                  { backgroundColor: added ? "#4A7A32" : colors.primary },
                ]}
                onPress={() => { handleAddToCart(); setShowDetail(false); }}
              >
                <Ionicons name={added ? "checkmark" : "basket-outline"} size={16} color="#FFFFFF" />
                <Text style={styles.sheetAddBtnText}>
                  {added ? "Added to Cart" : "Add to Cart"}
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </Animated.View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 248,
    height: 186,
    borderRadius: 22,
    overflow: "hidden",
    marginRight: 14,
    shadowColor: "#1E2414",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  bgImage: { ...StyleSheet.absoluteFillObject },
  bgColor: { ...StyleSheet.absoluteFillObject },
  content: {
    flex: 1,
    padding: 16,
    justifyContent: "space-between",
  },
  topBadge: {},
  basketBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignSelf: "flex-start",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
  },
  basketBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "rgba(255,255,255,0.95)",
    letterSpacing: 0.3,
  },
  bottomContent: { gap: 3 },
  name: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 12,
    color: "rgba(255,255,255,0.75)",
    marginBottom: 10,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  price: {
    fontSize: 19,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 20,
  },
  addBtnAdded: {
    backgroundColor: "#4A7A32",
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1E2414",
  },
  addBtnTextAdded: {
    color: "#FFFFFF",
  },

  // Detail sheet
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
    maxHeight: "88%",
  },
  sheetHero: {
    height: 190,
    position: "relative",
  },
  sheetHeroImage: {
    width: "100%",
    height: "100%",
  },
  sheetHeroContent: {
    position: "absolute",
    bottom: 16,
    left: 18,
    right: 50,
    gap: 4,
  },
  sheetName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.5,
    marginTop: 6,
  },
  sheetTagline: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
  },
  closeBtn: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetBody: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  includedLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginTop: 20,
    marginBottom: 10,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 11,
    borderBottomWidth: 1,
  },
  itemDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  itemText: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  sheetFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 2,
  },
  totalPrice: {
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.8,
  },
  sheetAddBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 16,
  },
  sheetAddBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});