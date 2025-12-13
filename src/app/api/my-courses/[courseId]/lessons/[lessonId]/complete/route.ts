import { NextResponse } from "next/server";
import { db } from "@/db";
import { enrollments } from "@/db/schema/enrollments";
import { lesson_progress } from "@/db/schema/lesson_progress";
import { lessons } from "@/db/schema/lessons";
import { modules } from "@/db/schema/modules";
import { eq, and, sql, inArray } from "drizzle-orm";
import { getCurrentUserWithRole } from "@/lib/auth/server";
import { isValidUUID } from "@/lib/utils/uuid";

/**
 * POST /api/my-courses/[courseId]/lessons/[lessonId]/complete
 * Mark a lesson as complete and update course progress
 */
export async function POST(
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

    // Get enrollment
    const enrollmentResults = await db
      .select()
      .from(enrollments)
      .where(
        and(
          eq(enrollments.course_id, courseId),
          eq(enrollments.learner_id, user.id)
        )
      )
      .limit(1);

    if (enrollmentResults.length === 0) {
      return NextResponse.json(
        { error: "You are not enrolled in this course" },
        { status: 403 }
      );
    }

    const enrollment = enrollmentResults[0];

    // Check if lesson exists and belongs to this course
    const lessonResults = await db
      .select()
      .from(lessons)
      .where(eq(lessons.id, lessonId))
      .limit(1);

    if (lessonResults.length === 0) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    const lesson = lessonResults[0];

    // Get module to verify it belongs to the course
    const moduleResults = await db
      .select()
      .from(modules)
      .where(eq(modules.id, lesson.module_id))
      .limit(1);

    if (moduleResults.length === 0 || moduleResults[0].course_id !== courseId) {
      return NextResponse.json(
        { error: "Lesson does not belong to this course" },
        { status: 403 }
      );
    }

    // Update or create lesson progress
    const existingProgress = await db
      .select()
      .from(lesson_progress)
      .where(
        and(
          eq(lesson_progress.enrollment_id, enrollment.id),
          eq(lesson_progress.lesson_id, lessonId)
        )
      )
      .limit(1);

    if (existingProgress.length > 0) {
      // Update existing progress
      await db
        .update(lesson_progress)
        .set({ completed: true })
        .where(eq(lesson_progress.id, existingProgress[0].id));
    } else {
      // Create new progress record
      await db.insert(lesson_progress).values({
        enrollment_id: enrollment.id,
        lesson_id: lessonId,
        completed: true,
      });
    }

    // Calculate overall course progress
    // Get all lessons in the course
    const courseModules = await db
      .select()
      .from(modules)
      .where(eq(modules.course_id, courseId));

    const moduleIds = courseModules.map((m) => m.id);
    const totalLessons =
      moduleIds.length > 0
        ? await db
            .select({ count: sql<number>`count(*)` })
            .from(lessons)
            .where(inArray(lessons.module_id, moduleIds))
        : [{ count: 0 }];

    const totalLessonsCount = Number(totalLessons[0]?.count || 0);

    // Get completed lessons count
    const completedLessons = await db
      .select({ count: sql<number>`count(*)` })
      .from(lesson_progress)
      .where(
        and(
          eq(lesson_progress.enrollment_id, enrollment.id),
          eq(lesson_progress.completed, true)
        )
      );

    const completedCount = Number(completedLessons[0]?.count || 0);
    const newProgress =
      totalLessonsCount > 0
        ? Math.round((completedCount / totalLessonsCount) * 100)
        : 0;

    // Update enrollment progress
    await db
      .update(enrollments)
      .set({ progress: newProgress })
      .where(eq(enrollments.id, enrollment.id));

    return NextResponse.json({
      success: true,
      progress: newProgress,
      completed: completedCount,
      total: totalLessonsCount,
    });
  } catch (error) {
    console.error("Error marking lesson as complete:", error);
    return NextResponse.json(
      { error: "Failed to mark lesson as complete" },
      { status: 500 }
    );
  }
}
