import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
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

interface BasketCardProps {
  basket: Basket;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function BasketCard({ basket }: BasketCardProps) {
  const colors = useColors();
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePress = () => {
    scale.value = withSpring(0.96, {}, () => {
      scale.value = withSpring(1);
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <AnimatedPressable style={[styles.card, animStyle]} onPress={handlePress}>
      <LinearGradient
        colors={[basket.cardColor, darken(basket.cardColor, 0.4)]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.top}>
            <Text style={styles.name}>{basket.name}</Text>
            <Text style={styles.tagline}>{basket.tagline}</Text>
          </View>
          <View style={styles.items}>
            {basket.items.slice(0, 3).map((item, i) => (
              <View key={i} style={styles.itemPill}>
                <Text style={styles.itemText}>{item}</Text>
              </View>
            ))}
            {basket.items.length > 3 && (
              <View style={styles.itemPill}>
                <Text style={styles.itemText}>+{basket.items.length - 3} more</Text>
              </View>
            )}
          </View>
          <View style={styles.bottom}>
            <Text style={styles.price}>
              {basket.currency} {basket.price.toFixed(0)}
            </Text>
            <View style={styles.addBtn}>
              <Ionicons name="bag-add" size={16} color="#0A0A0A" />
              <Text style={styles.addBtnText}>Add Basket</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </AnimatedPressable>
  );
}

function darken(hex: string, amount: number): string {
  const num = parseInt(hex.slice(1), 16);
  const r = Math.max(0, (num >> 16) - Math.round(255 * amount));
  const g = Math.max(0, ((num >> 8) & 0xff) - Math.round(255 * amount));
  const b = Math.max(0, (num & 0xff) - Math.round(255 * amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

const styles = StyleSheet.create({
  card: {
    width: 240,
    height: 170,
    borderRadius: 18,
    overflow: "hidden",
    marginRight: 14,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
    justifyContent: "space-between",
  },
  top: {
    gap: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },
  tagline: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
  },
  items: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  itemPill: {
    backgroundColor: "rgba(0,0,0,0.25)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  itemText: {
    fontSize: 10,
    color: "rgba(255,255,255,0.9)",
    fontWeight: "500",
  },
  bottom: {
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
    gap: 5,
    backgroundColor: "#F5C400",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0A0A0A",
  },
});
