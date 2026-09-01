import { apiRequest } from "./api";
import { ENDPOINTS } from "./apiConstants";
import type {
  CreateShopRequestDto,
  ShopDto,
  UpdateShopRequestDto,
} from "./dto/shop.dto";

/**
 * The shop sites of the signed-in account. Every call carries the access token,
 * and the backend answers with that account's shops only.
 */
export const shopService = {
  list(): Promise<ShopDto[]> {
    return apiRequest<ShopDto[]>(ENDPOINTS.shops.all, { authenticated: true });
  },

  get(id: string): Promise<ShopDto> {
    return apiRequest<ShopDto>(ENDPOINTS.shops.byId(id), {
      authenticated: true,
    });
  },

  /** Creates the shop and starts its deployment in the cluster. */
  create(shop: CreateShopRequestDto): Promise<ShopDto> {
    return apiRequest<ShopDto>(ENDPOINTS.shops.all, {
      method: "POST",
      body: shop,
      authenticated: true,
    });
  },

  /** Sends only the settings that changed. */
  update(id: string, changes: UpdateShopRequestDto): Promise<ShopDto> {
    return apiRequest<ShopDto>(ENDPOINTS.shops.byId(id), {
      method: "PATCH",
      body: changes,
      authenticated: true,
    });
  },

  /** Removes the shop and everything it runs on. */
  remove(id: string): Promise<void> {
    return apiRequest<void>(ENDPOINTS.shops.byId(id), {
      method: "DELETE",
      authenticated: true,
    });
  },
};
