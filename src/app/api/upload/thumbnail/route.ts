import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getCurrentUserWithRole } from "@/lib/auth/server";
import { r2 } from "@/lib/r2/client";
import { r2Config, uploadConfig, isR2Configured } from "@/lib/config/env";
import { generateCourseThumbnailKey, getPublicUrl } from "@/lib/r2/utils";
import { isInstructorOrAbove } from "@/lib/types/roles";
import { z } from "zod";

/**
 * Thumbnail upload validation schema
 */
const uploadThumbnailSchema = z.object({
  filename: z.string().min(1, "Filename is required"),
  size: z
    .number()
    .int()
    .max(
      uploadConfig.maxMaterialSizeBytes,
      `File size must be less than ${uploadConfig.maxMaterialSizeMB}MB`
    ),
  type: z
    .string()
    .refine((type) => type.startsWith("image/"), "File must be an image"),
});

/**
 * POST /api/upload/thumbnail
 * Upload thumbnail file directly (proxied through API to avoid CORS)
 * Body: FormData with file, courseId
 */
export async function POST(req: Request) {
  const startTime = Date.now();
  let courseId: string | null = null;
  let filename: string | null = null;
  let fileSize: number | null = null;

  try {
    if (!isR2Configured()) {
      console.error("[UPLOAD:THUMBNAIL] R2 storage is not configured");
      return NextResponse.json(
        { error: "R2 storage is not configured" },
        { status: 500 }
      );
    }

    const user = await getCurrentUserWithRole();
    if (!user || !isInstructorOrAbove(user.role)) {
      console.warn(
        `[UPLOAD:THUMBNAIL] Unauthorized access attempt by user: ${
          user?.id || "unknown"
        }`
      );
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    courseId = formData.get("courseId") as string;
    filename = file?.name || null;
    fileSize = file?.size || null;

    const isNewCourse = !courseId || courseId === "new";
    console.log(
      `[UPLOAD:THUMBNAIL] Starting upload - User: ${user.id}, Course: ${
        courseId || "new"
      }, File: ${filename}, Size: ${fileSize} bytes`
    );

    if (!file) {
      console.warn("[UPLOAD:THUMBNAIL] No file provided in request");
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    // Validate file
    const validatedData = uploadThumbnailSchema.parse({
      filename: file.name,
      size: file.size,
      type: file.type,
    });

    console.log(
      `[UPLOAD:THUMBNAIL] File validated - Name: ${validatedData.filename}, Type: ${validatedData.type}, Size: ${validatedData.size} bytes`
    );

    // For new courses, use a temporary path that can be moved later
    // Or allow courseId to be optional for initial upload
    let fileKey: string;
    if (courseId && courseId !== "new" && typeof courseId === "string") {
      fileKey = generateCourseThumbnailKey(courseId, validatedData.filename);
    } else {
      // For new courses, use a temporary path
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 15);
      const sanitizedFilename = validatedData.filename.replace(
        /[^a-zA-Z0-9.-]/g,
        "_"
      );
      fileKey = `temp/thumbnails/${timestamp}-${random}-${sanitizedFilename}`;
    }

    console.log(
      `[UPLOAD:THUMBNAIL] Generated R2 key: ${fileKey} (${
        isNewCourse ? "temporary" : "permanent"
      })`
    );

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log(
      `[UPLOAD:THUMBNAIL] File converted to buffer: ${buffer.length} bytes`
    );

    // Upload to R2
    console.log(
      `[UPLOAD:THUMBNAIL] Uploading to R2 - Bucket: ${r2Config.bucketName}, Key: ${fileKey}`
    );
    const command = new PutObjectCommand({
      Bucket: r2Config.bucketName,
      Key: fileKey,
      Body: buffer,
      ContentType: validatedData.type,
    });

    await r2.send(command);
    const uploadTime = Date.now() - startTime;
    console.log(
      `[UPLOAD:THUMBNAIL] Successfully uploaded to R2 in ${uploadTime}ms - Key: ${fileKey}`
    );

    // Get public URL
    const publicUrl = getPublicUrl(fileKey);

    const totalTime = Date.now() - startTime;
    console.log(
      `[UPLOAD:THUMBNAIL] Upload completed successfully in ${totalTime}ms - User: ${
        user.id
      }, Course: ${courseId || "new"}, File: ${
        validatedData.filename
      }, R2 Key: ${fileKey}, URL: ${publicUrl}`
    );

    return NextResponse.json({
      key: fileKey,
      url: publicUrl,
      filename: validatedData.filename,
      size: validatedData.size,
      type: validatedData.type,
    });
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(
      `[UPLOAD:THUMBNAIL] Error after ${totalTime}ms - User: ${
        user?.id || "unknown"
      }, Course: ${courseId || "unknown"}, File: ${
        filename || "unknown"
      }, Size: ${fileSize || "unknown"} bytes`,
      error
    );

    if (error instanceof Error && error.name === "ZodError") {
      console.error(
        `[UPLOAD:THUMBNAIL] Validation error - ${JSON.stringify(error)}`
      );
      return NextResponse.json(
        { error: "Validation error", details: error },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to upload thumbnail" },
      { status: 500 }
    );
  }
}
