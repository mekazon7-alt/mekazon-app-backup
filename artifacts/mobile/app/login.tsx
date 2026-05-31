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
import { sendOTP, setPendingPhone, setPendingChannel } from "@/services/authService";

const COUNTRY_CODES = [
  { flag: "🇦🇪", code: "+971", label: "UAE" },
  { flag: "🇰🇪", code: "+254", label: "Kenya" },
  { flag: "🇺🇬", code: "+256", label: "Uganda" },
  { flag: "🇪🇹", code: "+251", label: "Ethiopia" },
  { flag: "🇬🇧", code: "+44", label: "UK" },
  { flag: "🇺🇸", code: "+1", label: "US/Canada" },
  { flag: "🇳🇬", code: "+234", label: "Nigeria" },
  { flag: "🇬🇭", code: "+233", label: "Ghana" },
  { flag: "🇸🇦", code: "+966", label: "Saudi Arabia" },
];

type Channel = "sms" | "whatsapp";

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();

  const [selectedCode, setSelectedCode] = useState(COUNTRY_CODES[0]);
  const [phone, setPhone] = useState("");
  const [channel, setChannel] = useState<Channel>("sms");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCodePicker, setShowCodePicker] = useState(false);

  const topPad = Platform.OS === "web" ? 20 : insets.top;
  const bottomPad = Platform.OS === "web" ? 20 : insets.bottom;

  const fullPhone = `${selectedCode.code}${phone.replace(/\s/g, "")}`;
  const canSend = phone.replace(/\D/g, "").length >= 7;

  const handleSend = async () => {
    if (!canSend || loading) return;
    setLoading(true);
    setError("");
    try {
      await sendOTP(fullPhone, channel);
      setPendingPhone(fullPhone);
      setPendingChannel(channel);
      router.push("/verify-otp");
    } catch (err: any) {
      setError(err.message ?? "Failed to send code. Please try again.");
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
        contentContainerStyle={[
          styles.content,
          { paddingTop: topPad + 20, paddingBottom: bottomPad + 40 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back */}
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={colors.foreground} />
          <Text style={[styles.backText, { color: colors.foreground }]}>
            {t("loginBack")}
          </Text>
        </Pressable>

        {/* Brand */}
        <View style={styles.brandRow}>
          <View style={[styles.brandDot, { backgroundColor: "#C4541A" }]} />
          <Text style={[styles.brandName, { color: colors.foreground }]}>
            Mekazon
          </Text>
        </View>

        <Text style={[styles.title, { color: colors.foreground }]}>
          {t("loginTitle")}
        </Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          {t("loginSubtitle")}
        </Text>

        {/* Channel selector */}
        <Text style={[styles.label, { color: colors.mutedForeground }]}>
          SEND CODE VIA
        </Text>
        <View style={styles.channelRow}>
          <Pressable
            style={[
              styles.channelBtn,
              {
                backgroundColor:
                  channel === "sms" ? "#C4541A" : colors.secondary,
                borderColor:
                  channel === "sms" ? "#C4541A" : colors.border,
              },
            ]}
            onPress={() => setChannel("sms")}
          >
            <Ionicons
              name="chatbubble-outline"
              size={16}
              color={channel === "sms" ? "#FFFFFF" : colors.mutedForeground}
            />
            <Text
              style={[
                styles.channelBtnText,
                { color: channel === "sms" ? "#FFFFFF" : colors.foreground },
              ]}
            >
              SMS
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.channelBtn,
              {
                backgroundColor:
                  channel === "whatsapp" ? "#25D366" : colors.secondary,
                borderColor:
                  channel === "whatsapp" ? "#25D366" : colors.border,
              },
            ]}
            onPress={() => setChannel("whatsapp")}
          >
            <Ionicons
              name="logo-whatsapp"
              size={16}
              color={
                channel === "whatsapp" ? "#FFFFFF" : colors.mutedForeground
              }
            />
            <Text
              style={[
                styles.channelBtnText,
                {
                  color:
                    channel === "whatsapp" ? "#FFFFFF" : colors.foreground,
                },
              ]}
            >
              WhatsApp
            </Text>
          </Pressable>
        </View>

        {/* Phone input */}
        <Text
          style={[styles.label, { color: colors.mutedForeground, marginTop: 20 }]}
        >
          {t("loginPhoneLabel")}
        </Text>
        <View
          style={[
            styles.phoneRow,
            { borderColor: colors.border, backgroundColor: colors.card },
          ]}
        >
          <Pressable
            style={[styles.codeBtn, { borderRightColor: colors.border }]}
            onPress={() => setShowCodePicker((v) => !v)}
          >
            <Text style={styles.codeFlag}>{selectedCode.flag}</Text>
            <Text style={[styles.codeText, { color: colors.foreground }]}>
              {selectedCode.code}
            </Text>
            <Ionicons
              name="chevron-down"
              size={13}
              color={colors.mutedForeground}
            />
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
          <View
            style={[
              styles.codeDropdown,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            {COUNTRY_CODES.map((c) => (
              <Pressable
                key={c.code}
                style={[
                  styles.codeOption,
                  { borderBottomColor: colors.border },
                  selectedCode.code === c.code && {
                    backgroundColor: colors.secondary,
                  },
                ]}
                onPress={() => {
                  setSelectedCode(c);
                  setShowCodePicker(false);
                }}
              >
                <Text style={styles.codeFlag}>{c.flag}</Text>
                <Text
                  style={[
                    styles.codeOptionLabel,
                    { color: colors.foreground },
                  ]}
                >
                  {c.label}
                </Text>
                <Text
                  style={[
                    styles.codeOptionCode,
                    { color: colors.mutedForeground },
                  ]}
                >
                  {c.code}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Error */}
        {!!error && (
          <Text style={[styles.errorText, { color: colors.destructive }]}>
            {error}
          </Text>
        )}

        {/* Send button */}
        <Pressable
          style={[
            styles.sendBtn,
            {
              backgroundColor:
                canSend && !loading
                  ? channel === "whatsapp"
                    ? "#25D366"
                    : "#C4541A"
                  : colors.muted,
            },
          ]}
          onPress={handleSend}
          disabled={!canSend || loading}
        >
          <Ionicons
            name={channel === "whatsapp" ? "logo-whatsapp" : "chatbubble-outline"}
            size={18}
            color="#FFFFFF"
          />
          <Text style={styles.sendBtnText}>
            {loading
              ? "Sending..."
              : channel === "whatsapp"
              ? "Send via WhatsApp"
              : "Send via SMS"}
          </Text>
          {!loading && (
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          )}
        </Pressable>

        <Text style={[styles.note, { color: colors.mutedForeground }]}>
          We'll send a 6-digit verification code to confirm your number.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 24 },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 40,
    alignSelf: "flex-start",
  },
  backText: { fontSize: 16, fontWeight: "600" },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 28,
  },
  brandDot: { width: 10, height: 10, borderRadius: 5 },
  brandName: { fontSize: 16, fontWeight: "800", letterSpacing: -0.3 },
  title: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.8,
    marginBottom: 10,
  },
  subtitle: { fontSize: 15, lineHeight: 22, marginBottom: 28 },
  label: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  channelRow: { flexDirection: "row", gap: 12 },
  channelBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  channelBtnText: { fontSize: 14, fontWeight: "700" },
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
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderRightWidth: 1,
  },
  codeFlag: { fontSize: 18 },
  codeText: { fontSize: 15, fontWeight: "700" },
  phoneInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    paddingHorizontal: 14,
    paddingVertical: 16,
  },
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
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  codeOptionLabel: { flex: 1, fontSize: 15, fontWeight: "600" },
  codeOptionCode: { fontSize: 14 },
  errorText: {
    fontSize: 13,
    textAlign: "center",
    marginBottom: 8,
    marginTop: 4,
  },
  sendBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 16,
    paddingVertical: 18,
    marginTop: 20,
    marginBottom: 16,
  },
  sendBtnText: { fontSize: 16, fontWeight: "700", color: "#FFFFFF" },
  note: { fontSize: 12, textAlign: "center", lineHeight: 18 },
});