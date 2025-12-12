import { NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/auth/server";
import { db } from "@/db";
import { courses } from "@/db/schema/courses";
import { modules } from "@/db/schema/modules";
import { lessons } from "@/db/schema/lessons";
import { eq, inArray } from "drizzle-orm";
import { canViewCourse } from "@/lib/auth/course-permissions";
import { isValidUUID } from "@/lib/utils/uuid";

/**
 * GET /api/courses/[courseId]
 * Get course details with modules and lessons
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

    // Validate UUID format to prevent database errors
    if (!isValidUUID(courseId)) {
      return NextResponse.json({ error: "Invalid course ID format" }, { status: 400 });
    }

    const user = await getCurrentUserWithRole();
    const userId = user?.id || "";
    const userRole = user?.role;

    // Fetch course
    const courseResults = await db
      .select()
      .from(courses)
      .where(eq(courses.id, courseId))
      .limit(1);

    if (courseResults.length === 0) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const course = courseResults[0];

    // Check permissions
    const canView = await canViewCourse(userId, courseId, userRole);
    if (!canView) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch modules
    const courseModules = await db
      .select()
      .from(modules)
      .where(eq(modules.course_id, courseId))
      .orderBy(modules.ord);

    // Fetch lessons for all modules
    const moduleIds = courseModules.map((m) => m.id);
    let allLessons: (typeof lessons.$inferSelect)[] = [];
    
    if (moduleIds.length > 0) {
      // Fetch all lessons for all modules using IN clause
      allLessons = await db
        .select()
        .from(lessons)
        .where(inArray(lessons.module_id, moduleIds))
        .orderBy(lessons.ord);
    }

    return NextResponse.json({
      course,
      modules: courseModules,
      lessons: allLessons,
    });
  } catch (error) {
    console.error("Error fetching course:", error);
    return NextResponse.json(
      { error: "Failed to fetch course" },
      { status: 500 }
    );
  }
}

