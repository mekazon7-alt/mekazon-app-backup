/**
 * Image Store — provider-based, swappable storage backend.
 *
 * MVP → LocalProvider: copies picked images to the app's document directory
 * (stable across sessions), stores file:// URIs in AsyncStorage.
 *
 * Future swap (change one line in ImageStoreContext):
 *   imageStore.setProvider(new SupabaseProvider(url, key))
 *   imageStore.setProvider(new ShopifyProvider(storeDomain, token))
 *
 * Image key conventions:
 *   "basket:{basket.id}"   — basket lifestyle image
 *   "meal:{meal.id}"       — meal inspiration image
 *   "hero:{country}"       — hero banner (e.g. "hero:uganda")
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const STORAGE_KEY = "@mekazon:img_store_v1";

export interface ImageProvider {
  save(key: string, localUri: string): Promise<string>;
  getAll(): Promise<Record<string, string>>;
  delete(key: string): Promise<void>;
}

async function loadMap(): Promise<Record<string, string>> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

async function saveMap(map: Record<string, string>): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

class LocalProvider implements ImageProvider {
  async save(key: string, localUri: string): Promise<string> {
    if (Platform.OS === "web") {
      const map = await loadMap();
      map[key] = localUri;
      await saveMap(map);
      return localUri;
    }

    try {
      // expo-file-system v56 class-based API
      const { Paths, File, Directory } = await import("expo-file-system");
      const imgDir = new Directory(Paths.document, "mekazon_images");
      if (!imgDir.exists) {
        imgDir.create({ idempotent: true });
      }
      const safeKey = key.replace(/[^a-z0-9_-]/gi, "_");
      const ext = localUri.split(".").pop()?.split("?")[0] ?? "jpg";
      const destFile = new File(imgDir, `${safeKey}.${ext}`);
      // If destination already exists, delete it first so copy succeeds
      if (destFile.exists) {
        destFile.delete();
      }
      const srcFile = new File(localUri);
      srcFile.copySync(destFile);
      const storedUri = destFile.uri;
      const map = await loadMap();
      map[key] = storedUri;
      await saveMap(map);
      return storedUri;
    } catch {
      // Fallback: just store the original URI (works for session, may not persist)
      const map = await loadMap();
      map[key] = localUri;
      await saveMap(map);
      return localUri;
    }
  }

  async getAll(): Promise<Record<string, string>> {
    return loadMap();
  }

  async delete(key: string): Promise<void> {
    const map = await loadMap();
    const uri = map[key];
    if (uri && Platform.OS !== "web") {
      try {
        const { File } = await import("expo-file-system");
        const file = new File(uri);
        if (file.exists) {
          file.delete();
        }
      } catch {
        /* file may already be gone */
      }
    }
    delete map[key];
    await saveMap(map);
  }
}

let activeProvider: ImageProvider = new LocalProvider();

export const imageStore = {
  setProvider(p: ImageProvider) {
    activeProvider = p;
  },
  save(key: string, localUri: string): Promise<string> {
    return activeProvider.save(key, localUri);
  },
  getAll(): Promise<Record<string, string>> {
    return activeProvider.getAll();
  },
  delete(key: string): Promise<void> {
    return activeProvider.delete(key);
  },
};
