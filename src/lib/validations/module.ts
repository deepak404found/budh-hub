import { z } from "zod";

/**
 * Module validation schemas
 */

export const createModuleSchema = z.object({
  course_id: z.string().uuid("Invalid course ID"),
  title: z.string().min(1, "Title is required").max(512, "Title must be less than 512 characters"),
  ord: z.number().int().min(0, "Order must be non-negative").default(0),
});

export const updateModuleSchema = z.object({
  title: z.string().min(1, "Title is required").max(512, "Title must be less than 512 characters").optional(),
  ord: z.number().int().min(0, "Order must be non-negative").optional(),
});

export type CreateModuleInput = z.infer<typeof createModuleSchema>;
export type UpdateModuleInput = z.infer<typeof updateModuleSchema>;


