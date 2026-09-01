import { screen } from "@testing-library/react";
import { ApiError } from "@/services/api";
import type { ShopDto } from "@/services/dto/shop.dto";
import { shopService } from "@/services/shopService";
import { routerMock } from "@/test-utils/nextNavigation";
import { renderAs, SIGNED_IN_USER } from "@/test-utils/render";
import ShopsPage from "./page";

jest.mock("@/services/shopService");

const shopServiceMock = jest.mocked(shopService);

const CLOTHES: ShopDto = {
  id: "d0000000-0000-4000-8000-000000000001",
  name: "Prodavnica odece",
  slug: "prodavnica-odece-abc123",
  availability: "standard",
  walletAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f42D0B",
  database: "postgresql",
  url: "http://prodavnica-odece-abc123.shop.local",
  createdAt: "2026-01-01T10:00:00.000Z",
};

const HEALTH_FOOD: ShopDto = {
  ...CLOTHES,
  id: "d0000000-0000-4000-8000-000000000002",
  name: "Prodavnica zdrave hrane",
  slug: "prodavnica-zdrave-hrane-def456",
  availability: "high",
  database: "redis",
  url: null,
};

describe("ShopsPage", () => {
  beforeEach(() => {
    shopServiceMock.list.mockResolvedValue([CLOTHES, HEALTH_FOOD]);
  });

  it("keeps a signed-out visitor out and never asks for any shops", () => {
    renderAs(null, <ShopsPage />);

    expect(routerMock.replace).toHaveBeenCalledWith("/login");
    expect(shopServiceMock.list).not.toHaveBeenCalled();
  });

  it("lists the shops the account owns", async () => {
    renderAs(SIGNED_IN_USER, <ShopsPage />);

    expect(await screen.findByText("Prodavnica odece")).toBeInTheDocument();
    expect(screen.getByText("Prodavnica zdrave hrane")).toBeInTheDocument();
  });

  it("shows how each shop is configured", async () => {
    renderAs(SIGNED_IN_USER, <ShopsPage />);

    expect(
      await screen.findByText("Standard · 2 replicas"),
    ).toBeInTheDocument();
    expect(screen.getByText("High · 3 replicas")).toBeInTheDocument();
    expect(screen.getByText("PostgreSQL")).toBeInTheDocument();
    expect(screen.getByText("Redis")).toBeInTheDocument();
  });

  it("opens a deployed shop in its own tab", async () => {
    renderAs(SIGNED_IN_USER, <ShopsPage />);

    const open = await screen.findByRole("link", { name: "Open shop" });
    expect(open).toHaveAttribute("href", CLOTHES.url);
    expect(open).toHaveAttribute("target", "_blank");
  });

  it("says a shop is not deployed yet instead of linking nowhere", async () => {
    renderAs(SIGNED_IN_USER, <ShopsPage />);

    expect(
      await screen.findByText("Waiting for the deployment…"),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Open shop" })).toHaveLength(1);
  });

  it("links each shop to its settings", async () => {
    renderAs(SIGNED_IN_USER, <ShopsPage />);

    const [first] = await screen.findAllByRole("link", { name: "Configure" });
    expect(first).toHaveAttribute("href", `/shops/${CLOTHES.id}`);
  });

  it("invites a new owner to create their first shop", async () => {
    shopServiceMock.list.mockResolvedValue([]);
    renderAs(SIGNED_IN_USER, <ShopsPage />);

    expect(await screen.findByText(/No shops yet/)).toBeInTheDocument();
  });

  it("says so when the shops could not be loaded", async () => {
    shopServiceMock.list.mockRejectedValue(new ApiError("Unauthorized", 401));
    renderAs(SIGNED_IN_USER, <ShopsPage />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Unauthorized");
  });
});
