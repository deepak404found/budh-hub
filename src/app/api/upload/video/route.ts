import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getCurrentUserWithRole } from "@/lib/auth/server";
import { r2 } from "@/lib/r2/client";
import { r2Config, uploadConfig, isR2Configured } from "@/lib/config/env";
import { generateLessonVideoKey, getPublicUrl } from "@/lib/r2/utils";
import { uploadVideoSchema } from "@/lib/validations/lesson";
import { isInstructorOrAbove } from "@/lib/types/roles";

// Configure execution settings for this route
export const maxDuration = 300; // 5 minutes max execution time
export const runtime = "nodejs";

/**
 * POST /api/upload/video
 * Upload video file directly (proxied through API to avoid CORS)
 * Body: FormData with file, lessonId
 *
 * IMPORTANT: Vercel serverless functions have a hard 4.5MB body size limit
 * that cannot be overridden. For files larger than 4.5MB, consider using
 * direct client-side uploads to R2 using presigned URLs (see /api/upload/signed-url)
 */
export async function POST(req: Request) {
  const startTime = Date.now();
  let lessonId: string | null = null;
  let filename: string | null = null;
  let fileSize: number | null = null;
  let user: Awaited<ReturnType<typeof getCurrentUserWithRole>> | null = null;

  try {
    if (!isR2Configured()) {
      console.error("[UPLOAD:VIDEO] R2 storage is not configured");
      return NextResponse.json(
        { error: "R2 storage is not configured" },
        { status: 500 }
      );
    }

    user = await getCurrentUserWithRole();
    if (!user || !isInstructorOrAbove(user.role)) {
      console.warn(
        `[UPLOAD:VIDEO] Unauthorized access attempt by user: ${
          user?.id || "unknown"
        }`
      );
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    lessonId = formData.get("lessonId") as string;
    filename = file?.name || null;
    fileSize = file?.size || null;

    console.log(
      `[UPLOAD:VIDEO] Starting upload - User: ${user.id}, Lesson: ${lessonId}, File: ${filename}, Size: ${fileSize} bytes`
    );

    if (!file) {
      console.warn("[UPLOAD:VIDEO] No file provided in request");
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    // Check Vercel's hard limit (4.5MB for serverless functions)
    // This is a platform limitation that cannot be overridden
    const VERCEL_BODY_SIZE_LIMIT = 4.5 * 1024 * 1024; // 4.5MB
    if (file.size > VERCEL_BODY_SIZE_LIMIT) {
      console.warn(
        `[UPLOAD:VIDEO] File size (${file.size} bytes) exceeds Vercel's 4.5MB limit`
      );
      return NextResponse.json(
        {
          error: `File too large. Maximum size for direct upload is 4.5MB due to server limitations. Your file is ${(
            file.size /
            1024 /
            1024
          ).toFixed(
            2
          )}MB. Please use a smaller file or implement direct client-side uploads using presigned URLs.`,
        },
        { status: 413 }
      );
    }

    if (!lessonId || typeof lessonId !== "string") {
      console.warn(
        `[UPLOAD:VIDEO] Invalid lesson ID: ${lessonId} (type: ${typeof lessonId})`
      );
      return NextResponse.json(
        { error: "Lesson ID is required" },
        { status: 400 }
      );
    }

    // Validate file
    const validatedData = uploadVideoSchema.parse({
      filename: file.name,
      size: file.size,
      type: file.type,
    });

    console.log(
      `[UPLOAD:VIDEO] File validated - Name: ${validatedData.filename}, Type: ${validatedData.type}, Size: ${validatedData.size} bytes`
    );

    // Generate file key
    const fileKey = generateLessonVideoKey(lessonId, validatedData.filename);
    console.log(`[UPLOAD:VIDEO] Generated R2 key: ${fileKey}`);

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log(
      `[UPLOAD:VIDEO] File converted to buffer: ${buffer.length} bytes`
    );

    // Upload to R2
    console.log(
      `[UPLOAD:VIDEO] Uploading to R2 - Bucket: ${r2Config.bucketName}, Key: ${fileKey}`
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
      `[UPLOAD:VIDEO] Successfully uploaded to R2 in ${uploadTime}ms - Key: ${fileKey}`
    );

    // Get public URL
    const publicUrl = getPublicUrl(fileKey);

    const totalTime = Date.now() - startTime;
    console.log(
      `[UPLOAD:VIDEO] Upload completed successfully in ${totalTime}ms - User: ${user.id}, Lesson: ${lessonId}, File: ${validatedData.filename}, R2 Key: ${fileKey}, URL: ${publicUrl}`
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
      `[UPLOAD:VIDEO] Error after ${totalTime}ms - User: ${
        user?.id || "unknown"
      }, Lesson: ${lessonId || "unknown"}, File: ${
        filename || "unknown"
      }, Size: ${fileSize || "unknown"} bytes`,
      error
    );

    if (error instanceof Error && error.name === "ZodError") {
      console.error(
        `[UPLOAD:VIDEO] Validation error - ${JSON.stringify(error)}`
      );
      return NextResponse.json(
        { error: "Validation error", details: error },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to upload video" },
      { status: 500 }
    );
  }
}
