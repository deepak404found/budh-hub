import { NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/auth/server";
import { db } from "@/db";
import { lessons } from "@/db/schema/lessons";
import { modules } from "@/db/schema/modules";
import { courses } from "@/db/schema/courses";
import { course_materials } from "@/db/schema/course_materials";
import { eq, and, inArray } from "drizzle-orm";
import { updateLessonSchema } from "@/lib/validations/lesson";
import { canEditCourse } from "@/lib/auth/course-permissions";
import { isValidUUID } from "@/lib/utils/uuid";
import { deleteFile } from "@/lib/r2/utils";

/**
 * GET /api/instructor/courses/[courseId]/modules/[moduleId]/lessons/[lessonId]
 * Get a specific lesson
 */
export async function GET(
  req: Request,
  {
    params,
  }: {
    params: Promise<{ courseId: string; moduleId: string; lessonId: string }>;
  }
) {
  try {
    const { courseId, moduleId, lessonId } = await params;

    // Validate UUIDs
    if (
      !isValidUUID(courseId) ||
      !isValidUUID(moduleId) ||
      !isValidUUID(lessonId)
    ) {
      return NextResponse.json(
        { error: "Invalid course, module, or lesson ID format" },
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
        { error: "Forbidden: You can only view lessons for your own courses" },
        { status: 403 }
      );
    }

    const [lesson] = await db
      .select()
      .from(lessons)
      .where(and(eq(lessons.id, lessonId), eq(lessons.module_id, moduleId)))
      .limit(1);

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    return NextResponse.json({ lesson });
  } catch (error) {
    console.error("Error fetching lesson:", error);
    return NextResponse.json(
      { error: "Failed to fetch lesson" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/instructor/courses/[courseId]/modules/[moduleId]/lessons/[lessonId]
 * Update a lesson
 */
export async function PATCH(
  req: Request,
  {
    params,
  }: {
    params: Promise<{ courseId: string; moduleId: string; lessonId: string }>;
  }
) {
  try {
    const { courseId, moduleId, lessonId } = await params;

    // Validate UUIDs
    if (
      !isValidUUID(courseId) ||
      !isValidUUID(moduleId) ||
      !isValidUUID(lessonId)
    ) {
      return NextResponse.json(
        { error: "Invalid course, module, or lesson ID format" },
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
        {
          error: "Forbidden: You can only update lessons for your own courses",
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

    const body = await req.json();
    const validatedData = updateLessonSchema.parse(body);

    const [updatedLesson] = await db
      .update(lessons)
      .set({
        ...(validatedData.title !== undefined && {
          title: validatedData.title,
        }),
        ...(validatedData.content !== undefined && {
          content: validatedData.content || null,
        }),
        ...(validatedData.video_key !== undefined && {
          video_key: validatedData.video_key || null,
        }),
        ...(validatedData.video_size !== undefined && {
          video_size: validatedData.video_size || null,
        }),
        ...(validatedData.video_duration !== undefined && {
          video_duration: validatedData.video_duration || null,
        }),
        ...(validatedData.video_mime_type !== undefined && {
          video_mime_type: validatedData.video_mime_type || null,
        }),
        ...(validatedData.ord !== undefined && { ord: validatedData.ord }),
      })
      .where(eq(lessons.id, lessonId))
      .returning();

    return NextResponse.json({ lesson: updatedLesson });
  } catch (error) {
    console.error("Error updating lesson:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update lesson" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/instructor/courses/[courseId]/modules/[moduleId]/lessons/[lessonId]
 * Delete a lesson
 */
export async function DELETE(
  req: Request,
  {
    params,
  }: {
    params: Promise<{ courseId: string; moduleId: string; lessonId: string }>;
  }
) {
  try {
    const { courseId, moduleId, lessonId } = await params;

    // Validate UUIDs
    if (
      !isValidUUID(courseId) ||
      !isValidUUID(moduleId) ||
      !isValidUUID(lessonId)
    ) {
      return NextResponse.json(
        { error: "Invalid course, module, or lesson ID format" },
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
        {
          error: "Forbidden: You can only delete lessons for your own courses",
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

    // Delete video from R2 if video_key exists
    if (existingLesson.video_key) {
      try {
        await deleteFile(existingLesson.video_key);
      } catch (fileError) {
        console.error("Error deleting video from R2:", fileError);
        // Continue with lesson deletion even if file deletion fails
      }
    }

    // Delete lesson materials from R2 and database
    const lessonMaterials = await db
      .select()
      .from(course_materials)
      .where(eq(course_materials.lesson_id, lessonId));

    for (const material of lessonMaterials) {
      if (material.file_key) {
        try {
          await deleteFile(material.file_key);
        } catch (fileError) {
          console.error(
            `Error deleting material ${material.id} from R2:`,
            fileError
          );
        }
      }
    }

    // Delete materials from database
    if (lessonMaterials.length > 0) {
      await db
        .delete(course_materials)
        .where(eq(course_materials.lesson_id, lessonId));
    }

    await db.delete(lessons).where(eq(lessons.id, lessonId));

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

    return NextResponse.json({ message: "Lesson deleted successfully" });
  } catch (error) {
    console.error("Error deleting lesson:", error);
    return NextResponse.json(
      { error: "Failed to delete lesson" },
      { status: 500 }
    );
  }
}
