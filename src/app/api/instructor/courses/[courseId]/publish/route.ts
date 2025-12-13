import { NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/auth/server";
import { db } from "@/db";
import { courses } from "@/db/schema/courses";
import { eq } from "drizzle-orm";
import { canEditCourse } from "@/lib/auth/course-permissions";
import { isValidUUID } from "@/lib/utils/uuid";

/**
 * POST /api/instructor/courses/[courseId]/publish
 * Publish or unpublish a course
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );
    }

    // Validate UUID format
    if (!isValidUUID(courseId)) {
      return NextResponse.json(
        { error: "Invalid course ID format" },
        { status: 400 }
      );
    }

    const user = await getCurrentUserWithRole();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!user.id) {
      return NextResponse.json({ error: "User ID not found" }, { status: 401 });
    }

    const canEdit = await canEditCourse(user.id, courseId);
    if (!canEdit) {
      return NextResponse.json(
        { error: "Forbidden: You can only publish your own courses" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { is_published } = body;

    if (typeof is_published !== "boolean") {
      return NextResponse.json(
        { error: "is_published must be a boolean" },
        { status: 400 }
      );
    }

    const [updatedCourse] = await db
      .update(courses)
      .set({ is_published })
      .where(eq(courses.id, courseId))
      .returning();

    if (!updatedCourse) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json({
      course: updatedCourse,
      message: is_published
        ? "Course published successfully"
        : "Course unpublished successfully",
    });
  } catch (error) {
    console.error("Error publishing course:", error);

    // Check if it's a database connection error
    if (error instanceof Error && error.message.includes("DbHandler")) {
      console.error(
        "Database connection error - pool may be exhausted or connection lost"
      );
      return NextResponse.json(
        { error: "Database connection error. Please try again." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update course publish status" },
      { status: 500 }
    );
  }
}
