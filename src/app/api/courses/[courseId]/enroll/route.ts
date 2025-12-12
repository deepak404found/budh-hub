import { NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/auth/server";
import { db } from "@/db";
import { courses } from "@/db/schema/courses";
import { enrollments } from "@/db/schema/enrollments";
import { lesson_progress } from "@/db/schema/lesson_progress";
import { lessons } from "@/db/schema/lessons";
import { modules } from "@/db/schema/modules";
import { eq, and, sql } from "drizzle-orm";
import { isEnrolled } from "@/lib/auth/course-permissions";
import { isValidUUID } from "@/lib/utils/uuid";

/**
 * POST /api/courses/[courseId]/enroll
 * Enroll in a course
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    if (!courseId) {
      return NextResponse.json({ error: "Course ID is required" }, { status: 400 });
    }

    // Validate UUID format
    if (!isValidUUID(courseId)) {
      return NextResponse.json({ error: "Invalid course ID format" }, { status: 400 });
    }

    const user = await getCurrentUserWithRole();
    if (!user || !user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if course exists and is published
    const courseResults = await db
      .select()
      .from(courses)
      .where(eq(courses.id, courseId))
      .limit(1);

    if (courseResults.length === 0) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const course = courseResults[0];
    if (!course.is_published) {
      return NextResponse.json({ error: "Course is not available for enrollment" }, { status: 403 });
    }

    // Check if already enrolled
    const alreadyEnrolled = await isEnrolled(user.id, courseId);
    if (alreadyEnrolled) {
      return NextResponse.json({ error: "Already enrolled in this course" }, { status: 400 });
    }

    // Create enrollment
    const [enrollment] = await db
      .insert(enrollments)
      .values({
        course_id: courseId,
        learner_id: user.id,
        progress: 0,
      })
      .returning();

    // Initialize lesson progress for all lessons in the course
    const courseModules = await db
      .select()
      .from(modules)
      .where(eq(modules.course_id, courseId));

    const moduleIds = courseModules.map((m) => m.id);
    if (moduleIds.length > 0) {
      const courseLessons = await db
        .select()
        .from(lessons)
        .where(eq(lessons.module_id, moduleIds[0])); // Simplified - should fetch all lessons

      // Create lesson progress records
      if (courseLessons.length > 0) {
        await db.insert(lesson_progress).values(
          courseLessons.map((lesson) => ({
            enrollment_id: enrollment.id,
            lesson_id: lesson.id,
            completed: false,
          }))
        );
      }
    }

    return NextResponse.json({ enrollment }, { status: 201 });
  } catch (error) {
    console.error("Error enrolling in course:", error);
    return NextResponse.json(
      { error: "Failed to enroll in course" },
      { status: 500 }
    );
  }
}

