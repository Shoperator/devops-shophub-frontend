import { env } from "next-runtime-env";

/**
 * Base URL of the ShopHub backend. Injected per deployment by Helm.
 *
 * Read through `env()` on every call instead of `process.env.NEXT_PUBLIC_*` at
 * module scope: Next inlines `NEXT_PUBLIC_` reads at build time, and the image
 * is built once with no env set, so a constant here would ship the localhost
 * fallback and ignore whatever the cluster sets at runtime.
 */
export function getApiBaseUrl(): string {
  return env("NEXT_PUBLIC_API_URL") ?? "http://localhost:3000";
}

export const API_PREFIX = "/api/v1";

export const AUTH_TOKEN_KEY = "shophub_access_token";

export const ENDPOINTS = {
  auth: {
    login: `${API_PREFIX}/auth/login`,
    register: `${API_PREFIX}/auth/register`,
    me: `${API_PREFIX}/auth/me`,
  },
  shops: {
    all: `${API_PREFIX}/shops`,
    byId: (id: string) => `${API_PREFIX}/shops/${id}`,
  },
} as const;
