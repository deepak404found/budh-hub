"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validations/auth";
import { FormField, FormPassword } from "@/components/forms";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isValidatingToken, setIsValidatingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
      token: "",
    },
  });

  // Validate token on mount
  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setIsValidatingToken(false);
      setTokenValid(false);
      toast.error("Invalid or missing reset token");
      return;
    }

    form.setValue("token", token);

    // Validate token with API
    fetch(`/api/auth/reset-password?token=${token}`, {
      method: "GET",
    })
      .then((res) => {
        if (res.ok) {
          setTokenValid(true);
        } else {
          setTokenValid(false);
          toast.error("This reset link is invalid or has expired");
        }
      })
      .catch(() => {
        setTokenValid(false);
        toast.error("Failed to validate reset token");
      })
      .finally(() => {
        setIsValidatingToken(false);
      });
  }, [searchParams, form]);

  const onSubmit = async (data: ResetPasswordInput) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "Failed to reset password. Please try again.");
        return;
      }

      toast.success("Password reset successfully!", {
        description: "You can now sign in with your new password.",
        duration: 5000,
      });

      // Redirect to sign-in after a short delay
      setTimeout(() => {
        router.push("/auth/sign-in");
      }, 2000);
    } catch (err) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidatingToken) {
    return (
      <div className="w-full max-w-md text-center">
        <p className="text-zinc-600 dark:text-zinc-400">Validating reset token...</p>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="w-full max-w-md space-y-8 text-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Invalid Reset Link
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            This password reset link is invalid or has expired.
          </p>
        </div>
        <div className="space-y-4">
          <Link
            href="/auth/forgot-password"
            className="inline-block rounded-md border border-transparent bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Request a new reset link
          </Link>
          <div>
            <Link
              href="/auth/sign-in"
              className="text-sm font-medium text-zinc-600 hover:text-zinc-500 dark:text-zinc-400 dark:hover:text-zinc-300"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">
            Enter your new password below.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-4 rounded-md shadow-sm">
            <FormField form={form} name="password" label="New Password">
              {({ value, onChange, onBlur, error, ref }) => (
                <FormPassword
                  value={value as string}
                  onChange={(e) => onChange(e.target.value)}
                  onBlur={onBlur}
                  placeholder="Enter your new password"
                  error={error}
                  autoComplete="new-password"
                  disabled={isLoading}
                  ref={ref}
                />
              )}
            </FormField>

            <FormField form={form} name="confirmPassword" label="Confirm New Password">
              {({ value, onChange, onBlur, error, ref }) => (
                <FormPassword
                  value={value as string}
                  onChange={(e) => onChange(e.target.value)}
                  onBlur={onBlur}
                  placeholder="Confirm your new password"
                  error={error}
                  autoComplete="new-password"
                  disabled={isLoading}
                  ref={ref}
                />
              )}
            </FormField>

            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Password must be at least 8 characters with uppercase, lowercase, number, and special character.
            </p>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {isLoading ? "Resetting password..." : "Reset Password"}
            </button>
          </div>

          <div className="text-center">
            <Link
              href="/auth/sign-in"
              className="text-sm font-medium text-zinc-600 hover:text-zinc-500 dark:text-zinc-400 dark:hover:text-zinc-300"
            >
              Back to sign in
            </Link>
          </div>
        </form>
      </div>
  );
}

