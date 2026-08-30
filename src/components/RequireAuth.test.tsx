import { screen, waitFor } from "@testing-library/react";
import { routerMock } from "@/test-utils/nextNavigation";
import { renderAs, SIGNED_IN_USER } from "@/test-utils/render";
import RequireAuth from "./RequireAuth";

const SECRET = "Only for signed-in eyes";

describe("RequireAuth", () => {
  it("sends a signed-out visitor to the sign-in page", async () => {
    renderAs(null, <RequireAuth>{SECRET}</RequireAuth>);

    await waitFor(() =>
      expect(routerMock.replace).toHaveBeenCalledWith("/login"),
    );
    expect(screen.queryByText(SECRET)).not.toBeInTheDocument();
  });

  it("renders the page for a signed-in user", () => {
    renderAs(SIGNED_IN_USER, <RequireAuth>{SECRET}</RequireAuth>);

    expect(screen.getByText(SECRET)).toBeInTheDocument();
    expect(routerMock.replace).not.toHaveBeenCalled();
  });
});
