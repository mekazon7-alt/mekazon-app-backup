import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import {
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

export default function CartScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { items, totalItems, totalPrice, updateQuantity, removeItem, clearCart } = useCart();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom + 60;

  const handleQty = (id: string, qty: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateQuantity(id, qty);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Your Cart</Text>
        {items.length > 0 && (
          <Pressable onPress={clearCart}>
            <Text style={[styles.clearBtn, { color: colors.destructive }]}>Clear</Text>
          </Pressable>
        )}
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="bag-outline" size={56} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Your cart is empty</Text>
          <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
            Add products or a basket to get started
          </Text>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: bottomPad + 100 }}
            ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: colors.border }]} />}
            renderItem={({ item }) => (
              <View style={styles.cartItem}>
                <View style={[styles.colorDot, { backgroundColor: item.cardColor }]} />
                <View style={styles.itemInfo}>
                  <Text style={[styles.itemName, { color: colors.foreground }]}>{item.name}</Text>
                  <Text style={[styles.itemUnit, { color: colors.mutedForeground }]}>{item.unit}</Text>
                </View>
                <View style={styles.qtyControls}>
                  <Pressable
                    style={[styles.qtyBtn, { backgroundColor: colors.secondary }]}
                    onPress={() => handleQty(item.id, item.quantity - 1)}
                  >
                    <Ionicons name={item.quantity === 1 ? "trash-outline" : "remove"} size={16} color={item.quantity === 1 ? colors.destructive : colors.foreground} />
                  </Pressable>
                  <Text style={[styles.qty, { color: colors.foreground }]}>{item.quantity}</Text>
                  <Pressable
                    style={[styles.qtyBtn, { backgroundColor: colors.secondary }]}
                    onPress={() => handleQty(item.id, item.quantity + 1)}
                  >
                    <Ionicons name="add" size={16} color={colors.foreground} />
                  </Pressable>
                </View>
                <Text style={[styles.itemPrice, { color: colors.primary }]}>
                  AED {(item.price * item.quantity).toFixed(0)}
                </Text>
              </View>
            )}
          />

          <View style={[styles.checkoutArea, { paddingBottom: bottomPad, backgroundColor: colors.background, borderTopColor: colors.border }]}>
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: colors.mutedForeground }]}>{totalItems} item{totalItems !== 1 ? "s" : ""}</Text>
              <Text style={[styles.totalPrice, { color: colors.foreground }]}>AED {totalPrice.toFixed(2)}</Text>
            </View>
            <Pressable style={[styles.checkoutBtn, { backgroundColor: colors.primary }]}>
              <Text style={[styles.checkoutText, { color: colors.primaryForeground }]}>Proceed to Checkout</Text>
              <Ionicons name="arrow-forward" size={20} color={colors.primaryForeground} />
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.6,
  },
  clearBtn: {
    fontSize: 14,
    fontWeight: "600",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingBottom: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 40,
  },
  separator: {
    height: 1,
    marginVertical: 4,
  },
  cartItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 12,
  },
  colorDot: {
    width: 36,
    height: 36,
    borderRadius: 10,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "600",
  },
  itemUnit: {
    fontSize: 12,
    marginTop: 2,
  },
  qtyControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  qtyBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  qty: {
    fontSize: 15,
    fontWeight: "700",
    minWidth: 20,
    textAlign: "center",
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "700",
    minWidth: 60,
    textAlign: "right",
  },
  checkoutArea: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    gap: 14,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 14,
  },
  totalPrice: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  checkoutBtn: {
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  checkoutText: {
    fontSize: 16,
    fontWeight: "700",
  },
});
