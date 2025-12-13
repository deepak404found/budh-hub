import { NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/auth/server";
import { db } from "@/db";
import { lessons } from "@/db/schema/lessons";
import { modules } from "@/db/schema/modules";
import { eq, and } from "drizzle-orm";
import { canEditCourse } from "@/lib/auth/course-permissions";
import { isValidUUID } from "@/lib/utils/uuid";
import { deleteFile } from "@/lib/r2/utils";
import { r2Config } from "@/lib/config/env";

/**
 * DELETE /api/instructor/courses/[courseId]/modules/[moduleId]/lessons/[lessonId]/video
 * Delete video from a lesson (removes video from R2 and clears video fields in database)
 */
export async function DELETE(
  req: Request,
  {
    params,
  }: {
    params: Promise<{ courseId: string; moduleId: string; lessonId: string }>;
  }
) {
  const startTime = Date.now();
  let user: Awaited<ReturnType<typeof getCurrentUserWithRole>> | null = null;
  try {
    const { courseId, moduleId, lessonId } = await params;

    console.log(
      `[DELETE:VIDEO] Starting deletion - Course: ${courseId}, Module: ${moduleId}, Lesson: ${lessonId}`
    );

    // Validate UUIDs
    if (
      !isValidUUID(courseId) ||
      !isValidUUID(moduleId) ||
      !isValidUUID(lessonId)
    ) {
      console.warn(
        `[DELETE:VIDEO] Invalid UUID format - Course: ${courseId}, Module: ${moduleId}, Lesson: ${lessonId}`
      );
      return NextResponse.json(
        { error: "Invalid course, module, or lesson ID format" },
        { status: 400 }
      );
    }

    user = await getCurrentUserWithRole();
    if (!user || !user.id) {
      console.warn(
        `[DELETE:VIDEO] Unauthorized access attempt - Course: ${courseId}, Lesson: ${lessonId}`
      );
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log(
      `[DELETE:VIDEO] User authenticated - User: ${user.id}, Role: ${user.role}`
    );

    // Verify module belongs to course
    const [module] = await db
      .select()
      .from(modules)
      .where(and(eq(modules.id, moduleId), eq(modules.course_id, courseId)))
      .limit(1);

    if (!module) {
      return NextResponse.json(
        { error: "Module not found or doesn't belong to this course" },
        { status: 404 }
      );
    }

    const canEdit = await canEditCourse(user.id, courseId);
    if (!canEdit) {
      return NextResponse.json(
        {
          error: "Forbidden: You can only delete videos from your own courses",
        },
        { status: 403 }
      );
    }

    // Verify lesson exists and belongs to module
    const [existingLesson] = await db
      .select()
      .from(lessons)
      .where(and(eq(lessons.id, lessonId), eq(lessons.module_id, moduleId)))
      .limit(1);

    if (!existingLesson) {
      return NextResponse.json(
        { error: "Lesson not found or doesn't belong to this module" },
        { status: 404 }
      );
    }

    if (!existingLesson.video_key) {
      console.warn(
        `[DELETE:VIDEO] No video to delete - Lesson: ${lessonId} has no video_key`
      );
      return NextResponse.json(
        { error: "No video to delete" },
        { status: 400 }
      );
    }

    const videoKey = existingLesson.video_key;
    console.log(
      `[DELETE:VIDEO] Video found - R2 Key: ${videoKey}, Lesson: ${lessonId}`
    );

    // Delete video from R2
    try {
      console.log(
        `[DELETE:VIDEO] Deleting from R2 - Bucket: ${r2Config.bucketName}, Key: ${videoKey}`
      );
      await deleteFile(videoKey);
      const r2DeleteTime = Date.now() - startTime;
      console.log(
        `[DELETE:VIDEO] Successfully deleted from R2 in ${r2DeleteTime}ms - Key: ${videoKey}`
      );
    } catch (fileError) {
      console.error(
        `[DELETE:VIDEO] Error deleting video from R2 - Key: ${videoKey}`,
        fileError
      );
      // Continue with database update even if file deletion fails
      // (file might already be deleted or R2 might not be accessible)
    }

    // Clear video fields in database
    console.log(
      `[DELETE:VIDEO] Clearing video fields in database - Lesson: ${lessonId}`
    );
    const [updatedLesson] = await db
      .update(lessons)
      .set({
        video_key: null,
        video_size: null,
        video_duration: null,
        video_mime_type: null,
      })
      .where(eq(lessons.id, lessonId))
      .returning();

    const totalTime = Date.now() - startTime;
    console.log(
      `[DELETE:VIDEO] Deletion completed successfully in ${totalTime}ms - User: ${user.id}, Course: ${courseId}, Lesson: ${lessonId}, R2 Key: ${videoKey}`
    );

    return NextResponse.json({
      message: "Video deleted successfully",
      lesson: updatedLesson,
    });
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(
      `[DELETE:VIDEO] Error after ${totalTime}ms - Course: ${courseId}, Module: ${moduleId}, Lesson: ${lessonId}`,
      error
    );
    return NextResponse.json(
      { error: "Failed to delete video" },
      { status: 500 }
    );
  }
}
