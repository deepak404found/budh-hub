import { z } from "zod";
import { uploadConfig } from "@/lib/config/env";

/**
 * Lesson validation schemas
 */

export const createLessonSchema = z.object({
  module_id: z.string().uuid("Invalid module ID"),
  title: z.string().min(1, "Title is required").max(512, "Title must be less than 512 characters"),
  content: z.string().optional(),
  video_key: z.string().max(1024, "Video key too long").optional(),
  video_size: z.number().int().min(0, "Video size cannot be negative").optional(),
  video_duration: z.number().int().min(0, "Video duration cannot be negative").optional(),
  video_mime_type: z.string().max(100, "MIME type too long").optional(),
  ord: z.number().int().min(0, "Order must be non-negative").default(0),
});

export const updateLessonSchema = z.object({
  title: z.string().min(1, "Title is required").max(512, "Title must be less than 512 characters").optional(),
  content: z.string().optional(),
  video_key: z.string().max(1024, "Video key too long").optional(),
  video_size: z.number().int().min(0, "Video size cannot be negative").optional(),
  video_duration: z.number().int().min(0, "Video duration cannot be negative").optional(),
  video_mime_type: z.string().max(100, "MIME type too long").optional(),
  ord: z.number().int().min(0, "Order must be non-negative").optional(),
});

/**
 * Video upload validation schema
 * Validates file size and type
 */
export const uploadVideoSchema = z.object({
  filename: z.string().min(1, "Filename is required"),
  size: z.number().int().max(uploadConfig.maxVideoSizeBytes, `Video size must be less than ${uploadConfig.maxVideoSizeMB}MB`),
  type: z.string().refine(
    (type) => type.startsWith("video/"),
    "File must be a video"
  ),
});

export type CreateLessonInput = z.infer<typeof createLessonSchema>;
export type UpdateLessonInput = z.infer<typeof updateLessonSchema>;
export type UploadVideoInput = z.infer<typeof uploadVideoSchema>;


