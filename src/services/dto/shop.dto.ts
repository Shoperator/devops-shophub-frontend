/** How many replicas the shop runs: `standard` two, `high` three. */
export type ShopAvailability = "standard" | "high";

/** Which database the shop is deployed with. */
export type ShopDatabase = "postgresql" | "redis";

/** Mirrors `ShopResponseDto` on the backend. */
export interface ShopDto {
  id: string;
  name: string;
  /** Name of the shop's resources in the cluster. */
  slug: string;
  availability: ShopAvailability;
  walletAddress: string;
  database: ShopDatabase;
  /** Null while the site is still being deployed. */
  url: string | null;
  createdAt: string;
}

export interface CreateShopRequestDto {
  name: string;
  availability: ShopAvailability;
  walletAddress: string;
  database: ShopDatabase;
}

export interface UpdateShopRequestDto {
  availability?: ShopAvailability;
  walletAddress?: string;
}
