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
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: topPad + 20, paddingBottom: bottomPad + 130 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeIn.duration(600)} style={styles.logoRow}>
          <View style={styles.logoWrap}>
            <Image
              source={require("@/assets/images/mekazon-logo.png")}
              style={styles.logo}
              contentFit="contain"
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120).duration(600)} style={styles.header}>
          <Text style={styles.eyebrow}>Welcome home.</Text>
          <Text style={styles.headline}>Choose Your{"\n"}Home.</Text>
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
                entering={FadeInDown.delay(220 + index * 70).duration(450)}
              >
                <AnimatedPressable
                  style={[
                    styles.optionCard,
                    {
                      borderColor: isSelected ? "#4E7234" : "#DDE8C8",
                      backgroundColor: isSelected ? "#F0F5E8" : "#FFFFFF",
                      shadowOpacity: isSelected ? 0.12 : 0.05,
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
                    <Text style={[styles.optionName, { color: isSelected ? "#4E7234" : "#1E2414" }]}>
                      {option.name}
                    </Text>
                    <Text style={[styles.optionSubtitle, { color: isSelected ? "#728054" : "#9AAA7A" }]}>
                      {option.subtitle}
                    </Text>
                  </View>

                  {cardImage && (
                    <View style={styles.cardImageWrap}>
                      <Image
                        source={cardImage}
                        style={styles.cardImage}
                        contentFit="cover"
                      />
                      <LinearGradient
                        colors={["rgba(247,248,242,0)", "rgba(247,248,242,0.6)"]}
                        start={{ x: 1, y: 0 }}
                        end={{ x: 0, y: 0 }}
                        style={StyleSheet.absoluteFill}
                      />
                    </View>
                  )}

                  <View style={[styles.checkCircle, { borderColor: isSelected ? "#4E7234" : "#DDE8C8", backgroundColor: isSelected ? "#4E7234" : "transparent" }]}>
                    {isSelected && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                  </View>
                </AnimatedPressable>
              </Animated.View>
            );
          })}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: bottomPad + 16 }]}>
        <Animated.View style={btnAnimStyle}>
          <Pressable
            style={[
              styles.continueBtn,
              {
                backgroundColor: selected ? "#4E7234" : "#DDE8C8",
              },
            ]}
            onPress={handleContinue}
            disabled={!selected}
          >
            <Text style={[styles.continueBtnText, { color: selected ? "#FFFFFF" : "#9AAA7A" }]}>
              {selectedOption ? `Continue as ${selectedOption.name}` : "Select your home first"}
            </Text>
            {selected && <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />}
          </Pressable>
        </Animated.View>
        <Text style={styles.footerNote}>You can change this anytime in Profile</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8F2",
  },
  scroll: {
    paddingHorizontal: 22,
  },
  logoRow: {
    alignItems: "flex-start",
    marginBottom: 28,
  },
  logoWrap: {
    width: 56,
    height: 56,
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  logo: {
    width: 56,
    height: 56,
  },
  header: {
    marginBottom: 28,
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: "600",
    color: "#C4541A",
    letterSpacing: 0.4,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  headline: {
    fontSize: 36,
    fontWeight: "800",
    color: "#1E2414",
    letterSpacing: -1,
    lineHeight: 42,
    marginBottom: 12,
  },
  subheadline: {
    fontSize: 15,
    color: "#728054",
    lineHeight: 22,
  },
  options: {
    gap: 10,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 1.5,
    overflow: "hidden",
    height: 80,
    shadowColor: "#1E2414",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
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
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 3,
    letterSpacing: -0.2,
  },
  optionSubtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  cardImageWrap: {
    width: 80,
    height: "100%",
    position: "relative",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    marginLeft: 4,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 22,
    paddingTop: 14,
    backgroundColor: "#F7F8F2",
    borderTopWidth: 1,
    borderTopColor: "#DDE8C8",
    gap: 10,
  },
  continueBtn: {
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
  },
  footerNote: {
    fontSize: 12,
    color: "#9AAA7A",
    textAlign: "center",
    paddingBottom: 4,
  },
});
