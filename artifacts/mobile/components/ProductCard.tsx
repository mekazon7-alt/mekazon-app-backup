import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { useColors } from "@/hooks/useColors";
import type { Product } from "@/constants/personalization";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
  product: Product;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ProductCard({ product }: ProductCardProps) {
  const colors = useColors();
  const { addItem, items } = useCart();
  const scale = useSharedValue(1);
  const cartItem = items.find((i) => i.id === product.id);

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handleAdd = () => {
    scale.value = withSpring(0.92, {}, () => {
      scale.value = withSpring(1);
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    addItem(product);
  };

  return (
    <AnimatedPressable style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }, animStyle]} onPress={handleAdd}>
      <View style={[styles.imagePlaceholder, { backgroundColor: product.cardColor }]}>
        {product.tag ? (
          <View style={[styles.tag, { backgroundColor: colors.primary }]}>
            <Text style={[styles.tagText, { color: colors.primaryForeground }]}>{product.tag}</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={2}>{product.name}</Text>
        <Text style={[styles.unit, { color: colors.mutedForeground }]}>{product.unit}</Text>
        <View style={styles.bottom}>
          <Text style={[styles.price, { color: colors.primary }]}>
            {product.currency} {product.price.toFixed(0)}
          </Text>
          <Pressable
            style={[styles.addBtn, { backgroundColor: cartItem ? colors.primary : colors.secondary }]}
            onPress={handleAdd}
          >
            {cartItem ? (
              <Text style={[styles.addBtnText, { color: colors.primaryForeground }]}>{cartItem.quantity}</Text>
            ) : (
              <Ionicons name="add" size={18} color={colors.secondaryForeground} />
            )}
          </Pressable>
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 148,
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    marginRight: 12,
  },
  imagePlaceholder: {
    height: 110,
    width: "100%",
  },
  tag: {
    position: "absolute",
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  info: {
    padding: 10,
  },
  name: {
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
    marginBottom: 2,
  },
  unit: {
    fontSize: 11,
    marginBottom: 8,
  },
  bottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  price: {
    fontSize: 15,
    fontWeight: "700",
  },
  addBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnText: {
    fontSize: 13,
    fontWeight: "700",
  },
});
