"use client";

import Link from "next/link";
import {
  FormField,
  FormInput,
  FormRadio,
  FormPassword,
} from "@/components/forms";
import { useOnboarding } from "@/hooks/auth/use-onboarding";

export default function OnboardingPage() {
  const {
    step,
    setStep,
    roleForm,
    profileForm,
    isLoading,
    error,
    setupPassword,
    setSetupPassword,
    progressPercentage,
    handleRoleSubmit,
    handleProfileSubmit,
  } = useOnboarding();

  return (
    <div className="w-full max-w-md space-y-8">
      <div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Welcome to BudhHub
        </h2>
        <p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">
          Let&apos;s set up your account
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full">
        <div className="mb-2 flex justify-between text-xs text-zinc-600 dark:text-zinc-400">
          <span>Step {step === "role" ? "1" : "2"} of 2</span>
          <span>{progressPercentage}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
          <div
            className="h-full bg-zinc-900 transition-all duration-300 dark:bg-zinc-100"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Role Selection Step */}
      {step === "role" && (
        <form
          className="mt-8 space-y-6"
          onSubmit={roleForm.handleSubmit(handleRoleSubmit)}
        >
          <div className="space-y-4 rounded-md shadow-sm">
            <FormField form={roleForm} name="role" label="I want to...">
              {({ value, onChange, onBlur, error }) => (
                <div className="space-y-3">
                  <FormRadio
                    value="INSTRUCTOR"
                    checked={value === "INSTRUCTOR"}
                    onChange={(e) =>
                      onChange(e.target.checked ? "INSTRUCTOR" : undefined)
                    }
                    onBlur={onBlur}
                    label="Create and teach courses"
                    error={error}
                  />
                  <FormRadio
                    value="LEARNER"
                    checked={value === "LEARNER"}
                    onChange={(e) =>
                      onChange(e.target.checked ? "LEARNER" : undefined)
                    }
                    onBlur={onBlur}
                    label="Learn from courses"
                    error={error}
                  />
                </div>
              )}
            </FormField>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Continue
            </button>
          </div>
        </form>
      )}

      {/* Profile Setup Step */}
      {step === "profile" && (
        <form
          className="mt-8 space-y-6"
          onSubmit={profileForm.handleSubmit(handleProfileSubmit)}
        >
          <div className="space-y-4 rounded-md shadow-sm">
            <FormField form={profileForm} name="name" label="Full Name">
              {({ value, onChange, onBlur, error }) => (
                <FormInput
                  type="text"
                  value={value as string}
                  onChange={(e) => onChange(e.target.value)}
                  onBlur={onBlur}
                  placeholder="John Doe"
                  error={error}
                  autoComplete="name"
                  disabled={isLoading}
                />
              )}
            </FormField>

            <FormField form={profileForm} name="bio" label="Bio (Optional)">
              {({ value, onChange, onBlur, error }) => (
                <textarea
                  value={(value as string) || ""}
                  onChange={(e) => onChange(e.target.value)}
                  onBlur={onBlur}
                  placeholder="Tell us about yourself..."
                  rows={4}
                  className={`w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-400 dark:focus:border-zinc-600 dark:focus:ring-zinc-600 ${
                    error
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500 dark:border-red-500 dark:focus:border-red-500"
                      : ""
                  }`}
                  disabled={isLoading}
                />
              )}
            </FormField>

            {/* Password Setup Section */}
            <div className="space-y-4 rounded-md border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900/50">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="setup-password"
                  checked={setupPassword}
                  onChange={(e) => {
                    setSetupPassword(e.target.checked);
                    if (!e.target.checked) {
                      profileForm.setValue("password", "");
                      profileForm.setValue("confirmPassword", "");
                    }
                  }}
                  className="h-4 w-4 rounded border-zinc-300 text-zinc-600 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800"
                />
                <label
                  htmlFor="setup-password"
                  className="ml-2 text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Set up password for faster login (optional)
                </label>
              </div>
              {setupPassword && (
                <div className="space-y-3 pt-2">
                  <FormField
                    form={profileForm}
                    name="password"
                    label="Password"
                  >
                    {({ value, onChange, onBlur, error, ref }) => (
                      <FormPassword
                        value={value as string}
                        onChange={(e) => onChange(e.target.value)}
                        onBlur={onBlur}
                        placeholder="Create a strong password"
                        error={error}
                        autoComplete="new-password"
                        disabled={isLoading}
                        ref={ref}
                      />
                    )}
                  </FormField>
                  <FormField
                    form={profileForm}
                    name="confirmPassword"
                    label="Confirm Password"
                  >
                    {({ value, onChange, onBlur, error, ref }) => (
                      <FormPassword
                        value={value as string}
                        onChange={(e) => onChange(e.target.value)}
                        onBlur={onBlur}
                        placeholder="Confirm your password"
                        error={error}
                        autoComplete="new-password"
                        disabled={isLoading}
                        ref={ref}
                      />
                    )}
                  </FormField>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Password must be at least 8 characters with uppercase,
                    lowercase, number, and special character.
                  </p>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => setStep("role")}
              disabled={isLoading}
              className="flex-1 rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 rounded-md border border-transparent bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {isLoading ? "Creating account..." : "Complete Setup"}
            </button>
          </div>
        </form>
      )}

      <div className="text-center">
        <Link
          href="/auth/sign-in"
          className="text-sm font-medium text-zinc-600 hover:text-zinc-500 dark:text-zinc-400 dark:hover:text-zinc-300"
        >
          Already have an account? Sign in
        </Link>
      </div>
    </div>
  );
}
