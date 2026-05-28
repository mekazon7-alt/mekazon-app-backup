import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { useLocation } from "@/context/LocationContext";
import { CART_CONTENT } from "@/constants/appContent";

export default function CartScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const { selectedEmirate } = useLocation();
  const { items, totalItems, totalPrice, updateQuantity, clearCart, checkoutLoading, shopifyCheckout } = useCart();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom + 60;

  const handleQty = (id: string, qty: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateQuantity(id, qty);
  };

  const handleCheckout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    shopifyCheckout();
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>{t("cartTitle")}</Text>
        {items.length > 0 && (
          <Pressable onPress={clearCart}>
            <Text style={[styles.clearBtn, { color: colors.destructive }]}>{t("cartClear")}</Text>
          </Pressable>
        )}
      </View>

      {selectedEmirate && (
        <View style={[styles.deliveryBanner, { backgroundColor: selectedEmirate.sameDay ? "#F0F5E8" : colors.secondary, borderColor: colors.border }]}>
          <Ionicons
            name={selectedEmirate.sameDay ? "flash" : "time-outline"}
            size={14}
            color={selectedEmirate.sameDay ? "#4E7234" : colors.mutedForeground}
          />
          <Text style={[styles.deliveryBannerText, { color: selectedEmirate.sameDay ? "#4E7234" : colors.mutedForeground }]}>
            {selectedEmirate.deliveryMessage}
          </Text>
        </View>
      )}

      {items.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="bag-outline" size={56} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>{t("cartEmpty")}</Text>
          <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
            {t("cartEmptySubtitle")}
          </Text>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingBottom: bottomPad + 160,
              paddingTop: 8,
            }}
            ItemSeparatorComponent={() => (
              <View style={[styles.separator, { backgroundColor: colors.border }]} />
            )}
            renderItem={({ item }) => (
              <View style={styles.cartItem}>
                <View style={[styles.colorDot, { backgroundColor: item.cardColor }]} />
                <View style={styles.itemInfo}>
                  <Text style={[styles.itemName, { color: colors.foreground }]}>{item.name}</Text>
                  <Text style={[styles.itemUnit, { color: colors.mutedForeground }]}>{item.unit}</Text>
                  <Text style={[styles.itemPrice, { color: colors.primary }]}>
                    AED {(item.price * item.quantity).toFixed(0)}
                  </Text>
                </View>
                <View style={styles.qtyControls}>
                  <Pressable
                    style={[styles.qtyBtn, { backgroundColor: colors.secondary }]}
                    onPress={() => handleQty(item.id, item.quantity - 1)}
                  >
                    <Ionicons
                      name={item.quantity === 1 ? "trash-outline" : "remove"}
                      size={16}
                      color={item.quantity === 1 ? colors.destructive : colors.foreground}
                    />
                  </Pressable>
                  <Text style={[styles.qty, { color: colors.foreground }]}>{item.quantity}</Text>
                  <Pressable
                    style={[styles.qtyBtn, { backgroundColor: colors.secondary }]}
                    onPress={() => handleQty(item.id, item.quantity + 1)}
                  >
                    <Ionicons name="add" size={16} color={colors.foreground} />
                  </Pressable>
                </View>
              </View>
            )}
          />

          <View
            style={[
              styles.checkoutArea,
              {
                paddingBottom: bottomPad,
                backgroundColor: colors.background,
                borderTopColor: colors.border,
              },
            ]}
          >
            <View style={styles.summaryBox}>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>
                  {t("cartSubtotal")}
                </Text>
                <Text style={[styles.summaryValue, { color: colors.foreground }]}>
                  AED {totalPrice.toFixed(2)}
                </Text>
              </View>
              <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
              <View style={styles.summaryRow}>
                <Text style={[styles.totalLabel, { color: colors.foreground }]}>{t("cartTotal")}</Text>
                <Text style={[styles.totalPrice, { color: colors.foreground }]}>
                  AED {totalPrice.toFixed(2)}
                </Text>
              </View>
              <Text style={[styles.deliveryNote, { color: colors.mutedForeground }]}>
                {CART_CONTENT.deliveryNote}
              </Text>
            </View>

            <Pressable
              style={[styles.checkoutBtn, { backgroundColor: checkoutLoading ? colors.muted : "#C4541A" }]}
              onPress={handleCheckout}
              disabled={checkoutLoading}
            >
              {checkoutLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="storefront-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.checkoutText}>{t("cartCheckout")}</Text>
                  <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                </>
              )}
            </Pressable>

            <Text style={[styles.checkoutNote, { color: colors.mutedForeground }]}>
              Payment processed securely via Shopify. Cash on delivery available.
            </Text>
          </View>
        </>
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
  title: {
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.6,
  },
  clearBtn: { fontSize: 14, fontWeight: "600" },
  deliveryBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 22,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  deliveryBannerText: { fontSize: 13, fontWeight: "600" },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingBottom: 80,
  },
  emptyTitle: { fontSize: 20, fontWeight: "700" },
  emptySubtitle: { fontSize: 14, textAlign: "center", paddingHorizontal: 40 },
  separator: { height: 1, marginVertical: 2 },
  cartItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 14,
  },
  colorDot: {
    width: 42,
    height: 42,
    borderRadius: 12,
    flexShrink: 0,
  },
  itemInfo: { flex: 1, gap: 2 },
  itemName: { fontSize: 14, fontWeight: "600" },
  itemUnit: { fontSize: 12 },
  itemPrice: { fontSize: 14, fontWeight: "700", marginTop: 4 },
  qtyControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  qty: { fontSize: 15, fontWeight: "700", minWidth: 22, textAlign: "center" },
  checkoutArea: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    gap: 10,
  },
  summaryBox: { gap: 8, marginBottom: 4 },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: { fontSize: 13 },
  summaryValue: { fontSize: 13, fontWeight: "600" },
  summaryDivider: { height: 1, marginVertical: 4 },
  totalLabel: { fontSize: 15, fontWeight: "700" },
  totalPrice: { fontSize: 22, fontWeight: "800", letterSpacing: -0.5 },
  checkoutBtn: {
    borderRadius: 16,
    paddingVertical: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  checkoutText: { fontSize: 16, fontWeight: "700", color: "#FFFFFF" },
  checkoutNote: {
    fontSize: 11,
    textAlign: "center",
    paddingBottom: 4,
  },
  deliveryNote: {
    fontSize: 11,
    textAlign: "center",
    marginTop: 2,
  },
});
