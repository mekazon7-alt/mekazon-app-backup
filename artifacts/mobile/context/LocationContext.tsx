import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "@mekazon_location";

export interface UAE_Emirate {
  id: string;
  name: string;
  arabicName: string;
  sameDay: boolean;
  deliveryMessage: string;
}

export const UAE_EMIRATES: UAE_Emirate[] = [
  {
    id: "dubai",
    name: "Dubai",
    arabicName: "دبي",
    sameDay: true,
    deliveryMessage: "Same-day delivery · AED 32",
  },
  {
    id: "abu-dhabi",
    name: "Abu Dhabi",
    arabicName: "أبوظبي",
    sameDay: false,
    deliveryMessage: "Next-day delivery available in Abu Dhabi",
  },
  {
    id: "sharjah",
    name: "Sharjah",
    arabicName: "الشارقة",
    sameDay: false,
    deliveryMessage: "Next-day delivery available in Sharjah",
  },
  {
    id: "ajman",
    name: "Ajman",
    arabicName: "عجمان",
    sameDay: false,
    deliveryMessage: "Next-day delivery available in Ajman",
  },
  {
    id: "rak",
    name: "Ras Al Khaimah",
    arabicName: "رأس الخيمة",
    sameDay: false,
    deliveryMessage: "Next-day delivery available in Ras Al Khaimah",
  },
  {
    id: "fujairah",
    name: "Fujairah",
    arabicName: "الفجيرة",
    sameDay: false,
    deliveryMessage: "Next-day delivery available in Fujairah",
  },
  {
    id: "umm-al-quwain",
    name: "Umm Al Quwain",
    arabicName: "أم القيوين",
    sameDay: false,
    deliveryMessage: "Next-day delivery available in Umm Al Quwain",
  },
];

interface LocationContextType {
  selectedEmirate: UAE_Emirate | null;
  setEmirate: (emirate: UAE_Emirate) => Promise<void>;
  deliveryLabel: string;
}

const LocationContext = createContext<LocationContextType>({
  selectedEmirate: null,
  setEmirate: async () => {},
  deliveryLabel: "Choose location",
});

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [selectedEmirate, setSelectedEmirateState] = useState<UAE_Emirate | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored) {
        const found = UAE_EMIRATES.find((e) => e.id === stored);
        if (found) setSelectedEmirateState(found);
      }
    });
  }, []);

  const setEmirate = useCallback(async (emirate: UAE_Emirate) => {
    await AsyncStorage.setItem(STORAGE_KEY, emirate.id);
    setSelectedEmirateState(emirate);
  }, []);

  const deliveryLabel = selectedEmirate ? selectedEmirate.name : "Choose location";

  return (
    <LocationContext.Provider value={{ selectedEmirate, setEmirate, deliveryLabel }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  return useContext(LocationContext);
}
