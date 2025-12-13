import { NextResponse } from "next/server";
import { db } from "@/db";
import { courses } from "@/db/schema/courses";
import { modules } from "@/db/schema/modules";
import { lessons } from "@/db/schema/lessons";
import { enrollments } from "@/db/schema/enrollments";
import { lesson_progress } from "@/db/schema/lesson_progress";
import { course_materials } from "@/db/schema/course_materials";
import { eq, and, sql, asc, inArray, isNull } from "drizzle-orm";
import { getCurrentUserWithRole } from "@/lib/auth/server";
import { isValidUUID } from "@/lib/utils/uuid";
import { getPublicUrl } from "@/lib/r2/utils";
import { isR2Configured } from "@/lib/config/env";

/**
 * GET /api/my-courses/[courseId]
 * Get course details for enrolled learner (with lessons and materials)
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;

    if (!isValidUUID(courseId)) {
      return NextResponse.json({ error: "Invalid course ID" }, { status: 400 });
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

    // Get course
    const [course] = await db
      .select()
      .from(courses)
      .where(eq(courses.id, courseId))
      .limit(1);

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Get modules
    const courseModules = await db
      .select()
      .from(modules)
      .where(eq(modules.course_id, courseId))
      .orderBy(asc(modules.ord));

    // Get all lessons for all modules
    const moduleIds = courseModules.map((m) => m.id);
    const courseLessons =
      moduleIds.length > 0
        ? await db
            .select()
            .from(lessons)
            .where(inArray(lessons.module_id, moduleIds))
            .orderBy(asc(lessons.ord))
        : [];

    // Get lesson progress for this enrollment
    const progressRecords =
      enrollment.length > 0
        ? await db
            .select()
            .from(lesson_progress)
            .where(eq(lesson_progress.enrollment_id, enrollment[0].id))
        : [];

    const completedLessonIds = new Set(
      progressRecords.filter((p) => p.completed).map((p) => p.lesson_id)
    );

    // Get all lesson IDs for fetching lesson materials
    const lessonIds = courseLessons.map((l) => l.id);

    // Fetch course-level materials (where lesson_id is null)
    const courseLevelMaterials = await db
      .select()
      .from(course_materials)
      .where(
        and(
          eq(course_materials.course_id, courseId),
          isNull(course_materials.lesson_id)
        )
      )
      .orderBy(course_materials.created_at);

    // Fetch lesson-level materials
    const lessonMaterials =
      lessonIds.length > 0
        ? await db
            .select()
            .from(course_materials)
            .where(
              and(
                eq(course_materials.course_id, courseId),
                inArray(course_materials.lesson_id, lessonIds)
              )
            )
            .orderBy(course_materials.created_at)
        : [];

    // Group materials by lesson ID
    const materialsByLessonId = new Map<string, typeof lessonMaterials>();
    lessonMaterials.forEach((material) => {
      if (material.lesson_id) {
        if (!materialsByLessonId.has(material.lesson_id)) {
          materialsByLessonId.set(material.lesson_id, []);
        }
        materialsByLessonId.get(material.lesson_id)!.push(material);
      }
    });

    // Group lessons by module and add completion status and materials
    // Note: Video URLs are fetched dynamically via /api/my-courses/[courseId]/lessons/[lessonId]/video-url
    // to support both public URLs and signed URLs
    const modulesWithLessons = courseModules.map((module) => {
      const moduleLessons = courseLessons
        .filter((lesson) => lesson.module_id === module.id)
        .map((lesson) => ({
          ...lesson,
          video_url: lesson.video_key ? undefined : null, // Will be fetched dynamically
          completed: completedLessonIds.has(lesson.id),
          materials: materialsByLessonId.get(lesson.id) || [],
        }));

      return {
        ...module,
        lessons: moduleLessons,
      };
    });

    return NextResponse.json({
      course,
      modules: modulesWithLessons,
      enrollment: enrollment[0],
      courseMaterials: courseLevelMaterials, // Course-level materials
    });
  } catch (error) {
    console.error("Error fetching course for learning:", error);
    return NextResponse.json(
      { error: "Failed to fetch course" },
      { status: 500 }
    );
  }
}
