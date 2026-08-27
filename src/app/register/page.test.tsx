import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ApiError } from "@/services/api";
import { AUTH_TOKEN_KEY } from "@/services/apiConstants";
import { authService } from "@/services/authService";
import { routerMock } from "@/test-utils/nextNavigation";
import { renderAs, SIGNED_IN_USER } from "@/test-utils/render";
import RegisterPage from "./page";

jest.mock("@/services/authService");

const authServiceMock = jest.mocked(authService);

const SESSION = {
  accessToken: "signed-token",
  tokenType: "Bearer",
  user: SIGNED_IN_USER,
};

async function register(username = "shop-owner", password = "sup3r-secret") {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Username"), username);
  await user.type(screen.getByLabelText("Password"), password);
  await user.click(screen.getByRole("button", { name: "Create account" }));
}

describe("RegisterPage", () => {
  beforeEach(() => {
    authServiceMock.register.mockResolvedValue(SESSION);
  });

  it("sends the account the visitor asked for", async () => {
    renderAs(null, <RegisterPage />);

    await register();

    expect(authServiceMock.register).toHaveBeenCalledWith({
      username: "shop-owner",
      password: "sup3r-secret",
    });
  });

  it("signs the new account in without a second password prompt", async () => {
    renderAs(null, <RegisterPage />);

    await register();

    await waitFor(() => expect(routerMock.push).toHaveBeenCalledWith("/"));
    expect(window.localStorage.getItem(AUTH_TOKEN_KEY)).toBe("signed-token");
    expect(authServiceMock.login).not.toHaveBeenCalled();
  });

  it("catches a short password before asking the backend", async () => {
    renderAs(null, <RegisterPage />);

    await register("shop-owner", "short");

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Password must be at least 8 characters.",
    );
    expect(authServiceMock.register).not.toHaveBeenCalled();
  });

  it("shows the conflict when the username is taken", async () => {
    authServiceMock.register.mockRejectedValue(
      new ApiError('Username "shop-owner" is already taken', 409),
    );
    renderAs(null, <RegisterPage />);

    await register();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      'Username "shop-owner" is already taken',
    );
    expect(routerMock.push).not.toHaveBeenCalled();
    expect(window.localStorage.getItem(AUTH_TOKEN_KEY)).toBeNull();
  });
});
