import type { ShopAvailability, ShopDatabase } from "@/services/dto/shop.dto";

/**
 * What the backend accepts as a shop name: latin letters — accented ones
 * included — digits, and single spaces between words.
 */
export const SHOP_NAME_PATTERN =
  "[\\p{Script=Latin}\\p{Mark}0-9]+( [\\p{Script=Latin}\\p{Mark}0-9]+)*";

/**
 * The choices the owner makes about a shop, spelled out with what each one
 * actually means in the cluster. The values are the ones the Shop CRD accepts.
 */
export const AVAILABILITY_OPTIONS: {
  value: ShopAvailability;
  label: string;
}[] = [
  { value: "standard", label: "Standard — 2 replicas" },
  { value: "high", label: "High — 3 replicas" },
];

export const DATABASE_OPTIONS: { value: ShopDatabase; label: string }[] = [
  { value: "postgresql", label: "Standard — PostgreSQL" },
  { value: "redis", label: "Light — Redis" },
];

export function availabilityLabel(availability: ShopAvailability): string {
  return availability === "high"
    ? "High · 3 replicas"
    : "Standard · 2 replicas";
}

export function databaseLabel(database: ShopDatabase): string {
  return database === "redis" ? "Redis" : "PostgreSQL";
}
