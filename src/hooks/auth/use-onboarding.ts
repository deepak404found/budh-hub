"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  roleSelectionSchema,
  onboardingSchema,
  type RoleSelectionInput,
  type OnboardingInput,
} from "@/lib/validations/onboarding";

type OnboardingStep = "role" | "profile";

interface UseOnboardingReturn {
  step: OnboardingStep;
  setStep: (step: OnboardingStep) => void;
  roleForm: ReturnType<typeof useForm<RoleSelectionInput>>;
  profileForm: ReturnType<typeof useForm<OnboardingInput>>;
  isLoading: boolean;
  error: string | null;
  setupPassword: boolean;
  setSetupPassword: (value: boolean) => void;
  progressPercentage: number;
  handleRoleSubmit: (data: RoleSelectionInput) => void;
  handleProfileSubmit: (data: OnboardingInput) => Promise<void>;
}

export function useOnboarding(): UseOnboardingReturn {
  const router = useRouter();
  const [step, setStep] = useState<OnboardingStep>("role");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [setupPassword, setSetupPassword] = useState(false);

  const roleForm = useForm<RoleSelectionInput>({
    resolver: zodResolver(roleSelectionSchema),
    defaultValues: {
      role: undefined,
    },
  });

  const profileForm = useForm<OnboardingInput>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: "",
      bio: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleRoleSubmit = (data: RoleSelectionInput) => {
    setStep("profile");
  };

  const handleProfileSubmit = async (data: OnboardingInput) => {
    setIsLoading(true);
    setError(null);

    const onboardingData: OnboardingInput = {
      role: roleForm.getValues("role")!,
      name: data.name,
      bio: data.bio,
      // Only include password if user opted to set it up
      password: setupPassword ? data.password : undefined,
      confirmPassword: setupPassword ? data.confirmPassword : undefined,
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

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const progressPercentage = step === "role" ? 50 : 100;

  return {
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
  };
}

