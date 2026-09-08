import { env } from "next-runtime-env";

/**
 * Base URL of the ShopHub backend -- empty on purpose, meaning "this page's
 * origin".
 *
 * The Helm chart publishes both halves of ShopHub under one host: the Ingress
 * sends `/api` to the backend and everything else here, so the two are one
 * origin as far as the browser is concerned.
 *
 *     https://shophub.example  /            -> this app
 *     https://shophub.example  /api/v1/...  -> ShopHub backend
 *
 * A path-only URL is therefore already a complete address: the browser resolves
 * `/api/v1/auth/register` against the page it is showing. Nothing has to tell
 * this app where its backend is, the requests are same-origin so no CORS is
 * involved, and the same image works under whatever host it is reached on.
 *
 * This holds only because every request is made from the browser. A relative
 * URL has nothing to resolve against in Node, so a call made while a page is
 * being server-rendered would throw, and would need the in-cluster Service
 * address instead -- which must not go in a `NEXT_PUBLIC_` variable.
 *
 * `NEXT_PUBLIC_API_URL` remains an override for a backend on another origin.
 * Local development does not need it: the dev server routes `/api` to the
 * backend itself, see `next.config.ts`.
 *
 * Read through `env()` rather than `process.env.NEXT_PUBLIC_*` at module scope:
 * Next inlines those at build time, and the image is built once with no env
 * set, so a constant here would freeze the build-time value.
 */
export function getApiBaseUrl(): string {
  return env("NEXT_PUBLIC_API_URL") ?? "";
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
