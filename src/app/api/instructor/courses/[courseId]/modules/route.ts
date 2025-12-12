import { NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/auth/server";
import { db } from "@/db";
import { courses } from "@/db/schema/courses";
import { modules } from "@/db/schema/modules";
import { eq } from "drizzle-orm";
import { createModuleSchema } from "@/lib/validations/module";
import { canEditCourse } from "@/lib/auth/course-permissions";
import { isValidUUID } from "@/lib/utils/uuid";

/**
 * GET /api/instructor/courses/[courseId]/modules
 * List all modules for a course
 */
export async function GET(
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

    const canEdit = await canEditCourse(user.id, courseId);
    if (!canEdit) {
      return NextResponse.json({ error: "Forbidden: You can only view your own courses" }, { status: 403 });
    }

    const courseModules = await db
      .select()
      .from(modules)
      .where(eq(modules.course_id, courseId))
      .orderBy(modules.ord);

    return NextResponse.json({ modules: courseModules });
  } catch (error) {
    console.error("Error fetching modules:", error);
    return NextResponse.json(
      { error: "Failed to fetch modules" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/instructor/courses/[courseId]/modules
 * Create a new module
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

    const canEdit = await canEditCourse(user.id, courseId);
    if (!canEdit) {
      return NextResponse.json({ error: "Forbidden: You can only create modules for your own courses" }, { status: 403 });
    }

    const body = await req.json();
    const validatedData = createModuleSchema.parse({
      ...body,
      course_id: courseId,
    });

    const [newModule] = await db
      .insert(modules)
      .values({
        course_id: validatedData.course_id,
        title: validatedData.title,
        ord: validatedData.ord,
      })
      .returning();

    return NextResponse.json({ module: newModule }, { status: 201 });
  } catch (error) {
    console.error("Error creating module:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create module" },
      { status: 500 }
    );
  }
}

