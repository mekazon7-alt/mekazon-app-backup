import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
} from "react";
import {
  Dimensions,
  StyleSheet,
  View,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
  Easing,
} from "react-native-reanimated";
import { Image } from "expo-image";

const { width: SW, height: SH } = Dimensions.get("window");

// Cart tab is roughly 2/5 across the screen
const CART_TAB_X = (2.5 / 5) * SW;
const CART_TAB_Y = SH - 50;

interface FlyItem {
  imageUrl?: string;
  imageKey?: string;
  startX: number;
  startY: number;
}

interface CartAnimationContextType {
  triggerFly: (item: FlyItem) => void;
}

const CartAnimationContext = createContext<CartAnimationContextType>({
  triggerFly: () => {},
});

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

function FlyingImage({
  item,
  onDone,
}: {
  item: FlyItem;
  onDone: () => void;
}) {
  const translateX = useSharedValue(item.startX);
  const translateY = useSharedValue(item.startY);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  React.useEffect(() => {
    // Fly to cart tab position
    translateX.value = withSpring(CART_TAB_X - 20, {
      damping: 20,
      stiffness: 120,
    });
    translateY.value = withTiming(CART_TAB_Y, {
      duration: 600,
      easing: Easing.in(Easing.quad),
    });
    scale.value = withTiming(0.3, { duration: 600 });
    opacity.value = withTiming(0, { duration: 550 }, (finished) => {
      if (finished) runOnJS(onDone)();
    });
  }, []);

  const style = useAnimatedStyle(() => ({
    position: "absolute",
    left: 0,
    top: 0,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
    width: 52,
    height: 52,
    borderRadius: 12,
    overflow: "hidden",
    zIndex: 9999,
  }));

  const localImg = item.imageKey ? PRODUCT_IMAGES[item.imageKey] : null;

  return (
    <Animated.View style={style}>
      {localImg ? (
        <Image source={localImg} style={{ width: 52, height: 52 }} contentFit="cover" />
      ) : item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={{ width: 52, height: 52 }} contentFit="cover" />
      ) : (
        <View style={{ width: 52, height: 52, backgroundColor: "#C4541A", borderRadius: 12 }} />
      )}
    </Animated.View>
  );
}

export function CartAnimationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [flyItems, setFlyItems] = useState<Array<FlyItem & { key: string }>>([]);

  const triggerFly = useCallback((item: FlyItem) => {
    const key = `fly-${Date.now()}-${Math.random()}`;
    setFlyItems((prev) => [...prev, { ...item, key }]);
  }, []);

  const removeFly = useCallback((key: string) => {
    setFlyItems((prev) => prev.filter((i) => i.key !== key));
  }, []);

  return (
    <CartAnimationContext.Provider value={{ triggerFly }}>
      <View style={{ flex: 1 }}>
        {children}
        {/* Overlay layer for flying items */}
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {flyItems.map((item) => (
            <FlyingImage
              key={item.key}
              item={item}
              onDone={() => removeFly(item.key)}
            />
          ))}
        </View>
      </View>
    </CartAnimationContext.Provider>
  );
}

export function useCartAnimation() {
  return useContext(CartAnimationContext);
}