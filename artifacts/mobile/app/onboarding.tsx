import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  Dimensions,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  withDelay,
  runOnJS,
  Easing,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useHomeCountry } from "@/context/HomeCountryContext";
import { useLanguage } from "@/context/LanguageContext";
import { ONBOARDING_OPTIONS, type HomeCountry } from "@/constants/personalization";
import { Analytics } from "@/services/analytics";
import {
  type SupportedLanguage,
  COUNTRY_SUGGESTED_LANGUAGE,
} from "@/lib/i18n";

const { width: SW, height: SH } = Dimensions.get("window");

const CARD_IMAGES: Record<string, ReturnType<typeof require>> = {
  "lifestyle-matooke": require("@/assets/images/lifestyle-matooke.png"),
  "lifestyle-ugali": require("@/assets/images/lifestyle-ugali.png"),
  "lifestyle-injera": require("@/assets/images/lifestyle-injera.png"),
  "hero-pan-african": require("@/assets/images/hero-pan-african.png"),
};

const CARD_LAYOUT = [
  { left: SW * 0.04, top: SH * 0.30, rotate: "-4deg", width: SW * 0.52, floatDelay: 0 },
  { left: SW * 0.44, top: SH * 0.38, rotate: "3deg",  width: SW * 0.50, floatDelay: 300 },
  { left: SW * 0.06, top: SH * 0.52, rotate: "-2deg", width: SW * 0.54, floatDelay: 600 },
  { left: SW * 0.38, top: SH * 0.62, rotate: "5deg",  width: SW * 0.52, floatDelay: 150 },
  { left: SW * 0.10, top: SH * 0.74, rotate: "-3deg", width: SW * 0.48, floatDelay: 450 },
];

const LANGUAGE_OPTIONS: Array<{
  id: SupportedLanguage;
  label: string;
  nativeLabel: string;
}> = [
  { id: "en", label: "English", nativeLabel: "English" },
  { id: "ar", label: "Arabic", nativeLabel: "العربية" },
  { id: "am", label: "Amharic", nativeLabel: "አማርኛ" },
  { id: "sw", label: "Swahili", nativeLabel: "Kiswahili" },
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Drifting watermark word
function DriftingWatermark() {
  const x = useSharedValue(-SW * 0.5);

  useEffect(() => {
    x.value = withRepeat(
      withTiming(SW * 1.2, {
        duration: 14000,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
  }));

  return (
    <Animated.Text
      pointerEvents="none"
      style={[styles.watermark, style]}
    >
      MEKAZON
    </Animated.Text>
  );
}

function FloatingCard({
  option,
  layout,
  onSelect,
  isSelected,
  isAnySelected,
}: {
  option: typeof ONBOARDING_OPTIONS[0];
  layout: typeof CARD_LAYOUT[0];
  onSelect: () => void;
  isSelected: boolean;
  isAnySelected: boolean;
}) {
  const floatY = useSharedValue(0);
  const scale = useSharedValue(0);
  const selectScale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const cardImage = CARD_IMAGES[option.cardImageKey];

  useEffect(() => {
    scale.value = withDelay(
      layout.floatDelay,
      withSpring(1, { damping: 14, stiffness: 90 })
    );
    floatY.value = withDelay(
      layout.floatDelay,
      withRepeat(
        withSequence(
          withTiming(-10, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
          withTiming(10, { duration: 2200, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      )
    );
  }, []);

  useEffect(() => {
    if (isSelected) {
      selectScale.value = withSequence(
        withSpring(1.12, { damping: 10 }),
        withSpring(1.06, { damping: 12 })
      );
      opacity.value = withTiming(1, { duration: 200 });
    } else if (isAnySelected) {
      opacity.value = withTiming(0, { duration: 300 });
      selectScale.value = withTiming(0.88, { duration: 300 });
    } else {
      opacity.value = withTiming(1, { duration: 300 });
      selectScale.value = withSpring(1);
    }
  }, [isSelected, isAnySelected]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: floatY.value },
      { scale: scale.value * selectScale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <AnimatedPressable
      style={[
        styles.floatingCard,
        {
          left: layout.left,
          top: layout.top,
          width: layout.width,
          transform: [{ rotate: layout.rotate }],
          borderColor: isSelected ? "rgba(196,84,26,0.8)" : "rgba(255,255,255,0.18)",
          shadowColor: isSelected ? "#C4541A" : "#000",
          shadowOpacity: isSelected ? 0.5 : 0.3,
        },
        animStyle,
      ]}
      onPress={onSelect}
    >
      {cardImage && (
        <View style={styles.cardImageWrap}>
          <Image source={cardImage} style={styles.cardImage} contentFit="cover" />
          <LinearGradient
            colors={["rgba(10,8,4,0)", "rgba(10,8,4,0.75)"]}
            style={StyleSheet.absoluteFill}
          />
        </View>
      )}
      <View style={styles.flagBar}>
        {option.flagColors.map((color, i) => (
          <View key={i} style={[styles.flagStripe, { backgroundColor: color }]} />
        ))}
      </View>
      <View style={styles.cardTextWrap}>
        <Text style={styles.cardName}>{option.name}</Text>
        {isSelected && (
          <Animated.View entering={FadeIn.duration(200)} style={styles.selectPill}>
            <Text style={styles.selectPillText}>Entering →</Text>
          </Animated.View>
        )}
      </View>
    </AnimatedPressable>
  );
}

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { setHomeCountry } = useHomeCountry();
  const { setLanguage, t } = useLanguage();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedCountry, setSelectedCountry] = useState<HomeCountry | null>(null);
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage | null>(null);
  const [immersing, setImmersing] = useState(false);

  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const overlayOpacity = useSharedValue(0);
  const btnScale = useSharedValue(1);

  const handleCountrySelect = (id: HomeCountry) => {
    if (immersing) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedCountry(id);
    const suggested = COUNTRY_SUGGESTED_LANGUAGE[id] as SupportedLanguage;
    setSelectedLang(suggested);

    setTimeout(() => {
      setImmersing(true);
      overlayOpacity.value = withTiming(1, { duration: 500 }, () => {
        runOnJS(setStep)(2);
        runOnJS(setImmersing)(false);
        overlayOpacity.value = withTiming(0, { duration: 300 });
      });
    }, 600);
  };

  const handleFinish = async () => {
    if (!selectedCountry) return;
    btnScale.value = withSpring(0.95, {}, () => { btnScale.value = withSpring(1); });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    if (selectedLang) await setLanguage(selectedLang);
    await setHomeCountry(selectedCountry);
    Analytics.selectCountry(selectedCountry, "onboarding");
    Analytics.onboardingComplete();
    router.replace("/(tabs)");
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setSelectedCountry(null);
    } else {
      router.replace("/welcome");
    }
  };

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const btnAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
  }));

  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/images/lifestyle-spices.png")}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
      />
      <LinearGradient
        colors={["rgba(10,8,4,0.55)", "rgba(10,8,4,0.72)", "rgba(10,8,4,0.92)"]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFillObject, styles.immersionOverlay, overlayStyle]}
      />

      {step === 1 ? (
        <Animated.View
          entering={FadeIn.duration(400)}
          exiting={FadeOut.duration(300)}
          style={StyleSheet.absoluteFillObject}
        >
          {/* Drifting watermark — sits behind everything */}
          <View style={styles.watermarkRow} pointerEvents="none">
            <DriftingWatermark />
          </View>

          {/* Header */}
          <View style={[styles.topHeader, { paddingTop: topPad + 12 }]}>
            <Pressable style={styles.backBtn} onPress={handleBack}>
              <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
            </Pressable>
            <Animated.View entering={FadeInDown.delay(100).duration(500)}>
              <Text style={styles.headline}>Choose{"\n"}Your Home.</Text>
            </Animated.View>
          </View>

          {/* Floating cards */}
          <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
            {ONBOARDING_OPTIONS.map((option, index) => (
              <FloatingCard
                key={option.id}
                option={option}
                layout={CARD_LAYOUT[index] ?? CARD_LAYOUT[0]}
                onSelect={() => handleCountrySelect(option.id)}
                isSelected={selectedCountry === option.id}
                isAnySelected={!!selectedCountry}
              />
            ))}
          </View>

          {/* Bottom hint */}
          <Animated.View
            entering={FadeInDown.delay(800).duration(500)}
            style={[styles.bottomHint, { paddingBottom: bottomPad + 24 }]}
          >
            <Text style={styles.hintText}>Tap your country to enter</Text>
          </Animated.View>
        </Animated.View>
      ) : (
        <Animated.View
          entering={FadeIn.duration(500)}
          style={[styles.langContainer, { paddingTop: topPad + 12, paddingBottom: bottomPad + 24 }]}
        >
          <View style={styles.langTopRow}>
            <Pressable style={styles.backBtn} onPress={handleBack}>
              <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
            </Pressable>
          </View>

          <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.langHeader}>
            <Text style={styles.headline}>Choose Your{"\n"}Language.</Text>
            <Text style={styles.langSubtext}>Pick what feels most natural.</Text>
          </Animated.View>

          <View style={styles.langOptions}>
            {LANGUAGE_OPTIONS.map((lang, index) => {
              const isSelected = selectedLang === lang.id;
              const isSuggested = selectedCountry
                ? COUNTRY_SUGGESTED_LANGUAGE[selectedCountry] === lang.id
                : false;
              return (
                <Animated.View
                  key={lang.id}
                  entering={FadeInDown.delay(200 + index * 80).duration(400)}
                >
                  <Pressable
                    style={[
                      styles.langCard,
                      {
                        borderColor: isSelected ? "#C4541A" : "rgba(255,255,255,0.15)",
                        backgroundColor: isSelected ? "rgba(196,84,26,0.2)" : "rgba(255,255,255,0.07)",
                      },
                    ]}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setSelectedLang(lang.id);
                    }}
                  >
                    <View style={styles.langLeft}>
                      <Text style={styles.langNative}>{lang.nativeLabel}</Text>
                      <Text style={styles.langLabel}>
                        {lang.label}{isSuggested ? "  · Suggested" : ""}
                      </Text>
                    </View>
                    <View style={[
                      styles.checkCircle,
                      {
                        borderColor: isSelected ? "#C4541A" : "rgba(255,255,255,0.3)",
                        backgroundColor: isSelected ? "#C4541A" : "transparent",
                      },
                    ]}>
                      {isSelected && <Ionicons name="checkmark" size={13} color="#FFFFFF" />}
                    </View>
                  </Pressable>
                </Animated.View>
              );
            })}
          </View>

          <Animated.View style={[styles.langFooter, btnAnimStyle]}>
            <Pressable
              style={[
                styles.continueBtn,
                { backgroundColor: selectedLang ? "#C4541A" : "rgba(255,255,255,0.15)" },
              ]}
              onPress={handleFinish}
              disabled={!selectedLang}
            >
              <Text style={[
                styles.continueBtnText,
                { color: selectedLang ? "#FFFFFF" : "rgba(255,255,255,0.4)" },
              ]}>
                Enter Mekazon
              </Text>
              {selectedLang && <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />}
            </Pressable>
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0806",
  },
  immersionOverlay: {
    backgroundColor: "#C4541A",
    zIndex: 50,
  },
  // Watermark
  watermarkRow: {
    position: "absolute",
    top: "48%",
    left: 0,
    right: 0,
    overflow: "hidden",
    zIndex: 1,
  },
  watermark: {
    fontSize: 72,
    fontWeight: "900",
    color: "rgba(255,255,255,0.045)",
    letterSpacing: 12,
    textTransform: "uppercase",
    whiteSpace: "nowrap",
  },
  topHeader: {
    paddingHorizontal: 24,
    zIndex: 10,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  headline: {
    fontSize: 40,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -1.5,
    lineHeight: 46,
  },
  bottomHint: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  hintText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.45)",
    fontWeight: "500",
    letterSpacing: 0.3,
  },
  floatingCard: {
    position: "absolute",
    borderRadius: 20,
    borderWidth: 1.5,
    overflow: "hidden",
    height: 100,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
    elevation: 10,
  },
  cardImageWrap: { ...StyleSheet.absoluteFillObject },
  cardImage: { width: "100%", height: "100%" },
  flagBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
    flexDirection: "column",
  },
  flagStripe: { flex: 1 },
  cardTextWrap: {
    position: "absolute",
    bottom: 12,
    left: 16,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardName: {
    fontSize: 17,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.4,
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  selectPill: {
    backgroundColor: "#C4541A",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  selectPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  langContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  langTopRow: { marginBottom: 8 },
  langHeader: { marginBottom: 32 },
  langSubtext: {
    fontSize: 15,
    color: "rgba(255,255,255,0.55)",
    marginTop: 10,
    lineHeight: 22,
  },
  langOptions: { gap: 12, flex: 1 },
  langCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 1.5,
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  langLeft: { flex: 1 },
  langNative: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 3,
    letterSpacing: -0.4,
  },
  langLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
    lineHeight: 17,
  },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  langFooter: { marginTop: 24 },
  continueBtn: {
    borderRadius: 18,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  continueBtnText: { fontSize: 17, fontWeight: "800" },
});