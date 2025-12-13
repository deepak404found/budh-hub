import { NextResponse } from "next/server";
import { db } from "@/db";
import { courses } from "@/db/schema/courses";
import { enrollments } from "@/db/schema/enrollments";
import { eq, and, or, like, desc, asc, sql } from "drizzle-orm";
import { getCurrentUserWithRole } from "@/lib/auth/server";

/**
 * GET /api/courses
 * Get all published courses (for browsing)
 * Query params: page, limit, category, difficulty, search, sort
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("limit") || "12", 10))
    );
    const category = searchParams.get("category");
    const difficulty = searchParams.get("difficulty");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "newest"; // newest, oldest, title

    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions = [eq(courses.is_published, true)];

    if (category) {
      conditions.push(eq(courses.category, category));
    }

    if (difficulty) {
      conditions.push(eq(courses.difficulty, difficulty));
    }

    if (search) {
      conditions.push(
        or(
          like(courses.title, `%${search}%`),
          like(courses.description, `%${search}%`)
        )!
      );
    }

    // Build order by
    let orderBy;
    switch (sort) {
      case "oldest":
        orderBy = asc(courses.created_at);
        break;
      case "title":
        orderBy = asc(courses.title);
        break;
      case "newest":
      default:
        orderBy = desc(courses.created_at);
        break;
    }

    // Get total count for pagination
    const totalCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(courses)
      .where(and(...conditions));

    const totalCount = Number(totalCountResult[0]?.count || 0);
    const totalPages = Math.ceil(totalCount / limit);

    // Get courses
    const publishedCourses = await db
      .select()
      .from(courses)
      .where(and(...conditions))
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    // Get user's enrollments if authenticated
    const user = await getCurrentUserWithRole();
    let enrolledCourseIds: string[] = [];

    if (user?.id) {
      const userEnrollments = await db
        .select({ course_id: enrollments.course_id })
        .from(enrollments)
        .where(eq(enrollments.learner_id, user.id));

      enrolledCourseIds = userEnrollments.map((e) => e.course_id);
    }

    // Add enrollment status to each course
    const coursesWithEnrollment = publishedCourses.map((course) => ({
      ...course,
      isEnrolled: enrolledCourseIds.includes(course.id),
    }));

    // Get unique categories and difficulties for filters
    const allPublishedCourses = await db
      .select({
        category: courses.category,
        difficulty: courses.difficulty,
      })
      .from(courses)
      .where(eq(courses.is_published, true));

    const categories = Array.from(
      new Set(allPublishedCourses.map((c) => c.category).filter(Boolean))
    ).sort();
    const difficulties = Array.from(
      new Set(allPublishedCourses.map((c) => c.difficulty).filter(Boolean))
    ).sort();

    return NextResponse.json({
      courses: coursesWithEnrollment,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      filters: {
        categories,
        difficulties,
      },
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}
