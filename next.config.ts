import type { NextConfig } from "next";

/** Where the dev server forwards `/api` to. Only used by `next dev`. */
const devBackendOrigin =
  process.env.DEV_API_PROXY_TARGET ?? "http://localhost:3000";

const nextConfig: NextConfig = {
  output: "standalone",

  /**
   * Puts the backend on this app's own origin during development, which is what
   * the Ingress does in the cluster.
   *
   * The app addresses its backend with path-only URLs (see `getApiBaseUrl()`),
   * and in the cluster nginx routes `/api` to the ShopHub backend Service before
   * the request ever reaches this server. Locally there is no nginx, so `next
   * dev` does the same routing: without it every `/api/v1/...` call would land
   * on the dev server and 404, and the same-origin path the deployed app takes
   * would never be exercised until it ran in the cluster.
   *
   * Development only: in the cluster nginx has already routed the request
   * elsewhere, so this rewrite would be dead code shipped in the image.
   */
  async rewrites() {
    if (process.env.NODE_ENV !== "development") {
      return [];
    }
    return [
      {
        source: "/api/:path*",
        destination: `${devBackendOrigin}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
