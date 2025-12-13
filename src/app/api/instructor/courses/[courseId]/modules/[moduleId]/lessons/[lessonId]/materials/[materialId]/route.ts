import { NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/auth/server";
import { db } from "@/db";
import { modules } from "@/db/schema/modules";
import { lessons } from "@/db/schema/lessons";
import { course_materials } from "@/db/schema/course_materials";
import { eq, and } from "drizzle-orm";
import { canEditCourse } from "@/lib/auth/course-permissions";
import { isValidUUID } from "@/lib/utils/uuid";
import { deleteFile } from "@/lib/r2/utils";

/**
 * DELETE /api/instructor/courses/[courseId]/modules/[moduleId]/lessons/[lessonId]/materials/[materialId]
 * Delete a lesson material and its file from R2
 */
export async function DELETE(
  req: Request,
  {
    params,
  }: {
    params: Promise<{
      courseId: string;
      moduleId: string;
      lessonId: string;
      materialId: string;
    }>;
  }
) {
  try {
    const { courseId, moduleId, lessonId, materialId } = await params;

    if (
      !isValidUUID(courseId) ||
      !isValidUUID(moduleId) ||
      !isValidUUID(lessonId) ||
      !isValidUUID(materialId)
    ) {
      return NextResponse.json(
        {
          error: "Invalid course, module, lesson, or material ID format",
        },
        { status: 400 }
      );
    }

    const user = await getCurrentUserWithRole();
    if (!user || !user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const canEdit = await canEditCourse(user.id, courseId);
    if (!canEdit) {
      return NextResponse.json(
        {
          error:
            "Forbidden: You can only delete materials for your own courses",
        },
        { status: 403 }
      );
    }

    // Verify lesson belongs to module and course
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

    const [lesson] = await db
      .select()
      .from(lessons)
      .where(and(eq(lessons.id, lessonId), eq(lessons.module_id, moduleId)))
      .limit(1);

    if (!lesson) {
      return NextResponse.json(
        { error: "Lesson not found or doesn't belong to this module" },
        { status: 404 }
      );
    }

    // Verify material exists and belongs to lesson
    const [existingMaterial] = await db
      .select()
      .from(course_materials)
      .where(
        and(
          eq(course_materials.id, materialId),
          eq(course_materials.course_id, courseId),
          eq(course_materials.lesson_id, lessonId)
        )
      )
      .limit(1);

    if (!existingMaterial) {
      return NextResponse.json(
        {
          error: "Material not found or doesn't belong to this lesson",
        },
        { status: 404 }
      );
    }

    // Delete file from R2
    if (existingMaterial.file_key) {
      try {
        await deleteFile(existingMaterial.file_key);
      } catch (fileError) {
        console.error("Error deleting file from R2:", fileError);
        // Continue with material deletion even if file deletion fails
      }
    }

    // Delete material from database
    await db
      .delete(course_materials)
      .where(eq(course_materials.id, materialId));

    return NextResponse.json({ message: "Material deleted successfully" });
  } catch (error) {
    console.error("Error deleting lesson material:", error);
    return NextResponse.json(
      { error: "Failed to delete material" },
      { status: 500 }
    );
  }
}
