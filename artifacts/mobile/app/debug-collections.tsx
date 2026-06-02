import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { getCollections, type ShopifyCollectionSummary } from "@/services/shopify";
import { COUNTRY_COLLECTION_HANDLES } from "@/services/shopify";
import { ADMIN_ENABLED, isAdminAuthenticated } from "@/services/adminAuth";

const STORE_DOMAIN =
  (process.env.EXPO_PUBLIC_SHOPIFY_STORE_DOMAIN as string | undefined) ?? "";
const IS_LIVE = !!STORE_DOMAIN;

export default function DebugCollectionsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [collections, setCollections] = useState<ShopifyCollectionSummary[]>([]);

  const mappedHandles = new Set(Object.values(COUNTRY_COLLECTION_HANDLES));

  // Hard guard: this debug screen is dev-only. In production builds, or if the
  // user isn't an authenticated admin, bounce out immediately.
  useEffect(() => {
    if (!ADMIN_ENABLED || !isAdminAuthenticated()) router.replace("/(tabs)/");
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getCollections();
      setCollections(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const showHandle = (handle: string) => {
    Alert.alert(
      "Collection Handle",
      `"${handle}"\n\nEdit COUNTRY_COLLECTION_HANDLES in services/shopify/index.ts to use this value.`
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.foreground} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={[styles.title, { color: colors.foreground }]}>Shopify Collections</Text>
          <View style={[styles.badge, { backgroundColor: IS_LIVE ? "#4E7234" : "#C4541A" }]}>
            <Text style={styles.badgeText}>{IS_LIVE ? `LIVE — ${STORE_DOMAIN}` : "MOCK DATA"}</Text>
          </View>
        </View>
        <Pressable onPress={load} style={styles.refreshBtn}>
          <Ionicons name="refresh" size={20} color={colors.primary} />
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.hint, { color: colors.mutedForeground }]}>
            Fetching collections from Shopify...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Ionicons name="alert-circle" size={40} color="#C4541A" />
          <Text style={[styles.errorTitle, { color: colors.foreground }]}>API Error</Text>
          <Text style={[styles.errorBody, { color: colors.mutedForeground }]}>{error}</Text>
          <Pressable style={[styles.retryBtn, { backgroundColor: colors.primary }]} onPress={load}>
            <Text style={[styles.retryText, { color: colors.primaryForeground }]}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }}>
          <Text style={[styles.sectionNote, { color: colors.mutedForeground }]}>
            {collections.length} collections found. Tap any handle to see its full name.
          </Text>

          {/* Mapping status */}
          <View style={[styles.mapCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.mapTitle, { color: colors.foreground }]}>Current mapping</Text>
            {Object.entries(COUNTRY_COLLECTION_HANDLES).map(([country, handle]) => {
              const exists = collections.some((c) => c.handle === handle);
              return (
                <View key={country} style={[styles.mapRow, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.mapCountry, { color: colors.mutedForeground }]}>{country}</Text>
                  <Pressable onPress={() => showHandle(handle)} style={styles.mapHandleBtn}>
                    <Text style={[styles.mapHandle, { color: colors.primary }]}>{handle}</Text>
                  </Pressable>
                  <Ionicons
                    name={exists ? "checkmark-circle" : "close-circle"}
                    size={16}
                    color={exists ? "#4E7234" : "#C4541A"}
                  />
                </View>
              );
            })}
          </View>

          {/* Collection list */}
          {collections.map((col) => {
            const isMapped = mappedHandles.has(col.handle);
            const firstProduct = col.products.nodes[0] ?? null;
            return (
              <View
                key={col.id}
                style={[
                  styles.card,
                  {
                    backgroundColor: colors.card,
                    borderColor: isMapped ? "#4E7234" : colors.border,
                    borderWidth: isMapped ? 2 : 1,
                  },
                ]}
              >
                {/* Header row */}
                <View style={styles.cardRow}>
                  {col.image ? (
                    <Image source={{ uri: col.image.url }} style={styles.colImage} />
                  ) : (
                    <View style={[styles.colImagePlaceholder, { backgroundColor: colors.secondary }]}>
                      <Ionicons name="grid-outline" size={20} color={colors.mutedForeground} />
                    </View>
                  )}
                  <View style={styles.cardInfo}>
                    <View style={styles.titleRow}>
                      <Text style={[styles.colTitle, { color: colors.foreground }]} numberOfLines={1}>
                        {col.title}
                      </Text>
                      {isMapped && (
                        <View style={styles.mappedPill}>
                          <Text style={styles.mappedPillText}>mapped</Text>
                        </View>
                      )}
                    </View>
                    <Pressable onPress={() => showHandle(col.handle)} style={styles.handleRow}>
                      <Text style={[styles.handleText, { color: colors.primary }]}>{col.handle}</Text>
                      <Ionicons name="information-circle-outline" size={13} color={colors.primary} />
                    </Pressable>
                    <Text style={[styles.moreText, { color: colors.mutedForeground }]}>
                      {col.products.pageInfo.hasNextPage ? "Multiple products" : `${col.products.nodes.length} product${col.products.nodes.length !== 1 ? "s" : ""}`}
                    </Text>
                  </View>
                </View>

                {/* First product */}
                {firstProduct ? (
                  <>
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />
                    <View style={styles.productRow}>
                      <Text style={[styles.productLabel, { color: colors.mutedForeground }]}>
                        First product:
                      </Text>
                      {firstProduct.featuredImage ? (
                        <Image source={{ uri: firstProduct.featuredImage.url }} style={styles.productThumb} />
                      ) : (
                        <View style={[styles.productThumbEmpty, { backgroundColor: colors.secondary }]}>
                          <Ionicons name="image-outline" size={14} color={colors.mutedForeground} />
                        </View>
                      )}
                      <View style={styles.productMeta}>
                        <Text style={[styles.productName, { color: colors.foreground }]} numberOfLines={2}>
                          {firstProduct.title}
                        </Text>
                        <Text style={[styles.productPrice, { color: colors.primary }]}>
                          {firstProduct.priceRange.minVariantPrice.currencyCode}{" "}
                          {parseFloat(firstProduct.priceRange.minVariantPrice.amount).toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  </>
                ) : null}
              </View>
            );
          })}

          {collections.length === 0 && (
            <View style={styles.center}>
              <Ionicons name="folder-open-outline" size={40} color={colors.mutedForeground} />
              <Text style={[styles.hint, { color: colors.mutedForeground, marginTop: 12 }]}>
                No collections found
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    gap: 10,
  },
  backBtn: { padding: 4 },
  headerCenter: { flex: 1, gap: 4 },
  title: { fontSize: 18, fontWeight: "700", letterSpacing: -0.4 },
  badge: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "700", letterSpacing: 0.3 },
  refreshBtn: { padding: 6 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 12 },
  hint: { fontSize: 14, textAlign: "center", marginTop: 8 },
  errorTitle: { fontSize: 18, fontWeight: "700", marginTop: 8 },
  errorBody: { fontSize: 13, textAlign: "center", lineHeight: 20 },
  retryBtn: { marginTop: 8, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  retryText: { fontSize: 14, fontWeight: "700" },
  sectionNote: { fontSize: 12, marginBottom: 12, lineHeight: 18 },
  mapCard: { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 16 },
  mapTitle: { fontSize: 13, fontWeight: "700", marginBottom: 10 },
  mapRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  mapCountry: { width: 70, fontSize: 12, fontWeight: "600" },
  mapHandleBtn: { flex: 1 },
  mapHandle: { fontSize: 12, fontWeight: "500" },
  card: { borderRadius: 16, padding: 14, marginBottom: 12 },
  cardRow: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  colImage: { width: 56, height: 56, borderRadius: 10 },
  colImagePlaceholder: {
    width: 56, height: 56, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
  },
  cardInfo: { flex: 1, gap: 3 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  colTitle: { fontSize: 15, fontWeight: "700", flexShrink: 1 },
  mappedPill: {
    backgroundColor: "#4E7234",
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5,
  },
  mappedPillText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  handleRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  handleText: { fontSize: 12, fontWeight: "600" },
  moreText: { fontSize: 11, marginTop: 1 },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: 10 },
  productRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  productLabel: { fontSize: 11, fontWeight: "600", minWidth: 72 },
  productThumb: { width: 38, height: 38, borderRadius: 8 },
  productThumbEmpty: {
    width: 38, height: 38, borderRadius: 8,
    alignItems: "center", justifyContent: "center",
  },
  productMeta: { flex: 1, gap: 2 },
  productName: { fontSize: 12, fontWeight: "600", lineHeight: 16 },
  productPrice: { fontSize: 12, fontWeight: "700" },
});