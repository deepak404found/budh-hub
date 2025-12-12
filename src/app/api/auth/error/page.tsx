"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

export default function AuthErrorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  useEffect(() => {
    if (error === "Verification") {
      toast.error("This sign-in link has expired or is invalid.", {
        description: "Please request a new magic link to sign in.",
        duration: 5000,
      });
      
      // Redirect to sign-in page after a short delay
      setTimeout(() => {
        router.push("/auth/sign-in");
      }, 2000);
    } else if (error === "Configuration") {
      toast.error("There is a problem with the server configuration.", {
        description: "Please contact support if this issue persists.",
        duration: 5000,
      });
    } else if (error) {
      toast.error("An authentication error occurred.", {
        description: "Please try signing in again.",
        duration: 5000,
      });
    }
  }, [error, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-zinc-900 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Authentication Error
          </h2>
          <p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">
            {error === "Verification" && (
              <>
                This sign-in link has expired or is invalid. Please request a new
                one.
              </>
            )}
            {error === "Configuration" && (
              <>
                There is a problem with the server configuration. Please contact
                support.
              </>
            )}
            {error && error !== "Verification" && error !== "Configuration" && (
              <>An authentication error occurred. Please try again.</>
            )}
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/auth/sign-in"
            className="inline-flex w-full justify-center rounded-md border border-transparent bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Go to Sign In
          </Link>
          <Link
            href="/"
            className="inline-flex w-full justify-center rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
}


