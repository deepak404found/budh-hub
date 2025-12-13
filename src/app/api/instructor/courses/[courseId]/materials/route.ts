import { NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/auth/server";
import { db } from "@/db";
import { courses } from "@/db/schema/courses";
import { course_materials } from "@/db/schema/course_materials";
import { eq, and, isNull } from "drizzle-orm";
import { canEditCourse } from "@/lib/auth/course-permissions";
import { isValidUUID } from "@/lib/utils/uuid";
import { uploadMaterialSchema } from "@/lib/validations/material";
import { getMaterialType } from "@/lib/validations/material";
import { z } from "zod";

/**
 * Create material schema
 */
const createMaterialSchema = z.object({
  file_name: z.string().min(1, "File name is required").max(512),
  file_key: z.string().min(1, "File key is required").max(1024),
  file_type: z.string().max(100).optional(),
  file_size: z.number().int().min(0).optional(),
  material_type: z.enum(["image", "document", "pdf", "other"]).optional(),
});

/**
 * GET /api/instructor/courses/[courseId]/materials
 * List all course-level materials (lesson_id is null)
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;

    if (!isValidUUID(courseId)) {
      return NextResponse.json(
        { error: "Invalid course ID format" },
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

    // Get course-level materials (lesson_id is null)
    const materials = await db
      .select()
      .from(course_materials)
      .where(
        and(
          eq(course_materials.course_id, courseId),
          isNull(course_materials.lesson_id)
        )
      )
      .orderBy(course_materials.created_at);

    return NextResponse.json({ materials });
  } catch (error) {
    console.error("Error fetching course materials:", error);
    return NextResponse.json(
      { error: "Failed to fetch materials" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/instructor/courses/[courseId]/materials
 * Create a new course-level material
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;

    if (!isValidUUID(courseId)) {
      return NextResponse.json(
        { error: "Invalid course ID format" },
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
            "Forbidden: You can only create materials for your own courses",
        },
        { status: 403 }
      );
    }

    // Verify course exists
    const [course] = await db
      .select()
      .from(courses)
      .where(eq(courses.id, courseId))
      .limit(1);

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const body = await req.json();
    const validatedData = createMaterialSchema.parse(body);

    // Determine material type from file_type if not provided
    const materialType =
      validatedData.material_type ||
      (validatedData.file_type
        ? getMaterialType(validatedData.file_type)
        : "other");

    const [newMaterial] = await db
      .insert(course_materials)
      .values({
        course_id: courseId,
        lesson_id: null, // Course-level material
        file_name: validatedData.file_name,
        file_key: validatedData.file_key,
        file_type: validatedData.file_type || null,
        file_size: validatedData.file_size || null,
        material_type: materialType,
      })
      .returning();

    return NextResponse.json({ material: newMaterial }, { status: 201 });
  } catch (error) {
    console.error("Error creating course material:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create material" },
      { status: 500 }
    );
  }
}
