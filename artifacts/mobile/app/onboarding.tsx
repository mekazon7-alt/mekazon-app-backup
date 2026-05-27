import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useHomeCountry } from "@/context/HomeCountryContext";
import { ONBOARDING_OPTIONS, type HomeCountry } from "@/constants/personalization";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { setHomeCountry } = useHomeCountry();
  const [selected, setSelected] = useState<HomeCountry | null>(null);
  const btnScale = useSharedValue(1);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const handleSelect = (id: HomeCountry) => {
    Haptics.selectionAsync();
    setSelected(id);
  };

  const handleContinue = async () => {
    if (!selected) return;
    btnScale.value = withSpring(0.95, {}, () => {
      btnScale.value = withSpring(1);
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await setHomeCountry(selected);
    router.replace("/(tabs)");
  };

  const btnAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
    opacity: selected ? 1 : 0.4,
  }));

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#0A0A0A", "#111111", "#0A0A0A"]}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: topPad + 20, paddingBottom: bottomPad + 120 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeIn.duration(600)} style={styles.logoRow}>
          <Image
            source={require("@/assets/images/mekazon-logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.header}>
          <Text style={styles.headline}>Choose Your Home.</Text>
          <Text style={styles.subheadline}>
            Mekazon personalizes everything — your products, baskets, and deals — based on where you come from.
          </Text>
        </Animated.View>

        <View style={styles.options}>
          {ONBOARDING_OPTIONS.map((option, index) => {
            const isSelected = selected === option.id;
            return (
              <Animated.View
                key={option.id}
                entering={FadeInDown.delay(300 + index * 80).duration(500)}
              >
                <AnimatedPressable
                  style={[
                    styles.optionCard,
                    {
                      borderColor: isSelected ? "#F5C400" : "#2A2A2A",
                      backgroundColor: isSelected ? "rgba(245,196,0,0.07)" : "#141414",
                    },
                  ]}
                  onPress={() => handleSelect(option.id)}
                >
                  <View style={styles.flagBar}>
                    {option.flagColors.map((color, i) => (
                      <View key={i} style={[styles.flagStripe, { backgroundColor: color }]} />
                    ))}
                  </View>
                  <View style={styles.optionContent}>
                    <Text style={[styles.optionName, { color: isSelected ? "#F5C400" : "#FFFFFF" }]}>
                      {option.name}
                    </Text>
                    <Text style={styles.optionSubtitle} numberOfLines={1}>{option.subtitle}</Text>
                  </View>
                  {isSelected ? (
                    <Ionicons name="checkmark-circle" size={22} color="#F5C400" style={styles.check} />
                  ) : (
                    <Ionicons name="chevron-forward" size={18} color="#555" style={styles.check} />
                  )}
                </AnimatedPressable>
              </Animated.View>
            );
          })}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: bottomPad + 16 }]}>
        <Animated.View style={btnAnimStyle}>
          <Pressable
            style={[styles.continueBtn, { opacity: selected ? 1 : 0.5 }]}
            onPress={handleContinue}
            disabled={!selected}
          >
            <Text style={styles.continueBtnText}>
              {selected ? `Enter as ${ONBOARDING_OPTIONS.find((o) => o.id === selected)?.name}` : "Select your home first"}
            </Text>
            {selected ? <Ionicons name="arrow-forward" size={20} color="#0A0A0A" /> : null}
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0A",
  },
  scroll: {
    paddingHorizontal: 20,
  },
  logoRow: {
    alignItems: "center",
    marginBottom: 28,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 18,
  },
  header: {
    marginBottom: 28,
  },
  headline: {
    fontSize: 32,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -1,
    marginBottom: 10,
  },
  subheadline: {
    fontSize: 15,
    color: "#888888",
    lineHeight: 22,
  },
  options: {
    gap: 10,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1.5,
    overflow: "hidden",
  },
  flagBar: {
    width: 6,
    height: "100%",
    flexDirection: "column",
    minHeight: 72,
  },
  flagStripe: {
    flex: 1,
  },
  optionContent: {
    flex: 1,
    paddingVertical: 18,
    paddingLeft: 16,
    paddingRight: 8,
  },
  optionName: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  optionSubtitle: {
    fontSize: 12,
    color: "#666666",
  },
  check: {
    marginRight: 16,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: "rgba(10,10,10,0.95)",
    borderTopWidth: 1,
    borderTopColor: "#1E1E1E",
  },
  continueBtn: {
    backgroundColor: "#F5C400",
    borderRadius: 16,
    paddingVertical: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  continueBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0A0A0A",
  },
});
