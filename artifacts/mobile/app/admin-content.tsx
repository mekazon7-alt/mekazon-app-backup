import { Ionicons } from "@expo/vector-icons";
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
import type { AdminBasket, AdminMeal, AdminCategory, AdminHero, AppContentData, ContentCountry } from "@/types/appContent";
import type { HomeCountry } from "@/constants/personalization";

const ADMIN_PASSWORD = "mekazon-2024";

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

// ─── colours ──────────────────────────────────────────────────────────────────
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

// ─── helper ───────────────────────────────────────────────────────────────────
function uid() {
  return Math.random().toString(36).slice(2, 10);
}

// ─────────────────────────────────────────────────────────────────────────────
export default function AdminContentScreen() {
  const insets = useSafeAreaInsets();
  const [authed, setAuthed] = useState(false);
  const [pwInput, setPwInput] = useState("");
  const [pwError, setPwError] = useState(false);
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

  const handleLogin = () => {
    if (pwInput.trim() === ADMIN_PASSWORD) {
      setAuthed(true);
      setPwError(false);
    } else {
      setPwError(true);
    }
  };

  const persistContent = async (updated: AppContentData) => {
    setContent(updated);
    await appContentService.setContent(updated);
  };

  if (!authed) {
    return (
      <View style={[styles.screen, { justifyContent: "center", paddingBottom: insets.bottom + 40 }]}>
        <View style={styles.loginCard}>
          <View style={styles.loginIcon}>
            <Ionicons name="lock-closed" size={28} color={C.primary} />
          </View>
          <Text style={styles.loginTitle}>Admin Access</Text>
          <Text style={styles.loginSub}>Enter the admin password to manage app content</Text>
          <TextInput
            style={[styles.loginInput, pwError && { borderColor: C.danger }]}
            placeholder="Password"
            placeholderTextColor={C.muted}
            secureTextEntry
            value={pwInput}
            onChangeText={(t) => { setPwInput(t); setPwError(false); }}
            onSubmitEditing={handleLogin}
            autoCapitalize="none"
          />
          {pwError && <Text style={styles.loginError}>Incorrect password</Text>}
          <Pressable style={styles.loginBtn} onPress={handleLogin}>
            <Text style={styles.loginBtnText}>Sign In</Text>
          </Pressable>
        </View>
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
      <View style={styles.adminHeader}>
        <Text style={styles.adminTitle}>Content Admin</Text>
        <Pressable onPress={async () => {
          Alert.alert("Reset Content", "This will reset all content to factory defaults. Continue?", [
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
      </View>

      <View style={styles.tabs}>
        {(["baskets", "meals", "categories", "hero"] as Tab[]).map((t) => (
          <Pressable key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      {tab === "baskets" && (
        <BasketsTab content={content} onChange={persistContent} />
      )}
      {tab === "meals" && (
        <MealsTab content={content} onChange={persistContent} />
      )}
      {tab === "categories" && (
        <CategoriesTab content={content} onChange={persistContent} />
      )}
      {tab === "hero" && (
        <HeroTab content={content} onChange={persistContent} />
      )}
    </View>
  );
}

// ─── BASKETS TAB ─────────────────────────────────────────────────────────────
function BasketsTab({ content, onChange }: { content: AppContentData; onChange: (d: AppContentData) => void }) {
  const [editItem, setEditItem] = useState<AdminBasket | null>(null);
  const [showForm, setShowForm] = useState(false);

  const openAdd = () => {
    setEditItem({
      id: uid(), country: "kenya", name: "", tagline: "", items: [], price: 0,
      currency: "AED", cardColor: "#4A7A32", lifestyleImageKey: "lifestyle-ugali",
      active: true, order: content.baskets.length + 1,
    });
    setShowForm(true);
  };

  const openEdit = (b: AdminBasket) => { setEditItem({ ...b }); setShowForm(true); };

  const save = (b: AdminBasket) => {
    const idx = content.baskets.findIndex((x) => x.id === b.id);
    const baskets = [...content.baskets];
    if (idx >= 0) baskets[idx] = b; else baskets.push(b);
    onChange({ ...content, baskets });
    setShowForm(false);
  };

  const del = (id: string) => {
    Alert.alert("Delete basket?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => onChange({ ...content, baskets: content.baskets.filter((b) => b.id !== id) }) },
    ]);
  };

  const move = (id: string, dir: -1 | 1) => {
    const list = [...content.baskets].sort((a, b) => a.order - b.order);
    const idx = list.findIndex((b) => b.id === id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= list.length) return;
    const tmp = list[idx].order;
    list[idx].order = list[swapIdx].order;
    list[swapIdx].order = tmp;
    onChange({ ...content, baskets: list });
  };

  const sorted = [...content.baskets].sort((a, b) => a.order - b.order);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.listContent}>
        <Text style={styles.listNote}>
          {content.baskets.length} baskets total. Tap to edit. Use arrows to reorder.
        </Text>
        {sorted.map((b, i) => (
          <View key={b.id} style={[styles.listItem, !b.active && { opacity: 0.45 }]}>
            <View style={{ flex: 1 }}>
              <View style={styles.listItemRow}>
                <View style={[styles.countryBadge, { backgroundColor: C.primary + "33" }]}>
                  <Text style={styles.countryBadgeText}>{b.country}</Text>
                </View>
                {!b.active && <Text style={[styles.countryBadgeText, { color: C.muted }]}>inactive</Text>}
              </View>
              <Text style={styles.listItemTitle}>{b.name || "(no name)"}</Text>
              <Text style={styles.listItemSub}>{b.tagline || "—"} · AED {b.price}</Text>
            </View>
            <View style={styles.listActions}>
              <Pressable onPress={() => move(b.id, -1)} disabled={i === 0} style={styles.arrowBtn}>
                <Ionicons name="chevron-up" size={16} color={i === 0 ? C.border : C.muted} />
              </Pressable>
              <Pressable onPress={() => move(b.id, 1)} disabled={i === sorted.length - 1} style={styles.arrowBtn}>
                <Ionicons name="chevron-down" size={16} color={i === sorted.length - 1 ? C.border : C.muted} />
              </Pressable>
              <Pressable onPress={() => openEdit(b)} style={styles.editBtn}>
                <Ionicons name="pencil" size={14} color={C.text} />
              </Pressable>
              <Pressable onPress={() => del(b.id)} style={styles.deleteBtn}>
                <Ionicons name="trash-outline" size={14} color={C.danger} />
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>
      <Pressable style={styles.fab} onPress={openAdd}>
        <Ionicons name="add" size={24} color="#FFF" />
        <Text style={styles.fabText}>Add Basket</Text>
      </Pressable>
      {showForm && editItem && (
        <BasketForm item={editItem} onSave={save} onClose={() => setShowForm(false)} />
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
    <Modal visible animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView style={{ flex: 1, backgroundColor: C.bg }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.formHeader}>
          <Pressable onPress={onClose}><Text style={styles.formCancel}>Cancel</Text></Pressable>
          <Text style={styles.formTitle}>{item.name ? "Edit Basket" : "New Basket"}</Text>
          <Pressable onPress={save}><Text style={styles.formSave}>Save</Text></Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.formBody}>
          <Field label="Name" value={form.name} onChange={(v) => set("name", v)} />
          <Field label="Tagline" value={form.tagline} onChange={(v) => set("tagline", v)} />
          <Field label="Price (AED)" value={String(form.price)} onChange={(v) => set("price", parseFloat(v) || 0)} keyboardType="numeric" />
          <Field label="Items (comma separated)" value={form.itemsStr} onChange={(v) => set("itemsStr", v)} multiline />
          <Field label="Card Colour (hex)" value={form.cardColor} onChange={(v) => set("cardColor", v)} />
          <Picker label="Lifestyle Image Key" value={form.lifestyleImageKey ?? ""} options={LIFESTYLE_KEYS} onChange={(v) => set("lifestyleImageKey", v)} />
          <Picker label="Country" value={form.country} options={COUNTRY_OPTIONS.map((o) => o.value)} labels={COUNTRY_OPTIONS.map((o) => o.label)} onChange={(v) => set("country", v)} />
          <Row label="Active">
            <Switch value={form.active} onValueChange={(v) => set("active", v)} trackColor={{ true: C.primary }} />
          </Row>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── MEALS TAB ────────────────────────────────────────────────────────────────
function MealsTab({ content, onChange }: { content: AppContentData; onChange: (d: AppContentData) => void }) {
  const [editItem, setEditItem] = useState<AdminMeal | null>(null);
  const [showForm, setShowForm] = useState(false);

  const openAdd = () => {
    setEditItem({
      id: uid(), country: "all", lifestyleImageKey: "lifestyle-ugali", name: "", description: "",
      prepTime: "15 min", cookTime: "30 min", servings: 4, ingredients: [], steps: [], active: true, order: content.meals.length + 1,
    });
    setShowForm(true);
  };

  const save = (m: AdminMeal) => {
    const idx = content.meals.findIndex((x) => x.id === m.id);
    const meals = [...content.meals];
    if (idx >= 0) meals[idx] = m; else meals.push(m);
    onChange({ ...content, meals });
    setShowForm(false);
  };

  const del = (id: string) => {
    Alert.alert("Delete meal?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => onChange({ ...content, meals: content.meals.filter((m) => m.id !== id) }) },
    ]);
  };

  const move = (id: string, dir: -1 | 1) => {
    const list = [...content.meals].sort((a, b) => a.order - b.order);
    const idx = list.findIndex((m) => m.id === id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= list.length) return;
    const tmp = list[idx].order; list[idx].order = list[swapIdx].order; list[swapIdx].order = tmp;
    onChange({ ...content, meals: list });
  };

  const sorted = [...content.meals].sort((a, b) => a.order - b.order);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.listContent}>
        <Text style={styles.listNote}>{content.meals.length} meals. Tap to edit ingredients, steps and tips.</Text>
        {sorted.map((m, i) => (
          <View key={m.id} style={[styles.listItem, !m.active && { opacity: 0.45 }]}>
            <View style={{ flex: 1 }}>
              <View style={styles.listItemRow}>
                <View style={[styles.countryBadge, { backgroundColor: C.accent + "33" }]}>
                  <Text style={styles.countryBadgeText}>{m.country}</Text>
                </View>
              </View>
              <Text style={styles.listItemTitle}>{m.name || "(no name)"}</Text>
              <Text style={styles.listItemSub}>{m.prepTime} prep · {m.cookTime} cook · serves {m.servings}</Text>
            </View>
            <View style={styles.listActions}>
              <Pressable onPress={() => move(m.id, -1)} disabled={i === 0} style={styles.arrowBtn}>
                <Ionicons name="chevron-up" size={16} color={i === 0 ? C.border : C.muted} />
              </Pressable>
              <Pressable onPress={() => move(m.id, 1)} disabled={i === sorted.length - 1} style={styles.arrowBtn}>
                <Ionicons name="chevron-down" size={16} color={i === sorted.length - 1 ? C.border : C.muted} />
              </Pressable>
              <Pressable onPress={() => { setEditItem({ ...m }); setShowForm(true); }} style={styles.editBtn}>
                <Ionicons name="pencil" size={14} color={C.text} />
              </Pressable>
              <Pressable onPress={() => del(m.id)} style={styles.deleteBtn}>
                <Ionicons name="trash-outline" size={14} color={C.danger} />
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>
      <Pressable style={styles.fab} onPress={openAdd}>
        <Ionicons name="add" size={24} color="#FFF" />
        <Text style={styles.fabText}>Add Meal</Text>
      </Pressable>
      {showForm && editItem && (
        <MealForm item={editItem} onSave={save} onClose={() => setShowForm(false)} />
      )}
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
    <Modal visible animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView style={{ flex: 1, backgroundColor: C.bg }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.formHeader}>
          <Pressable onPress={onClose}><Text style={styles.formCancel}>Cancel</Text></Pressable>
          <Text style={styles.formTitle}>{item.name ? "Edit Meal" : "New Meal"}</Text>
          <Pressable onPress={save}><Text style={styles.formSave}>Save</Text></Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.formBody}>
          <Field label="Name" value={form.name} onChange={(v) => set("name", v)} />
          <Field label="Description" value={form.description} onChange={(v) => set("description", v)} multiline />
          <Picker label="Lifestyle Image Key" value={form.lifestyleImageKey} options={LIFESTYLE_KEYS} onChange={(v) => set("lifestyleImageKey", v)} />
          <Picker label="Country" value={form.country} options={COUNTRY_OPTIONS.map((o) => o.value)} labels={COUNTRY_OPTIONS.map((o) => o.label)} onChange={(v) => set("country", v)} />
          <Field label="Prep Time" value={form.prepTime} onChange={(v) => set("prepTime", v)} placeholder="e.g. 15 min" />
          <Field label="Cook Time" value={form.cookTime} onChange={(v) => set("cookTime", v)} placeholder="e.g. 30 min" />
          <Field label="Serves" value={String(form.servings)} onChange={(v) => set("servings", parseInt(v) || 1)} keyboardType="numeric" />
          <Field label="Ingredients (one per line)" value={form.ingredientsStr} onChange={(v) => set("ingredientsStr", v)} multiline placeholder={"2 cups maize flour\n4 cups water\n..."} />
          <Field label="Method Steps (one per line)" value={form.stepsStr} onChange={(v) => set("stepsStr", v)} multiline placeholder={"Bring water to boil\nAdd flour gradually\n..."} />
          <Field label="Chef Tip (optional)" value={form.tip ?? ""} onChange={(v) => set("tip", v)} multiline />
          <Row label="Active">
            <Switch value={form.active} onValueChange={(v) => set("active", v)} trackColor={{ true: C.primary }} />
          </Row>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── CATEGORIES TAB ───────────────────────────────────────────────────────────
function CategoriesTab({ content, onChange }: { content: AppContentData; onChange: (d: AppContentData) => void }) {
  const [editItem, setEditItem] = useState<AdminCategory | null>(null);
  const [showForm, setShowForm] = useState(false);

  const openAdd = () => {
    setEditItem({
      id: uid(), country: "kenya", name: "", icon: "nutrition",
      keywords: [], active: true, order: content.categories.length + 1,
    });
    setShowForm(true);
  };

  const save = (c: AdminCategory) => {
    const idx = content.categories.findIndex((x) => x.id === c.id);
    const categories = [...content.categories];
    if (idx >= 0) categories[idx] = c; else categories.push(c);
    onChange({ ...content, categories });
    setShowForm(false);
  };

  const del = (id: string) => {
    Alert.alert("Delete category?", undefined, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => onChange({ ...content, categories: content.categories.filter((c) => c.id !== id) }) },
    ]);
  };

  const sorted = [...content.categories].sort((a, b) => {
    const cOrder = ["uganda", "kenya", "ethiopia", "other", "all"];
    const ca = cOrder.indexOf(a.country); const cb = cOrder.indexOf(b.country);
    if (ca !== cb) return ca - cb;
    return a.order - b.order;
  });

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.listContent}>
        <Text style={styles.listNote}>
          Categories filter products by keyword. Map a Shopify collection handle for future direct collection fetch.
        </Text>
        {sorted.map((c) => (
          <View key={c.id} style={[styles.listItem, !c.active && { opacity: 0.45 }]}>
            <View style={{ flex: 1 }}>
              <View style={styles.listItemRow}>
                <View style={[styles.countryBadge, { backgroundColor: C.muted + "33" }]}>
                  <Text style={styles.countryBadgeText}>{c.country}</Text>
                </View>
              </View>
              <Text style={styles.listItemTitle}>{c.name || "(no name)"}</Text>
              <Text style={styles.listItemSub} numberOfLines={1}>{c.keywords.join(", ") || "no keywords"}</Text>
              {c.shopifyCollectionHandle && (
                <Text style={[styles.listItemSub, { color: C.primary }]}>{c.shopifyCollectionHandle}</Text>
              )}
            </View>
            <View style={styles.listActions}>
              <Pressable onPress={() => { setEditItem({ ...c }); setShowForm(true); }} style={styles.editBtn}>
                <Ionicons name="pencil" size={14} color={C.text} />
              </Pressable>
              <Pressable onPress={() => del(c.id)} style={styles.deleteBtn}>
                <Ionicons name="trash-outline" size={14} color={C.danger} />
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>
      <Pressable style={styles.fab} onPress={openAdd}>
        <Ionicons name="add" size={24} color="#FFF" />
        <Text style={styles.fabText}>Add Category</Text>
      </Pressable>
      {showForm && editItem && (
        <CategoryForm item={editItem} onSave={save} onClose={() => setShowForm(false)} />
      )}
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
    <Modal visible animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView style={{ flex: 1, backgroundColor: C.bg }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.formHeader}>
          <Pressable onPress={onClose}><Text style={styles.formCancel}>Cancel</Text></Pressable>
          <Text style={styles.formTitle}>{item.name ? "Edit Category" : "New Category"}</Text>
          <Pressable onPress={save}><Text style={styles.formSave}>Save</Text></Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.formBody}>
          <Field label="Category Name" value={form.name} onChange={(v) => set("name", v)} placeholder="e.g. Flours" />
          <Field label="Icon Name (Ionicons)" value={form.icon} onChange={(v) => set("icon", v)} placeholder="e.g. nutrition, flask, leaf" />
          <Picker label="Country" value={form.country} options={COUNTRY_OPTIONS.map((o) => o.value)} labels={COUNTRY_OPTIONS.map((o) => o.label)} onChange={(v) => set("country", v)} />
          <Field
            label="Keywords (comma separated)"
            value={form.keywordsStr}
            onChange={(v) => set("keywordsStr", v)}
            multiline
            placeholder="flour, unga, posho, maize"
          />
          <Field
            label="Shopify Collection Handle (optional)"
            value={form.shopifyCollectionHandle ?? ""}
            onChange={(v) => set("shopifyCollectionHandle", v)}
            placeholder="e.g. kenyan-foodstuff"
          />
          <Text style={styles.fieldHint}>
            Future: when tapped, fetch products directly from this Shopify collection instead of keyword filtering.
          </Text>
          <Row label="Active">
            <Switch value={form.active} onValueChange={(v) => set("active", v)} trackColor={{ true: C.primary }} />
          </Row>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── HERO TAB ─────────────────────────────────────────────────────────────────
function HeroTab({ content, onChange }: { content: AppContentData; onChange: (d: AppContentData) => void }) {
  const [editItem, setEditItem] = useState<AdminHero | null>(null);
  const [showForm, setShowForm] = useState(false);

  const getHero = (country: HomeCountry): AdminHero =>
    content.heroes.find((h) => h.country === country) ?? { country, title: "", tagline: "", imageKey: "hero-pan-african" };

  const save = (h: AdminHero) => {
    const heroes = [...content.heroes];
    const idx = heroes.findIndex((x) => x.country === h.country);
    if (idx >= 0) heroes[idx] = h; else heroes.push(h);
    onChange({ ...content, heroes });
    setShowForm(false);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.listContent}>
        <Text style={styles.listNote}>Hero banners shown at the top of the home screen, per country.</Text>
        {HERO_COUNTRIES.map((country) => {
          const hero = getHero(country);
          return (
            <View key={country} style={styles.listItem}>
              <View style={{ flex: 1 }}>
                <View style={[styles.countryBadge, { backgroundColor: C.primary + "33", alignSelf: "flex-start", marginBottom: 6 }]}>
                  <Text style={styles.countryBadgeText}>{country}</Text>
                </View>
                <Text style={styles.listItemTitle}>{hero.title || "(no title)"}</Text>
                <Text style={styles.listItemSub}>{hero.tagline || "(no tagline)"}</Text>
                <Text style={[styles.listItemSub, { color: C.muted }]}>{hero.imageKey}</Text>
              </View>
              <Pressable onPress={() => { setEditItem({ ...hero }); setShowForm(true); }} style={styles.editBtn}>
                <Ionicons name="pencil" size={14} color={C.text} />
              </Pressable>
            </View>
          );
        })}
      </ScrollView>
      {showForm && editItem && (
        <HeroForm item={editItem} onSave={save} onClose={() => setShowForm(false)} />
      )}
    </View>
  );
}

function HeroForm({ item, onSave, onClose }: { item: AdminHero; onSave: (h: AdminHero) => void; onClose: () => void }) {
  const [form, setForm] = useState({ ...item });
  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView style={{ flex: 1, backgroundColor: C.bg }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.formHeader}>
          <Pressable onPress={onClose}><Text style={styles.formCancel}>Cancel</Text></Pressable>
          <Text style={styles.formTitle}>Edit Hero — {item.country}</Text>
          <Pressable onPress={() => onSave(form)}><Text style={styles.formSave}>Save</Text></Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.formBody}>
          <Field label="Hero Title" value={form.title} onChange={(v) => set("title", v)} multiline />
          <Field label="Tagline / Subtitle" value={form.tagline} onChange={(v) => set("tagline", v)} multiline />
          <Picker label="Image Key" value={form.imageKey} options={["hero-uganda", "hero-kenya", "hero-ethiopia", "hero-pan-african"]} onChange={(v) => set("imageKey", v)} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── SHARED FORM COMPONENTS ───────────────────────────────────────────────────
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

function Picker({ label, value, options, labels, onChange }: {
  label: string; value: string; options: string[]; labels?: string[]; onChange: (v: string) => void;
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 6 }}>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {options.map((opt, i) => (
            <Pressable
              key={opt}
              style={[styles.pickerOption, opt === value && styles.pickerOptionActive]}
              onPress={() => onChange(opt)}
            >
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

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.rowWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  loginCard: { margin: 28, backgroundColor: C.surface, borderRadius: 20, padding: 28, gap: 12, borderWidth: 1, borderColor: C.border },
  loginIcon: { alignSelf: "center", backgroundColor: C.primary + "22", width: 60, height: 60, borderRadius: 30, alignItems: "center", justifyContent: "center" },
  loginTitle: { fontSize: 22, fontWeight: "800", color: C.text, textAlign: "center" },
  loginSub: { fontSize: 13, color: C.muted, textAlign: "center", lineHeight: 19 },
  loginInput: { backgroundColor: C.input, borderWidth: 1.5, borderColor: C.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 13, fontSize: 15, color: C.text, marginTop: 4 },
  loginError: { color: C.danger, fontSize: 13, textAlign: "center" },
  loginBtn: { backgroundColor: C.primary, borderRadius: 14, paddingVertical: 15, alignItems: "center", marginTop: 4 },
  loginBtnText: { color: "#FFF", fontSize: 15, fontWeight: "700" },
  adminHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.border },
  adminTitle: { fontSize: 20, fontWeight: "800", color: C.text },
  resetBtn: { color: C.danger, fontSize: 13, fontWeight: "600" },
  tabs: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: C.border },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center" },
  tabActive: { borderBottomWidth: 2, borderBottomColor: C.primary },
  tabText: { fontSize: 12, fontWeight: "600", color: C.muted },
  tabTextActive: { color: C.primary },
  listContent: { padding: 16, paddingBottom: 100 },
  listNote: { fontSize: 12, color: C.muted, marginBottom: 14, lineHeight: 18 },
  listItem: { backgroundColor: C.surface, borderRadius: 14, padding: 14, marginBottom: 10, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: C.border },
  listItemRow: { flexDirection: "row", gap: 8, marginBottom: 4 },
  listItemTitle: { fontSize: 15, fontWeight: "700", color: C.text },
  listItemSub: { fontSize: 12, color: C.muted, marginTop: 2 },
  listActions: { flexDirection: "row", gap: 4, alignItems: "center" },
  arrowBtn: { width: 28, height: 28, alignItems: "center", justifyContent: "center" },
  editBtn: { width: 32, height: 32, backgroundColor: C.primary + "33", borderRadius: 8, alignItems: "center", justifyContent: "center" },
  deleteBtn: { width: 32, height: 32, backgroundColor: C.danger + "22", borderRadius: 8, alignItems: "center", justifyContent: "center" },
  countryBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  countryBadgeText: { fontSize: 10, fontWeight: "700", color: C.muted, textTransform: "uppercase", letterSpacing: 0.5 },
  fab: { position: "absolute", bottom: 24, right: 20, backgroundColor: C.primary, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 20, paddingVertical: 14, borderRadius: 28, shadowColor: "#000", shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 6 },
  fabText: { color: "#FFF", fontWeight: "700", fontSize: 15 },
  formHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 20, borderBottomWidth: 1, borderBottomColor: C.border },
  formCancel: { color: C.muted, fontSize: 15 },
  formTitle: { fontSize: 16, fontWeight: "700", color: C.text },
  formSave: { color: C.primary, fontSize: 15, fontWeight: "700" },
  formBody: { padding: 20, gap: 4, paddingBottom: 60 },
  fieldWrap: { marginBottom: 16 },
  fieldLabel: { fontSize: 12, fontWeight: "700", color: C.muted, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 6 },
  fieldInput: { backgroundColor: C.input, borderWidth: 1, borderColor: C.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, color: C.text },
  fieldHint: { fontSize: 11, color: C.muted, lineHeight: 16, marginTop: -8, marginBottom: 16 },
  rowWrap: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  pickerOption: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: C.input, borderWidth: 1, borderColor: C.border },
  pickerOptionActive: { backgroundColor: C.primary, borderColor: C.primary },
  pickerOptionText: { fontSize: 12, color: C.muted, fontWeight: "600" },
  pickerOptionTextActive: { color: "#FFF" },
});
