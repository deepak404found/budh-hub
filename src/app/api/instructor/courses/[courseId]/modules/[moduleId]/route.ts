import { NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/auth/server";
import { db } from "@/db";
import { courses } from "@/db/schema/courses";
import { modules } from "@/db/schema/modules";
import { eq, and } from "drizzle-orm";
import { updateModuleSchema } from "@/lib/validations/module";
import { canEditCourse } from "@/lib/auth/course-permissions";

/**
 * GET /api/instructor/courses/[courseId]/modules/[moduleId]
 * Get module details
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ courseId: string; moduleId: string }> }
) {
  try {
    const { courseId, moduleId } = await params;
    if (!courseId || !moduleId) {
      return NextResponse.json({ error: "Course ID and Module ID are required" }, { status: 400 });
    }

    const user = await getCurrentUserWithRole();
    if (!user || !user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const canEdit = await canEditCourse(user.id, courseId);
    if (!canEdit) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const moduleResults = await db
      .select()
      .from(modules)
      .where(and(
        eq(modules.id, moduleId),
        eq(modules.course_id, courseId)
      ))
      .limit(1);

    if (moduleResults.length === 0) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    return NextResponse.json({ module: moduleResults[0] });
  } catch (error) {
    console.error("Error fetching module:", error);
    return NextResponse.json(
      { error: "Failed to fetch module" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/instructor/courses/[courseId]/modules/[moduleId]
 * Update module
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ courseId: string; moduleId: string }> }
) {
  try {
    const { courseId, moduleId } = await params;
    if (!courseId || !moduleId) {
      return NextResponse.json({ error: "Course ID and Module ID are required" }, { status: 400 });
    }

    const user = await getCurrentUserWithRole();
    if (!user || !user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const canEdit = await canEditCourse(user.id, courseId);
    if (!canEdit) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const validatedData = updateModuleSchema.parse(body);

    const updateData: any = {};
    if (validatedData.title !== undefined) updateData.title = validatedData.title;
    if (validatedData.ord !== undefined) updateData.ord = validatedData.ord;

    const [updatedModule] = await db
      .update(modules)
      .set(updateData)
      .where(eq(modules.id, moduleId))
      .returning();

    return NextResponse.json({ module: updatedModule });
  } catch (error) {
    console.error("Error updating module:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update module" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/instructor/courses/[courseId]/modules/[moduleId]
 * Delete module
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ courseId: string; moduleId: string }> }
) {
  try {
    const { courseId, moduleId } = await params;
    if (!courseId || !moduleId) {
      return NextResponse.json({ error: "Course ID and Module ID are required" }, { status: 400 });
    }

    const user = await getCurrentUserWithRole();
    if (!user || !user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const canEdit = await canEditCourse(user.id, courseId);
    if (!canEdit) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.delete(modules).where(eq(modules.id, moduleId));

    return NextResponse.json({ message: "Module deleted successfully" });
  } catch (error) {
    console.error("Error deleting module:", error);
    return NextResponse.json(
      { error: "Failed to delete module" },
      { status: 500 }
    );
  }
}

