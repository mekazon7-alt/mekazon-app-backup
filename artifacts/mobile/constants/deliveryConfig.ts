import type { HomeCountry } from "@/constants/personalization";

export const VAT_RATE = 0.05;

export const SAME_DAY_FEE_AED = 35;
export const NEXT_DAY_FEE_AED = 20;

/**
 * isSameDayEligible — only Dubai + Uganda qualifies for same-day.
 * All other emirate+country combinations default to next-day.
 */
export function isSameDayEligible(emirateId: string, country: HomeCountry | null): boolean {
  return emirateId === "dubai" && country === "uganda";
}

/**
 * computeDeliveryFee — returns estimated delivery fee in AED.
 *   Dubai + Uganda = AED 35 (same-day)
 *   All others     = AED 20 (next-day)
 */
export function computeDeliveryFee(emirateId: string, country: HomeCountry | null): number {
  return isSameDayEligible(emirateId, country) ? SAME_DAY_FEE_AED : NEXT_DAY_FEE_AED;
}

/**
 * computeVAT — 5% VAT on product subtotal only.
 * VAT is NOT applied to delivery fees.
 */
export function computeVAT(subtotalAED: number): number {
  return Math.round(subtotalAED * VAT_RATE * 100) / 100;
}

export function getDeliveryLabel(emirateId: string, country: HomeCountry | null): string {
  if (isSameDayEligible(emirateId, country)) return "Same-day delivery (Dubai)";
  const names: Record<string, string> = {
    dubai: "Dubai",
    "abu-dhabi": "Abu Dhabi",
    sharjah: "Sharjah",
    ajman: "Ajman",
    rak: "Ras Al Khaimah",
    fujairah: "Fujairah",
    "umm-al-quwain": "Umm Al Quwain",
  };
  const name = names[emirateId] ?? emirateId;
  return `Next-day delivery (${name})`;
}
