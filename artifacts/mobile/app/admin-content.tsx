import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState, useEffect, useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { appContentService } from "@/services/content/appContentService";
import { ImageUploadField } from "@/components/ImageUploadField";
import { isAdminAuthenticated, adminLogout } from "@/services/adminAuth";
import type {
  AdminBasket,
  AdminMeal,
  AdminCategory,
  AdminHero,
  AppContentData,
  ContentCountry,
} from "@/types/appContent";
import type { HomeCountry } from "@/constants/personalization";

/**
 * DEVELOPER NOTE — Admin Content Screen
 * ─────────────────────────────────────────────────────────────────────────────
 * This screen is intentionally hidden from the main navigation.
 * Access: Profile → tap version number 5 times → enter admin password.
 *
 * What is controlled HERE (App Content Admin):
 *   My Baskets, Meal Inspiration, homepage hero copy/images,
 *   app category labels and keyword mappings, country-specific content.
 *
 * What is controlled by SHOPIFY (not editable here):
 *   Real products, prices, inventory, collections, checkout, payments, orders.
 *
 * What can be edited WITHOUT code changes (via this screen):
 *   All baskets, meals, categories, and hero content for all countries.
 *
 * What STILL requires developer work:
 *   Adding new local images (must be bundled with Metro before use).
 *   Adding new countries beyond the current 5.
 *   Connecting categories directly to Shopify collections (architecture is
 *   prepared — add the shopifyCollectionHandle field — but fetching by
 *   collection requires a service update).
 *
 * Future CMS recommendation:
 *   Replace AsyncStorage with Sanity, Shopify Metaobjects, Firebase, or
 *   Supabase. The service layer (appContentService.ts) is designed so the
 *   storage backend can be swapped without changing any UI code.
 *
 * Authentication note:
 *   Current auth is temporary password-based (see services/adminAuth.ts).
 *   Replace with proper backend auth before any public/production release.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const COUNTRY_OPTIONS: { label: string; value: ContentCountry }[] = [
  { label: "All Countries", value: "all" },
  { label: "Uganda", value: "uganda" },
  { label: "Kenya", value: "kenya" },
  { label: "Ethiopia", value: "ethiopia" },
  { label: "Other African", value: "other" },
];

const LIFESTYLE_KEYS = [
  "lifestyle-ugali",
  "lifestyle-injera",
  "lifestyle-matooke",
  "lifestyle-coffee",
  "lifestyle-spices",
  "hero-uganda",
  "hero-kenya",
  "hero-ethiopia",
  "hero-pan-african",
];

const HERO_COUNTRIES: HomeCountry[] = ["uganda", "kenya", "ethiopia", "other", "all"];

type Tab = "baskets" | "meals" | "categories" | "hero";

// ─── Dark admin colour palette ────────────────────────────────────────────────
const C = {
  bg: "#0F1410",
  surface: "#1A2016",
  border: "#2A3424",
  primary: "#4E7234",
  accent: "#C4541A",
  text: "#E8F0DC",
  muted: "#728054",
  danger: "#C44040",
  input: "#222C1C",
};

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

// ─────────────────────────────────────────────────────────────────────────────
export default function AdminContentScreen() {
  const insets = useSafeAreaInsets();
  const [authed, setAuthed] = useState(isAdminAuthenticated());
  const [tab, setTab] = useState<Tab>("baskets");
  const [content, setContent] = useState<AppContentData | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await appContentService.getContent();
    setContent(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authed) load();
  }, [authed, load]);

  // Re-check auth when screen is revisited
  useEffect(() => {
    if (isAdminAuthenticated() && !authed) setAuthed(true);
  });

  const handleLogout = () => {
    adminLogout();
    setAuthed(false);
    router.back();
  };

  const persistContent = async (updated: AppContentData) => {
    setContent(updated);
    await appContentService.setContent(updated);
  };

  if (!authed) {
    return (
      <View style={[styles.screen, { justifyContent: "center", alignItems: "center" }]}>
        <Ionicons name="lock-closed" size={32} color={C.muted} />
        <Text style={[styles.lockedText]}>
          Access via Profile → tap version number
        </Text>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  if (loading || !content) {
    return (
      <View style={[styles.screen, { justifyContent: "center" }]}>
        <ActivityIndicator color={C.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.adminHeader}>
        <Pressable onPress={() => router.back()} style={styles.backIcon}>
          <Ionicons name="chevron-back" size={20} color={C.muted} />
        </Pressable>
        <Text style={styles.adminTitle}>Content Admin</Text>
        <View style={styles.headerActions}>
          <Pressable onPress={async () => {
            Alert.alert("Reset Content", "Reset all content to factory defaults? This cannot be undone.", [
              { text: "Cancel", style: "cancel" },
              {
                text: "Reset", style: "destructive", onPress: async () => {
                  await appContentService.resetContent();
                  await load();
                }
              },
            ]);
          }}>
            <Text style={styles.resetBtn}>Reset</Text>
          </Pressable>
          <Pressable onPress={handleLogout}>
            <Text style={styles.logoutBtn}>Logout</Text>
          </Pressable>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {(["baskets", "meals", "categories", "hero"] as Tab[]).map((t) => (
          <Pressable key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      {tab === "baskets" && <BasketsTab content={content} onChange={persistContent} />}
      {tab === "meals" && <MealsTab content={content} onChange={persistContent} />}
      {tab === "categories" && <CategoriesTab content={content} onChange={persistContent} />}
      {tab === "hero" && <HeroTab content={content} onChange={persistContent} />}
    </View>
  );
}

// ─── BASKETS TAB ─────────────────────────────────────────────────────────────
function BasketsTab({ content, onChange }: { content: AppContentData; onChange: (d: AppContentData) => void }) {
  const [editItem, setEditItem] = useState<AdminBasket | null>(null);

  const openAdd = () => setEditItem({
    id: uid(), country: "kenya", name: "", tagline: "", items: [], price: 0,
    currency: "AED", cardColor: "#4A7A32", lifestyleImageKey: "lifestyle-ugali",
    active: true, order: content.baskets.length + 1,
  });

  const save = (b: AdminBasket) => {
    const baskets = [...content.baskets];
    const idx = baskets.findIndex((x) => x.id === b.id);
    if (idx >= 0) baskets[idx] = b; else baskets.push(b);
    onChange({ ...content, baskets });
    setEditItem(null);
  };

  const del = (id: string) => Alert.alert("Delete basket?", "Cannot be undone.", [
    { text: "Cancel", style: "cancel" },
    { text: "Delete", style: "destructive", onPress: () => onChange({ ...content, baskets: content.baskets.filter((b) => b.id !== id) }) },
  ]);

  const move = (id: string, dir: -1 | 1) => {
    const list = [...content.baskets].sort((a, b) => a.order - b.order);
    const idx = list.findIndex((b) => b.id === id);
    const swap = idx + dir;
    if (swap < 0 || swap >= list.length) return;
    [list[idx].order, list[swap].order] = [list[swap].order, list[idx].order];
    onChange({ ...content, baskets: list });
  };

  const sorted = [...content.baskets].sort((a, b) => a.order - b.order);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.listContent}>
        <Text style={styles.listNote}>{content.baskets.length} baskets total · tap pencil to edit · arrows to reorder</Text>
        {sorted.map((b, i) => (
          <View key={b.id} style={[styles.listItem, !b.active && { opacity: 0.45 }]}>
            <View style={{ flex: 1 }}>
              <CountryBadge value={b.country} />
              <Text style={styles.listItemTitle}>{b.name || "(no name)"}</Text>
              <Text style={styles.listItemSub}>{b.tagline || "—"} · AED {b.price}</Text>
            </View>
            <View style={styles.listActions}>
              <ArrowBtn up onPress={() => move(b.id, -1)} disabled={i === 0} />
              <ArrowBtn up={false} onPress={() => move(b.id, 1)} disabled={i === sorted.length - 1} />
              <EditBtn onPress={() => setEditItem({ ...b })} />
              <DeleteBtn onPress={() => del(b.id)} />
            </View>
          </View>
        ))}
      </ScrollView>
      <FAB label="Add Basket" onPress={openAdd} />
      {editItem && (
        <BasketForm item={editItem} onSave={save} onClose={() => setEditItem(null)} />
      )}
    </View>
  );
}

function BasketForm({ item, onSave, onClose }: { item: AdminBasket; onSave: (b: AdminBasket) => void; onClose: () => void }) {
  const [form, setForm] = useState({ ...item, itemsStr: item.items.join(", ") });
  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));
  const save = () => {
    if (!form.name.trim()) { Alert.alert("Name required"); return; }
    onSave({ ...form, items: form.itemsStr.split(",").map((s) => s.trim()).filter(Boolean) });
  };
  return (
    <FormSheet title={item.name ? "Edit Basket" : "New Basket"} onSave={save} onClose={onClose}>
      <Field label="Name" value={form.name} onChange={(v) => set("name", v)} />
      <Field label="Tagline" value={form.tagline} onChange={(v) => set("tagline", v)} />
      <Field label="Price (AED)" value={String(form.price)} onChange={(v) => set("price", parseFloat(v) || 0)} keyboardType="numeric" />
      <Field label="Items (comma separated)" value={form.itemsStr} onChange={(v) => set("itemsStr", v)} multiline />
      <Field label="Card colour (hex)" value={form.cardColor} onChange={(v) => set("cardColor", v)} />
      <ImageUploadField imageKey={`basket:${form.id}`} />
      <PickerField label="Country" value={form.country} options={COUNTRY_OPTIONS.map((o) => o.value)} labels={COUNTRY_OPTIONS.map((o) => o.label)} onChange={(v) => set("country", v)} />
      <ToggleRow label="Active" value={form.active} onChange={(v) => set("active", v)} />
    </FormSheet>
  );
}

// ─── MEALS TAB ────────────────────────────────────────────────────────────────
function MealsTab({ content, onChange }: { content: AppContentData; onChange: (d: AppContentData) => void }) {
  const [editItem, setEditItem] = useState<AdminMeal | null>(null);

  const openAdd = () => setEditItem({
    id: uid(), country: "all", lifestyleImageKey: "lifestyle-ugali", name: "", description: "",
    prepTime: "15 min", cookTime: "30 min", servings: 4, ingredients: [], steps: [], active: true, order: content.meals.length + 1,
  });

  const save = (m: AdminMeal) => {
    const meals = [...content.meals];
    const idx = meals.findIndex((x) => x.id === m.id);
    if (idx >= 0) meals[idx] = m; else meals.push(m);
    onChange({ ...content, meals });
    setEditItem(null);
  };

  const del = (id: string) => Alert.alert("Delete meal?", "Cannot be undone.", [
    { text: "Cancel", style: "cancel" },
    { text: "Delete", style: "destructive", onPress: () => onChange({ ...content, meals: content.meals.filter((m) => m.id !== id) }) },
  ]);

  const move = (id: string, dir: -1 | 1) => {
    const list = [...content.meals].sort((a, b) => a.order - b.order);
    const idx = list.findIndex((m) => m.id === id);
    const swap = idx + dir;
    if (swap < 0 || swap >= list.length) return;
    [list[idx].order, list[swap].order] = [list[swap].order, list[idx].order];
    onChange({ ...content, meals: list });
  };

  const sorted = [...content.meals].sort((a, b) => a.order - b.order);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.listContent}>
        <Text style={styles.listNote}>{content.meals.length} meals · edit ingredients, steps and tips per meal</Text>
        {sorted.map((m, i) => (
          <View key={m.id} style={[styles.listItem, !m.active && { opacity: 0.45 }]}>
            <View style={{ flex: 1 }}>
              <CountryBadge value={m.country} accent />
              <Text style={styles.listItemTitle}>{m.name || "(no name)"}</Text>
              <Text style={styles.listItemSub}>{m.prepTime} prep · {m.cookTime} cook · serves {m.servings}</Text>
            </View>
            <View style={styles.listActions}>
              <ArrowBtn up onPress={() => move(m.id, -1)} disabled={i === 0} />
              <ArrowBtn up={false} onPress={() => move(m.id, 1)} disabled={i === sorted.length - 1} />
              <EditBtn onPress={() => setEditItem({ ...m })} />
              <DeleteBtn onPress={() => del(m.id)} />
            </View>
          </View>
        ))}
      </ScrollView>
      <FAB label="Add Meal" onPress={openAdd} />
      {editItem && <MealForm item={editItem} onSave={save} onClose={() => setEditItem(null)} />}
    </View>
  );
}

function MealForm({ item, onSave, onClose }: { item: AdminMeal; onSave: (m: AdminMeal) => void; onClose: () => void }) {
  const [form, setForm] = useState({
    ...item,
    ingredientsStr: item.ingredients.join("\n"),
    stepsStr: item.steps.join("\n"),
  });
  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));
  const save = () => {
    if (!form.name.trim()) { Alert.alert("Name required"); return; }
    onSave({
      ...form,
      ingredients: form.ingredientsStr.split("\n").map((s) => s.trim()).filter(Boolean),
      steps: form.stepsStr.split("\n").map((s) => s.trim()).filter(Boolean),
    });
  };
  return (
    <FormSheet title={item.name ? "Edit Meal" : "New Meal"} onSave={save} onClose={onClose}>
      <Field label="Name" value={form.name} onChange={(v) => set("name", v)} />
      <Field label="Description" value={form.description} onChange={(v) => set("description", v)} multiline />
      <ImageUploadField imageKey={`meal:${form.id}`} />
      <PickerField label="Country" value={form.country} options={COUNTRY_OPTIONS.map((o) => o.value)} labels={COUNTRY_OPTIONS.map((o) => o.label)} onChange={(v) => set("country", v)} />
      <Field label="Prep Time" value={form.prepTime} onChange={(v) => set("prepTime", v)} placeholder="e.g. 15 min" />
      <Field label="Cook Time" value={form.cookTime} onChange={(v) => set("cookTime", v)} placeholder="e.g. 30 min" />
      <Field label="Serves" value={String(form.servings)} onChange={(v) => set("servings", parseInt(v) || 1)} keyboardType="numeric" />
      <Field label="Ingredients — one per line" value={form.ingredientsStr} onChange={(v) => set("ingredientsStr", v)} multiline placeholder={"2 cups maize flour\n4 cups water"} />
      <Field label="Method Steps — one per line" value={form.stepsStr} onChange={(v) => set("stepsStr", v)} multiline placeholder={"Bring water to boil\nAdd flour gradually"} />
      <Field label="Chef Tip (optional)" value={form.tip ?? ""} onChange={(v) => set("tip", v)} multiline />
      <ToggleRow label="Active" value={form.active} onChange={(v) => set("active", v)} />
    </FormSheet>
  );
}

// ─── CATEGORIES TAB ───────────────────────────────────────────────────────────
function CategoriesTab({ content, onChange }: { content: AppContentData; onChange: (d: AppContentData) => void }) {
  const [editItem, setEditItem] = useState<AdminCategory | null>(null);

  const openAdd = () => setEditItem({
    id: uid(), country: "kenya", name: "", icon: "nutrition",
    keywords: [], active: true, order: content.categories.length + 1,
  });

  const save = (c: AdminCategory) => {
    const categories = [...content.categories];
    const idx = categories.findIndex((x) => x.id === c.id);
    if (idx >= 0) categories[idx] = c; else categories.push(c);
    onChange({ ...content, categories });
    setEditItem(null);
  };

  const del = (id: string) => Alert.alert("Delete category?", undefined, [
    { text: "Cancel", style: "cancel" },
    { text: "Delete", style: "destructive", onPress: () => onChange({ ...content, categories: content.categories.filter((c) => c.id !== id) }) },
  ]);

  const sorted = [...content.categories].sort((a, b) => {
    const order = ["uganda", "kenya", "ethiopia", "other", "all"];
    const ca = order.indexOf(a.country); const cb = order.indexOf(b.country);
    if (ca !== cb) return ca - cb;
    return a.order - b.order;
  });

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.listContent}>
        <Text style={styles.listNote}>
          Categories filter products by keyword. Add a Shopify collection handle to enable direct collection fetch in a future update.
        </Text>
        {sorted.map((c) => (
          <View key={c.id} style={[styles.listItem, !c.active && { opacity: 0.45 }]}>
            <View style={{ flex: 1 }}>
              <CountryBadge value={c.country} />
              <Text style={styles.listItemTitle}>{c.name || "(no name)"}</Text>
              <Text style={styles.listItemSub} numberOfLines={1}>{c.keywords.join(", ") || "no keywords"}</Text>
              {c.shopifyCollectionHandle && (
                <Text style={[styles.listItemSub, { color: C.primary }]}>{c.shopifyCollectionHandle}</Text>
              )}
            </View>
            <View style={styles.listActions}>
              <EditBtn onPress={() => setEditItem({ ...c })} />
              <DeleteBtn onPress={() => del(c.id)} />
            </View>
          </View>
        ))}
      </ScrollView>
      <FAB label="Add Category" onPress={openAdd} />
      {editItem && <CategoryForm item={editItem} onSave={save} onClose={() => setEditItem(null)} />}
    </View>
  );
}

function CategoryForm({ item, onSave, onClose }: { item: AdminCategory; onSave: (c: AdminCategory) => void; onClose: () => void }) {
  const [form, setForm] = useState({ ...item, keywordsStr: item.keywords.join(", ") });
  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));
  const save = () => {
    if (!form.name.trim()) { Alert.alert("Name required"); return; }
    onSave({ ...form, keywords: form.keywordsStr.split(",").map((s) => s.trim()).filter(Boolean) });
  };
  return (
    <FormSheet title={item.name ? "Edit Category" : "New Category"} onSave={save} onClose={onClose}>
      <Field label="Category Name" value={form.name} onChange={(v) => set("name", v)} placeholder="e.g. Flours" />
      <Field label="Icon (Ionicons name)" value={form.icon} onChange={(v) => set("icon", v)} placeholder="e.g. nutrition, flask, leaf" />
      <PickerField label="Country" value={form.country} options={COUNTRY_OPTIONS.map((o) => o.value)} labels={COUNTRY_OPTIONS.map((o) => o.label)} onChange={(v) => set("country", v)} />
      <Field label="Keywords — comma separated" value={form.keywordsStr} onChange={(v) => set("keywordsStr", v)} multiline placeholder="flour, unga, posho, maize" />
      <Field label="Shopify Collection Handle (optional)" value={form.shopifyCollectionHandle ?? ""} onChange={(v) => set("shopifyCollectionHandle", v)} placeholder="e.g. kenyan-foodstuff" />
      <Text style={styles.fieldHint}>Future: tap on this category will fetch directly from the Shopify collection instead of keyword filtering.</Text>
      <ToggleRow label="Active" value={form.active} onChange={(v) => set("active", v)} />
    </FormSheet>
  );
}

// ─── HERO TAB ─────────────────────────────────────────────────────────────────
function HeroTab({ content, onChange }: { content: AppContentData; onChange: (d: AppContentData) => void }) {
  const [editItem, setEditItem] = useState<AdminHero | null>(null);

  const getHero = (country: HomeCountry): AdminHero =>
    content.heroes.find((h) => h.country === country) ?? { country, title: "", tagline: "", imageKey: "hero-pan-african" };

  const save = (h: AdminHero) => {
    const heroes = [...content.heroes];
    const idx = heroes.findIndex((x) => x.country === h.country);
    if (idx >= 0) heroes[idx] = h; else heroes.push(h);
    onChange({ ...content, heroes });
    setEditItem(null);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.listContent}>
        <Text style={styles.listNote}>Hero banner shown at the top of the home screen for each country.</Text>
        {HERO_COUNTRIES.map((country) => {
          const hero = getHero(country);
          return (
            <View key={country} style={styles.listItem}>
              <View style={{ flex: 1 }}>
                <CountryBadge value={country} />
                <Text style={styles.listItemTitle}>{hero.title || "(no title)"}</Text>
                <Text style={styles.listItemSub}>{hero.tagline || "(no tagline)"}</Text>
                <Text style={[styles.listItemSub, { color: C.muted }]}>{hero.imageKey}</Text>
              </View>
              <EditBtn onPress={() => setEditItem({ ...hero })} />
            </View>
          );
        })}
      </ScrollView>
      {editItem && (
        <FormSheet title={`Edit Hero — ${editItem.country}`} onSave={() => save(editItem)} onClose={() => setEditItem(null)}>
          <Field label="Hero Title" value={editItem.title} onChange={(v) => setEditItem((h) => h ? { ...h, title: v } : h)} multiline />
          <Field label="Tagline / Subtitle" value={editItem.tagline} onChange={(v) => setEditItem((h) => h ? { ...h, tagline: v } : h)} multiline />
          <ImageUploadField imageKey={`hero:${editItem.country}`} />
        </FormSheet>
      )}
    </View>
  );
}

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────
function FormSheet({ title, children, onSave, onClose }: {
  title: string; children: React.ReactNode; onSave: () => void; onClose: () => void;
}) {
  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView style={{ flex: 1, backgroundColor: C.bg }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.formHeader}>
          <Pressable onPress={onClose}><Text style={styles.formCancel}>Cancel</Text></Pressable>
          <Text style={styles.formTitle}>{title}</Text>
          <Pressable onPress={onSave}><Text style={styles.formSave}>Save</Text></Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.formBody}>{children}</ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function Field({ label, value, onChange, multiline, keyboardType, placeholder }: {
  label: string; value: string; onChange: (v: string) => void;
  multiline?: boolean; keyboardType?: "numeric" | "default"; placeholder?: string;
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.fieldInput, multiline && { height: 90, textAlignVertical: "top" }]}
        value={value}
        onChangeText={onChange}
        multiline={multiline}
        keyboardType={keyboardType ?? "default"}
        placeholder={placeholder}
        placeholderTextColor={C.muted}
      />
    </View>
  );
}

function PickerField({ label, value, options, labels, onChange }: {
  label: string; value: string; options: string[]; labels?: string[]; onChange: (v: string) => void;
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 6 }}>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {options.map((opt, i) => (
            <Pressable key={opt} style={[styles.pickerOption, opt === value && styles.pickerOptionActive]} onPress={() => onChange(opt)}>
              <Text style={[styles.pickerOptionText, opt === value && styles.pickerOptionTextActive]}>
                {labels?.[i] ?? opt}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={styles.rowWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: C.primary }} />
    </View>
  );
}

function CountryBadge({ value, accent }: { value: string; accent?: boolean }) {
  return (
    <View style={[styles.countryBadge, { backgroundColor: accent ? C.accent + "33" : C.primary + "33" }]}>
      <Text style={styles.countryBadgeText}>{value}</Text>
    </View>
  );
}

function ArrowBtn({ up, onPress, disabled }: { up: boolean; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={styles.arrowBtn}>
      <Ionicons name={up ? "chevron-up" : "chevron-down"} size={16} color={disabled ? C.border : C.muted} />
    </Pressable>
  );
}

function EditBtn({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.editBtn}>
      <Ionicons name="pencil" size={14} color={C.text} />
    </Pressable>
  );
}

function DeleteBtn({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.deleteBtn}>
      <Ionicons name="trash-outline" size={14} color={C.danger} />
    </Pressable>
  );
}

function FAB({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.fab} onPress={onPress}>
      <Ionicons name="add" size={24} color="#FFF" />
      <Text style={styles.fabText}>{label}</Text>
    </Pressable>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  lockedText: { color: C.muted, fontSize: 14, marginTop: 12, textAlign: "center", paddingHorizontal: 40 },
  backBtn: { marginTop: 20, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, backgroundColor: C.surface },
  backBtnText: { color: C.text, fontSize: 14, fontWeight: "600" },
  adminHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    gap: 8,
  },
  backIcon: { padding: 4 },
  adminTitle: { flex: 1, fontSize: 18, fontWeight: "800", color: C.text },
  headerActions: { flexDirection: "row", gap: 14, alignItems: "center" },
  resetBtn: { color: C.danger, fontSize: 13, fontWeight: "600" },
  logoutBtn: { color: C.muted, fontSize: 13, fontWeight: "600" },
  tabs: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: C.border },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center" },
  tabActive: { borderBottomWidth: 2, borderBottomColor: C.primary },
  tabText: { fontSize: 12, fontWeight: "600", color: C.muted },
  tabTextActive: { color: C.primary },
  listContent: { padding: 16, paddingBottom: 100 },
  listNote: { fontSize: 12, color: C.muted, marginBottom: 14, lineHeight: 18 },
  listItem: {
    backgroundColor: C.surface, borderRadius: 14, padding: 14, marginBottom: 10,
    flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: C.border,
  },
  listItemTitle: { fontSize: 15, fontWeight: "700", color: C.text, marginBottom: 2 },
  listItemSub: { fontSize: 12, color: C.muted, marginTop: 1 },
  listActions: { flexDirection: "row", gap: 4, alignItems: "center" },
  arrowBtn: { width: 28, height: 28, alignItems: "center", justifyContent: "center" },
  editBtn: { width: 32, height: 32, backgroundColor: C.primary + "33", borderRadius: 8, alignItems: "center", justifyContent: "center" },
  deleteBtn: { width: 32, height: 32, backgroundColor: C.danger + "22", borderRadius: 8, alignItems: "center", justifyContent: "center" },
  countryBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, alignSelf: "flex-start", marginBottom: 5 },
  countryBadgeText: { fontSize: 10, fontWeight: "700", color: C.muted, textTransform: "uppercase", letterSpacing: 0.5 },
  fab: {
    position: "absolute", bottom: 24, right: 20,
    backgroundColor: C.primary, flexDirection: "row", alignItems: "center",
    gap: 8, paddingHorizontal: 20, paddingVertical: 14, borderRadius: 28,
    shadowColor: "#000", shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
  fabText: { color: "#FFF", fontWeight: "700", fontSize: 15 },
  formHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    padding: 20, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  formCancel: { color: C.muted, fontSize: 15 },
  formTitle: { fontSize: 16, fontWeight: "700", color: C.text },
  formSave: { color: C.primary, fontSize: 15, fontWeight: "700" },
  formBody: { padding: 20, gap: 4, paddingBottom: 60 },
  fieldWrap: { marginBottom: 16 },
  fieldLabel: { fontSize: 12, fontWeight: "700", color: C.muted, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 6 },
  fieldInput: {
    backgroundColor: C.input, borderWidth: 1, borderColor: C.border,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, color: C.text,
  },
  fieldHint: { fontSize: 11, color: C.muted, lineHeight: 16, marginTop: -8, marginBottom: 16 },
  rowWrap: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  pickerOption: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20,
    backgroundColor: C.input, borderWidth: 1, borderColor: C.border,
  },
  pickerOptionActive: { backgroundColor: C.primary, borderColor: C.primary },
  pickerOptionText: { fontSize: 12, color: C.muted, fontWeight: "600" },
  pickerOptionTextActive: { color: "#FFF" },
});
