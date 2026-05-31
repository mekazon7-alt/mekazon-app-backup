import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Linking } from "react-native";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { Analytics } from "@/services/analytics";
import { useHomeCountry } from "@/context/HomeCountryContext";
import { useLanguage } from "@/context/LanguageContext";
import { useLocation } from "@/context/LocationContext";
import { LocationBottomSheet } from "@/components/LocationBottomSheet";
import { ONBOARDING_OPTIONS, type HomeCountry } from "@/constants/personalization";
import { LANGUAGE_META, type SupportedLanguage } from "@/lib/i18n";
import { checkAdminPassword, setAdminAuthenticated, isAdminAuthenticated, adminLogout } from "@/services/adminAuth";
import {
  sendLocalNotification,
  syncNotificationSchedules,
  requestNotificationPermission,
} from "@/services/notificationService";

const APP_VERSION = "1.0";
const VERSION_TAPS_REQUIRED = 5;

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t, language, setLanguage } = useLanguage();
  const { homeCountry, experience, setHomeCountry } = useHomeCountry();
  const { selectedEmirate } = useLocation();
  const { session, isLoggedIn, logout } = useAuth();

  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [showLocationSheet, setShowLocationSheet] = useState(false);
  const [flashColor, setFlashColor] = useState<string | null>(null);
  const [notifs, setNotifs] = useState({
    weeklyBasket: session?.user.notificationPreferences.weeklyBasket ?? true,
    freshStock: session?.user.notificationPreferences.freshStock ?? false,
    newArrivals: session?.user.notificationPreferences.newArrivals ?? true,
    reorder: session?.user.notificationPreferences.reorder ?? false,
  });

  const handleNotifChange = async (key: keyof typeof notifs, value: boolean) => {
    const next = { ...notifs, [key]: value };
    setNotifs(next);
    const granted = await requestNotificationPermission();
    if (granted) {
      await syncNotificationSchedules({
        weeklyBasket: next.weeklyBasket,
        reorder: next.reorder,
        freshStock: next.freshStock,
      });
    }
  };

  const handleTestNotification = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await sendLocalNotification(
      "Mekazon",
      "Your home basket is ready. Fresh arrivals for your community — shop now."
    );
  };

  const handleLogout = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await logout();
  };

  const [versionTapCount, setVersionTapCount] = useState(0);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPw, setAdminPw] = useState("");
  const [adminPwError, setAdminPwError] = useState(false);
  const [adminLoggedIn, setAdminLoggedIn] = useState(isAdminAuthenticated());

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom + 60;

  const handleChangeCountry = async (country: HomeCountry) => {
    if (country === homeCountry) {
      setShowCountryPicker(false);
      return;
    }
    Haptics.selectionAsync();
    const opt = ONBOARDING_OPTIONS.find((o) => o.id === country);
    const col = opt?.flagColors?.[0] ?? "#C4541A";
    setFlashColor(col);
    setShowCountryPicker(false);
    setTimeout(async () => {
      await setHomeCountry(country);
      Analytics.selectCountry(country, "profile");
      setTimeout(() => setFlashColor(null), 400);
    }, 300);
  };

  const handleChangeLang = async (lang: SupportedLanguage) => {
    Haptics.selectionAsync();
    const wasRTL = LANGUAGE_META[language].rtl;
    const willBeRTL = LANGUAGE_META[lang].rtl;
    await setLanguage(lang);
    setShowLangPicker(false);
    if (wasRTL !== willBeRTL) {
      Alert.alert(
        "Restart Required",
        "Please close and reopen the app to apply the new language layout direction.",
        [{ text: "OK" }]
      );
    }
  };

  const handleVersionTap = () => {
    if (adminLoggedIn) return;
    const next = versionTapCount + 1;
    setVersionTapCount(next);
    if (next >= VERSION_TAPS_REQUIRED) {
      setVersionTapCount(0);
      setAdminPw("");
      setAdminPwError(false);
      setShowAdminLogin(true);
    }
  };

  const handleAdminLogin = () => {
    if (checkAdminPassword(adminPw)) {
      setAdminAuthenticated(true);
      setAdminLoggedIn(true);
      setShowAdminLogin(false);
      setAdminPw("");
      router.push("/admin-content");
    } else {
      setAdminPwError(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleAdminLogout = () => {
    adminLogout();
    setAdminLoggedIn(false);
  };

  const currentOption = ONBOARDING_OPTIONS.find((o) => o.id === homeCountry);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Country switch flash overlay */}
      {flashColor && (
        <Animated.View
          entering={FadeInDown.duration(200)}
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFillObject,
            { backgroundColor: flashColor, opacity: 0.18, zIndex: 999 },
          ]}
        />
      )}

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: bottomPad }}>
        <View style={[styles.header, { paddingTop: topPad + 12 }]}>
          <Text style={[styles.title, { color: colors.foreground }]}>{t("profileTitle")}</Text>
        </View>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={[styles.avatar, { backgroundColor: isLoggedIn ? colors.primary + "22" : colors.secondary }]}>
            {isLoggedIn ? (
              <Text style={[styles.avatarInitial, { color: colors.primary }]}>
                {session!.user.name.charAt(0).toUpperCase()}
              </Text>
            ) : (
              <Ionicons name="person" size={36} color={colors.mutedForeground} />
            )}
          </View>

          {isLoggedIn ? (
            <>
              <Text style={[styles.guestName, { color: colors.foreground }]}>{session!.user.name}</Text>
              <Text style={[styles.userPhone, { color: colors.mutedForeground }]}>{session!.user.phone}</Text>
              <Pressable style={[styles.logoutBtn, { borderColor: colors.border }]} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={15} color={colors.mutedForeground} />
                <Text style={[styles.logoutText, { color: colors.mutedForeground }]}>{t("profileLogout")}</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={[styles.guestName, { color: colors.foreground }]}>{t("profileGuest")}</Text>
              <Pressable
                style={[styles.signInBtn, { backgroundColor: colors.primary }]}
                onPress={() => router.push("/login")}
              >
                <Ionicons name="phone-portrait-outline" size={15} color="#FFFFFF" />
                <Text style={[styles.signInText, { color: "#FFFFFF" }]}>{t("profileSignIn")}</Text>
              </Pressable>
            </>
          )}
        </View>

        {/* Your Home */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>{t("profileYourHome")}</Text>
            <Pressable onPress={() => setShowCountryPicker(true)}>
              <Text style={[styles.changeText, { color: colors.primary }]}>{t("profileChange")}</Text>
            </Pressable>
          </View>
          {currentOption ? (
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
          ) : (
            <Pressable style={styles.homeRow} onPress={() => setShowCountryPicker(true)}>
              <View style={[styles.locationIconWrap, { backgroundColor: colors.secondary }]}>
                <Ionicons name="earth-outline" size={16} color={colors.primary} />
              </View>
              <View style={styles.homeInfo}>
                <Text style={[styles.homeName, { color: colors.mutedForeground }]}>Not selected</Text>
                <Text style={[styles.homeTagline, { color: colors.primary }]}>Tap to choose your home country</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.primary} />
            </Pressable>
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
                onValueChange={(v) => handleNotifChange(item.key, v)}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={"#FFFFFF"}
              />
            </View>
          ))}
          <Pressable
            style={[styles.testNotifBtn, { borderColor: colors.border }]}
            onPress={handleTestNotification}
          >
            <Ionicons name="notifications-outline" size={16} color={colors.primary} />
            <Text style={[styles.testNotifText, { color: colors.primary }]}>{t("notifTestBtn")}</Text>
          </Pressable>
        </View>

        {/* Support */}
        <View style={[styles.menuSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Pressable
            style={[styles.menuRow, { borderBottomColor: colors.border }]}
            onPress={() => Linking.openURL("https://wa.me/971561167903")}
          >
            <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
            <Text style={[styles.menuLabel, { color: colors.foreground }]}>{t("profileSupport")}</Text>
            <Ionicons name="open-outline" size={16} color={colors.mutedForeground} />
          </Pressable>
        </View>

        {/* Admin Tools */}
        {adminLoggedIn && (
          <View style={[styles.menuSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Pressable
              style={[styles.menuRow, { borderBottomColor: colors.border }]}
              onPress={() => router.push("/admin-content")}
            >
              <Ionicons name="settings-outline" size={20} color={colors.primary} />
              <Text style={[styles.menuLabel, { color: colors.primary }]}>App Content Admin</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.primary} />
            </Pressable>
            <Pressable
              style={[styles.menuRow, { borderBottomColor: "transparent" }]}
              onPress={handleAdminLogout}
            >
              <Ionicons name="log-out-outline" size={20} color={colors.destructive} />
              <Text style={[styles.menuLabel, { color: colors.destructive }]}>Logout from Admin</Text>
            </Pressable>
          </View>
        )}

        <Text style={[styles.shopifyNote, { color: colors.mutedForeground }]}>
          Your orders and payments are handled securely through mekazon.com
        </Text>

        <View style={styles.legalRow}>
          <Pressable onPress={() => Linking.openURL("https://www.mekazon.com/policies/privacy-policy")}>
            <Text style={[styles.legalLink, { color: colors.mutedForeground }]}>Privacy Policy</Text>
          </Pressable>
          <View style={[styles.legalDot, { backgroundColor: colors.border }]} />
          <Pressable onPress={() => Linking.openURL("https://www.mekazon.com/policies/terms-of-service")}>
            <Text style={[styles.legalLink, { color: colors.mutedForeground }]}>Terms of Use</Text>
          </Pressable>
        </View>

        <Pressable onPress={handleVersionTap} style={styles.versionWrap}>
          <Text style={[styles.versionText, { color: colors.mutedForeground }]}>
            Mekazon App v{APP_VERSION}
          </Text>
          {versionTapCount > 0 && versionTapCount < VERSION_TAPS_REQUIRED && (
            <Text style={[styles.versionHint, { color: colors.mutedForeground }]}>
              {VERSION_TAPS_REQUIRED - versionTapCount} more tap{VERSION_TAPS_REQUIRED - versionTapCount === 1 ? "" : "s"}...
            </Text>
          )}
        </Pressable>
      </ScrollView>

      {/* Admin Login Modal */}
      <Modal visible={showAdminLogin} animationType="fade" transparent>
        <Pressable style={styles.modalOverlay} onPress={() => setShowAdminLogin(false)} />
        <Animated.View
          entering={FadeInDown.duration(300)}
          style={[styles.adminLoginSheet, { backgroundColor: colors.card }]}
        >
          <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />
          <View style={styles.adminLoginIcon}>
            <Ionicons name="lock-closed" size={24} color={colors.primary} />
          </View>
          <Text style={[styles.adminLoginTitle, { color: colors.foreground }]}>Admin Access</Text>
          <Text style={[styles.adminLoginSub, { color: colors.mutedForeground }]}>
            Enter the admin password to manage app content
          </Text>
          <TextInput
            style={[
              styles.adminLoginInput,
              {
                backgroundColor: colors.background,
                borderColor: adminPwError ? colors.destructive : colors.border,
                color: colors.foreground,
              },
            ]}
            placeholder="Admin password"
            placeholderTextColor={colors.mutedForeground}
            secureTextEntry
            value={adminPw}
            onChangeText={(v) => { setAdminPw(v); setAdminPwError(false); }}
            onSubmitEditing={handleAdminLogin}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {adminPwError && (
            <Text style={[styles.adminPwError, { color: colors.destructive }]}>Incorrect password</Text>
          )}
          <Pressable
            style={[styles.adminLoginBtn, { backgroundColor: colors.primary }]}
            onPress={handleAdminLogin}
          >
            <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
            <Text style={styles.adminLoginBtnText}>Sign In</Text>
          </Pressable>
        </Animated.View>
      </Modal>

      {/* Country Picker Modal */}
      <Modal visible={showCountryPicker} animationType="slide" transparent>
        <Pressable style={styles.modalOverlay} onPress={() => setShowCountryPicker(false)} />
        <Animated.View
          entering={FadeInDown.duration(300)}
          style={[styles.modalSheet, { backgroundColor: colors.card }]}
        >
          <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />
          <Text style={[styles.modalTitle, { color: colors.foreground }]}>{t("profileChangeHome")}</Text>
          <Text style={{ fontSize: 12, color: colors.mutedForeground, marginTop: -4, marginBottom: 8 }}>
            Tap a country to switch your experience
          </Text>
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
  avatarInitial: { fontSize: 30, fontWeight: "800" },
  guestName: { fontSize: 18, fontWeight: "700" },
  userPhone: { fontSize: 14, marginTop: -4 },
  logoutBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 18, paddingVertical: 9, borderRadius: 20, borderWidth: 1, marginTop: 4 },
  logoutText: { fontSize: 13, fontWeight: "600" },
  signInBtn: { flexDirection: "row", alignItems: "center", gap: 7, paddingHorizontal: 22, paddingVertical: 12, borderRadius: 14, marginTop: 4 },
  signInText: { fontSize: 14, fontWeight: "700" },
  testNotifBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 13, marginTop: 8, borderRadius: 12, borderWidth: 1 },
  testNotifText: { fontSize: 14, fontWeight: "600" },
  card: { marginHorizontal: 22, marginBottom: 14, borderRadius: 18, borderWidth: 1, padding: 18 },
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
  notifRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 12, borderBottomWidth: 1 },
  notifLabel: { fontSize: 14, flex: 1 },
  menuSection: { marginHorizontal: 22, marginBottom: 14, borderRadius: 18, borderWidth: 1, paddingHorizontal: 18 },
  menuRow: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 16, borderBottomWidth: 1 },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: "500" },
  shopifyNote: { fontSize: 11, textAlign: "center", paddingHorizontal: 24, paddingBottom: 8, lineHeight: 17 },
  legalRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 8 },
  legalLink: { fontSize: 12, fontWeight: "500" },
  legalDot: { width: 3, height: 3, borderRadius: 1.5 },
  versionWrap: { alignItems: "center", paddingVertical: 14, paddingBottom: 4, gap: 4 },
  versionText: { fontSize: 12, fontWeight: "500" },
  versionHint: { fontSize: 11, opacity: 0.7 },
  adminLoginSheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingTop: 12, gap: 12 },
  adminLoginIcon: { alignSelf: "center", width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(78,114,52,0.12)", marginTop: 8 },
  adminLoginTitle: { fontSize: 20, fontWeight: "800", textAlign: "center", letterSpacing: -0.4 },
  adminLoginSub: { fontSize: 13, textAlign: "center", lineHeight: 19, marginBottom: 4 },
  adminLoginInput: { borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, marginTop: 4 },
  adminPwError: { fontSize: 13, textAlign: "center", marginTop: -4 },
  adminLoginBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, paddingVertical: 15, marginTop: 4 },
  adminLoginBtnText: { fontSize: 15, fontWeight: "700", color: "#FFFFFF" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)" },
  modalSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingTop: 12, gap: 10 },
  modalHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 12 },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 4, letterSpacing: -0.3 },
  modalOption: { flexDirection: "row", alignItems: "center", borderRadius: 14, borderWidth: 1.5, paddingVertical: 12, paddingRight: 16, gap: 12, overflow: "hidden" },
  flagBarSmall: { width: 5, height: 52, flexDirection: "column" },
  flagStripeSmall: { flex: 1 },
  modalOptionContent: { flex: 1, paddingLeft: 10 },
  modalOptionName: { fontSize: 15, fontWeight: "700" },
  modalOptionSub: { fontSize: 12, marginTop: 2 },
});