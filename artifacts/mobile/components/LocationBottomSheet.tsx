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
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useLocation, UAE_EMIRATES, type UAE_Emirate } from "@/context/LocationContext";
import { useLanguage } from "@/context/LanguageContext";

interface LocationBottomSheetProps {
  visible: boolean;
  onClose: () => void;
}

export function LocationBottomSheet({ visible, onClose }: LocationBottomSheetProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const { selectedEmirate, setEmirate } = useLocation();
  const [pending, setPending] = useState<UAE_Emirate | null>(selectedEmirate);

  const bottomPad = Platform.OS === "web" ? 32 : insets.bottom + 16;

  const handleSelect = (emirate: UAE_Emirate) => {
    Haptics.selectionAsync();
    setPending(emirate);
  };

  const handleConfirm = async () => {
    if (pending) {
      await setEmirate(pending);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose} />
      <Animated.View
        entering={FadeInDown.duration(280)}
        style={[
          styles.sheet,
          {
            backgroundColor: colors.card,
            paddingBottom: bottomPad,
          },
        ]}
      >
        <View style={[styles.handle, { backgroundColor: colors.border }]} />

        <Text style={[styles.title, { color: colors.foreground }]}>
          {t("locationTitle")}
        </Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          {t("locationSubtext")}
        </Text>

        <ScrollView
          style={styles.list}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingBottom: 8 }}
        >
          {UAE_EMIRATES.map((emirate) => {
            const isSelected = pending?.id === emirate.id;
            return (
              <Pressable
                key={emirate.id}
                style={[
                  styles.emirateRow,
                  {
                    backgroundColor: isSelected ? colors.secondary : "transparent",
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => handleSelect(emirate)}
              >
                <View style={styles.emirateInfo}>
                  <Text
                    style={[
                      styles.emirateName,
                      { color: isSelected ? colors.primary : colors.foreground },
                    ]}
                  >
                    {emirate.name}
                  </Text>
                  {isSelected && (
                    <View
                      style={[
                        styles.deliveryBadge,
                        {
                          backgroundColor: emirate.sameDay
                            ? "#4E7234" + "22"
                            : colors.muted,
                        },
                      ]}
                    >
                      <Ionicons
                        name={emirate.sameDay ? "flash" : "time-outline"}
                        size={11}
                        color={emirate.sameDay ? "#4E7234" : colors.mutedForeground}
                      />
                      <Text
                        style={[
                          styles.deliveryBadgeText,
                          {
                            color: emirate.sameDay
                              ? "#4E7234"
                              : colors.mutedForeground,
                          },
                        ]}
                      >
                        {emirate.sameDay
                          ? t("sameDayLabel")
                          : t("nextDayLabel")}
                      </Text>
                    </View>
                  )}
                </View>
                <View
                  style={[
                    styles.radioOuter,
                    {
                      borderColor: isSelected ? colors.primary : colors.border,
                      backgroundColor: isSelected ? colors.primary : "transparent",
                    },
                  ]}
                >
                  {isSelected && (
                    <View style={[styles.radioInner, { backgroundColor: colors.primaryForeground }]} />
                  )}
                </View>
              </Pressable>
            );
          })}
        </ScrollView>

        <Pressable
          style={[
            styles.confirmBtn,
            { backgroundColor: pending ? colors.primary : colors.muted },
          ]}
          onPress={handleConfirm}
          disabled={!pending}
        >
          <Ionicons
            name="location"
            size={16}
            color={pending ? colors.primaryForeground : colors.mutedForeground}
          />
          <Text
            style={[
              styles.confirmBtnText,
              { color: pending ? colors.primaryForeground : colors.mutedForeground },
            ]}
          >
            {t("locationConfirm")}
          </Text>
        </Pressable>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingTop: 12,
    maxHeight: "80%",
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 18,
  },
  list: {
    maxHeight: 340,
    marginBottom: 16,
  },
  emirateRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 12,
  },
  emirateInfo: {
    flex: 1,
    gap: 6,
  },
  emirateName: {
    fontSize: 15,
    fontWeight: "700",
  },
  deliveryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  deliveryBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  confirmBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 17,
    borderRadius: 18,
  },
  confirmBtnText: {
    fontSize: 16,
    fontWeight: "700",
  },
});
