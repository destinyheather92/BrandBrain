import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SignUpProfileCapture } from "../components/sign-up-profile-capture";
import type { AuthRouteConfig } from "../types/auth-route";

const signUpMock = vi.fn((props: Record<string, unknown>) => (
  <div
    data-testid="clerk-sign-up"
    data-initial-values={JSON.stringify(props.initialValues)}
    data-unsafe-metadata={JSON.stringify(props.unsafeMetadata)}
  />
));

vi.mock("@clerk/nextjs", () => ({
  SignUp: (props: Record<string, unknown>) => signUpMock(props)
}));

const routes: AuthRouteConfig = {
  afterSignIn: "/dashboard",
  afterSignUp: "/dashboard",
  signIn: "/sign-in",
  signUp: "/sign-up"
};

describe("SignUpProfileCapture", () => {
  it("captures first and last name before mounting Clerk sign-up", () => {
    render(<SignUpProfileCapture appearance={{}} routes={routes} />);

    expect(screen.getByRole("heading", { name: "Tell us who is creating this account" })).toBeInTheDocument();
    expect(screen.queryByTestId("clerk-sign-up")).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("First name"), {
      target: { value: "Avery" }
    });
    fireEvent.change(screen.getByLabelText("Last name"), {
      target: { value: "Stone" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Continue to account setup" }));

    expect(screen.getByTestId("clerk-sign-up")).toBeInTheDocument();
    expect(signUpMock).toHaveBeenCalledWith(
      expect.objectContaining({
        fallbackRedirectUrl: "/dashboard",
        initialValues: {
          firstName: "Avery",
          lastName: "Stone"
        },
        path: "/sign-up",
        routing: "path",
        signInUrl: "/sign-in",
        unsafeMetadata: {
          brandbrainProfile: {
            firstName: "Avery",
            lastName: "Stone"
          }
        }
      })
    );
  });

  it("does not continue without both name fields", () => {
    render(<SignUpProfileCapture appearance={{}} routes={routes} />);

    fireEvent.change(screen.getByLabelText("First name"), {
      target: { value: "Avery" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Continue to account setup" }));

    expect(screen.queryByTestId("clerk-sign-up")).not.toBeInTheDocument();
    expect(screen.getByText("First and last name are required.")).toBeInTheDocument();
  });
});
