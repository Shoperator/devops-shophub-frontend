import { screen } from "@testing-library/react";
import { ApiError } from "@/services/api";
import { authService } from "@/services/authService";
import { routerMock } from "@/test-utils/nextNavigation";
import { renderAs, SIGNED_IN_USER } from "@/test-utils/render";
import AccountPage from "./page";

jest.mock("@/services/authService");

const authServiceMock = jest.mocked(authService);

describe("AccountPage", () => {
  beforeEach(() => {
    authServiceMock.me.mockResolvedValue(SIGNED_IN_USER);
  });

  it("keeps a signed-out visitor out and never asks for a profile", () => {
    renderAs(null, <AccountPage />);

    expect(routerMock.replace).toHaveBeenCalledWith("/login");
    expect(authServiceMock.me).not.toHaveBeenCalled();
  });

  it("confirms the stored session against the backend", async () => {
    renderAs(SIGNED_IN_USER, <AccountPage />);

    expect(await screen.findByText("shop-owner")).toBeInTheDocument();
    expect(authServiceMock.me).toHaveBeenCalled();
  });

  it("shows the profile the token belongs to", async () => {
    authServiceMock.me.mockResolvedValue({
      ...SIGNED_IN_USER,
      username: "renamed-owner",
    });
    renderAs(SIGNED_IN_USER, <AccountPage />);

    expect(await screen.findByText("renamed-owner")).toBeInTheDocument();
    expect(screen.getByText("1 Jan 2026, 10:00 UTC")).toBeInTheDocument();
  });

  it("says so when the profile could not be refreshed", async () => {
    authServiceMock.me.mockRejectedValue(new ApiError("Unauthorized", 401));
    renderAs(SIGNED_IN_USER, <AccountPage />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Unauthorized");
  });
});
