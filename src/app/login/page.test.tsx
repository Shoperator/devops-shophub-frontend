import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ApiError } from "@/services/api";
import { AUTH_TOKEN_KEY } from "@/services/apiConstants";
import { authService } from "@/services/authService";
import { routerMock } from "@/test-utils/nextNavigation";
import { renderAs, SIGNED_IN_USER } from "@/test-utils/render";
import LoginPage from "./page";

jest.mock("@/services/authService");

const authServiceMock = jest.mocked(authService);

const SESSION = {
  accessToken: "signed-token",
  tokenType: "Bearer",
  user: SIGNED_IN_USER,
};

async function signIn(username = "shop-owner", password = "sup3r-secret") {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Username"), username);
  await user.type(screen.getByLabelText("Password"), password);
  await user.click(screen.getByRole("button", { name: "Sign in" }));
}

describe("LoginPage", () => {
  beforeEach(() => {
    authServiceMock.login.mockResolvedValue(SESSION);
  });

  it("sends the credentials the visitor typed", async () => {
    renderAs(null, <LoginPage />);

    await signIn();

    expect(authServiceMock.login).toHaveBeenCalledWith({
      username: "shop-owner",
      password: "sup3r-secret",
    });
  });

  it("stores the session and lands on the home page", async () => {
    renderAs(null, <LoginPage />);

    await signIn();

    await waitFor(() => expect(routerMock.push).toHaveBeenCalledWith("/"));
    expect(window.localStorage.getItem(AUTH_TOKEN_KEY)).toBe("signed-token");
  });

  it("shows what the backend said about a rejected sign-in", async () => {
    authServiceMock.login.mockRejectedValue(
      new ApiError("Invalid username or password", 401),
    );
    renderAs(null, <LoginPage />);

    await signIn("ghost");

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Invalid username or password",
    );
    expect(routerMock.push).not.toHaveBeenCalled();
  });

  it("keeps no session when the sign-in failed", async () => {
    authServiceMock.login.mockRejectedValue(
      new ApiError("Invalid username or password", 401),
    );
    renderAs(null, <LoginPage />);

    await signIn("ghost");

    await screen.findByRole("alert");
    expect(window.localStorage.getItem(AUTH_TOKEN_KEY)).toBeNull();
  });

  it("lets the visitor try again after a failure", async () => {
    authServiceMock.login.mockRejectedValueOnce(
      new ApiError("Invalid username or password", 401),
    );
    renderAs(null, <LoginPage />);

    await signIn("ghost");
    await screen.findByRole("alert");

    expect(screen.getByRole("button", { name: "Sign in" })).toBeEnabled();
  });
});
