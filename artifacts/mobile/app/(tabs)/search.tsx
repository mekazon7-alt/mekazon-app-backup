import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  FlatList,
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
import { useHomeCountry } from "@/context/HomeCountryContext";
import { useCart } from "@/context/CartContext";
import { ProductCard } from "@/components/ProductCard";

export default function SearchScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { countryConfig } = useHomeCountry();
  const { totalItems } = useCart();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom + 60;

  const filtered = countryConfig?.products.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.description.toLowerCase().includes(query.toLowerCase())
  ) ?? [];

  const suggestions = countryConfig?.searchSuggestions ?? [];

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.headerArea, { paddingTop: topPad + 12 }]}>
        <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: focused ? colors.primary : colors.border }]}>
          <Ionicons name="search" size={18} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder={`Search in ${countryConfig?.name ?? "Mekazon"}...`}
            placeholderTextColor={colors.mutedForeground}
            value={query}
            onChangeText={setQuery}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")}>
              <Ionicons name="close-circle" size={18} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: bottomPad }}
        showsVerticalScrollIndicator={false}
      >
        {query.length === 0 ? (
          <>
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                {countryConfig ? `What ${countryConfig.name} shops for` : "Trending"}
              </Text>
              <View style={styles.suggestions}>
                {suggestions.map((s) => (
                  <Pressable
                    key={s}
                    style={[styles.suggestionPill, { backgroundColor: colors.secondary, borderColor: colors.border }]}
                    onPress={() => setQuery(s)}
                  >
                    <Ionicons name="search" size={13} color={colors.mutedForeground} />
                    <Text style={[styles.suggestionText, { color: colors.foreground }]}>{s}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Browse All Products</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.productRow}>
                {(countryConfig?.products ?? []).map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </ScrollView>
            </View>
          </>
        ) : (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
              {filtered.length} result{filtered.length !== 1 ? "s" : ""} for "{query}"
            </Text>
            {filtered.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={40} color={colors.mutedForeground} />
                <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Nothing found</Text>
                <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
                  Try a different term or browse categories
                </Text>
              </View>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.productRow}>
                {filtered.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </ScrollView>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  headerArea: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1.5,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  section: {
    paddingTop: 8,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    paddingHorizontal: 20,
    marginBottom: 14,
    letterSpacing: -0.3,
  },
  suggestions: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 8,
  },
  suggestionPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 24,
    borderWidth: 1,
  },
  suggestionText: {
    fontSize: 13,
    fontWeight: "500",
  },
  productRow: {
    paddingHorizontal: 20,
    paddingBottom: 4,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 50,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
  },
});
