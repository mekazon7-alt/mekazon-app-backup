import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
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
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ProductCard({ product }: ProductCardProps) {
  const colors = useColors();
  const { addItem, items } = useCart();
  const scale = useSharedValue(1);
  const cartItem = items.find((i) => i.id === product.id);
  const productImage = product.imageKey ? PRODUCT_IMAGES[product.imageKey] : null;

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handleAdd = () => {
    scale.value = withSpring(0.93, {}, () => {
      scale.value = withSpring(1);
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    addItem(product);
  };

  return (
    <AnimatedPressable
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          shadowColor: colors.foreground,
        },
        animStyle,
      ]}
      onPress={handleAdd}
    >
      <View style={[styles.imageArea, { backgroundColor: productImage ? colors.muted : product.cardColor }]}>
        {productImage ? (
          <Image
            source={productImage}
            style={styles.productImage}
            contentFit="contain"
          />
        ) : (
          <View style={styles.colorBlock} />
        )}
        {product.tag ? (
          <View style={[styles.tag, { backgroundColor: colors.primary }]}>
            <Text style={[styles.tagText, { color: colors.primaryForeground }]}>{product.tag}</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={[styles.unit, { color: colors.mutedForeground }]}>{product.unit}</Text>
        <View style={styles.bottom}>
          <Text style={[styles.price, { color: colors.foreground }]}>
            <Text style={styles.currency}>AED </Text>
            {product.price.toFixed(0)}
          </Text>
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
              <Text style={[styles.addBtnCount, { color: colors.primaryForeground }]}>
                {cartItem.quantity}
              </Text>
            ) : (
              <Ionicons name="add" size={18} color={colors.mutedForeground} />
            )}
          </Pressable>
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 152,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    marginRight: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  imageArea: {
    height: 118,
    width: "100%",
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  colorBlock: {
    ...StyleSheet.absoluteFillObject,
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
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  currency: {
    fontSize: 11,
    fontWeight: "500",
  },
  addBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  addBtnCount: {
    fontSize: 13,
    fontWeight: "700",
  },
});
