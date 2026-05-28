import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { imageStore } from "@/services/imageStore";

interface ImageStoreContextValue {
  uriMap: Record<string, string>;
  storeImage(key: string, localUri: string): Promise<void>;
  removeImage(key: string): Promise<void>;
  refresh(): Promise<void>;
}

const ImageStoreContext = createContext<ImageStoreContextValue>({
  uriMap: {},
  storeImage: async () => {},
  removeImage: async () => {},
  refresh: async () => {},
});

export function ImageStoreProvider({ children }: { children: React.ReactNode }) {
  const [uriMap, setUriMap] = useState<Record<string, string>>({});

  const refresh = useCallback(async () => {
    const map = await imageStore.getAll();
    setUriMap(map);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const storeImage = useCallback(async (key: string, localUri: string) => {
    const storedUri = await imageStore.save(key, localUri);
    setUriMap((prev) => ({ ...prev, [key]: storedUri }));
  }, []);

  const removeImage = useCallback(async (key: string) => {
    await imageStore.delete(key);
    setUriMap((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  return (
    <ImageStoreContext.Provider value={{ uriMap, storeImage, removeImage, refresh }}>
      {children}
    </ImageStoreContext.Provider>
  );
}

export function useImageStore() {
  return useContext(ImageStoreContext);
}
