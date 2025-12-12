import { z } from "zod";

export const roleSelectionSchema = z.object({
  role: z.enum(["INSTRUCTOR", "LEARNER"], {
    message: "Please select a role",
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

export const onboardingSchema = roleSelectionSchema.merge(profileSchema);

export type RoleSelectionInput = z.infer<typeof roleSelectionSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;

