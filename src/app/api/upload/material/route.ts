import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getCurrentUserWithRole } from "@/lib/auth/server";
import { r2 } from "@/lib/r2/client";
import { r2Config, uploadConfig, isR2Configured } from "@/lib/config/env";
import {
  generateCourseMaterialKey,
  generateLessonMaterialKey,
  getPublicUrl,
} from "@/lib/r2/utils";
import { uploadMaterialSchema } from "@/lib/validations/material";
import { isInstructorOrAbove } from "@/lib/types/roles";

/**
 * POST /api/upload/material
 * Upload material file directly (proxied through API to avoid CORS)
 * Body: FormData with file, courseId, lessonId (optional), materialId (optional)
 */
export async function POST(req: Request) {
  const startTime = Date.now();
  let courseId: string | null = null;
  let lessonId: string | null = null;
  let filename: string | null = null;
  let fileSize: number | null = null;

  try {
    if (!isR2Configured()) {
      console.error("[UPLOAD:MATERIAL] R2 storage is not configured");
      return NextResponse.json(
        { error: "R2 storage is not configured" },
        { status: 500 }
      );
    }

    const user = await getCurrentUserWithRole();
    if (!user || !isInstructorOrAbove(user.role)) {
      console.warn(
        `[UPLOAD:MATERIAL] Unauthorized access attempt by user: ${
          user?.id || "unknown"
        }`
      );
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    courseId = formData.get("courseId") as string;
    lessonId = formData.get("lessonId") as string | null;
    const materialId = formData.get("materialId") as string | null;
    filename = file?.name || null;
    fileSize = file?.size || null;

    const materialType = lessonId ? "lesson-level" : "course-level";
    console.log(
      `[UPLOAD:MATERIAL] Starting upload - User: ${
        user.id
      }, Course: ${courseId}, Lesson: ${lessonId || "N/A"}, Material: ${
        materialId || "new"
      }, Type: ${materialType}, File: ${filename}, Size: ${fileSize} bytes`
    );

    if (!file) {
      console.warn("[UPLOAD:MATERIAL] No file provided in request");
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    if (!courseId || typeof courseId !== "string") {
      console.warn(
        `[UPLOAD:MATERIAL] Invalid course ID: ${courseId} (type: ${typeof courseId})`
      );
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );
    }

    // Validate file
    const validatedData = uploadMaterialSchema.parse({
      filename: file.name,
      size: file.size,
      type: file.type,
    });

    console.log(
      `[UPLOAD:MATERIAL] File validated - Name: ${validatedData.filename}, Type: ${validatedData.type}, Size: ${validatedData.size} bytes`
    );

    // Generate file key based on whether it's course-level or lesson-level material
    let fileKey: string;
    if (lessonId && materialId) {
      fileKey = generateLessonMaterialKey(
        lessonId,
        materialId,
        validatedData.filename
      );
    } else if (materialId) {
      fileKey = generateCourseMaterialKey(
        courseId,
        materialId,
        validatedData.filename
      );
    } else {
      // Generate a temporary material ID if not provided
      const tempMaterialId = `temp-${Date.now()}`;
      fileKey = lessonId
        ? generateLessonMaterialKey(
            lessonId,
            tempMaterialId,
            validatedData.filename
          )
        : generateCourseMaterialKey(
            courseId,
            tempMaterialId,
            validatedData.filename
          );
    }

    console.log(`[UPLOAD:MATERIAL] Generated R2 key: ${fileKey}`);

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log(
      `[UPLOAD:MATERIAL] File converted to buffer: ${buffer.length} bytes`
    );

    // Upload to R2
    console.log(
      `[UPLOAD:MATERIAL] Uploading to R2 - Bucket: ${r2Config.bucketName}, Key: ${fileKey}`
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
      `[UPLOAD:MATERIAL] Successfully uploaded to R2 in ${uploadTime}ms - Key: ${fileKey}`
    );

    // Get public URL
    const publicUrl = getPublicUrl(fileKey);

    const totalTime = Date.now() - startTime;
    console.log(
      `[UPLOAD:MATERIAL] Upload completed successfully in ${totalTime}ms - User: ${
        user.id
      }, Course: ${courseId}, Lesson: ${lessonId || "N/A"}, File: ${
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
      `[UPLOAD:MATERIAL] Error after ${totalTime}ms - User: ${
        user?.id || "unknown"
      }, Course: ${courseId || "unknown"}, Lesson: ${
        lessonId || "N/A"
      }, File: ${filename || "unknown"}, Size: ${fileSize || "unknown"} bytes`,
      error
    );

    if (error instanceof Error && error.name === "ZodError") {
      console.error(
        `[UPLOAD:MATERIAL] Validation error - ${JSON.stringify(error)}`
      );
      return NextResponse.json(
        { error: "Validation error", details: error },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to upload material" },
      { status: 500 }
    );
  }
}
