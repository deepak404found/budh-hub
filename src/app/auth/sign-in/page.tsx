"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { signInSchema, type SignInInput } from "@/lib/validations/auth";
import { FormField, FormInput } from "@/components/forms";

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [sentEmail, setSentEmail] = useState<string | null>(null);

  // Check for error messages from URL params
  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam === "Verification") {
      toast.error("This sign-in link has expired. Please request a new one.", {
        duration: 5000,
      });
      // Clear the error from URL
      router.replace("/auth/sign-in");
    }
  }, [searchParams, router]);

  const form = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: SignInInput) => {
    setIsLoading(true);
    setError(null);
    setEmailSent(false);

    try {
      const result = await signIn("email", {
        email: data.email,
        redirect: false,
      });

      if (result?.error) {
        const errorMessage = result.error || "Failed to sign in. Please try again.";
        setError(errorMessage);
        toast.error(errorMessage);
      } else if (result?.ok) {
        // Email sent successfully
        setEmailSent(true);
        setSentEmail(data.email);
        toast.success("Magic link sent! Check your email inbox.", {
          description: `We've sent a sign-in link to ${data.email}`,
          duration: 5000,
        });
        // Reset form
        form.reset();
      }
    } catch (err) {
      const errorMessage = "An unexpected error occurred. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
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

          {emailSent && (
            <div className="rounded-md bg-green-50 p-4 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <div className="flex items-start">
                <div className="flex-shrink-0">
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
                      We&apos;ve sent a sign-in link to <strong>{sentEmail}</strong>.
                      Please check your email inbox and click the link to sign in.
                    </p>
                    <p className="mt-2">
                      The link will expire in 24 hours. If you don&apos;t see the email,
                      check your spam folder.
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
              {isLoading ? "Sending magic link..." : emailSent ? "Email sent!" : "Sign in with email"}
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
      </div>
    </div>
  );
}

