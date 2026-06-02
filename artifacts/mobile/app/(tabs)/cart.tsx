import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import { Analytics } from "@/services/analytics";
import { useLanguage } from "@/context/LanguageContext";
import { useLocation } from "@/context/LocationContext";
import { useHomeCountry } from "@/context/HomeCountryContext";
import { LocationBottomSheet } from "@/components/LocationBottomSheet";
import { CART_CONTENT } from "@/constants/appContent";
import { SavingsCoinAnimation, GoldCoin } from "@/components/SavingsCoinAnimation";
import {
  computeDeliveryFee,
  computeVAT,
  isDubai,
  DUBAI_DELIVERY_OPTIONS,
  type DeliveryOption,
} from "@/constants/deliveryConfig";

const CART_IMAGES: Record<string, ReturnType<typeof require>> = {
  "product-royco": require("@/assets/images/product-royco.png"),
  "product-unga": require("@/assets/images/product-unga.png"),
  "product-teff": require("@/assets/images/product-teff.png"),
  "product-berbere": require("@/assets/images/product-berbere.png"),
  "product-coffee": require("@/assets/images/product-coffee.png"),
  "lifestyle-matooke": require("@/assets/images/lifestyle-matooke.png"),
  "lifestyle-injera": require("@/assets/images/lifestyle-injera.png"),
  "lifestyle-spices": require("@/assets/images/lifestyle-spices.png"),
  "lifestyle-ugali": require("@/assets/images/lifestyle-ugali.png"),
  "lifestyle-coffee": require("@/assets/images/lifestyle-coffee.png"),
};

export default function CartScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const { selectedEmirate } = useLocation();
  const { homeCountry } = useHomeCountry();
  const { items, totalItems, totalPrice, totalSavings, updateQuantity, clearCart, checkoutLoading, shopifyCheckout } = useCart();
  const [showLocationSheet, setShowLocationSheet] = useState(false);
  const [deliveryOption, setDeliveryOption] = useState<DeliveryOption>("next-day");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom + 60;

  const isDubaiSelected = !!selectedEmirate && isDubai(selectedEmirate.id);

  const deliveryFee = useMemo(() => {
    if (!selectedEmirate) return null;
    return computeDeliveryFee(selectedEmirate.id, deliveryOption);
  }, [selectedEmirate, deliveryOption]);

  const vatAmount = useMemo(() => computeVAT(totalPrice), [totalPrice]);

  const estimatedTotal = useMemo(() => {
    if (deliveryFee === null) return totalPrice + vatAmount;
    return totalPrice + vatAmount + deliveryFee;
  }, [totalPrice, vatAmount, deliveryFee]);

  const selectedDeliveryChoice = DUBAI_DELIVERY_OPTIONS.find((o) => o.id === deliveryOption);

  const handleQty = (id: string, qty: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateQuantity(id, qty);
  };

  React.useEffect(() => { Analytics.screenView("Cart"); }, []);

  const handleCheckout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    shopifyCheckout({
      vatAmount,
      deliveryFee,
      estimatedTotal,
      emirate: selectedEmirate?.name,
      country: homeCountry ?? undefined,
    });
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>{t("cartTitle")}</Text>
        {items.length > 0 && (
          <Pressable onPress={() => {
            Alert.alert(
              "Clear Cart",
              "Remove all items from your cart?",
              [
                { text: "Cancel", style: "cancel" },
                { text: "Clear", style: "destructive", onPress: clearCart },
              ]
            );
          }}>
            <Text style={[styles.clearBtn, { color: colors.destructive }]}>{t("cartClear")}</Text>
          </Pressable>
        )}
      </View>

      {selectedEmirate && isDubaiSelected ? (
        /* Dubai — three selectable delivery options */
        <View style={styles.deliverySelector}>
          <Text style={[styles.deliverySelectorLabel, { color: colors.mutedForeground }]}>
            DELIVERY OPTION — DUBAI
          </Text>
          <View style={styles.deliveryOptions}>
            {DUBAI_DELIVERY_OPTIONS.map((opt) => {
              const active = deliveryOption === opt.id;
              const isExpressLocked = opt.id === "express" && homeCountry !== "uganda";
              return (
                <Pressable
                  key={opt.id}
                  style={[
                    styles.deliveryOptionPill,
                    {
                      backgroundColor: active ? colors.primary : colors.secondary,
                      borderColor: active ? colors.primary : colors.border,
                      opacity: isExpressLocked ? 0.45 : 1,
                    },
                  ]}
                  onPress={() => {
                    if (isExpressLocked) return;
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setDeliveryOption(opt.id);
                  }}
                >
                  <Text style={[
                    styles.deliveryOptionLabel,
                    { color: active ? "#FFFFFF" : colors.foreground },
                  ]}>
                    {opt.label}
                  </Text>
                  <Text style={[
                    styles.deliveryOptionFee,
                    { color: active ? "rgba(255,255,255,0.85)" : colors.mutedForeground },
                  ]}>
                    AED {opt.fee}
                  </Text>
                  {opt.id === "express" && (
                    <Text style={[
                      styles.deliveryOptionDesc,
                      { color: active ? "rgba(255,255,255,0.7)" : colors.mutedForeground },
                    ]}>
                      {isExpressLocked ? "Uganda only" : opt.description}
                    </Text>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : selectedEmirate ? (
        /* Other emirates — simple next-day banner */
        <View style={[styles.deliveryBanner, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
          <Ionicons name="time-outline" size={14} color={colors.mutedForeground} />
          <Text style={[styles.deliveryBannerText, { color: colors.mutedForeground }]}>
            Next-day delivery — {selectedEmirate.name}
          </Text>
        </View>
      ) : null}

      {items.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="bag-outline" size={56} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>{t("cartEmpty")}</Text>
          <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
            {t("cartEmptySubtitle")}
          </Text>
          <Pressable
            style={[styles.emptyCtaBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/(tabs)/search")}
          >
            <Ionicons name="storefront-outline" size={16} color="#FFFFFF" />
            <Text style={styles.emptyCtaText}>Browse Products</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingBottom: bottomPad + 340,
              paddingTop: 8,
            }}
            ItemSeparatorComponent={() => (
              <View style={[styles.separator, { backgroundColor: colors.border }]} />
            )}
            renderItem={({ item }) => {
              const imgSrc = item.imageKey ? CART_IMAGES[item.imageKey] : null;
              const isProduct = item.imageKey?.startsWith("product-");
              return (
              <View style={styles.cartItem}>
                {imgSrc ? (
                  <View style={[styles.itemThumb, { backgroundColor: isProduct ? "#F4F6EE" : item.cardColor + "22" }]}>
                    <Image
                      source={imgSrc}
                      style={isProduct ? styles.itemThumbContain : styles.itemThumbCover}
                      contentFit={isProduct ? "contain" : "cover"}
                    />
                  </View>
                ) : item.remoteImageUrl ? (
                  <View style={[styles.itemThumb, { backgroundColor: item.cardColor + "22" }]}>
                    <Image source={{ uri: item.remoteImageUrl }} style={styles.itemThumbCover} contentFit="cover" />
                  </View>
                ) : (
                  <View style={[styles.itemThumb, { backgroundColor: item.cardColor + "33" }]}>
                    <View style={[styles.itemThumbDot, { backgroundColor: item.cardColor }]} />
                  </View>
                )}
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
              );
            }}
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
            {/* Savings animation */}
            <SavingsCoinAnimation savings={totalSavings} visible={items.length > 0} />

            {/* Pricing breakdown */}
            <View style={[styles.summaryBox, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
              {/* Subtotal */}
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>
                  Subtotal ({totalItems} {totalItems === 1 ? "item" : "items"})
                </Text>
                <Text style={[styles.summaryValue, { color: colors.foreground }]}>
                  AED {totalPrice.toFixed(2)}
                </Text>
              </View>

              {/* VAT */}
              <View style={styles.summaryRow}>
                <View style={styles.summaryLabelRow}>
                  <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>
                    VAT (5%)
                  </Text>
                  <Text style={[styles.summaryHint, { color: colors.mutedForeground }]}>
                    on products
                  </Text>
                </View>
                <Text style={[styles.summaryValue, { color: colors.foreground }]}>
                  AED {vatAmount.toFixed(2)}
                </Text>
              </View>

              {/* Delivery */}
              <View style={styles.summaryRow}>
                <View style={styles.summaryLabelRow}>
                  <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>
                    {isDubaiSelected && selectedDeliveryChoice
                      ? `${selectedDeliveryChoice.label} delivery`
                      : "Est. delivery"}
                  </Text>
                  {isDubaiSelected && selectedDeliveryChoice && (
                    <View style={[styles.sameDayBadge, { backgroundColor: colors.primary + "18" }]}>
                      <Text style={[styles.sameDayBadgeText, { color: colors.primary }]}>
                        {selectedDeliveryChoice.description}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.summaryValue, { color: colors.foreground }]}>
                  {deliveryFee !== null
                    ? `AED ${deliveryFee.toFixed(0)}`
                    : selectedEmirate
                      ? "..."
                      : "Choose location"}
                </Text>
              </View>

              {totalSavings > 0 && (
                <View style={styles.summaryRow}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <GoldCoin size={14} />
                    <Text style={[styles.summaryLabel, { color: "#2E7D32" }]}>Discount savings</Text>
                  </View>
                  <Text style={[styles.summaryValue, { color: "#2E7D32", fontWeight: "700" }]}>
                    - AED {totalSavings.toFixed(2)}
                  </Text>
                </View>
              )}

              <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />

              {/* Estimated Total */}
              <View style={styles.summaryRow}>
                <View style={{ gap: 2 }}>
                  <Text style={[styles.totalLabel, { color: colors.foreground }]}>
                    Estimated total
                  </Text>
                  <Text style={[styles.totalHint, { color: colors.mutedForeground }]}>
                    Final confirmed at checkout
                  </Text>
                </View>
                <Text style={[styles.totalPrice, { color: colors.foreground }]}>
                  AED {estimatedTotal.toFixed(0)}
                </Text>
              </View>

              {!selectedEmirate && (
                <Pressable
                  style={[styles.locationNudge, { backgroundColor: colors.accent + "18", borderColor: colors.accent + "44" }]}
                  onPress={() => setShowLocationSheet(true)}
                >
                  <Ionicons name="location-outline" size={13} color={colors.accent} />
                  <Text style={[styles.locationNudgeText, { color: colors.accent }]}>
                    Tap to choose your emirate for a delivery estimate
                  </Text>
                  <Ionicons name="chevron-forward" size={13} color={colors.accent} />
                </Pressable>
              )}
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
              Payment processed securely. Cash on delivery available.
            </Text>
          </View>
        </>
      )}
      <LocationBottomSheet
        visible={showLocationSheet}
        onClose={() => setShowLocationSheet(false)}
      />
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
  deliveryBannerText: { fontSize: 13, fontWeight: "600", flex: 1 },
  deliverySelector: {
    marginHorizontal: 20,
    marginBottom: 10,
  },
  deliverySelectorLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  deliveryOptions: {
    flexDirection: "row",
    gap: 8,
  },
  deliveryOptionPill: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 14,
    borderWidth: 1,
    gap: 2,
  },
  deliveryOptionLabel: {
    fontSize: 12,
    fontWeight: "700",
  },
  deliveryOptionFee: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  deliveryOptionDesc: {
    fontSize: 9,
    fontWeight: "500",
    letterSpacing: 0.1,
    textAlign: "center",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingBottom: 80,
  },
  emptyTitle: { fontSize: 20, fontWeight: "700" },
  emptySubtitle: { fontSize: 14, textAlign: "center", paddingHorizontal: 40 },
  emptyCtaBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 24, paddingVertical: 13, borderRadius: 14, marginTop: 8 },
  emptyCtaText: { fontSize: 15, fontWeight: "700", color: "#FFFFFF" },
  separator: { height: 1, marginVertical: 2 },
  cartItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 14,
  },
  colorDot: { width: 42, height: 42, borderRadius: 12, flexShrink: 0 },
  itemThumb: {
    width: 54,
    height: 54,
    borderRadius: 12,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  itemThumbContain: {
    width: "80%",
    height: "80%",
  },
  itemThumbCover: {
    width: "100%",
    height: "100%",
  },
  itemThumbDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    opacity: 0.7,
  },
  itemInfo: { flex: 1, gap: 2 },
  itemName: { fontSize: 14, fontWeight: "600" },
  itemUnit: { fontSize: 12 },
  itemPrice: { fontSize: 14, fontWeight: "700", marginTop: 4 },
  qtyControls: { flexDirection: "row", alignItems: "center", gap: 12 },
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
    paddingTop: 14,
    borderTopWidth: 1,
    gap: 10,
  },
  summaryBox: {
    borderRadius: 16,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    marginBottom: 2,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabelRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  summaryLabel: { fontSize: 13 },
  summaryHint: { fontSize: 10, opacity: 0.7 },
  summaryValue: { fontSize: 13, fontWeight: "600" },
  summaryDivider: { height: 1, marginVertical: 2 },
  totalLabel: { fontSize: 14, fontWeight: "700" },
  totalHint: { fontSize: 10 },
  totalPrice: { fontSize: 20, fontWeight: "800", letterSpacing: -0.5 },
  sameDayBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  sameDayBadgeText: { fontSize: 10, fontWeight: "700" },
  locationNudge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 4,
  },
  locationNudgeText: { fontSize: 12, fontWeight: "500", flex: 1 },
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
});