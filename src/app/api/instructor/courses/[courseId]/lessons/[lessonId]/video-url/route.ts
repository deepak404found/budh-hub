import { NextResponse } from "next/server";
import { db } from "@/db";
import { lessons } from "@/db/schema/lessons";
import { modules } from "@/db/schema/modules";
import { eq, and } from "drizzle-orm";
import { getCurrentUserWithRole } from "@/lib/auth/server";
import { isValidUUID } from "@/lib/utils/uuid";
import { isR2Configured, r2Config } from "@/lib/config/env";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { r2 } from "@/lib/r2/client";
import { getPublicUrl } from "@/lib/r2/utils";
import { canEditCourse } from "@/lib/auth/course-permissions";

/**
 * GET /api/instructor/courses/[courseId]/lessons/[lessonId]/video-url
 * Get signed or public URL for lesson video (for instructors)
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ courseId: string; lessonId: string }> }
) {
  try {
    const { courseId, lessonId } = await params;

    if (!isValidUUID(courseId) || !isValidUUID(lessonId)) {
      return NextResponse.json(
        { error: "Invalid course or lesson ID" },
        { status: 400 }
      );
    }

    const user = await getCurrentUserWithRole();
    if (!user || !user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user can edit this course
    const canEdit = await canEditCourse(user.id, courseId);
    if (!canEdit) {
      return NextResponse.json(
        { error: "Forbidden: You can only view videos for your own courses" },
        { status: 403 }
      );
    }

    // Verify lesson belongs to course
    const [lesson] = await db
      .select()
      .from(lessons)
      .where(eq(lessons.id, lessonId))
      .limit(1);

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    // Verify module belongs to course
    const [module] = await db
      .select()
      .from(modules)
      .where(
        and(eq(modules.id, lesson.module_id), eq(modules.course_id, courseId))
      )
      .limit(1);

    if (!module) {
      return NextResponse.json(
        { error: "Lesson does not belong to this course" },
        { status: 404 }
      );
    }

    if (!lesson.video_key) {
      return NextResponse.json(
        { error: "No video available for this lesson" },
        { status: 404 }
      );
    }

    // If R2_PUBLIC_URL is configured, use public URL
    if (r2Config.publicUrl) {
      const publicUrl = getPublicUrl(lesson.video_key);
      return NextResponse.json({ videoUrl: publicUrl });
    }

    // Otherwise, generate a signed URL (valid for 1 hour)
    if (!isR2Configured()) {
      return NextResponse.json(
        { error: "R2 is not configured" },
        { status: 500 }
      );
    }

    const command = new GetObjectCommand({
      Bucket: r2Config.bucketName,
      Key: lesson.video_key,
    });

    const signedUrl = await getSignedUrl(r2, command, { expiresIn: 3600 });
    return NextResponse.json({ videoUrl: signedUrl });
  } catch (error) {
    console.error("Error generating video URL:", error);
    return NextResponse.json(
      { error: "Failed to generate video URL" },
      { status: 500 }
    );
  }
}
