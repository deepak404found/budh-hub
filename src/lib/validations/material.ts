import { z } from "zod";
import { uploadConfig } from "@/lib/config/env";

/**
 * Material validation schemas
 */

const allowedMaterialTypes = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
] as const;

export const uploadMaterialSchema = z.object({
  course_id: z.string().uuid("Invalid course ID"),
  lesson_id: z.string().uuid("Invalid lesson ID").optional(),
  filename: z.string().min(1, "Filename is required"),
  size: z.number().int().max(uploadConfig.maxMaterialSizeBytes, `File size must be less than ${uploadConfig.maxMaterialSizeMB}MB`),
  type: z.string().refine(
    (type) => allowedMaterialTypes.includes(type as any),
    `File type must be one of: ${allowedMaterialTypes.join(", ")}`
  ),
});

/**
 * Determine material type from MIME type
 */
export function getMaterialType(mimeType: string): "image" | "document" | "pdf" | "other" {
  if (mimeType.startsWith("image/")) {
    return "image";
  }
  if (mimeType === "application/pdf") {
    return "pdf";
  }
  if (mimeType.includes("word") || mimeType.includes("text")) {
    return "document";
  }
  return "other";
}

export type UploadMaterialInput = z.infer<typeof uploadMaterialSchema>;

