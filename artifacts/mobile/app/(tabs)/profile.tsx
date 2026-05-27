import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useHomeCountry } from "@/context/HomeCountryContext";
import { ONBOARDING_OPTIONS, type HomeCountry } from "@/constants/personalization";

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { homeCountry, experience, setHomeCountry } = useHomeCountry();
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom + 60;

  const handleChangeCountry = async (country: HomeCountry) => {
    Haptics.selectionAsync();
    await setHomeCountry(country);
    setShowCountryPicker(false);
  };

  const currentOption = ONBOARDING_OPTIONS.find((o) => o.id === homeCountry);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: bottomPad }}>
        <View style={[styles.header, { paddingTop: topPad + 12 }]}>
          <Text style={[styles.title, { color: colors.foreground }]}>Profile</Text>
        </View>

        <View style={styles.avatarSection}>
          <View style={[styles.avatar, { backgroundColor: colors.secondary }]}>
            <Ionicons name="person" size={36} color={colors.mutedForeground} />
          </View>
          <Text style={[styles.guestName, { color: colors.foreground }]}>Guest User</Text>
          <Pressable style={[styles.signInBtn, { backgroundColor: colors.primary }]}>
            <Text style={[styles.signInText, { color: colors.primaryForeground }]}>Sign In or Create Account</Text>
          </Pressable>
        </View>

        <View style={[styles.homeSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.homeSectionHeader}>
            <Text style={[styles.homeSectionTitle, { color: colors.foreground }]}>Your Home</Text>
            <Pressable onPress={() => setShowCountryPicker(true)}>
              <Text style={[styles.changeText, { color: colors.primary }]}>Change</Text>
            </Pressable>
          </View>
          {currentOption && (
            <View style={styles.homeCountryRow}>
              <View style={styles.flagBar}>
                {currentOption.flagColors.map((color, i) => (
                  <View key={i} style={[styles.flagStripe, { backgroundColor: color }]} />
                ))}
              </View>
              <View style={styles.homeCountryInfo}>
                <Text style={[styles.homeCountryName, { color: colors.foreground }]}>{currentOption.name}</Text>
                <Text style={[styles.homeCountrySubtitle, { color: colors.mutedForeground }]}>
                  {experience?.tagline}
                </Text>
              </View>
              <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
            </View>
          )}
        </View>

        <View style={styles.menuSection}>
          {[
            { icon: "heart-outline", label: "Saved Products" },
            { icon: "repeat-outline", label: "Repeat Orders" },
            { icon: "location-outline", label: "Delivery Address" },
            { icon: "card-outline", label: "Payment Methods" },
            { icon: "notifications-outline", label: "Notifications" },
            { icon: "help-circle-outline", label: "Help & Support" },
          ].map((item) => (
            <Pressable key={item.label} style={[styles.menuRow, { borderBottomColor: colors.border }]}>
              <Ionicons name={item.icon as any} size={20} color={colors.mutedForeground} />
              <Text style={[styles.menuLabel, { color: colors.foreground }]}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <Modal visible={showCountryPicker} animationType="slide" transparent>
        <Pressable style={styles.modalOverlay} onPress={() => setShowCountryPicker(false)} />
        <Animated.View entering={FadeInDown.duration(300)} style={[styles.modalSheet, { backgroundColor: colors.card }]}>
          <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />
          <Text style={[styles.modalTitle, { color: colors.foreground }]}>Change Your Home</Text>
          {ONBOARDING_OPTIONS.map((option) => (
            <Pressable
              key={option.id}
              style={[
                styles.modalOption,
                {
                  backgroundColor: homeCountry === option.id ? "rgba(245,196,0,0.08)" : "transparent",
                  borderColor: homeCountry === option.id ? colors.primary : colors.border,
                },
              ]}
              onPress={() => handleChangeCountry(option.id)}
            >
              <View style={styles.flagBarSmall}>
                {option.flagColors.map((color, i) => (
                  <View key={i} style={[styles.flagStripeSmall, { backgroundColor: color }]} />
                ))}
              </View>
              <View style={styles.modalOptionContent}>
                <Text style={[styles.modalOptionName, { color: homeCountry === option.id ? colors.primary : colors.foreground }]}>{option.name}</Text>
                <Text style={[styles.modalOptionSubtitle, { color: colors.mutedForeground }]} numberOfLines={1}>{option.subtitle}</Text>
              </View>
              {homeCountry === option.id && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
            </Pressable>
          ))}
        </Animated.View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.6,
  },
  avatarSection: {
    alignItems: "center",
    paddingVertical: 24,
    gap: 10,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  guestName: {
    fontSize: 18,
    fontWeight: "700",
  },
  signInBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 4,
  },
  signInText: {
    fontSize: 14,
    fontWeight: "700",
  },
  homeSection: {
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 24,
  },
  homeSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  homeSectionTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  changeText: {
    fontSize: 14,
    fontWeight: "600",
  },
  homeCountryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  flagBar: {
    width: 6,
    height: 44,
    borderRadius: 3,
    overflow: "hidden",
    flexDirection: "column",
  },
  flagStripe: {
    flex: 1,
  },
  homeCountryInfo: {
    flex: 1,
  },
  homeCountryName: {
    fontSize: 16,
    fontWeight: "700",
  },
  homeCountrySubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  menuSection: {
    marginHorizontal: 20,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingTop: 12,
    gap: 10,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1.5,
    paddingVertical: 12,
    paddingRight: 16,
    gap: 12,
    overflow: "hidden",
  },
  flagBarSmall: {
    width: 5,
    height: 52,
    flexDirection: "column",
  },
  flagStripeSmall: {
    flex: 1,
  },
  modalOptionContent: {
    flex: 1,
    paddingLeft: 10,
  },
  modalOptionName: {
    fontSize: 15,
    fontWeight: "700",
  },
  modalOptionSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
});
