import { Ionicons } from "@expo/vector-icons";
import { Linking } from "react-native";
import React, { useState, useEffect, useCallback } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useLanguage } from "@/context/LanguageContext";
import { loadOrders, clearOrders, type LocalOrder } from "@/services/orderHistoryService";

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export default function OrdersScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom + 60;

  const [orders, setOrders] = useState<LocalOrder[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const data = await loadOrders();
    setOrders(data);
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleClearAll = async () => {
    await clearOrders();
    setOrders([]);
  };

  const renderOrder = ({ item }: { item: LocalOrder }) => (
    <View style={[styles.orderCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* Header */}
      <View style={styles.orderHeader}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.orderId, { color: colors.mutedForeground }]}>{item.id}</Text>
          <Text style={[styles.orderDate, { color: colors.foreground }]}>
            {formatDate(item.date)} at {formatTime(item.date)}
          </Text>
          {item.emirate && (
            <Text style={[styles.orderEmirate, { color: colors.mutedForeground }]}>
              {item.emirate}
            </Text>
          )}
        </View>
        <View style={[styles.statusBadge, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
          <View style={[styles.statusDot, { backgroundColor: "#C4881A" }]} />
          <Text style={[styles.statusText, { color: colors.foreground }]}>{t("orderStatusSent")}</Text>
        </View>
      </View>

      {/* Items */}
      <View style={[styles.itemsList, { borderTopColor: colors.border }]}>
        {item.items.slice(0, 4).map((it, i) => (
          <View key={i} style={styles.itemRow}>
            <Text style={[styles.itemQty, { color: colors.mutedForeground }]}>{it.quantity}x</Text>
            <Text style={[styles.itemName, { color: colors.foreground }]} numberOfLines={1}>{it.name}</Text>
            <Text style={[styles.itemPrice, { color: colors.foreground }]}>
              AED {(it.price * it.quantity).toFixed(0)}
            </Text>
          </View>
        ))}
        {item.items.length > 4 && (
          <Text style={[styles.moreItems, { color: colors.mutedForeground }]}>
            +{item.items.length - 4} more items
          </Text>
        )}
      </View>

      {/* Totals */}
      <View style={[styles.totalsBox, { borderTopColor: colors.border }]}>
        <View style={styles.totalRow}>
          <Text style={[styles.totalLabel, { color: colors.mutedForeground }]}>Subtotal</Text>
          <Text style={[styles.totalValue, { color: colors.foreground }]}>AED {item.subtotal.toFixed(2)}</Text>
        </View>
        {item.vatAmount > 0 && (
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: colors.mutedForeground }]}>VAT (5%)</Text>
            <Text style={[styles.totalValue, { color: colors.foreground }]}>AED {item.vatAmount.toFixed(2)}</Text>
          </View>
        )}
        {item.deliveryFee !== null && (
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: colors.mutedForeground }]}>Est. delivery</Text>
            <Text style={[styles.totalValue, { color: colors.foreground }]}>AED {item.deliveryFee?.toFixed(0)}</Text>
          </View>
        )}
        <View style={[styles.totalRow, styles.grandTotalRow]}>
          <Text style={[styles.grandLabel, { color: colors.foreground }]}>Est. total</Text>
          <Text style={[styles.grandValue, { color: colors.foreground }]}>AED {item.estimatedTotal.toFixed(0)}</Text>
        </View>
      </View>

      {/* Actions */}
      <Pressable
        style={[styles.viewCheckoutBtn, { backgroundColor: colors.primary }]}
        onPress={() => Linking.openURL(item.checkoutUrl)}
      >
        <Ionicons name="storefront-outline" size={15} color="#FFFFFF" />
        <Text style={styles.viewCheckoutText}>{t("orderViewCheckout")}</Text>
        <Ionicons name="open-outline" size={13} color="#FFFFFF" />
      </Pressable>
    </View>
  );

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>{t("ordersTitle")}</Text>
        {orders.length > 0 && (
          <Pressable onPress={handleClearAll}>
            <Text style={[styles.clearBtn, { color: colors.mutedForeground }]}>Clear all</Text>
          </Pressable>
        )}
      </View>

      {orders.length > 0 && (
        <View style={[styles.localNote, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
          <Ionicons name="information-circle-outline" size={14} color={colors.mutedForeground} />
          <Text style={[styles.localNoteText, { color: colors.mutedForeground }]}>
            {t("ordersRecentLabel")} — {t("ordersLocalNote")}
          </Text>
        </View>
      )}

      {orders.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="cube-outline" size={52} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>{t("ordersEmpty")}</Text>
          <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
            {t("ordersEmptySubtitle")}
          </Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={renderOrder}
          contentContainerStyle={{ padding: 20, paddingBottom: bottomPad, gap: 14 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 22,
    paddingBottom: 12,
  },
  title: { fontSize: 26, fontWeight: "800", letterSpacing: -0.6 },
  clearBtn: { fontSize: 14 },
  localNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginHorizontal: 22,
    marginBottom: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  localNoteText: { flex: 1, fontSize: 12, lineHeight: 17 },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingBottom: 80,
  },
  emptyTitle: { fontSize: 20, fontWeight: "700" },
  emptySubtitle: { fontSize: 14, textAlign: "center", paddingHorizontal: 40, lineHeight: 21 },
  orderCard: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
  },
  orderHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
    gap: 12,
  },
  orderId: { fontSize: 11, fontWeight: "600", letterSpacing: 0.3, marginBottom: 3 },
  orderDate: { fontSize: 15, fontWeight: "700" },
  orderEmirate: { fontSize: 12, marginTop: 2 },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 2,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: "600" },
  itemsList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 8,
  },
  itemRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  itemQty: { fontSize: 13, fontWeight: "700", width: 24 },
  itemName: { flex: 1, fontSize: 13 },
  itemPrice: { fontSize: 13, fontWeight: "600" },
  moreItems: { fontSize: 12, marginTop: 4 },
  totalsBox: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 6,
  },
  totalRow: { flexDirection: "row", justifyContent: "space-between" },
  totalLabel: { fontSize: 13 },
  totalValue: { fontSize: 13, fontWeight: "600" },
  grandTotalRow: { marginTop: 6, paddingTop: 8, borderTopWidth: 1, borderTopColor: "rgba(0,0,0,0.06)" },
  grandLabel: { fontSize: 15, fontWeight: "700" },
  grandValue: { fontSize: 18, fontWeight: "800" },
  viewCheckoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    margin: 14,
    marginTop: 0,
    borderRadius: 14,
    paddingVertical: 13,
  },
  viewCheckoutText: { fontSize: 14, fontWeight: "700", color: "#FFFFFF" },
});
