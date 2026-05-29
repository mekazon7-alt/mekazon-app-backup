import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useLanguage } from "@/context/LanguageContext";

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const bottomPad = Platform.OS === "web" ? 40 : insets.bottom + 32;

  const handleStart = () => {
    router.replace("/onboarding");
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/images/lifestyle-spices.png")}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
      />
      <LinearGradient
        colors={[
          "rgba(20,16,10,0.25)",
          "rgba(20,16,10,0.35)",
          "rgba(14,11,6,0.80)",
          "rgba(10,8,4,0.97)",
        ]}
        locations={[0, 0.3, 0.7, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={[styles.content, { paddingBottom: bottomPad, paddingTop: insets.top + 24 }]}>
        <Animated.View entering={FadeIn.delay(200).duration(800)} style={styles.topSection}>
          <View style={styles.logoWrap}>
            <Image
              source={require("@/assets/images/mekazon-logo.png")}
              style={styles.logo}
              contentFit="contain"
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(700)} style={styles.bottomSection}>
          <View style={styles.taglinePill}>
            <View style={styles.taglineDot} />
            <Text style={styles.taglineLabel}>African Food. UAE Delivery.</Text>
          </View>

          <Text style={styles.headline}>{t("welcomeTitle")}</Text>
          <Text style={styles.subtitle}>{t("welcomeSubtitle")}</Text>

          <View style={styles.trustRow}>
            {["Uganda", "Kenya", "Ethiopia", "West Africa"].map((c) => (
              <View key={c} style={styles.trustBadge}>
                <Text style={styles.trustBadgeText}>{c}</Text>
              </View>
            ))}
          </View>

          <Pressable style={styles.startBtn} onPress={handleStart}>
            <Text style={styles.startBtnText}>{t("welcomeBtn")}</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </Pressable>

          <Text style={styles.footerNote}>
            No account needed to browse. Secure checkout, cash on delivery available.
          </Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0806",
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 26,
  },
  topSection: {},
  logoWrap: {
    width: 52,
    height: 52,
    borderRadius: 13,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  logo: { width: 52, height: 52 },
  bottomSection: {
    gap: 16,
  },
  taglinePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 4,
  },
  taglineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#C4541A",
  },
  taglineLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255,255,255,0.85)",
    letterSpacing: 0.3,
  },
  headline: {
    fontSize: 38,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -1.2,
    lineHeight: 44,
  },
  subtitle: {
    fontSize: 15,
    color: "rgba(255,255,255,0.70)",
    lineHeight: 23,
    marginBottom: 4,
  },
  trustRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 4,
  },
  trustBadge: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  trustBadgeText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "500",
  },
  startBtn: {
    backgroundColor: "#C4541A",
    borderRadius: 18,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: "#C4541A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  startBtnText: {
    fontSize: 17,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  footerNote: {
    fontSize: 12,
    color: "rgba(255,255,255,0.4)",
    textAlign: "center",
    paddingBottom: 8,
    lineHeight: 18,
  },
});
