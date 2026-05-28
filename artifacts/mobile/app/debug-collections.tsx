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
import {
  getCollections,
  getCollectionByHandle,
  type ShopifyCollectionSummary,
  type ShopifyProduct,
} from "@/services/shopify";
import { COUNTRY_COLLECTION_HANDLES } from "@/services/shopify";

const STORE_DOMAIN =
  (process.env.EXPO_PUBLIC_SHOPIFY_STORE_DOMAIN as string | undefined) ?? "";
const IS_LIVE = !!STORE_DOMAIN;

interface CollectionRow extends ShopifyCollectionSummary {
  firstProduct: ShopifyProduct | null;
  loadingProduct: boolean;
  mapped: boolean;
}

export default function DebugCollectionsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<CollectionRow[]>([]);

  const mappedHandles = new Set(Object.values(COUNTRY_COLLECTION_HANDLES));

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const collections = await getCollections();
      const initial: CollectionRow[] = collections.map((c) => ({
        ...c,
        firstProduct: null,
        loadingProduct: true,
        mapped: mappedHandles.has(c.handle),
      }));
      setRows(initial);
      setLoading(false);

      await Promise.all(
        collections.map(async (c, idx) => {
          try {
            const full = await getCollectionByHandle(c.handle);
            const product = full?.products.nodes[0] ?? null;
            setRows((prev) =>
              prev.map((r, i) =>
                i === idx ? { ...r, firstProduct: product, loadingProduct: false } : r
              )
            );
          } catch {
            setRows((prev) =>
              prev.map((r, i) =>
                i === idx ? { ...r, loadingProduct: false } : r
              )
            );
          }
        })
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const copyHandle = (handle: string) => {
    Alert.alert("Collection Handle", `"${handle}"\n\nUse this value in COUNTRY_COLLECTION_HANDLES in services/shopify/index.ts`);
  };

  const productCount = (row: CollectionRow): string => {
    const raw = row.productsCount as unknown;
    if (typeof raw === "number") return String(raw);
    if (raw && typeof raw === "object" && "count" in raw) return String((raw as { count: number }).count);
    return "—";
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
          <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>
            Fetching collections from Shopify...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Ionicons name="alert-circle" size={40} color="#C4541A" />
          <Text style={[styles.errorTitle, { color: colors.foreground }]}>API Error</Text>
          <Text style={[styles.errorText, { color: colors.mutedForeground }]}>{error}</Text>
          <Pressable
            style={[styles.retryBtn, { backgroundColor: colors.primary }]}
            onPress={load}
          >
            <Text style={[styles.retryText, { color: colors.primaryForeground }]}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }}>
          <Text style={[styles.sectionNote, { color: colors.mutedForeground }]}>
            {rows.length} collections found. Green = currently mapped to a country.
          </Text>

          <View style={[styles.mapTable, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.mapTitle, { color: colors.foreground }]}>Current mapping</Text>
            {Object.entries(COUNTRY_COLLECTION_HANDLES).map(([country, handle]) => (
              <View key={country} style={[styles.mapRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.mapCountry, { color: colors.mutedForeground }]}>{country}</Text>
                <Pressable onPress={() => copyHandle(handle)}>
                  <Text style={[styles.mapHandle, { color: colors.primary }]}>{handle}</Text>
                </Pressable>
                {rows.length > 0 && (
                  <Ionicons
                    name={rows.some((r) => r.handle === handle) ? "checkmark-circle" : "close-circle"}
                    size={16}
                    color={rows.some((r) => r.handle === handle) ? "#4E7234" : "#C4541A"}
                  />
                )}
              </View>
            ))}
          </View>

          {rows.map((row) => (
            <View
              key={row.id}
              style={[
                styles.card,
                {
                  backgroundColor: colors.card,
                  borderColor: row.mapped ? "#4E7234" : colors.border,
                  borderWidth: row.mapped ? 2 : 1,
                },
              ]}
            >
              <View style={styles.cardTop}>
                {row.image ? (
                  <Image source={{ uri: row.image.url }} style={styles.collectionImage} />
                ) : (
                  <View style={[styles.collectionImagePlaceholder, { backgroundColor: colors.secondary }]}>
                    <Ionicons name="grid-outline" size={20} color={colors.mutedForeground} />
                  </View>
                )}
                <View style={styles.cardInfo}>
                  <View style={styles.titleRow}>
                    <Text style={[styles.collectionTitle, { color: colors.foreground }]} numberOfLines={1}>
                      {row.title}
                    </Text>
                    {row.mapped && (
                      <View style={styles.mappedBadge}>
                        <Text style={styles.mappedBadgeText}>mapped</Text>
                      </View>
                    )}
                  </View>
                  <Pressable onPress={() => copyHandle(row.handle)} style={styles.handleRow}>
                    <Text style={[styles.handleText, { color: colors.primary }]}>{row.handle}</Text>
                    <Ionicons name="copy-outline" size={13} color={colors.primary} />
                  </Pressable>
                  <Text style={[styles.countText, { color: colors.mutedForeground }]}>
                    {productCount(row)} products
                  </Text>
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              <View style={styles.firstProduct}>
                <Text style={[styles.firstProductLabel, { color: colors.mutedForeground }]}>
                  First product:
                </Text>
                {row.loadingProduct ? (
                  <ActivityIndicator size="small" color={colors.mutedForeground} />
                ) : row.firstProduct ? (
                  <View style={styles.productPreview}>
                    {row.firstProduct.featuredImage ? (
                      <Image
                        source={{ uri: row.firstProduct.featuredImage.url }}
                        style={styles.productThumb}
                      />
                    ) : (
                      <View style={[styles.productThumbPlaceholder, { backgroundColor: colors.secondary }]}>
                        <Ionicons name="image-outline" size={14} color={colors.mutedForeground} />
                      </View>
                    )}
                    <View style={styles.productInfo}>
                      <Text style={[styles.productName, { color: colors.foreground }]} numberOfLines={2}>
                        {row.firstProduct.title}
                      </Text>
                      <Text style={[styles.productPrice, { color: colors.primary }]}>
                        {row.firstProduct.priceRange.minVariantPrice.currencyCode}{" "}
                        {parseFloat(row.firstProduct.priceRange.minVariantPrice.amount).toFixed(2)}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                    No products in this collection
                  </Text>
                )}
              </View>
            </View>
          ))}

          {rows.length === 0 && (
            <View style={styles.center}>
              <Ionicons name="folder-open-outline" size={40} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground, marginTop: 12 }]}>
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
  loadingText: { fontSize: 14, textAlign: "center", marginTop: 8 },
  errorTitle: { fontSize: 18, fontWeight: "700", marginTop: 8 },
  errorText: { fontSize: 13, textAlign: "center", lineHeight: 20 },
  retryBtn: { marginTop: 8, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  retryText: { fontSize: 14, fontWeight: "700" },
  sectionNote: { fontSize: 12, marginBottom: 12, lineHeight: 18 },
  mapTable: { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 16 },
  mapTitle: { fontSize: 13, fontWeight: "700", marginBottom: 10 },
  mapRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  mapCountry: { width: 70, fontSize: 12, fontWeight: "600" },
  mapHandle: { flex: 1, fontSize: 12, fontWeight: "500" },
  card: { borderRadius: 16, padding: 14, marginBottom: 12 },
  cardTop: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  collectionImage: { width: 60, height: 60, borderRadius: 10 },
  collectionImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cardInfo: { flex: 1, gap: 3 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  collectionTitle: { fontSize: 15, fontWeight: "700", flexShrink: 1 },
  mappedBadge: {
    backgroundColor: "#4E7234",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  mappedBadgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  handleRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  handleText: { fontSize: 12, fontWeight: "600" },
  countText: { fontSize: 12, marginTop: 1 },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: 10 },
  firstProduct: { flexDirection: "row", alignItems: "center", gap: 8 },
  firstProductLabel: { fontSize: 11, fontWeight: "600", minWidth: 72 },
  productPreview: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
  productThumb: { width: 40, height: 40, borderRadius: 8 },
  productThumbPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  productInfo: { flex: 1, gap: 2 },
  productName: { fontSize: 12, fontWeight: "600", lineHeight: 16 },
  productPrice: { fontSize: 12, fontWeight: "700" },
  emptyText: { fontSize: 12, fontStyle: "italic" },
});
