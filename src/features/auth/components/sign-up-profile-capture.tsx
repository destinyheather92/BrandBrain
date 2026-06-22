"use client";

import { SignUp } from "@clerk/nextjs";
import type { ComponentProps, FormEvent } from "react";
import { useState } from "react";

import type { AuthRouteConfig } from "../types/auth-route";

type SignUpProfileCaptureProps = {
  appearance: ComponentProps<typeof SignUp>["appearance"];
  routes: AuthRouteConfig;
};

type CapturedProfile = {
  firstName: string;
  lastName: string;
};

export function SignUpProfileCapture({ appearance, routes }: SignUpProfileCaptureProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [capturedProfile, setCapturedProfile] = useState<CapturedProfile | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedFirstName = firstName.trim();
    const normalizedLastName = lastName.trim();

    if (!normalizedFirstName || !normalizedLastName) {
      setError("First and last name are required.");
      return;
    }

    setError(null);
    setCapturedProfile({
      firstName: normalizedFirstName,
      lastName: normalizedLastName
    });
  }

  if (capturedProfile) {
    return (
      <div className="grid gap-4">
        <div className="flex items-center justify-between rounded-lg border border-[#263244] bg-[#141A26] px-4 py-3">
          <p className="text-sm text-[#CBD5E1]">
            Account name:{" "}
            <span className="font-medium text-[#F8FAFC]">
              {capturedProfile.firstName} {capturedProfile.lastName}
            </span>
          </p>
          <button
            className="text-sm font-medium text-[#00E5FF] hover:text-[#4CF2FF]"
            onClick={() => setCapturedProfile(null)}
            type="button"
          >
            Edit
          </button>
        </div>
        <SignUp
          appearance={appearance}
          fallbackRedirectUrl={routes.afterSignUp}
          initialValues={capturedProfile}
          path={routes.signUp}
          routing="path"
          signInUrl={routes.signIn}
          unsafeMetadata={{
            brandbrainProfile: capturedProfile
          }}
        />
      </div>
    );
  }

  return (
    <form className="rounded-lg border border-[#263244] bg-[#141A26] p-5" onSubmit={handleSubmit}>
      <div>
        <h3 className="text-xl font-semibold text-[#F8FAFC]">Tell us who is creating this account</h3>
        <p className="mt-2 text-sm leading-6 text-[#CBD5E1]">
          BrandBrain uses this for your workspace profile and account records.
        </p>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-[#F8FAFC]">
          First name
          <input
            autoComplete="given-name"
            className="h-11 rounded-md border border-[#263244] bg-[#0B0F19] px-3 text-sm text-[#F8FAFC] outline-none transition focus:border-[#00E5FF]"
            onChange={(event) => setFirstName(event.target.value)}
            value={firstName}
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-[#F8FAFC]">
          Last name
          <input
            autoComplete="family-name"
            className="h-11 rounded-md border border-[#263244] bg-[#0B0F19] px-3 text-sm text-[#F8FAFC] outline-none transition focus:border-[#00E5FF]"
            onChange={(event) => setLastName(event.target.value)}
            value={lastName}
          />
        </label>
      </div>

      {error ? <p className="mt-4 text-sm text-[#EF4444]">{error}</p> : null}

      <button
        className="mt-5 h-11 w-full rounded-md bg-[#00E5FF] px-4 text-sm font-semibold text-[#0B0F19] transition hover:bg-[#4CF2FF]"
        type="submit"
      >
        Continue to account setup
      </button>
    </form>
  );
}
