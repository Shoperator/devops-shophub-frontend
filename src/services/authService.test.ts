import { AUTH_TOKEN_KEY } from "./apiConstants";
import { authService } from "./authService";

const BASE = "http://shophub-backend.test";

const SESSION = {
  accessToken: "signed-token",
  tokenType: "Bearer",
  user: {
    id: "c0000000-0000-4000-8000-000000000001",
    username: "shop-owner",
    createdAt: "2026-01-01T10:00:00.000Z",
  },
};

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

describe("authService", () => {
  beforeEach(() => {
    globalThis.fetch = jest.fn().mockResolvedValue(jsonResponse(SESSION));
  });

  describe("login", () => {
    it("posts the credentials to the backend the container was pointed at", async () => {
      await authService.login({
        username: "shop-owner",
        password: "sup3r-secret",
      });

      const { url, init } = lastRequest();
      expect(url).toBe(`${BASE}/api/v1/auth/login`);
      expect(init.method).toBe("POST");
      expect(init.headers).toMatchObject({
        "Content-Type": "application/json",
      });
      expect(JSON.parse(init.body as string)).toEqual({
        username: "shop-owner",
        password: "sup3r-secret",
      });
    });

    it("signs in without a token, since there is none yet", async () => {
      await authService.login({
        username: "shop-owner",
        password: "sup3r-secret",
      });

      const headers = lastRequest().init.headers as Record<string, string>;
      expect(headers.Authorization).toBeUndefined();
    });

    it("returns the session the backend issued", async () => {
      await expect(
        authService.login({ username: "shop-owner", password: "sup3r-secret" }),
      ).resolves.toEqual(SESSION);
    });

    it("surfaces the message the backend sent", async () => {
      (globalThis.fetch as jest.Mock).mockResolvedValue(
        jsonResponse({ message: "Invalid username or password" }, 401),
      );

      await expect(
        authService.login({ username: "ghost", password: "sup3r-secret" }),
      ).rejects.toThrow("Invalid username or password");
    });

    it("reports a backend it cannot reach", async () => {
      (globalThis.fetch as jest.Mock).mockRejectedValue(
        new TypeError("failed"),
      );

      await expect(
        authService.login({ username: "shop-owner", password: "sup3r-secret" }),
      ).rejects.toThrow("Cannot reach ShopHub. Please try again.");
    });
  });

  describe("register", () => {
    it("posts the registration and gets a session back", async () => {
      await expect(
        authService.register({
          username: "shop-owner",
          password: "sup3r-secret",
        }),
      ).resolves.toEqual(SESSION);

      const { url, init } = lastRequest();
      expect(url).toBe(`${BASE}/api/v1/auth/register`);
      expect(init.method).toBe("POST");
      expect(JSON.parse(init.body as string)).toEqual({
        username: "shop-owner",
        password: "sup3r-secret",
      });
    });

    it("joins the validation errors the backend listed", async () => {
      (globalThis.fetch as jest.Mock).mockResolvedValue(
        jsonResponse(
          {
            message: [
              "username must be longer than or equal to 3 characters",
              "password must be longer than or equal to 8 characters",
            ],
          },
          400,
        ),
      );

      await expect(
        authService.register({ username: "ab", password: "abc" }),
      ).rejects.toThrow(
        "username must be longer than or equal to 3 characters, password must be longer than or equal to 8 characters",
      );
    });
  });

  describe("me", () => {
    it("sends the stored token", async () => {
      window.localStorage.setItem(AUTH_TOKEN_KEY, "stored-token");

      await authService.me();

      const { url, init } = lastRequest();
      expect(url).toBe(`${BASE}/api/v1/auth/me`);
      expect(init.headers).toMatchObject({
        Authorization: "Bearer stored-token",
      });
    });

    it("clears the session when the token was rejected", async () => {
      window.localStorage.setItem(AUTH_TOKEN_KEY, "expired-token");
      (globalThis.fetch as jest.Mock).mockResolvedValue(
        jsonResponse({ message: "Unauthorized" }, 401),
      );

      await expect(authService.me()).rejects.toThrow();

      expect(window.localStorage.getItem(AUTH_TOKEN_KEY)).toBeNull();
    });
  });
});
