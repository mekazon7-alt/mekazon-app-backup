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
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useHomeCountry } from "@/context/HomeCountryContext";
import { useLanguage } from "@/context/LanguageContext";
import { ONBOARDING_OPTIONS, type HomeCountry } from "@/constants/personalization";
import {
  type SupportedLanguage,
  LANGUAGE_META,
  COUNTRY_SUGGESTED_LANGUAGE,
} from "@/lib/i18n";

const CARD_IMAGES: Record<string, ReturnType<typeof require>> = {
  "lifestyle-matooke": require("@/assets/images/lifestyle-matooke.png"),
  "lifestyle-ugali": require("@/assets/images/lifestyle-ugali.png"),
  "lifestyle-injera": require("@/assets/images/lifestyle-injera.png"),
  "hero-pan-african": require("@/assets/images/hero-pan-african.png"),
};

const LANGUAGE_OPTIONS: Array<{
  id: SupportedLanguage;
  label: string;
  nativeLabel: string;
  script: string;
}> = [
  { id: "en", label: "English", nativeLabel: "English", script: "Latin" },
  { id: "ar", label: "Arabic", nativeLabel: "العربية", script: "Arabic" },
  { id: "am", label: "Amharic", nativeLabel: "አማርኛ", script: "Ethiopic" },
  { id: "sw", label: "Swahili", nativeLabel: "Kiswahili", script: "Latin" },
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { setHomeCountry } = useHomeCountry();
  const { setLanguage, t } = useLanguage();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedCountry, setSelectedCountry] = useState<HomeCountry | null>(null);
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage | null>(null);
  const btnScale = useSharedValue(1);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const handleCountrySelect = (id: HomeCountry) => {
    Haptics.selectionAsync();
    setSelectedCountry(id);
    const suggested = COUNTRY_SUGGESTED_LANGUAGE[id] as SupportedLanguage;
    if (!selectedLang) setSelectedLang(suggested);
  };

  const handleCountryContinue = () => {
    if (!selectedCountry) return;
    btnScale.value = withSpring(0.95, {}, () => { btnScale.value = withSpring(1); });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setStep(2);
  };

  const handleFinish = async () => {
    if (!selectedCountry) return;
    btnScale.value = withSpring(0.95, {}, () => { btnScale.value = withSpring(1); });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    if (selectedLang) await setLanguage(selectedLang);
    await setHomeCountry(selectedCountry);
    router.replace("/(tabs)");
  };

  const btnAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
  }));

  const selectedOption = ONBOARDING_OPTIONS.find((o) => o.id === selectedCountry);

  return (
    <View style={[styles.container, { backgroundColor: "#F7F8F2" }]}>
      {/* Step indicator */}
      <View style={[styles.stepRow, { paddingTop: topPad + 16 }]}>
        <Pressable
          style={styles.backBtn}
          onPress={() => step === 2 ? setStep(1) : router.back()}
        >
          <Ionicons name="arrow-back" size={20} color="#1E2414" />
        </Pressable>
        <View style={styles.stepDots}>
          <View style={[styles.dot, step === 1 ? styles.dotActive : styles.dotInactive]} />
          <View style={[styles.dot, step === 2 ? styles.dotActive : styles.dotInactive]} />
        </View>
        <View style={{ width: 36 }} />
      </View>

      {step === 1 ? (
        /* ── STEP 1: Choose Your Home ── */
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad + 130 }]}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInDown.delay(60).duration(500)} style={styles.header}>
            <Text style={styles.eyebrow}>{t("onboardingEyebrow")}</Text>
            <Text style={styles.headline}>{t("onboardingHeadline")}</Text>
            <Text style={styles.subheadline}>{t("onboardingSubtext")}</Text>
          </Animated.View>

          <View style={styles.options}>
            {ONBOARDING_OPTIONS.map((option, index) => {
              const isSelected = selectedCountry === option.id;
              const cardImage = CARD_IMAGES[option.cardImageKey];
              return (
                <Animated.View
                  key={option.id}
                  entering={FadeInDown.delay(140 + index * 65).duration(420)}
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
                    onPress={() => handleCountrySelect(option.id)}
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
                        <Image source={cardImage} style={styles.cardImage} contentFit="cover" />
                        <LinearGradient
                          colors={["rgba(247,248,242,0)", "rgba(247,248,242,0.6)"]}
                          start={{ x: 1, y: 0 }}
                          end={{ x: 0, y: 0 }}
                          style={StyleSheet.absoluteFill}
                        />
                      </View>
                    )}
                    <View style={[
                      styles.checkCircle,
                      {
                        borderColor: isSelected ? "#4E7234" : "#DDE8C8",
                        backgroundColor: isSelected ? "#4E7234" : "transparent",
                      },
                    ]}>
                      {isSelected && <Ionicons name="checkmark" size={13} color="#FFFFFF" />}
                    </View>
                  </AnimatedPressable>
                </Animated.View>
              );
            })}
          </View>
        </ScrollView>
      ) : (
        /* ── STEP 2: Choose Language ── */
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad + 130 }]}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInRight.duration(380)} style={styles.header}>
            <Text style={styles.eyebrow}>{t("langStepEyebrow")}</Text>
            <Text style={styles.headline}>{t("langStepHeadline")}</Text>
            <Text style={styles.subheadline}>{t("langStepSubtext")}</Text>
          </Animated.View>

          <View style={styles.options}>
            {LANGUAGE_OPTIONS.map((lang, index) => {
              const isSelected = selectedLang === lang.id;
              const meta = LANGUAGE_META[lang.id];
              const isSuggested =
                selectedCountry ? COUNTRY_SUGGESTED_LANGUAGE[selectedCountry] === lang.id : false;
              return (
                <Animated.View
                  key={lang.id}
                  entering={FadeInDown.delay(80 + index * 65).duration(380)}
                >
                  <Pressable
                    style={[
                      styles.langCard,
                      {
                        borderColor: isSelected ? "#4E7234" : "#DDE8C8",
                        backgroundColor: isSelected ? "#F0F5E8" : "#FFFFFF",
                      },
                    ]}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setSelectedLang(lang.id);
                    }}
                  >
                    <View style={styles.langLeft}>
                      <Text style={styles.langNative}>{lang.nativeLabel}</Text>
                      <Text style={[styles.langLabel, { color: isSelected ? "#728054" : "#9AAA7A" }]}>
                        {lang.label}
                        {meta.rtl ? " — RTL" : ""}
                        {isSuggested ? "  Suggested" : ""}
                      </Text>
                    </View>
                    <View style={[
                      styles.checkCircle,
                      {
                        borderColor: isSelected ? "#4E7234" : "#DDE8C8",
                        backgroundColor: isSelected ? "#4E7234" : "transparent",
                      },
                    ]}>
                      {isSelected && <Ionicons name="checkmark" size={13} color="#FFFFFF" />}
                    </View>
                  </Pressable>
                </Animated.View>
              );
            })}
          </View>
        </ScrollView>
      )}

      {/* Footer CTA */}
      <View style={[styles.footer, { paddingBottom: bottomPad + 16 }]}>
        <Animated.View style={btnAnimStyle}>
          <Pressable
            style={[
              styles.continueBtn,
              {
                backgroundColor:
                  (step === 1 ? selectedCountry : selectedLang) ? "#4E7234" : "#DDE8C8",
              },
            ]}
            onPress={step === 1 ? handleCountryContinue : handleFinish}
            disabled={step === 1 ? !selectedCountry : !selectedLang}
          >
            <Text style={[
              styles.continueBtnText,
              { color: (step === 1 ? selectedCountry : selectedLang) ? "#FFFFFF" : "#9AAA7A" },
            ]}>
              {step === 1
                ? selectedOption
                  ? t("onboardingContinue", { country: selectedOption.name })
                  : t("onboardingSelectFirst")
                : t("langStepBtn")}
            </Text>
            {(step === 1 ? selectedCountry : selectedLang) && (
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            )}
          </Pressable>
        </Animated.View>
        <Text style={styles.footerNote}>{t("onboardingFooterNote")}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 22,
    paddingBottom: 8,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    backgroundColor: "#EBF0DE",
  },
  stepDots: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 24,
    backgroundColor: "#4E7234",
  },
  dotInactive: {
    width: 8,
    backgroundColor: "#DDE8C8",
  },
  scroll: {
    paddingHorizontal: 22,
    paddingTop: 12,
  },
  header: { marginBottom: 24 },
  eyebrow: {
    fontSize: 13,
    fontWeight: "600",
    color: "#C4541A",
    letterSpacing: 0.4,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  headline: {
    fontSize: 34,
    fontWeight: "800",
    color: "#1E2414",
    letterSpacing: -1,
    lineHeight: 40,
    marginBottom: 10,
  },
  subheadline: {
    fontSize: 15,
    color: "#728054",
    lineHeight: 22,
  },
  options: { gap: 10 },
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
  flagBar: { width: 5, height: "100%", flexDirection: "column" },
  flagStripe: { flex: 1 },
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
  optionSubtitle: { fontSize: 12, lineHeight: 16 },
  cardImageWrap: { width: 80, height: "100%" },
  cardImage: { width: "100%", height: "100%" },
  langCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 1.5,
    paddingHorizontal: 20,
    paddingVertical: 20,
    shadowColor: "#1E2414",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  langLeft: { flex: 1 },
  langNative: {
    fontSize: 19,
    fontWeight: "800",
    color: "#1E2414",
    marginBottom: 4,
    letterSpacing: -0.4,
  },
  langLabel: { fontSize: 12, lineHeight: 17 },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
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
  continueBtnText: { fontSize: 16, fontWeight: "700" },
  footerNote: {
    fontSize: 12,
    color: "#9AAA7A",
    textAlign: "center",
    paddingBottom: 4,
  },
});
