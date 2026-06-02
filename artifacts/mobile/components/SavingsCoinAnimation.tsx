import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";

interface Props {
  savings: number;
  visible: boolean;
}

// A real, rendered gold coin (no emoji — looks identical on every device).
// Exported so other screens (e.g. the cart summary) can reuse the same coin.
export function GoldCoin({ size = 22 }: { size?: number }) {
  return (
    <LinearGradient
      colors={["#FCE9A8", "#E7BC58", "#B8860B"]}
      start={{ x: 0.2, y: 0.1 }}
      end={{ x: 0.85, y: 0.95 }}
      style={[
        styles.goldCoin,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <View
        style={[
          styles.goldCoinRing,
          {
            width: size * 0.62,
            height: size * 0.62,
            borderRadius: (size * 0.62) / 2,
          },
        ]}
      />
    </LinearGradient>
  );
}

function FloatingCoin({ delay, x }: { delay: number; x: number }) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 200 }));
    translateY.value = withDelay(
      delay,
      withSequence(
        withTiming(-60, { duration: 600, easing: Easing.out(Easing.quad) }),
        withTiming(-90, { duration: 400, easing: Easing.in(Easing.quad) })
      )
    );
    // Fade out near end
    setTimeout(() => {
      opacity.value = withTiming(0, { duration: 300 });
    }, delay + 700);
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: x }, { translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.floatingCoin, style]}>
      <GoldCoin size={18} />
    </Animated.View>
  );
}

function CountingNumber({ target, duration }: { target: number; duration: number }) {
  const [displayed, setDisplayed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const steps = 30;
    const stepTime = duration / steps;
    const increment = target / steps;
    let current = 0;
    intervalRef.current = setInterval(() => {
      current += increment;
      if (current >= target) {
        setDisplayed(target);
        clearInterval(intervalRef.current!);
      } else {
        setDisplayed(Math.floor(current * 100) / 100);
      }
    }, stepTime);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [target]);

  return <Text style={styles.savingsAmount}>AED {displayed.toFixed(2)}</Text>;
}

export function SavingsCoinAnimation({ savings, visible }: Props) {
  const [showCoins, setShowCoins] = useState(false);
  const containerScale = useSharedValue(0.8);
  const prevSavings = useRef(savings);

  useEffect(() => {
    if (visible && savings > 0) {
      if (savings !== prevSavings.current) {
        setShowCoins(true);
        containerScale.value = withSequence(
          withSpring(1.05, { damping: 8 }),
          withSpring(1, { damping: 12 })
        );
        setTimeout(() => setShowCoins(false), 1200);
        prevSavings.current = savings;
      }
    }
  }, [savings, visible]);

  if (!visible || savings <= 0) return null;

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: containerScale.value }],
  }));

  return (
    <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(200)}>
      <Animated.View style={[styles.container, containerStyle]}>
        {/* Floating coins burst */}
        {showCoins && (
          <View style={styles.coinsContainer} pointerEvents="none">
            {[-40, -20, 0, 20, 40].map((x, i) => (
              <FloatingCoin key={i} delay={i * 80} x={x} />
            ))}
          </View>
        )}

        <View style={styles.row}>
          <GoldCoin size={26} />
          <View style={styles.textGroup}>
            <Text style={styles.label}>You're saving</Text>
            <CountingNumber target={savings} duration={600} />
          </View>
          <Ionicons
            name="sparkles"
            size={20}
            color="#E7A100"
            style={styles.celebrateIcon}
          />
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFF8E7",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: "#F59E0B",
    overflow: "visible",
  },
  coinsContainer: {
    position: "absolute",
    top: 0,
    left: "50%",
    height: 0,
    zIndex: 100,
  },
  floatingCoin: {
    position: "absolute",
  },
  goldCoin: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#8C6A1A",
  },
  goldCoinRing: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.55)",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  celebrateIcon: { marginLeft: "auto" },
  textGroup: { flex: 1, gap: 1 },
  label: {
    fontSize: 11,
    fontWeight: "600",
    color: "#92400E",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  savingsAmount: {
    fontSize: 20,
    fontWeight: "800",
    color: "#92400E",
    letterSpacing: -0.5,
  },
});