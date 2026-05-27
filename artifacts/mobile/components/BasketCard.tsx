import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import type { Basket } from "@/constants/personalization";

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
  const lifestyleImage = basket.lifestyleImageKey ? LIFESTYLE_IMAGES[basket.lifestyleImageKey] : null;

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePress = () => {
    scale.value = withSpring(0.97, {}, () => { scale.value = withSpring(1); });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
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
            <View style={styles.addBtn}>
              <Ionicons name="add" size={14} color="#1E2414" />
              <Text style={styles.addBtnText}>Add</Text>
            </View>
          </View>
        </View>
      </View>
    </AnimatedPressable>
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
  addBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1E2414",
  },
});
