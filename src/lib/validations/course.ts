import { z } from "zod";

/**
 * Course validation schemas
 */

export const createCourseSchema = z.object({
  title: z.string().min(1, "Title is required").max(512, "Title must be less than 512 characters"),
  description: z.string().optional(),
  category: z.string().max(128, "Category must be less than 128 characters").optional(),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced"], {
    message: "Difficulty must be Beginner, Intermediate, or Advanced",
  }).optional(),
  thumbnail_url: z.string().url("Invalid thumbnail URL").max(1024, "URL too long").optional(),
  price: z.number().min(0, "Price cannot be negative").optional(),
});

export const updateCourseSchema = createCourseSchema.partial();

export const publishCourseSchema = z.object({
  courseId: z.string().uuid("Invalid course ID"),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
export type PublishCourseInput = z.infer<typeof publishCourseSchema>;

