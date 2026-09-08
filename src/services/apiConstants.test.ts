import { getApiBaseUrl } from "./apiConstants";

describe("getApiBaseUrl", () => {
  it("is empty when nothing is configured, so calls stay on the page's origin", () => {
    // What the deployed app looks like: the chart sets no backend address,
    // because the Ingress already puts the backend under /api on this host.
    delete window.__ENV.NEXT_PUBLIC_API_URL;

    expect(getApiBaseUrl()).toBe("");
  });

  it("keeps a request path relative, so the browser resolves it", () => {
    delete window.__ENV.NEXT_PUBLIC_API_URL;

    expect(`${getApiBaseUrl()}/api/v1/auth/register`).toBe(
      "/api/v1/auth/register",
    );
  });

  it("honours an override, for a backend on another origin", () => {
    window.__ENV.NEXT_PUBLIC_API_URL = "http://shophub-backend.test";

    expect(getApiBaseUrl()).toBe("http://shophub-backend.test");
  });
});
