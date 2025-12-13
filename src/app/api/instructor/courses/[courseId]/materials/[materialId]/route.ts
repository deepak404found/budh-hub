import { NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/auth/server";
import { db } from "@/db";
import { courses } from "@/db/schema/courses";
import { course_materials } from "@/db/schema/course_materials";
import { eq, and } from "drizzle-orm";
import { canEditCourse } from "@/lib/auth/course-permissions";
import { isValidUUID } from "@/lib/utils/uuid";
import { deleteFile } from "@/lib/r2/utils";
import { z } from "zod";

/**
 * Update material schema
 */
const updateMaterialSchema = z.object({
  file_name: z.string().min(1).max(512).optional(),
  material_type: z.enum(["image", "document", "pdf", "other"]).optional(),
});

/**
 * GET /api/instructor/courses/[courseId]/materials/[materialId]
 * Get a specific course material
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ courseId: string; materialId: string }> }
) {
  try {
    const { courseId, materialId } = await params;

    if (!isValidUUID(courseId) || !isValidUUID(materialId)) {
      return NextResponse.json(
        { error: "Invalid course or material ID format" },
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
          error: "Forbidden: You can only view materials for your own courses",
        },
        { status: 403 }
      );
    }

    const [material] = await db
      .select()
      .from(course_materials)
      .where(
        and(
          eq(course_materials.id, materialId),
          eq(course_materials.course_id, courseId)
        )
      )
      .limit(1);

    if (!material) {
      return NextResponse.json(
        { error: "Material not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ material });
  } catch (error) {
    console.error("Error fetching material:", error);
    return NextResponse.json(
      { error: "Failed to fetch material" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/instructor/courses/[courseId]/materials/[materialId]
 * Update a course material
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ courseId: string; materialId: string }> }
) {
  try {
    const { courseId, materialId } = await params;

    if (!isValidUUID(courseId) || !isValidUUID(materialId)) {
      return NextResponse.json(
        { error: "Invalid course or material ID format" },
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
            "Forbidden: You can only update materials for your own courses",
        },
        { status: 403 }
      );
    }

    // Verify material exists and belongs to course
    const [existingMaterial] = await db
      .select()
      .from(course_materials)
      .where(
        and(
          eq(course_materials.id, materialId),
          eq(course_materials.course_id, courseId)
        )
      )
      .limit(1);

    if (!existingMaterial) {
      return NextResponse.json(
        { error: "Material not found or doesn't belong to this course" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const validatedData = updateMaterialSchema.parse(body);

    const updateData: any = {};
    if (validatedData.file_name !== undefined)
      updateData.file_name = validatedData.file_name;
    if (validatedData.material_type !== undefined)
      updateData.material_type = validatedData.material_type;

    const [updatedMaterial] = await db
      .update(course_materials)
      .set(updateData)
      .where(eq(course_materials.id, materialId))
      .returning();

    return NextResponse.json({ material: updatedMaterial });
  } catch (error) {
    console.error("Error updating material:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update material" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/instructor/courses/[courseId]/materials/[materialId]
 * Delete a course material and its file from R2
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ courseId: string; materialId: string }> }
) {
  try {
    const { courseId, materialId } = await params;

    if (!isValidUUID(courseId) || !isValidUUID(materialId)) {
      return NextResponse.json(
        { error: "Invalid course or material ID format" },
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

    // Verify material exists and belongs to course
    const [existingMaterial] = await db
      .select()
      .from(course_materials)
      .where(
        and(
          eq(course_materials.id, materialId),
          eq(course_materials.course_id, courseId)
        )
      )
      .limit(1);

    if (!existingMaterial) {
      return NextResponse.json(
        { error: "Material not found or doesn't belong to this course" },
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
    console.error("Error deleting material:", error);
    return NextResponse.json(
      { error: "Failed to delete material" },
      { status: 500 }
    );
  }
}
