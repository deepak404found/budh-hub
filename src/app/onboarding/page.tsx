"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  roleSelectionSchema,
  profileSchema,
  type RoleSelectionInput,
  type ProfileInput,
  type OnboardingInput,
} from "@/lib/validations/onboarding";
import { FormField, FormInput, FormRadio } from "@/components/forms";

type OnboardingStep = "role" | "profile";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<OnboardingStep>("role");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roleForm = useForm<RoleSelectionInput>({
    resolver: zodResolver(roleSelectionSchema),
    defaultValues: {
      role: undefined,
    },
  });

  const profileForm = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      bio: "",
    },
  });

  const handleRoleSubmit = (data: RoleSelectionInput) => {
    setStep("profile");
  };

  const handleProfileSubmit = async (data: ProfileInput) => {
    setIsLoading(true);
    setError(null);

    const onboardingData: OnboardingInput = {
      role: roleForm.getValues("role")!,
      name: data.name,
      bio: data.bio,
    };

    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(onboardingData),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Failed to complete onboarding. Please try again.");
        return;
      }

      router.push("/dashboard" as any);
      router.refresh();
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const progressPercentage = step === "role" ? 50 : 100;

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-zinc-900 sm:px-6 lg:px-8">
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
              <FormField
                form={roleForm}
                name="role"
                label="I want to..."
              >
                {({ value, onChange, onBlur, error }) => (
                  <div className="space-y-3">
                    <FormRadio
                      value="INSTRUCTOR"
                      checked={value === "INSTRUCTOR"}
                      onChange={(e) => onChange(e.target.checked ? "INSTRUCTOR" : undefined)}
                      onBlur={onBlur}
                      label="Create and teach courses"
                      error={error}
                    />
                    <FormRadio
                      value="LEARNER"
                      checked={value === "LEARNER"}
                      onChange={(e) => onChange(e.target.checked ? "LEARNER" : undefined)}
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
              <FormField
                form={profileForm}
                name="name"
                label="Full Name"
              >
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

              <FormField
                form={profileForm}
                name="bio"
                label="Bio (Optional)"
              >
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
            href={"/auth/sign-in" as any}
            className="text-sm font-medium text-zinc-600 hover:text-zinc-500 dark:text-zinc-400 dark:hover:text-zinc-300"
          >
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

