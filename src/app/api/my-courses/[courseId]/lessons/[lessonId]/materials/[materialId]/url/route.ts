import { NextResponse } from "next/server";
import { db } from "@/db";
import { course_materials } from "@/db/schema/course_materials";
import { enrollments } from "@/db/schema/enrollments";
import { lessons } from "@/db/schema/lessons";
import { eq, and } from "drizzle-orm";
import { getCurrentUserWithRole } from "@/lib/auth/server";
import { isValidUUID } from "@/lib/utils/uuid";
import { isR2Configured, r2Config } from "@/lib/config/env";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { r2 } from "@/lib/r2/client";
import { getPublicUrl } from "@/lib/r2/utils";

/**
 * GET /api/my-courses/[courseId]/lessons/[lessonId]/materials/[materialId]/url
 * Get signed or public URL for lesson-level material (for learners)
 */
export async function GET(
  req: Request,
  {
    params,
  }: {
    params: Promise<{
      courseId: string;
      lessonId: string;
      materialId: string;
    }>;
  }
) {
  try {
    const { courseId, lessonId, materialId } = await params;

    if (
      !isValidUUID(courseId) ||
      !isValidUUID(lessonId) ||
      !isValidUUID(materialId)
    ) {
      return NextResponse.json(
        { error: "Invalid course, lesson, or material ID" },
        { status: 400 }
      );
    }

    const user = await getCurrentUserWithRole();
    if (!user || !user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is enrolled
    const enrollment = await db
      .select()
      .from(enrollments)
      .where(
        and(
          eq(enrollments.course_id, courseId),
          eq(enrollments.learner_id, user.id)
        )
      )
      .limit(1);

    if (enrollment.length === 0) {
      return NextResponse.json(
        { error: "You are not enrolled in this course" },
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

    // Get material
    const [material] = await db
      .select()
      .from(course_materials)
      .where(
        and(
          eq(course_materials.id, materialId),
          eq(course_materials.course_id, courseId),
          eq(course_materials.lesson_id, lessonId) // Lesson-level material
        )
      )
      .limit(1);

    if (!material) {
      return NextResponse.json(
        { error: "Material not found" },
        { status: 404 }
      );
    }

    // If R2_PUBLIC_URL is configured, use public URL
    if (r2Config.publicUrl) {
      const publicUrl = getPublicUrl(material.file_key);
      return NextResponse.json({ materialUrl: publicUrl });
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
      Key: material.file_key,
    });

    const signedUrl = await getSignedUrl(r2, command, { expiresIn: 3600 });
    return NextResponse.json({ materialUrl: signedUrl });
  } catch (error) {
    console.error("Error generating material URL:", error);
    return NextResponse.json(
      { error: "Failed to generate material URL" },
      { status: 500 }
    );
  }
}
