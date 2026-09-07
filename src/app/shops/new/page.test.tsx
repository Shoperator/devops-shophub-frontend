import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ApiError } from "@/services/api";
import type { ShopDto } from "@/services/dto/shop.dto";
import { shopService } from "@/services/shopService";
import { routerMock } from "@/test-utils/nextNavigation";
import { renderAs, SIGNED_IN_USER } from "@/test-utils/render";
import NewShopPage from "./page";

jest.mock("@/services/shopService");

const shopServiceMock = jest.mocked(shopService);

const WALLET = "0x742d35Cc6634C0532925a3b844Bc9e7595f42D0B";

const CREATED: ShopDto = {
  id: "d0000000-0000-4000-8000-000000000001",
  name: "Prodavnica odece",
  slug: "prodavnica-odece-abc123",
  availability: "standard",
  walletAddress: WALLET,
  database: "postgresql",
  url: "http://prodavnica-odece-abc123.shop.local",
  createdAt: "2026-01-01T10:00:00.000Z",
};

async function fillIn({ name = "Prodavnica odece", wallet = WALLET } = {}) {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Shop name"), name);
  await user.type(screen.getByLabelText("Wallet address"), wallet);
  return user;
}

describe("NewShopPage", () => {
  beforeEach(() => {
    shopServiceMock.create.mockResolvedValue(CREATED);
  });

  it("keeps a signed-out visitor out", () => {
    renderAs(null, <NewShopPage />);

    expect(routerMock.replace).toHaveBeenCalledWith("/login");
  });

  it("creates the shop with the defaults when nothing else is chosen", async () => {
    renderAs(SIGNED_IN_USER, <NewShopPage />);

    const user = await fillIn();
    await user.click(screen.getByRole("button", { name: "Create shop" }));

    expect(shopServiceMock.create).toHaveBeenCalledWith({
      name: "Prodavnica odece",
      availability: "standard",
      walletAddress: WALLET,
      database: "postgresql",
    });
  });

  it("sends the availability and database the owner picked", async () => {
    renderAs(SIGNED_IN_USER, <NewShopPage />);

    const user = await fillIn({ name: "Prodavnica zdrave hrane" });
    await user.selectOptions(screen.getByLabelText("Availability"), "high");
    await user.selectOptions(screen.getByLabelText("Database"), "redis");
    await user.click(screen.getByRole("button", { name: "Create shop" }));

    expect(shopServiceMock.create).toHaveBeenCalledWith({
      name: "Prodavnica zdrave hrane",
      availability: "high",
      walletAddress: WALLET,
      database: "redis",
    });
  });

  it("returns to the shop list once the shop is on its way", async () => {
    renderAs(SIGNED_IN_USER, <NewShopPage />);

    const user = await fillIn();
    await user.click(screen.getByRole("button", { name: "Create shop" }));

    await waitFor(() => expect(routerMock.push).toHaveBeenCalledWith("/shops"));
  });

  it("shows what the backend refused and stays on the form", async () => {
    shopServiceMock.create.mockRejectedValue(
      new ApiError(
        "walletAddress must be an alphanumeric wallet address of 26 to 128 characters",
        400,
      ),
    );
    renderAs(SIGNED_IN_USER, <NewShopPage />);

    const user = await fillIn({ wallet: "not-a-wallet-address-at-all" });
    await user.click(screen.getByRole("button", { name: "Create shop" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "walletAddress must be an alphanumeric wallet address",
    );
    expect(routerMock.push).not.toHaveBeenCalled();
  });

  it("lets the owner try again after a failure", async () => {
    shopServiceMock.create.mockRejectedValueOnce(
      new ApiError("Something went wrong", 500),
    );
    renderAs(SIGNED_IN_USER, <NewShopPage />);

    const user = await fillIn();
    await user.click(screen.getByRole("button", { name: "Create shop" }));
    await screen.findByRole("alert");

    expect(screen.getByRole("button", { name: "Create shop" })).toBeEnabled();
  });
});
