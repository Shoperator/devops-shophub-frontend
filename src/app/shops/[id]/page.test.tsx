import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ApiError } from "@/services/api";
import type { ShopDto } from "@/services/dto/shop.dto";
import { shopService } from "@/services/shopService";
import { routerMock, setRouteParams } from "@/test-utils/nextNavigation";
import { renderAs, SIGNED_IN_USER } from "@/test-utils/render";
import ShopPage from "./page";

jest.mock("@/services/shopService");

const shopServiceMock = jest.mocked(shopService);

const SHOP: ShopDto = {
  id: "d0000000-0000-4000-8000-000000000001",
  name: "Prodavnica odece",
  slug: "prodavnica-odece-abc123",
  availability: "standard",
  walletAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f42D0B",
  database: "postgresql",
  url: "http://prodavnica-odece-abc123.shop.local",
  createdAt: "2026-01-01T10:00:00.000Z",
};

const OTHER_WALLET = "0x0000000000000000000000000000000000000042";

/** Waits for the shop to arrive, so the settings form is on screen. */
async function loaded(): Promise<ReturnType<typeof userEvent.setup>> {
  await screen.findByLabelText("Wallet address");
  return userEvent.setup();
}

describe("ShopPage", () => {
  beforeEach(() => {
    setRouteParams({ id: SHOP.id });
    shopServiceMock.get.mockResolvedValue(SHOP);
    shopServiceMock.update.mockImplementation((_id, changes) =>
      Promise.resolve({ ...SHOP, ...changes }),
    );
    shopServiceMock.remove.mockResolvedValue(undefined);
  });

  it("keeps a signed-out visitor out and never asks for the shop", () => {
    renderAs(null, <ShopPage />);

    expect(routerMock.replace).toHaveBeenCalledWith("/login");
    expect(shopServiceMock.get).not.toHaveBeenCalled();
  });

  it("loads the shop the address points at", async () => {
    renderAs(SIGNED_IN_USER, <ShopPage />);

    await loaded();
    expect(shopServiceMock.get).toHaveBeenCalledWith(SHOP.id);
  });

  it("shows how the shop is deployed", async () => {
    renderAs(SIGNED_IN_USER, <ShopPage />);

    await loaded();
    expect(screen.getByText(SHOP.url as string)).toBeInTheDocument();
    expect(screen.getByText(SHOP.slug)).toBeInTheDocument();
    expect(screen.getByText("PostgreSQL")).toBeInTheDocument();
  });

  it("fills the form with the settings the shop runs on", async () => {
    renderAs(SIGNED_IN_USER, <ShopPage />);

    await loaded();
    expect(screen.getByLabelText("Availability")).toHaveValue("standard");
    expect(screen.getByLabelText("Wallet address")).toHaveValue(
      SHOP.walletAddress,
    );
  });

  it("shows the name without offering to change it", async () => {
    renderAs(SIGNED_IN_USER, <ShopPage />);

    await loaded();
    expect(
      screen.getByRole("heading", { name: SHOP.name }),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("Shop name")).not.toBeInTheDocument();
  });

  it("has nothing to save until something is changed", async () => {
    renderAs(SIGNED_IN_USER, <ShopPage />);

    await loaded();
    expect(screen.getByRole("button", { name: "Save changes" })).toBeDisabled();
  });

  it("sends only the setting that changed", async () => {
    renderAs(SIGNED_IN_USER, <ShopPage />);

    const user = await loaded();
    await user.selectOptions(screen.getByLabelText("Availability"), "high");
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(shopServiceMock.update).toHaveBeenCalledWith(SHOP.id, {
      availability: "high",
    });
  });

  it("moves the payments to another wallet", async () => {
    renderAs(SIGNED_IN_USER, <ShopPage />);

    const user = await loaded();
    await user.clear(screen.getByLabelText("Wallet address"));
    await user.type(screen.getByLabelText("Wallet address"), OTHER_WALLET);
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(shopServiceMock.update).toHaveBeenCalledWith(SHOP.id, {
      walletAddress: OTHER_WALLET,
    });
  });

  it("confirms the change was accepted", async () => {
    renderAs(SIGNED_IN_USER, <ShopPage />);

    const user = await loaded();
    await user.selectOptions(screen.getByLabelText("Availability"), "high");
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(await screen.findByRole("status")).toHaveTextContent(
      "The shop is being reconfigured",
    );
    expect(screen.getByRole("button", { name: "Save changes" })).toBeDisabled();
  });

  it("says what the backend refused", async () => {
    shopServiceMock.update.mockRejectedValue(
      new ApiError("Shop not found", 404),
    );
    renderAs(SIGNED_IN_USER, <ShopPage />);

    const user = await loaded();
    await user.selectOptions(screen.getByLabelText("Availability"), "high");
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Shop not found",
    );
  });

  it("asks before deleting anything", async () => {
    renderAs(SIGNED_IN_USER, <ShopPage />);

    const user = await loaded();
    await user.click(screen.getByRole("button", { name: "Delete shop" }));

    expect(shopServiceMock.remove).not.toHaveBeenCalled();
    expect(
      screen.getByRole("button", { name: `Yes, delete ${SHOP.name}` }),
    ).toBeInTheDocument();
  });

  it("leaves the shop alone when the owner backs out", async () => {
    renderAs(SIGNED_IN_USER, <ShopPage />);

    const user = await loaded();
    await user.click(screen.getByRole("button", { name: "Delete shop" }));
    await user.click(screen.getByRole("button", { name: "Keep it" }));

    expect(shopServiceMock.remove).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Delete shop" })).toBeVisible();
  });

  it("deletes the shop and goes back to the list", async () => {
    renderAs(SIGNED_IN_USER, <ShopPage />);

    const user = await loaded();
    await user.click(screen.getByRole("button", { name: "Delete shop" }));
    await user.click(
      screen.getByRole("button", { name: `Yes, delete ${SHOP.name}` }),
    );

    expect(shopServiceMock.remove).toHaveBeenCalledWith(SHOP.id);
    await waitFor(() => expect(routerMock.push).toHaveBeenCalledWith("/shops"));
  });

  it("says so when the shop could not be loaded", async () => {
    shopServiceMock.get.mockRejectedValue(new ApiError("Shop not found", 404));
    renderAs(SIGNED_IN_USER, <ShopPage />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Shop not found",
    );
  });
});
