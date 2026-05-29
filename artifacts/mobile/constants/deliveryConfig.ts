export const VAT_RATE = 0.05;

export const NEXT_DAY_FEE_AED = 20;
export const SAME_DAY_FEE_AED = 32;
export const EXPRESS_FEE_AED = 40;

export type DeliveryOption = "next-day" | "same-day" | "express";

export interface DeliveryChoice {
  id: DeliveryOption;
  label: string;
  description: string;
  fee: number;
}

export const DUBAI_DELIVERY_OPTIONS: DeliveryChoice[] = [
  {
    id: "next-day",
    label: "Next Day",
    description: "Delivered tomorrow",
    fee: NEXT_DAY_FEE_AED,
  },
  {
    id: "same-day",
    label: "Same Day",
    description: "Delivered today",
    fee: SAME_DAY_FEE_AED,
  },
  {
    id: "express",
    label: "Express",
    description: "Within 2 hours",
    fee: EXPRESS_FEE_AED,
  },
];

export function isDubai(emirateId: string): boolean {
  return emirateId === "dubai";
}

export function computeDeliveryFee(
  emirateId: string,
  option: DeliveryOption = "next-day"
): number {
  if (isDubai(emirateId)) {
    return DUBAI_DELIVERY_OPTIONS.find((o) => o.id === option)?.fee ?? NEXT_DAY_FEE_AED;
  }
  return NEXT_DAY_FEE_AED;
}

export function computeVAT(subtotalAED: number): number {
  return Math.round(subtotalAED * VAT_RATE * 100) / 100;
}

export function getDeliveryLabel(emirateId: string, option: DeliveryOption = "next-day"): string {
  if (isDubai(emirateId)) {
    const choice = DUBAI_DELIVERY_OPTIONS.find((o) => o.id === option);
    return `${choice?.label ?? "Next day"} delivery — Dubai`;
  }
  const names: Record<string, string> = {
    "abu-dhabi": "Abu Dhabi",
    sharjah: "Sharjah",
    ajman: "Ajman",
    rak: "Ras Al Khaimah",
    fujairah: "Fujairah",
    "umm-al-quwain": "Umm Al Quwain",
  };
  const name = names[emirateId] ?? emirateId;
  return `Next-day delivery — ${name}`;
}
