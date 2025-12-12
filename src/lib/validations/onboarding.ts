import { z } from "zod";
import { passwordSchema } from "./auth";

/**
 * Role selection schema for onboarding
 * Note: ADMIN role cannot be selected during onboarding - it must be assigned manually
 */
export const roleSelectionSchema = z.object({
  role: z.enum(["INSTRUCTOR", "LEARNER"], {
    message: "Please select a role. Admin role cannot be selected during onboarding.",
  }),
});

export const profileSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(255, "Name must be less than 255 characters"),
  bio: z.string().max(1000, "Bio must be less than 1000 characters").optional(),
});

// Optional password schema for onboarding
export const passwordSetupSchema = z
  .object({
    password: passwordSchema.optional(),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      // If password is provided, confirmPassword must match
      if (data.password && !data.confirmPassword) {
        return false;
      }
      if (!data.password && data.confirmPassword) {
        return false;
      }
      return true;
    },
    {
      message: "Please confirm your password",
      path: ["confirmPassword"],
    }
  )
  .refine(
    (data) => {
      // If both are provided, they must match
      if (data.password && data.confirmPassword) {
        return data.password === data.confirmPassword;
      }
      return true;
    },
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }
  );

export const onboardingSchema = roleSelectionSchema
  .merge(profileSchema)
  .merge(passwordSetupSchema);

export type RoleSelectionInput = z.infer<typeof roleSelectionSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;

