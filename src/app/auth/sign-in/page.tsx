"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { FormField, FormInput, FormPassword } from "@/components/forms";
import { useSignIn } from "@/hooks/auth";

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    method,
    setMethod,
    magicLinkForm,
    passwordForm,
    isLoading,
    error,
    emailSent,
    sentEmail,
    onMagicLinkSubmit,
    onPasswordSubmit,
  } = useSignIn();

  // Check for error messages from URL params
  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam === "Verification") {
      toast.error("This sign-in link has expired. Please request a new one.", {
        duration: 5000,
      });
      router.replace("/auth/sign-in");
    }
  }, [searchParams, router]);

  return (
    <div className="w-full max-w-md space-y-8">
      <div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">
          Or{" "}
          <Link
            href="/onboarding"
            className="font-medium text-zinc-600 hover:text-zinc-500 dark:text-zinc-400 dark:hover:text-zinc-300"
          >
            create a new account
          </Link>
        </p>
      </div>

      {/* Method Toggle */}
      <div className="flex rounded-lg border border-zinc-200 bg-white p-1 dark:border-zinc-700 dark:bg-zinc-800">
        <button
          type="button"
          onClick={() => {
            setMethod("magic-link");
            magicLinkForm.reset();
            passwordForm.reset();
          }}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            method === "magic-link"
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
              : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          }`}
        >
          Magic Link
        </button>
        <button
          type="button"
          onClick={() => {
            setMethod("password");
            magicLinkForm.reset();
            passwordForm.reset();
          }}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            method === "password"
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
              : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          }`}
        >
          Email/Password
        </button>
      </div>

      {/* Magic Link Form */}
      {method === "magic-link" && (
        <form
          className="mt-8 space-y-6"
          onSubmit={magicLinkForm.handleSubmit(onMagicLinkSubmit)}
        >
          <div className="space-y-4 rounded-md shadow-sm">
            <FormField form={magicLinkForm} name="email" label="Email address">
              {({ value, onChange, onBlur, error, ref }) => (
                <FormInput
                  type="email"
                  value={value as string}
                  onChange={(e) => onChange(e.target.value)}
                  onBlur={onBlur}
                  placeholder="you@example.com"
                  error={error}
                  autoComplete="email"
                  disabled={isLoading}
                  ref={ref}
                />
              )}
            </FormField>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {emailSent && (
            <div className="rounded-md bg-green-50 p-4 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <div className="flex items-start">
                <div className="shrink-0">
                  <svg
                    className="h-5 w-5 text-green-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                    Magic link sent!
                  </h3>
                  <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                    <p>
                      We&apos;ve sent a sign-in link to{" "}
                      <strong>{sentEmail}</strong>. Please check your email
                      inbox and click the link to sign in.
                    </p>
                    <p className="mt-2">
                      The link will expire in 24 hours. If you don&apos;t see
                      the email, check your spam folder.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading || emailSent}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {isLoading
                ? "Sending magic link..."
                : emailSent
                ? "Email sent!"
                : "Sign in with email"}
            </button>
          </div>

          {!emailSent && (
            <div className="text-center text-sm text-zinc-600 dark:text-zinc-400">
              <p>
                We&apos;ll send you a magic link to sign in. Check your email
                after submitting.
              </p>
            </div>
          )}
        </form>
      )}

      {/* Password Form */}
      {method === "password" && (
        <form
          className="mt-8 space-y-6"
          onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
        >
          <div className="space-y-4 rounded-md shadow-sm">
            <FormField form={passwordForm} name="email" label="Email address">
              {({ value, onChange, onBlur, error, ref }) => (
                <FormInput
                  type="email"
                  value={value as string}
                  onChange={(e) => onChange(e.target.value)}
                  onBlur={onBlur}
                  placeholder="you@example.com"
                  error={error}
                  autoComplete="email"
                  disabled={isLoading}
                  ref={ref}
                />
              )}
            </FormField>

            <FormField form={passwordForm} name="password" label="Password">
              {({ value, onChange, onBlur, error, ref }) => (
                <FormPassword
                  value={value as string}
                  onChange={(e) => onChange(e.target.value)}
                  onBlur={onBlur}
                  placeholder="Enter your password"
                  error={error}
                  autoComplete="current-password"
                  disabled={isLoading}
                  ref={ref}
                />
              )}
            </FormField>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link
                href="/auth/forgot-password"
                className="font-medium text-zinc-600 hover:text-zinc-500 dark:text-zinc-400 dark:hover:text-zinc-300"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Sign in to your account
            </h2>
            <p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">
              Loading...
            </p>
          </div>
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
