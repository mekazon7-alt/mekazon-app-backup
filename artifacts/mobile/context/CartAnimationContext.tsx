import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { Animated, Dimensions, Image, StyleSheet, View } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface FlyItem {
  id: string;
  imageSource: any;
  startX: number;
  startY: number;
  translateX: Animated.Value;
  translateY: Animated.Value;
  scale: Animated.Value;
  opacity: Animated.Value;
}

interface CartAnimationContextType {
  cartIconPosition: React.MutableRefObject<{ x: number; y: number }>;
  triggerFly: (imageSource: any, startX: number, startY: number) => void;
}

const CartAnimationContext = createContext<CartAnimationContextType>({
  cartIconPosition: { current: { x: SCREEN_WIDTH * 0.6, y: SCREEN_HEIGHT - 50 } },
  triggerFly: () => {},
});

export function CartAnimationProvider({ children }: { children: React.ReactNode }) {
  const [flyItems, setFlyItems] = useState<FlyItem[]>([]);
  const cartIconPosition = useRef({ x: SCREEN_WIDTH * 0.6, y: SCREEN_HEIGHT - 50 });

  const triggerFly = useCallback(
    (imageSource: any, startX: number, startY: number) => {
      const id = Math.random().toString(36).slice(2);
      const translateX = new Animated.Value(0);
      const translateY = new Animated.Value(0);
      const scale = new Animated.Value(1);
      const opacity = new Animated.Value(1);

      const targetX = cartIconPosition.current.x - startX;
      const targetY = cartIconPosition.current.y - startY;

      const newItem: FlyItem = {
        id,
        imageSource,
        startX,
        startY,
        translateX,
        translateY,
        scale,
        opacity,
      };

      setFlyItems((prev) => [...prev, newItem]);

      Animated.parallel([
        Animated.timing(translateX, {
          toValue: targetX,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: targetY,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 1.15,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 0.15,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.delay(400),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        setFlyItems((prev) => prev.filter((item) => item.id !== id));
      });
    },
    []
  );

  return (
    <CartAnimationContext.Provider value={{ cartIconPosition, triggerFly }}>
      {children}
      {flyItems.map((item) => (
        <Animated.View
          key={item.id}
          pointerEvents="none"
          style={[
            styles.flyingItem,
            {
              left: item.startX - 24,
              top: item.startY - 24,
              transform: [
                { translateX: item.translateX },
                { translateY: item.translateY },
                { scale: item.scale },
              ],
              opacity: item.opacity,
            },
          ]}
        >
          {item.imageSource ? (
            <Image
              source={item.imageSource}
              style={styles.flyingImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.flyingImage, { backgroundColor: "#C4541A" }]} />
          )}
        </Animated.View>
      ))}
    </CartAnimationContext.Provider>
  );
}

export function useCartAnimation() {
  return useContext(CartAnimationContext);
}

const styles = StyleSheet.create({
  flyingItem: {
    position: "absolute",
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: "hidden",
    zIndex: 9999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  flyingImage: {
    width: "100%",
    height: "100%",
  },
});