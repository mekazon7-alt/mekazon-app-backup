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

import { useColors } from "@/hooks/useColors";
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
  const colors = useColors();
  const scale = useSharedValue(1);
  const lifestyleImage = basket.lifestyleImageKey
    ? LIFESTYLE_IMAGES[basket.lifestyleImageKey]
    : null;

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePress = () => {
    scale.value = withSpring(0.96, {}, () => {
      scale.value = withSpring(1);
    });
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
        colors={["rgba(0,0,0,0.08)", "rgba(0,0,0,0.72)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradient}
      />
      <View style={styles.content}>
        <View style={styles.top}>
          <View style={styles.basketBadge}>
            <Ionicons name="basket" size={12} color="rgba(255,255,255,0.9)" />
            <Text style={styles.basketBadgeText}>Basket</Text>
          </View>
        </View>
        <View style={styles.bottom}>
          <Text style={styles.name}>{basket.name}</Text>
          <Text style={styles.tagline}>{basket.tagline}</Text>
          <View style={styles.footer}>
            <Text style={styles.price}>AED {basket.price.toFixed(0)}</Text>
            <View style={styles.addBtn}>
              <Ionicons name="add" size={16} color="#1C1510" />
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
    width: 240,
    height: 180,
    borderRadius: 20,
    overflow: "hidden",
    marginRight: 14,
  },
  bgImage: {
    ...StyleSheet.absoluteFillObject,
  },
  bgColor: {
    ...StyleSheet.absoluteFillObject,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    padding: 16,
    justifyContent: "space-between",
  },
  top: {},
  basketBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  basketBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "rgba(255,255,255,0.9)",
    letterSpacing: 0.3,
  },
  bottom: {
    gap: 3,
  },
  name: {
    fontSize: 17,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.4,
  },
  tagline: {
    fontSize: 12,
    color: "rgba(255,255,255,0.72)",
    marginBottom: 8,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  price: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FAF7F2",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1C1510",
  },
});
