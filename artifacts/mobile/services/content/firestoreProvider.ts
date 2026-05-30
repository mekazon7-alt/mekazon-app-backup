/**
 * Firebase Firestore Content Provider — Mekazon
 * ─────────────────────────────────────────────────────────────────────────────
 * This module connects to Firestore to read and write app content.
 * It uses the Firebase REST API (no native SDK needed — works on all platforms
 * including Expo Go and web without any extra native modules).
 *
 * The REST API approach means:
 *   - Zero native dependencies
 *   - Works in Expo Go without rebuilding
 *   - Works on web
 *   - Same behaviour on iOS and Android
 *
 * ARCHITECTURE:
 *   All content (baskets, meals, categories, heroes, promos) is stored as a
 *   single document in Firestore:
 *     Collection: app_content
 *     Document:   v1
 *
 *   This means one read fetches everything — fast, cheap, simple.
 *   Writes replace the whole document (acceptable at this content size).
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { AppContentData } from "@/types/appContent";
import { FIREBASE_CONFIG, FIRESTORE } from "./firebaseConfig";

const BASE_URL = `https://firestore.googleapis.com/v1/projects/${FIREBASE_CONFIG.projectId}/databases/(default)/documents`;
const DOC_URL = `${BASE_URL}/${FIRESTORE.COLLECTION}/${FIRESTORE.DOCUMENT}`;

// ─── Firestore value serialisation ──────────────────────────────────────────

function toFirestoreValue(value: unknown): object {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === "boolean") return { booleanValue: value };
  if (typeof value === "number") {
    if (Number.isInteger(value)) return { integerValue: String(value) };
    return { doubleValue: value };
  }
  if (typeof value === "string") return { stringValue: value };
  if (Array.isArray(value)) {
    return { arrayValue: { values: value.map(toFirestoreValue) } };
  }
  if (typeof value === "object") {
    const fields: Record<string, object> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      fields[k] = toFirestoreValue(v);
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(value) };
}

function fromFirestoreValue(val: Record<string, unknown>): unknown {
  if ("nullValue" in val) return null;
  if ("booleanValue" in val) return val.booleanValue;
  if ("integerValue" in val) return Number(val.integerValue);
  if ("doubleValue" in val) return val.doubleValue;
  if ("stringValue" in val) return val.stringValue;
  if ("arrayValue" in val) {
    const arr = val.arrayValue as { values?: Array<Record<string, unknown>> };
    return (arr.values ?? []).map(fromFirestoreValue);
  }
  if ("mapValue" in val) {
    const map = val.mapValue as { fields?: Record<string, Record<string, unknown>> };
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(map.fields ?? {})) {
      result[k] = fromFirestoreValue(v);
    }
    return result;
  }
  return null;
}

function toFirestoreDoc(data: AppContentData): object {
  const fields: Record<string, object> = {};
  for (const [k, v] of Object.entries(data)) {
    fields[k] = toFirestoreValue(v);
  }
  return { fields };
}

function fromFirestoreDoc(doc: {
  fields?: Record<string, Record<string, unknown>>;
}): AppContentData | null {
  if (!doc.fields) return null;
  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(doc.fields)) {
    result[k] = fromFirestoreValue(v);
  }
  return result as AppContentData;
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Fetch content from Firestore.
 * Returns null if the document doesn't exist yet or on network error.
 */
export async function fetchFromFirestore(): Promise<AppContentData | null> {
  const url = `${DOC_URL}?key=${FIREBASE_CONFIG.apiKey}`;
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (res.status === 404) return null; // document not seeded yet
    if (!res.ok) {
      console.warn("[Mekazon Firebase] Fetch failed:", res.status);
      return null;
    }
    const doc = await res.json();
    return fromFirestoreDoc(doc);
  } catch (err) {
    console.warn("[Mekazon Firebase] Network error on fetch:", err);
    return null;
  }
}

/**
 * Write content to Firestore.
 * Uses PATCH to create-or-update the document.
 * Only callable when Firebase is configured (admin flow).
 */
export async function saveToFirestore(data: AppContentData): Promise<boolean> {
  const url = `${DOC_URL}?key=${FIREBASE_CONFIG.apiKey}`;
  try {
    const res = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toFirestoreDoc(data)),
    });
    if (!res.ok) {
      const err = await res.text();
      console.warn("[Mekazon Firebase] Save failed:", res.status, err);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("[Mekazon Firebase] Network error on save:", err);
    return false;
  }
}

/**
 * Seed Firestore with content if the document doesn't exist yet.
 * Safe to call every time — only writes if document is absent.
 */
export async function seedFirestoreIfEmpty(
  defaultContent: AppContentData
): Promise<void> {
  const existing = await fetchFromFirestore();
  if (existing) return; // already seeded
  console.log("[Mekazon Firebase] Seeding Firestore with default content...");
  const ok = await saveToFirestore(defaultContent);
  if (ok) {
    console.log("[Mekazon Firebase] Seed complete.");
  } else {
    console.warn("[Mekazon Firebase] Seed failed — will use local defaults.");
  }
}