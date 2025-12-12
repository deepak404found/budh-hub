import { NextResponse } from "next/server";
import { db } from "@/db";
import { courses } from "@/db/schema/courses";
import { eq } from "drizzle-orm";

/**
 * GET /api/courses
 * Get all published courses (for browsing)
 */
export async function GET() {
  try {
    const publishedCourses = await db
      .select()
      .from(courses)
      .where(eq(courses.is_published, true))
      .orderBy(courses.created_at);

    return NextResponse.json({ courses: publishedCourses });
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}
