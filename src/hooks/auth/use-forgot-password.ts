"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { signInSchema, type SignInInput } from "@/lib/validations/auth";

interface UseForgotPasswordReturn {
  form: ReturnType<typeof useForm<SignInInput>>;
  isLoading: boolean;
  emailSent: boolean;
  sentEmail: string | null;
  onSubmit: (data: SignInInput) => Promise<void>;
}

export function useForgotPassword(): UseForgotPasswordReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [sentEmail, setSentEmail] = useState<string | null>(null);

  const form = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: SignInInput) => {
    setIsLoading(true);
    setEmailSent(false);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: data.email }),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMessage = result.error || "Failed to send reset email. Please try again.";
        toast.error(errorMessage);
        return;
      }

      setEmailSent(true);
      setSentEmail(data.email);
      toast.success("Password reset email sent!", {
        description: result.message || `We've sent a password reset link to ${data.email}`,
        duration: 5000,
      });
      form.reset();
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    isLoading,
    emailSent,
    sentEmail,
    onSubmit,
  };
}

