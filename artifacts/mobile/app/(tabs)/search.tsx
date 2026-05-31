import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
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
import { ProductCard } from "@/components/ProductCard";
import { Analytics } from "@/services/analytics";

export default function SearchScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { experience, shopifyProducts, productsLoading } = useHomeCountry();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  React.useEffect(() => { Analytics.screenView("Search"); }, []);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom + 60;

  const filtered = query.length > 0
    ? shopifyProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.description.toLowerCase().includes(query.toLowerCase())
      )
    : shopifyProducts;

  const suggestions = experience?.searchSuggestions ?? [];

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.headerArea, { paddingTop: topPad + 12 }]}>
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: colors.card,
              borderColor: focused ? colors.primary : colors.border,
            },
          ]}
        >
          <Ionicons name="search" size={18} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder={`Search in ${experience?.name ?? "Mekazon"}...`}
            placeholderTextColor={colors.mutedForeground}
            value={query}
            onChangeText={(v) => {
              setQuery(v);
              if (v.length > 2) Analytics.search(v);
            }}
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

      <ScrollView style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: bottomPad }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Search suggestions — shown when search bar is empty */}
        {query.length === 0 && suggestions.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              {experience ? `What ${experience.name} shops for` : "Trending"}
            </Text>
            <View style={styles.suggestions}>
              {suggestions.map((s) => (
                <Pressable
                  key={s}
                  style={[
                    styles.suggestionPill,
                    { backgroundColor: colors.secondary, borderColor: colors.border },
                  ]}
                  onPress={() => setQuery(s)}
                >
                  <Ionicons name="search" size={13} color={colors.mutedForeground} />
                  <Text style={[styles.suggestionText, { color: colors.foreground }]}>{s}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Product grid */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            {query.length > 0
              ? `${filtered.length} result${filtered.length !== 1 ? "s" : ""} for "${query}"`
              : "Browse All Products"}
          </Text>

          {productsLoading ? (
            <View style={styles.loadingState}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>
                Loading products...
              </Text>
            </View>
          ) : filtered.length === 0 && query.length > 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={40} color={colors.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Nothing found</Text>
              <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
                Try a different search term
              </Text>
            </View>
          ) : filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="basket-outline" size={40} color={colors.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Products loading</Text>
              <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
                Your country's products will appear here
              </Text>
            </View>
          ) : (
            <View style={styles.productGrid}>
              {filtered.map((p) => (
                <View key={p.id} style={styles.productGridItem}>
                  <ProductCard product={p} cardStyle={{ width: "100%", marginRight: 0 }} />
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
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
    fontSize: 17,
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
  productGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 14,
    gap: 10,
  },
  productGridItem: {
    width: "47.5%",
    flexShrink: 0,
  },
  productGridCard: {
    width: "100%",
    marginRight: 0,
  },
  loadingState: {
    alignItems: "center",
    paddingVertical: 50,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 50,
    gap: 10,
    paddingHorizontal: 20,
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