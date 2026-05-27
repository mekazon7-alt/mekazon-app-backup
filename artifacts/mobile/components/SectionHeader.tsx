import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  onSeeAll?: () => void;
}

export function SectionHeader({ title, subtitle, onSeeAll }: SectionHeaderProps) {
  const colors = useColors();
  return (
    <View style={styles.row}>
      <View>
        <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
        {subtitle ? <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{subtitle}</Text> : null}
      </View>
      {onSeeAll ? (
        <Pressable onPress={onSeeAll}>
          <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  seeAll: {
    fontSize: 13,
    fontWeight: "600",
  },
});
