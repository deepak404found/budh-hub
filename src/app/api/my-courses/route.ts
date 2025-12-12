import { NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/auth/server";
import { db } from "@/db";
import { courses } from "@/db/schema/courses";
import { enrollments } from "@/db/schema/enrollments";
import { eq, sql } from "drizzle-orm";

/**
 * GET /api/my-courses
 * Get all courses the current user is enrolled in
 */
export async function GET() {
  try {
    const user = await getCurrentUserWithRole();
    if (!user || !user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch enrolled courses
    const enrolledCourses = await db
      .select({
        course: courses,
        enrollment: enrollments,
      })
      .from(enrollments)
      .innerJoin(
        courses,
        eq(sql`${enrollments.course_id}::uuid`, courses.id)
      )
      .where(eq(enrollments.learner_id, user.id));

    return NextResponse.json({ courses: enrolledCourses });
  } catch (error) {
    console.error("Error fetching enrolled courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch enrolled courses" },
      { status: 500 }
    );
  }
}

