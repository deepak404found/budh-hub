"use client";

import Link from "next/link";
import { FormField, FormInput } from "@/components/forms";
import { useForgotPassword } from "@/hooks/auth";

export default function ForgotPasswordPage() {
  const { form, isLoading, emailSent, sentEmail, onSubmit } = useForgotPassword();

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-zinc-900 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">
            Enter your email address and we&apos;ll send you a link to reset your password.
          </p>
        </div>

        {!emailSent ? (
          <form className="mt-8 space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-4 rounded-md shadow-sm">
              <FormField form={form} name="email" label="Email address">
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

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative flex w-full justify-center rounded-md border border-transparent bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                {isLoading ? "Sending..." : "Send reset link"}
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
        ) : (
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
                  Reset link sent!
                </h3>
                <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                  <p>
                    We&apos;ve sent a password reset link to <strong>{sentEmail}</strong>.
                    Please check your email inbox and click the link to reset your password.
                  </p>
                  <p className="mt-2">
                    The link will expire in 1 hour. If you don&apos;t see the email,
                    check your spam folder.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
