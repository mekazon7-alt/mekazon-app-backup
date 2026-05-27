import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useHomeCountry } from "@/context/HomeCountryContext";
import { useLanguage } from "@/context/LanguageContext";
import { useLocation } from "@/context/LocationContext";
import { LocationBottomSheet } from "@/components/LocationBottomSheet";
import { ONBOARDING_OPTIONS, type HomeCountry } from "@/constants/personalization";
import { LANGUAGE_META, type SupportedLanguage } from "@/lib/i18n";

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t, language, setLanguage } = useLanguage();
  const { homeCountry, experience, setHomeCountry } = useHomeCountry();
  const { selectedEmirate, deliveryLabel } = useLocation();
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [showLocationSheet, setShowLocationSheet] = useState(false);
  const [notifs, setNotifs] = useState({
    weeklyBasket: true,
    freshStock: false,
    newArrivals: true,
    reorder: false,
  });

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom + 60;

  const handleChangeCountry = async (country: HomeCountry) => {
    Haptics.selectionAsync();
    await setHomeCountry(country);
    setShowCountryPicker(false);
  };

  const handleChangeLang = async (lang: SupportedLanguage) => {
    Haptics.selectionAsync();
    await setLanguage(lang);
    setShowLangPicker(false);
  };

  const currentOption = ONBOARDING_OPTIONS.find((o) => o.id === homeCountry);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: bottomPad }}>
        <View style={[styles.header, { paddingTop: topPad + 12 }]}>
          <Text style={[styles.title, { color: colors.foreground }]}>{t("profileTitle")}</Text>
        </View>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={[styles.avatar, { backgroundColor: colors.secondary }]}>
            <Ionicons name="person" size={36} color={colors.mutedForeground} />
          </View>
          <Text style={[styles.guestName, { color: colors.foreground }]}>{t("profileGuest")}</Text>
          <Pressable style={[styles.signInBtn, { backgroundColor: colors.primary }]}>
            <Text style={[styles.signInText, { color: colors.primaryForeground }]}>{t("profileSignIn")}</Text>
          </Pressable>
        </View>

        {/* Your Home */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>{t("profileYourHome")}</Text>
            <Pressable onPress={() => setShowCountryPicker(true)}>
              <Text style={[styles.changeText, { color: colors.primary }]}>{t("profileChange")}</Text>
            </Pressable>
          </View>
          {currentOption && (
            <View style={styles.homeRow}>
              <View style={styles.flagBar}>
                {currentOption.flagColors.map((color, i) => (
                  <View key={i} style={[styles.flagStripe, { backgroundColor: color }]} />
                ))}
              </View>
              <View style={styles.homeInfo}>
                <Text style={[styles.homeName, { color: colors.foreground }]}>{currentOption.name}</Text>
                <Text style={[styles.homeTagline, { color: colors.mutedForeground }]}>{experience?.tagline}</Text>
              </View>
              <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
            </View>
          )}
        </View>

        {/* Delivery Location */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>{t("profileDelivery")}</Text>
            <Pressable onPress={() => setShowLocationSheet(true)}>
              <Text style={[styles.changeText, { color: colors.primary }]}>{t("profileChange")}</Text>
            </Pressable>
          </View>
          <View style={styles.locationRow}>
            <View style={[styles.locationIconWrap, { backgroundColor: colors.secondary }]}>
              <Ionicons name="location" size={16} color={colors.primary} />
            </View>
            <View>
              <Text style={[styles.locationName, { color: colors.foreground }]}>
                {selectedEmirate?.name ?? t("chooseLocation")}
              </Text>
              {selectedEmirate && (
                <Text style={[styles.locationDelivery, { color: selectedEmirate.sameDay ? "#4E7234" : colors.mutedForeground }]}>
                  {selectedEmirate.sameDay ? t("sameDayLabel") : t("nextDayLabel")}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Language */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>{t("profileLanguage")}</Text>
            <Pressable onPress={() => setShowLangPicker(true)}>
              <Text style={[styles.changeText, { color: colors.primary }]}>{t("profileChange")}</Text>
            </Pressable>
          </View>
          <View style={styles.locationRow}>
            <View style={[styles.locationIconWrap, { backgroundColor: colors.secondary }]}>
              <Ionicons name="language" size={16} color={colors.primary} />
            </View>
            <View>
              <Text style={[styles.locationName, { color: colors.foreground }]}>
                {LANGUAGE_META[language].nativeLabel}
              </Text>
              <Text style={[styles.locationDelivery, { color: colors.mutedForeground }]}>
                {LANGUAGE_META[language].label}
                {LANGUAGE_META[language].rtl ? " — RTL" : ""}
              </Text>
            </View>
          </View>
        </View>

        {/* Notifications */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground, marginBottom: 14 }]}>
            {t("profileNotifications")}
          </Text>
          {(
            [
              { key: "weeklyBasket", label: t("notifWeeklyBasket") },
              { key: "freshStock", label: t("notifFreshStock") },
              { key: "newArrivals", label: t("notifNewArrivals") },
              { key: "reorder", label: t("notifReorder") },
            ] as const
          ).map((item) => (
            <View key={item.key} style={[styles.notifRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.notifLabel, { color: colors.foreground }]}>{item.label}</Text>
              <Switch
                value={notifs[item.key]}
                onValueChange={(v) =>
                  setNotifs((prev) => ({ ...prev, [item.key]: v }))
                }
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={"#FFFFFF"}
              />
            </View>
          ))}
        </View>

        {/* Menu Items */}
        <View style={[styles.menuSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {(
            [
              { icon: "heart-outline", label: t("profileSaved") },
              { icon: "repeat-outline", label: t("profileRepeat") },
              { icon: "location-outline", label: t("profileAddress") },
              { icon: "card-outline", label: t("profilePayment") },
              { icon: "logo-whatsapp", label: t("profileSupport") },
            ] as const
          ).map((item) => (
            <Pressable key={item.label} style={[styles.menuRow, { borderBottomColor: colors.border }]}>
              <Ionicons name={item.icon} size={20} color={colors.mutedForeground} />
              <Text style={[styles.menuLabel, { color: colors.foreground }]}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
            </Pressable>
          ))}
        </View>

        <Text style={[styles.shopifyNote, { color: colors.mutedForeground }]}>
          Powered by Shopify. Orders, payments, and inventory managed via mekazon.com
        </Text>
      </ScrollView>

      {/* Country Picker Modal */}
      <Modal visible={showCountryPicker} animationType="slide" transparent>
        <Pressable style={styles.modalOverlay} onPress={() => setShowCountryPicker(false)} />
        <Animated.View
          entering={FadeInDown.duration(300)}
          style={[styles.modalSheet, { backgroundColor: colors.card }]}
        >
          <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />
          <Text style={[styles.modalTitle, { color: colors.foreground }]}>{t("profileChangeHome")}</Text>
          {ONBOARDING_OPTIONS.map((option) => (
            <Pressable
              key={option.id}
              style={[
                styles.modalOption,
                {
                  backgroundColor: homeCountry === option.id ? colors.secondary : "transparent",
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
                <Text style={[styles.modalOptionName, { color: homeCountry === option.id ? colors.primary : colors.foreground }]}>
                  {option.name}
                </Text>
                <Text style={[styles.modalOptionSub, { color: colors.mutedForeground }]} numberOfLines={1}>
                  {option.subtitle}
                </Text>
              </View>
              {homeCountry === option.id && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
            </Pressable>
          ))}
        </Animated.View>
      </Modal>

      {/* Language Picker Modal */}
      <Modal visible={showLangPicker} animationType="slide" transparent>
        <Pressable style={styles.modalOverlay} onPress={() => setShowLangPicker(false)} />
        <Animated.View
          entering={FadeInDown.duration(300)}
          style={[styles.modalSheet, { backgroundColor: colors.card }]}
        >
          <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />
          <Text style={[styles.modalTitle, { color: colors.foreground }]}>{t("profileChangeLanguage")}</Text>
          {(Object.keys(LANGUAGE_META) as SupportedLanguage[]).map((lang) => {
            const meta = LANGUAGE_META[lang];
            const isSelected = language === lang;
            return (
              <Pressable
                key={lang}
                style={[
                  styles.modalOption,
                  {
                    backgroundColor: isSelected ? colors.secondary : "transparent",
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => handleChangeLang(lang)}
              >
                <View style={styles.modalOptionContent}>
                  <Text style={[styles.modalOptionName, { color: isSelected ? colors.primary : colors.foreground }]}>
                    {meta.nativeLabel}
                  </Text>
                  <Text style={[styles.modalOptionSub, { color: colors.mutedForeground }]}>
                    {meta.label}{meta.rtl ? " — RTL" : ""}
                  </Text>
                </View>
                {isSelected && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
              </Pressable>
            );
          })}
        </Animated.View>
      </Modal>

      {/* Location Bottom Sheet */}
      <LocationBottomSheet
        visible={showLocationSheet}
        onClose={() => setShowLocationSheet(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { paddingHorizontal: 22, paddingBottom: 16 },
  title: { fontSize: 26, fontWeight: "800", letterSpacing: -0.6 },
  avatarSection: { alignItems: "center", paddingVertical: 20, gap: 10 },
  avatar: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center" },
  guestName: { fontSize: 18, fontWeight: "700" },
  signInBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, marginTop: 4 },
  signInText: { fontSize: 14, fontWeight: "700" },
  card: {
    marginHorizontal: 22,
    marginBottom: 14,
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  cardTitle: { fontSize: 15, fontWeight: "700" },
  changeText: { fontSize: 14, fontWeight: "600" },
  homeRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  flagBar: { width: 6, height: 44, borderRadius: 3, overflow: "hidden", flexDirection: "column" },
  flagStripe: { flex: 1 },
  homeInfo: { flex: 1 },
  homeName: { fontSize: 16, fontWeight: "700" },
  homeTagline: { fontSize: 12, marginTop: 2 },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  locationIconWrap: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  locationName: { fontSize: 15, fontWeight: "700" },
  locationDelivery: { fontSize: 12, marginTop: 2, fontWeight: "500" },
  notifRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  notifLabel: { fontSize: 14, flex: 1 },
  menuSection: {
    marginHorizontal: 22,
    marginBottom: 14,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 18,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: "500" },
  shopifyNote: { fontSize: 11, textAlign: "center", paddingHorizontal: 24, paddingBottom: 20, lineHeight: 17 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)" },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingTop: 12,
    gap: 10,
  },
  modalHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 12 },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 8, letterSpacing: -0.3 },
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
  flagBarSmall: { width: 5, height: 52, flexDirection: "column" },
  flagStripeSmall: { flex: 1 },
  modalOptionContent: { flex: 1, paddingLeft: 10 },
  modalOptionName: { fontSize: 15, fontWeight: "700" },
  modalOptionSub: { fontSize: 12, marginTop: 2 },
});
