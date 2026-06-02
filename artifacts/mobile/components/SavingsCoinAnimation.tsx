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
import { Audio } from "expo-av";

interface Props {
  savings: number;
  visible: boolean;
}

const COINS = ["🪙", "💰", "🪙", "💵", "🪙"];

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

  const coin = COINS[Math.floor(Math.abs(x) % COINS.length)];

  return (
    <Animated.Text style={[styles.floatingCoin, style]}>{coin}</Animated.Text>
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
          <Text style={styles.coinEmoji}>🪙</Text>
          <View style={styles.textGroup}>
            <Text style={styles.label}>You're saving</Text>
            <CountingNumber target={savings} duration={600} />
          </View>
          <Text style={styles.celebrateEmoji}>🎉</Text>
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
    fontSize: 18,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  coinEmoji: { fontSize: 22 },
  celebrateEmoji: { fontSize: 20, marginLeft: "auto" },
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