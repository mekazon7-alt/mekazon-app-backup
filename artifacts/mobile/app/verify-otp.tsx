import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState, useRef, useEffect } from "react";
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
import { useAuth } from "@/context/AuthContext";
import { verifyOTP, getPendingPhone, sendOTP, saveSession } from "@/services/authService";
import type { UserProfile } from "@/types/user";

type Step = "otp" | "name";

export default function VerifyOtpScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const { login } = useAuth();

  const phone = getPendingPhone();
  const topPad = Platform.OS === "web" ? 20 : insets.top;
  const bottomPad = Platform.OS === "web" ? 20 : insets.bottom;

  const [step, setStep] = useState<Step>("otp");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const otpRef = useRef<TextInput>(null);
  const nameRef = useRef<TextInput>(null);

  // Start resend cooldown
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (resendCooldown > 0) {
      timer = setInterval(() => setResendCooldown((v) => v - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleVerify = async () => {
    if (otp.length < 6 || loading) return;
    setLoading(true);
    setError("");
    try {
      const ok = await verifyOTP(otp);
      if (ok) {
        setStep("name");
        setTimeout(() => nameRef.current?.focus(), 200);
      } else {
        setError(t("otpWrong"));
        setOtp("");
        otpRef.current?.focus();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setResendCooldown(30);
    await sendOTP(phone);
  };

  const handleComplete = async () => {
    if (!name.trim() || loading) return;
    setLoading(true);
    try {
      const profile: UserProfile = {
        phone,
        name: name.trim(),
        notificationPreferences: {
          offers: true,
          freshStock: true,
          newArrivals: true,
          reorder: false,
          orderUpdates: true,
          weeklyBasket: true,
        },
      };
      const session = await saveSession(profile);
      login(session);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      router.replace("/(tabs)/" as any);
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
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={colors.foreground} />
          <Text style={[styles.backText, { color: colors.foreground }]}>{t("loginBack")}</Text>
        </Pressable>

        {step === "otp" ? (
          <>
            <Text style={[styles.title, { color: colors.foreground }]}>{t("otpTitle")}</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              {t("otpSubtitle").replace("{phone}", phone)}
            </Text>

            <TextInput
              ref={otpRef}
              style={[styles.otpInput, {
                color: colors.foreground,
                borderColor: error ? colors.destructive : otp.length === 6 ? colors.primary : colors.border,
                backgroundColor: colors.card,
              }]}
              value={otp}
              onChangeText={(v) => { setOtp(v.replace(/\D/g, "").slice(0, 6)); setError(""); }}
              keyboardType="number-pad"
              maxLength={6}
              placeholder="• • • • • •"
              placeholderTextColor={colors.mutedForeground}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleVerify}
            />

            {!!error && (
              <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text>
            )}

            <Pressable
              style={[styles.mainBtn, { backgroundColor: otp.length === 6 && !loading ? colors.primary : colors.muted }]}
              onPress={handleVerify}
              disabled={otp.length < 6 || loading}
            >
              <Text style={styles.mainBtnText}>
                {loading ? t("otpVerifying") : t("otpVerify")}
              </Text>
            </Pressable>

            <Pressable
              style={styles.resendBtn}
              onPress={handleResend}
              disabled={resendCooldown > 0}
            >
              <Text style={[styles.resendText, { color: resendCooldown > 0 ? colors.mutedForeground : colors.primary }]}>
                {resendCooldown > 0 ? `${t("otpResend")} (${resendCooldown}s)` : t("otpResend")}
              </Text>
            </Pressable>

          </>
        ) : (
          <>
            <View style={[styles.successIcon, { backgroundColor: colors.primary + "20" }]}>
              <Ionicons name="checkmark-circle" size={36} color={colors.primary} />
            </View>
            <Text style={[styles.title, { color: colors.foreground }]}>{t("otpNameTitle")}</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              Verified as {phone}
            </Text>

            <TextInput
              ref={nameRef}
              style={[styles.nameInput, {
                color: colors.foreground,
                borderColor: name.trim() ? colors.primary : colors.border,
                backgroundColor: colors.card,
              }]}
              value={name}
              onChangeText={setName}
              placeholder={t("otpNamePlaceholder")}
              placeholderTextColor={colors.mutedForeground}
              returnKeyType="done"
              onSubmitEditing={handleComplete}
              autoCapitalize="words"
            />

            <Pressable
              style={[styles.mainBtn, { backgroundColor: name.trim() && !loading ? colors.primary : colors.muted }]}
              onPress={handleComplete}
              disabled={!name.trim() || loading}
            >
              <Text style={styles.mainBtnText}>
                {loading ? "Saving..." : t("otpContinue")}
              </Text>
              {!loading && <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />}
            </Pressable>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 24 },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 40, alignSelf: "flex-start" },
  backText: { fontSize: 16, fontWeight: "600" },
  title: { fontSize: 32, fontWeight: "800", letterSpacing: -0.8, marginBottom: 10 },
  subtitle: { fontSize: 15, lineHeight: 22, marginBottom: 32 },
  otpInput: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: 12,
    textAlign: "center",
    borderWidth: 2,
    borderRadius: 18,
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  nameInput: {
    fontSize: 20,
    fontWeight: "600",
    borderWidth: 1.5,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  errorText: { fontSize: 14, textAlign: "center", marginBottom: 12 },
  mainBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 16,
    paddingVertical: 18,
    marginTop: 8,
    marginBottom: 16,
  },
  mainBtnText: { fontSize: 16, fontWeight: "700", color: "#FFFFFF" },
  resendBtn: { alignItems: "center", paddingVertical: 12, marginBottom: 24 },
  resendText: { fontSize: 15, fontWeight: "600" },
  successIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
    marginBottom: 24,
  },
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
