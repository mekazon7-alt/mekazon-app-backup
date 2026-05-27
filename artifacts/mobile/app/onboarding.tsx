import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
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

const CARD_IMAGES: Record<string, ReturnType<typeof require>> = {
  "lifestyle-matooke": require("@/assets/images/lifestyle-matooke.png"),
  "lifestyle-ugali": require("@/assets/images/lifestyle-ugali.png"),
  "lifestyle-injera": require("@/assets/images/lifestyle-injera.png"),
  "hero-pan-african": require("@/assets/images/hero-pan-african.png"),
};

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
  }));

  const selectedOption = ONBOARDING_OPTIONS.find((o) => o.id === selected);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#1A0E06", "#241408", "#1A0E06"]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: topPad + 20, paddingBottom: bottomPad + 130 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeIn.duration(700)} style={styles.logoRow}>
          <Image
            source={require("@/assets/images/mekazon-logo.png")}
            style={styles.logo}
            contentFit="contain"
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(150).duration(600)} style={styles.header}>
          <Text style={styles.welcome}>Welcome home.</Text>
          <Text style={styles.headline}>Choose Your Home.</Text>
          <Text style={styles.subheadline}>
            We'll personalize your products, baskets, and deals for where you come from.
          </Text>
        </Animated.View>

        <View style={styles.options}>
          {ONBOARDING_OPTIONS.map((option, index) => {
            const isSelected = selected === option.id;
            const cardImage = CARD_IMAGES[option.cardImageKey];
            return (
              <Animated.View
                key={option.id}
                entering={FadeInDown.delay(250 + index * 80).duration(500)}
              >
                <AnimatedPressable
                  style={[
                    styles.optionCard,
                    {
                      borderColor: isSelected ? "#E07030" : "rgba(255,255,255,0.1)",
                      shadowColor: isSelected ? "#E07030" : "transparent",
                      shadowOpacity: isSelected ? 0.4 : 0,
                      shadowRadius: 12,
                      elevation: isSelected ? 8 : 0,
                    },
                  ]}
                  onPress={() => handleSelect(option.id)}
                >
                  {cardImage && (
                    <Image
                      source={cardImage}
                      style={styles.cardBgImage}
                      contentFit="cover"
                    />
                  )}
                  <LinearGradient
                    colors={
                      isSelected
                        ? ["rgba(224,112,48,0.55)", "rgba(26,14,6,0.88)"]
                        : ["rgba(26,14,6,0.45)", "rgba(26,14,6,0.82)"]
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.cardOverlay}
                  >
                    <View style={styles.flagBar}>
                      {option.flagColors.map((color, i) => (
                        <View key={i} style={[styles.flagStripe, { backgroundColor: color }]} />
                      ))}
                    </View>
                    <View style={styles.optionContent}>
                      <Text style={[styles.optionName, { color: isSelected ? "#FFCF92" : "#FFFFFF" }]}>
                        {option.name}
                      </Text>
                      <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
                    </View>
                    {isSelected ? (
                      <Ionicons name="checkmark-circle" size={24} color="#E07030" style={styles.check} />
                    ) : (
                      <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.4)" style={styles.check} />
                    )}
                  </LinearGradient>
                </AnimatedPressable>
              </Animated.View>
            );
          })}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: bottomPad + 16 }]}>
        <Animated.View style={btnAnimStyle}>
          <Pressable
            style={[styles.continueBtn, { opacity: selected ? 1 : 0.45 }]}
            onPress={handleContinue}
            disabled={!selected}
          >
            <Text style={styles.continueBtnText}>
              {selectedOption
                ? `Enter as ${selectedOption.name}`
                : "Select your home first"}
            </Text>
            {selected ? <Ionicons name="arrow-forward" size={20} color="#FFFFFF" /> : null}
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1A0E06",
  },
  scroll: {
    paddingHorizontal: 20,
  },
  logoRow: {
    alignItems: "center",
    marginBottom: 26,
  },
  logo: {
    width: 68,
    height: 68,
    borderRadius: 16,
  },
  header: {
    marginBottom: 24,
  },
  welcome: {
    fontSize: 14,
    fontWeight: "600",
    color: "#E07030",
    letterSpacing: 0.5,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  headline: {
    fontSize: 30,
    fontWeight: "800",
    color: "#FAF0E4",
    letterSpacing: -0.8,
    marginBottom: 10,
  },
  subheadline: {
    fontSize: 15,
    color: "rgba(250,240,228,0.6)",
    lineHeight: 22,
  },
  options: {
    gap: 10,
  },
  optionCard: {
    height: 88,
    borderRadius: 18,
    borderWidth: 1.5,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 4 },
  },
  cardBgImage: {
    ...StyleSheet.absoluteFillObject,
  },
  cardOverlay: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  flagBar: {
    width: 5,
    height: "100%",
    flexDirection: "column",
  },
  flagStripe: {
    flex: 1,
  },
  optionContent: {
    flex: 1,
    paddingVertical: 16,
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
    color: "rgba(250,240,228,0.6)",
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
    paddingTop: 14,
    backgroundColor: "rgba(26,14,6,0.96)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
  },
  continueBtn: {
    backgroundColor: "#C8581C",
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
    color: "#FFFFFF",
  },
});
