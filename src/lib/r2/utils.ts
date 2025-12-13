import { r2Config, isR2Configured } from "@/lib/config/env";
import { DeleteObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { r2 } from "./client";

/**
 * Generate a unique file key for R2 storage
 * Format: {prefix}/{timestamp}-{random}-{filename}
 */
export function generateFileKey(prefix: string, filename: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
  return `${prefix}/${timestamp}-${random}-${sanitizedFilename}`;
}

/**
 * Get public URL for an R2 object
 * Uses R2_PUBLIC_URL if configured, otherwise constructs from bucket name
 * Returns a fallback URL if R2 is not configured (for development)
 */
export function getPublicUrl(key: string): string {
  if (!isR2Configured()) {
    // Return a fallback URL instead of throwing (allows UI to render)
    console.warn("R2 is not configured, returning fallback URL");
    return `#r2-not-configured/${key}`;
  }

  if (r2Config.publicUrl) {
    // If public URL is configured, use it
    return `${r2Config.publicUrl}/${key}`;
  }

  // Otherwise, construct from bucket name (may require public access)
  return `https://${r2Config.accountId}.r2.cloudflarestorage.com/${r2Config.bucketName}/${key}`;
}

/**
 * Delete a file from R2
 */
export async function deleteFile(key: string): Promise<void> {
  if (!isR2Configured()) {
    throw new Error("R2 is not configured");
  }

  try {
    const command = new DeleteObjectCommand({
      Bucket: r2Config.bucketName,
      Key: key,
    });
    await r2.send(command);
  } catch (error) {
    console.error(`Failed to delete file ${key} from R2:`, error);
    throw error;
  }
}

/**
 * Get file metadata from R2
 */
export interface FileMetadata {
  size: number;
  contentType?: string;
  lastModified?: Date;
  etag?: string;
}

export async function getFileMetadata(
  key: string
): Promise<FileMetadata | null> {
  if (!isR2Configured()) {
    throw new Error("R2 is not configured");
  }

  try {
    const command = new HeadObjectCommand({
      Bucket: r2Config.bucketName,
      Key: key,
    });
    const response = await r2.send(command);
    return {
      size: response.ContentLength || 0,
      contentType: response.ContentType,
      lastModified: response.LastModified,
      etag: response.ETag,
    };
  } catch (error) {
    console.error(`Failed to get metadata for file ${key}:`, error);
    return null;
  }
}

/**
 * Generate file key for course thumbnail
 */
export function generateCourseThumbnailKey(
  courseId: string,
  filename: string
): string {
  return generateFileKey(`courses/${courseId}/thumbnails`, filename);
}

/**
 * Generate file key for lesson video
 */
export function generateLessonVideoKey(
  lessonId: string,
  filename: string
): string {
  return generateFileKey(`lessons/${lessonId}/videos`, filename);
}

/**
 * Generate file key for course material
 */
export function generateCourseMaterialKey(
  courseId: string,
  materialId: string,
  filename: string
): string {
  return generateFileKey(
    `courses/${courseId}/materials`,
    `${materialId}-${filename}`
  );
}

/**
 * Generate file key for lesson material
 */
export function generateLessonMaterialKey(
  lessonId: string,
  materialId: string,
  filename: string
): string {
  return generateFileKey(
    `lessons/${lessonId}/materials`,
    `${materialId}-${filename}`
  );
}
