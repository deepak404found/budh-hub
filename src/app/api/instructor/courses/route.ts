import { NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/auth/server";
import { db } from "@/db";
import { courses } from "@/db/schema/courses";
import { eq } from "drizzle-orm";
import { createCourseSchema } from "@/lib/validations/course";
import { isInstructor } from "@/lib/types/roles";

/**
 * GET /api/instructor/courses
 * List all courses for the current instructor
 */
export async function GET() {
  try {
    const user = await getCurrentUserWithRole();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isInstructor(user.role)) {
      return NextResponse.json({ error: "Forbidden: Instructor access required" }, { status: 403 });
    }

    if (!user.id) {
      return NextResponse.json({ error: "User ID not found" }, { status: 401 });
    }

    const instructorCourses = await db
      .select()
      .from(courses)
      .where(eq(courses.instructor_id, user.id))
      .orderBy(courses.created_at);

    return NextResponse.json({ courses: instructorCourses });
  } catch (error) {
    console.error("Error fetching instructor courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/instructor/courses
 * Create a new course
 */
export async function POST(req: Request) {
  try {
    const user = await getCurrentUserWithRole();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isInstructor(user.role)) {
      return NextResponse.json({ error: "Forbidden: Instructor access required" }, { status: 403 });
    }

    const body = await req.json();
    const validatedData = createCourseSchema.parse(body);

    if (!user.id) {
      return NextResponse.json({ error: "User ID not found" }, { status: 401 });
    }

    const [newCourse] = await db
      .insert(courses)
      .values({
        instructor_id: user.id,
        title: validatedData.title,
        description: validatedData.description || null,
        category: validatedData.category || null,
        difficulty: validatedData.difficulty || null,
        thumbnail_url: validatedData.thumbnail_url || null,
        price: validatedData.price?.toString() || null,
        is_published: false,
        total_lessons: 0,
      })
      .returning();

    return NextResponse.json({ course: newCourse }, { status: 201 });
  } catch (error) {
    console.error("Error creating course:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create course" },
      { status: 500 }
    );
  }
}

