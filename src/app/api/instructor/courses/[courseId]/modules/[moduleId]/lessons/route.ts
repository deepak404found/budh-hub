import { NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/auth/server";
import { db } from "@/db";
import { lessons } from "@/db/schema/lessons";
import { modules } from "@/db/schema/modules";
import { courses } from "@/db/schema/courses";
import { eq, and, inArray } from "drizzle-orm";
import { createLessonSchema, updateLessonSchema } from "@/lib/validations/lesson";
import { canEditCourse } from "@/lib/auth/course-permissions";
import { isValidUUID } from "@/lib/utils/uuid";

/**
 * GET /api/instructor/courses/[courseId]/modules/[moduleId]/lessons
 * List all lessons for a specific module
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ courseId: string; moduleId: string }> }
) {
  try {
    const { courseId, moduleId } = await params;

    // Validate UUIDs
    if (!isValidUUID(courseId) || !isValidUUID(moduleId)) {
      return NextResponse.json(
        { error: "Invalid course or module ID format" },
        { status: 400 }
      );
    }

    const user = await getCurrentUserWithRole();
    if (!user || !user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify module belongs to course and user can edit it
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
        { error: "Forbidden: You can only view lessons for your own courses" },
        { status: 403 }
      );
    }

    const moduleLessons = await db
      .select()
      .from(lessons)
      .where(eq(lessons.module_id, moduleId))
      .orderBy(lessons.ord);

    return NextResponse.json({ lessons: moduleLessons });
  } catch (error) {
    console.error("Error fetching lessons:", error);
    return NextResponse.json(
      { error: "Failed to fetch lessons" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/instructor/courses/[courseId]/modules/[moduleId]/lessons
 * Create a new lesson in a module
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ courseId: string; moduleId: string }> }
) {
  try {
    const { courseId, moduleId } = await params;

    // Validate UUIDs
    if (!isValidUUID(courseId) || !isValidUUID(moduleId)) {
      return NextResponse.json(
        { error: "Invalid course or module ID format" },
        { status: 400 }
      );
    }

    const user = await getCurrentUserWithRole();
    if (!user || !user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
        { error: "Forbidden: You can only create lessons for your own courses" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validatedData = createLessonSchema.parse({
      ...body,
      module_id: moduleId, // Ensure module_id matches the URL parameter
    });

    // Get current lesson count for ordering
    const existingLessons = await db
      .select()
      .from(lessons)
      .where(eq(lessons.module_id, moduleId));

    const [newLesson] = await db
      .insert(lessons)
      .values({
        module_id: moduleId,
        title: validatedData.title,
        content: validatedData.content || null,
        video_key: validatedData.video_key || null,
        video_size: validatedData.video_size || null,
        video_duration: validatedData.video_duration || null,
        video_mime_type: validatedData.video_mime_type || null,
        ord: validatedData.ord ?? existingLessons.length,
      })
      .returning();

    // Update course total_lessons count
    // Get all modules for this course
    const courseModules = await db
      .select({ id: modules.id })
      .from(modules)
      .where(eq(modules.course_id, courseId));
    
    const moduleIds = courseModules.map((m) => m.id);
    let totalLessons = 0;
    
    if (moduleIds.length > 0) {
      const allLessons = await db
        .select()
        .from(lessons)
        .where(inArray(lessons.module_id, moduleIds));
      totalLessons = allLessons.length;
    }
    
    await db
      .update(courses)
      .set({ total_lessons: totalLessons })
      .where(eq(courses.id, courseId));

    return NextResponse.json({ lesson: newLesson }, { status: 201 });
  } catch (error) {
    console.error("Error creating lesson:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create lesson" },
      { status: 500 }
    );
  }
}

