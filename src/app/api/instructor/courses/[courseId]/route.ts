import { NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/auth/server";
import { db } from "@/db";
import { courses } from "@/db/schema/courses";
import { eq } from "drizzle-orm";
import { updateCourseSchema } from "@/lib/validations/course";
import { canEditCourse } from "@/lib/auth/course-permissions";
import { deleteFile } from "@/lib/r2/utils";
import { isValidUUID } from "@/lib/utils/uuid";

/**
 * GET /api/instructor/courses/[courseId]
 * Get course details
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
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!user.id) {
      return NextResponse.json({ error: "User ID not found" }, { status: 401 });
    }

    const canEdit = await canEditCourse(user.id, courseId);
    if (!canEdit) {
      return NextResponse.json({ error: "Forbidden: You can only view your own courses" }, { status: 403 });
    }

    const courseResults = await db
      .select()
      .from(courses)
      .where(eq(courses.id, courseId))
      .limit(1);

    if (courseResults.length === 0) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json({ course: courseResults[0] });
  } catch (error) {
    console.error("Error fetching course:", error);
    return NextResponse.json(
      { error: "Failed to fetch course" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/instructor/courses/[courseId]
 * Update course
 */
export async function PATCH(
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
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!user.id) {
      return NextResponse.json({ error: "User ID not found" }, { status: 401 });
    }

    const canEdit = await canEditCourse(user.id, courseId);
    if (!canEdit) {
      return NextResponse.json({ error: "Forbidden: You can only edit your own courses" }, { status: 403 });
    }

    const body = await req.json();
    const validatedData = updateCourseSchema.parse(body);

    // Build update object
    const updateData: any = {};
    if (validatedData.title !== undefined) updateData.title = validatedData.title;
    if (validatedData.description !== undefined) updateData.description = validatedData.description;
    if (validatedData.category !== undefined) updateData.category = validatedData.category;
    if (validatedData.difficulty !== undefined) updateData.difficulty = validatedData.difficulty;
    if (validatedData.thumbnail_url !== undefined) updateData.thumbnail_url = validatedData.thumbnail_url;
    if (validatedData.price !== undefined) updateData.price = validatedData.price.toString();

    const [updatedCourse] = await db
      .update(courses)
      .set(updateData)
      .where(eq(courses.id, courseId))
      .returning();

    return NextResponse.json({ course: updatedCourse });
  } catch (error) {
    console.error("Error updating course:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update course" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/instructor/courses/[courseId]
 * Delete course and associated files
 */
export async function DELETE(
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
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!user.id) {
      return NextResponse.json({ error: "User ID not found" }, { status: 401 });
    }

    const canEdit = await canEditCourse(user.id, courseId);
    if (!canEdit) {
      return NextResponse.json({ error: "Forbidden: You can only delete your own courses" }, { status: 403 });
    }

    // Get course to check for thumbnail
    const courseResults = await db
      .select({ thumbnail_url: courses.thumbnail_url })
      .from(courses)
      .where(eq(courses.id, courseId))
      .limit(1);

    if (courseResults.length === 0) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Delete thumbnail from R2 if exists
    if (courseResults[0].thumbnail_url) {
      try {
        // Extract key from URL or use the URL as key
        const thumbnailKey = courseResults[0].thumbnail_url.split("/").pop();
        if (thumbnailKey) {
          await deleteFile(`courses/${courseId}/thumbnails/${thumbnailKey}`);
        }
      } catch (fileError) {
        console.error("Error deleting thumbnail:", fileError);
        // Continue with course deletion even if file deletion fails
      }
    }

    // Delete course (cascade will handle related records if configured)
    await db.delete(courses).where(eq(courses.id, courseId));

    return NextResponse.json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error("Error deleting course:", error);
    return NextResponse.json(
      { error: "Failed to delete course" },
      { status: 500 }
    );
  }
}

