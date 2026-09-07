import { AUTH_TOKEN_KEY } from "./apiConstants";
import { shopService } from "./shopService";

const BASE = "http://shophub-backend.test";
const SHOP_ID = "d0000000-0000-4000-8000-000000000001";

const SHOP = {
  id: SHOP_ID,
  name: "Prodavnica odece",
  slug: "prodavnica-odece-abc123",
  availability: "standard",
  walletAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f42D0B",
  database: "postgresql",
  url: "http://prodavnica-odece-abc123.shop.local",
  createdAt: "2026-01-01T10:00:00.000Z",
};

/** jsdom ships no Fetch API, so only the parts `apiRequest` touches are built. */
function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  } as Response;
}

function lastRequest(): { url: string; init: RequestInit } {
  const calls = (globalThis.fetch as jest.Mock).mock.calls;
  const [url, init] = calls[calls.length - 1] as [string, RequestInit];
  return { url, init };
}

describe("shopService", () => {
  beforeEach(() => {
    window.localStorage.setItem(AUTH_TOKEN_KEY, "stored-token");
    globalThis.fetch = jest.fn().mockResolvedValue(jsonResponse(SHOP));
  });

  describe("list", () => {
    it("asks for the shops of the signed-in account", async () => {
      (globalThis.fetch as jest.Mock).mockResolvedValue(jsonResponse([SHOP]));

      await expect(shopService.list()).resolves.toEqual([SHOP]);

      const { url, init } = lastRequest();
      expect(url).toBe(`${BASE}/api/v1/shops`);
      expect(init.headers).toMatchObject({
        Authorization: "Bearer stored-token",
      });
    });

    it("clears the session when the token was rejected", async () => {
      (globalThis.fetch as jest.Mock).mockResolvedValue(
        jsonResponse({ message: "Unauthorized" }, 401),
      );

      await expect(shopService.list()).rejects.toThrow("Unauthorized");
      expect(window.localStorage.getItem(AUTH_TOKEN_KEY)).toBeNull();
    });
  });

  describe("create", () => {
    it("posts the configuration the owner chose", async () => {
      const creation = {
        name: "Prodavnica odece",
        availability: "standard",
        walletAddress: SHOP.walletAddress,
        database: "postgresql",
      } as const;

      await expect(shopService.create(creation)).resolves.toEqual(SHOP);

      const { url, init } = lastRequest();
      expect(url).toBe(`${BASE}/api/v1/shops`);
      expect(init.method).toBe("POST");
      expect(JSON.parse(init.body as string)).toEqual(creation);
    });

    it("surfaces what the backend said about a rejected configuration", async () => {
      (globalThis.fetch as jest.Mock).mockResolvedValue(
        jsonResponse(
          {
            message: [
              "availability must be one of the following values: standard, high",
            ],
          },
          400,
        ),
      );

      await expect(
        shopService.create({
          name: "Prodavnica odece",
          availability: "standard",
          walletAddress: SHOP.walletAddress,
          database: "postgresql",
        }),
      ).rejects.toThrow(
        "availability must be one of the following values: standard, high",
      );
    });
  });

  describe("update", () => {
    it("patches only the settings it was given", async () => {
      await shopService.update(SHOP_ID, { availability: "high" });

      const { url, init } = lastRequest();
      expect(url).toBe(`${BASE}/api/v1/shops/${SHOP_ID}`);
      expect(init.method).toBe("PATCH");
      expect(JSON.parse(init.body as string)).toEqual({ availability: "high" });
    });
  });

  describe("remove", () => {
    it("deletes the shop and expects no content back", async () => {
      (globalThis.fetch as jest.Mock).mockResolvedValue(
        jsonResponse(undefined, 204),
      );

      await expect(shopService.remove(SHOP_ID)).resolves.toBeUndefined();

      const { url, init } = lastRequest();
      expect(url).toBe(`${BASE}/api/v1/shops/${SHOP_ID}`);
      expect(init.method).toBe("DELETE");
    });

    it("reports a backend it cannot reach", async () => {
      (globalThis.fetch as jest.Mock).mockRejectedValue(
        new TypeError("failed"),
      );

      await expect(shopService.remove(SHOP_ID)).rejects.toThrow(
        "Cannot reach ShopHub. Please try again.",
      );
    });
  });
});
