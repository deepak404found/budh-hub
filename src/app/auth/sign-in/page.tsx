"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signInSchema, type SignInInput } from "@/lib/validations/auth";
import { FormField, FormInput } from "@/components/forms";

export default function SignInPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: SignInInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("email", {
        email: data.email,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error || "Failed to sign in. Please try again.");
      } else if (result?.ok) {
        router.push("/dashboard" as any);
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-zinc-900 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">
            Or{" "}
            <Link
              href={"/onboarding" as any}
              className="font-medium text-zinc-600 hover:text-zinc-500 dark:text-zinc-400 dark:hover:text-zinc-300"
            >
              create a new account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-4 rounded-md shadow-sm">
            <FormField
              form={form}
              name="email"
              label="Email address"
            >
              {({ value, onChange, onBlur, error }) => (
                <FormInput
                  type="email"
                    value={value as string}
                    onChange={(e) => onChange(e.target.value)}
                    onBlur={onBlur}
                    placeholder="you@example.com"
                    error={error}
                    autoComplete="email"
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

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {isLoading ? "Sending magic link..." : "Sign in with email"}
            </button>
          </div>

          <div className="text-center text-sm text-zinc-600 dark:text-zinc-400">
            <p>
              We&apos;ll send you a magic link to sign in. Check your email
              after submitting.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

