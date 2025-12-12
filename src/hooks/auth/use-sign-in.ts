"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  signInSchema,
  passwordSignInSchema,
  type SignInInput,
  type PasswordSignInInput,
} from "@/lib/validations/auth";

type SignInMethod = "magic-link" | "password";

interface UseSignInReturn {
  method: SignInMethod;
  setMethod: (method: SignInMethod) => void;
  magicLinkForm: ReturnType<typeof useForm<SignInInput>>;
  passwordForm: ReturnType<typeof useForm<PasswordSignInInput>>;
  isLoading: boolean;
  error: string | null;
  emailSent: boolean;
  sentEmail: string | null;
  onMagicLinkSubmit: (data: SignInInput) => Promise<void>;
  onPasswordSubmit: (data: PasswordSignInInput) => Promise<void>;
}

export function useSignIn(): UseSignInReturn {
  const router = useRouter();
  const [method, setMethod] = useState<SignInMethod>("magic-link");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [sentEmail, setSentEmail] = useState<string | null>(null);

  const magicLinkForm = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
    },
  });

  const passwordForm = useForm<PasswordSignInInput>({
    resolver: zodResolver(passwordSignInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onMagicLinkSubmit = async (data: SignInInput) => {
    setIsLoading(true);
    setError(null);
    setEmailSent(false);

    try {
      const result = await signIn("email", {
        email: data.email,
        redirect: false,
      });

      if (result?.error) {
        const errorMessage =
          result.error || "Failed to sign in. Please try again.";
        setError(errorMessage);
        toast.error(errorMessage);
      } else if (result?.ok) {
        setEmailSent(true);
        setSentEmail(data.email);
        toast.success("Magic link sent! Check your email inbox.", {
          description: `We've sent a sign-in link to ${data.email}`,
          duration: 5000,
        });
        magicLinkForm.reset();
      }
    } catch {
      const errorMessage = "An unexpected error occurred. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordSignInInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        const errorMessage =
          result.error === "CredentialsSignin"
            ? "Invalid email or password"
            : result.error || "Failed to sign in. Please try again.";
        setError(errorMessage);
        toast.error(errorMessage);
      } else if (result?.ok) {
        toast.success("Signed in successfully!");
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      const errorMessage = "An unexpected error occurred. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
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
  };
}

