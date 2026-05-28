import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useLanguage } from "@/context/LanguageContext";
import { sendOTP, setPendingPhone } from "@/services/authService";

const COUNTRY_CODES = [
  { flag: "AE", code: "+971", label: "UAE" },
  { flag: "KE", code: "+254", label: "Kenya" },
  { flag: "UG", code: "+256", label: "Uganda" },
  { flag: "ET", code: "+251", label: "Ethiopia" },
  { flag: "GB", code: "+44", label: "UK" },
  { flag: "US", code: "+1", label: "US/Canada" },
];

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();

  const [selectedCode, setSelectedCode] = useState(COUNTRY_CODES[0]);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCodePicker, setShowCodePicker] = useState(false);

  const topPad = Platform.OS === "web" ? 20 : insets.top;
  const bottomPad = Platform.OS === "web" ? 20 : insets.bottom;

  const fullPhone = `${selectedCode.code}${phone.replace(/\s/g, "")}`;
  const canSend = phone.replace(/\D/g, "").length >= 7;

  const handleSend = async () => {
    if (!canSend || loading) return;
    setLoading(true);
    try {
      await sendOTP(fullPhone);
      setPendingPhone(fullPhone);
      router.push("/verify-otp");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: topPad + 20, paddingBottom: bottomPad + 40 }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back */}
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={colors.foreground} />
          <Text style={[styles.backText, { color: colors.foreground }]}>{t("loginBack")}</Text>
        </Pressable>

        {/* Logo / Brand */}
        <View style={styles.brandRow}>
          <View style={[styles.brandDot, { backgroundColor: colors.primary }]} />
          <Text style={[styles.brandName, { color: colors.foreground }]}>Mekazon</Text>
        </View>

        <Text style={[styles.title, { color: colors.foreground }]}>{t("loginTitle")}</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{t("loginSubtitle")}</Text>

        {/* Phone input */}
        <Text style={[styles.label, { color: colors.mutedForeground }]}>{t("loginPhoneLabel")}</Text>
        <View style={[styles.phoneRow, { borderColor: colors.border, backgroundColor: colors.card }]}>
          {/* Country code picker */}
          <Pressable
            style={[styles.codeBtn, { borderRightColor: colors.border }]}
            onPress={() => setShowCodePicker((v) => !v)}
          >
            <Text style={[styles.codeText, { color: colors.foreground }]}>{selectedCode.code}</Text>
            <Ionicons name="chevron-down" size={13} color={colors.mutedForeground} />
          </Pressable>
          <TextInput
            style={[styles.phoneInput, { color: colors.foreground }]}
            value={phone}
            onChangeText={setPhone}
            placeholder="50 123 4567"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="phone-pad"
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleSend}
          />
        </View>

        {/* Country code dropdown */}
        {showCodePicker && (
          <View style={[styles.codeDropdown, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {COUNTRY_CODES.map((c) => (
              <Pressable
                key={c.code}
                style={[
                  styles.codeOption,
                  { borderBottomColor: colors.border },
                  selectedCode.code === c.code && { backgroundColor: colors.secondary },
                ]}
                onPress={() => { setSelectedCode(c); setShowCodePicker(false); }}
              >
                <Text style={[styles.codeOptionLabel, { color: colors.foreground }]}>{c.label}</Text>
                <Text style={[styles.codeOptionCode, { color: colors.mutedForeground }]}>{c.code}</Text>
              </Pressable>
            ))}
          </View>
        )}

        <Pressable
          style={[
            styles.sendBtn,
            { backgroundColor: canSend && !loading ? colors.primary : colors.muted },
          ]}
          onPress={handleSend}
          disabled={!canSend || loading}
        >
          <Text style={styles.sendBtnText}>
            {loading ? t("loginSending") : t("loginSendCode")}
          </Text>
          {!loading && <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />}
        </Pressable>

        {/* Developer note */}
        <View style={[styles.devNote, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
          <Ionicons name="code-slash-outline" size={13} color={colors.mutedForeground} />
          <Text style={[styles.devNoteText, { color: colors.mutedForeground }]}>
            {t("loginDevNote")}
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 24 },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 40, alignSelf: "flex-start" },
  backText: { fontSize: 16, fontWeight: "600" },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 28 },
  brandDot: { width: 10, height: 10, borderRadius: 5 },
  brandName: { fontSize: 16, fontWeight: "800", letterSpacing: -0.3 },
  title: { fontSize: 32, fontWeight: "800", letterSpacing: -0.8, marginBottom: 10 },
  subtitle: { fontSize: 15, lineHeight: 22, marginBottom: 32 },
  label: { fontSize: 12, fontWeight: "700", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 8 },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1.5,
    overflow: "hidden",
    marginBottom: 6,
  },
  codeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 16,
    borderRightWidth: 1,
  },
  codeText: { fontSize: 15, fontWeight: "700" },
  phoneInput: { flex: 1, fontSize: 18, fontWeight: "600", paddingHorizontal: 14, paddingVertical: 16 },
  codeDropdown: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  codeOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  codeOptionLabel: { fontSize: 15, fontWeight: "600" },
  codeOptionCode: { fontSize: 14 },
  sendBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 16,
    paddingVertical: 18,
    marginTop: 16,
    marginBottom: 24,
  },
  sendBtnText: { fontSize: 16, fontWeight: "700", color: "#FFFFFF" },
  devNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  devNoteText: { flex: 1, fontSize: 12, lineHeight: 18 },
});
