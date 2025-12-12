import { db } from "@/db";
import { courses } from "@/db/schema/courses";
import { eq, and } from "drizzle-orm";

/**
 * Check if a user can edit a course
 * Only the course instructor can edit their own courses
 */
export async function canEditCourse(userId: string, courseId: string): Promise<boolean> {
  try {
    const courseResults = await db
      .select({ instructor_id: courses.instructor_id })
      .from(courses)
      .where(eq(courses.id, courseId))
      .limit(1);

    if (courseResults.length === 0) {
      return false;
    }

    return courseResults[0].instructor_id === userId;
  } catch (error) {
    console.error("Error checking course edit permission:", error);
    return false;
  }
}

/**
 * Check if a user can view a course
 * Anyone can view published courses, or instructors can view their own courses
 */
export async function canViewCourse(userId: string, courseId: string, userRole?: string): Promise<boolean> {
  try {
    const courseResults = await db
      .select({
        instructor_id: courses.instructor_id,
        is_published: courses.is_published,
      })
      .from(courses)
      .where(eq(courses.id, courseId))
      .limit(1);

    if (courseResults.length === 0) {
      return false;
    }

    const course = courseResults[0];

    // Instructors can always view their own courses
    if (course.instructor_id === userId) {
      return true;
    }

    // Published courses can be viewed by anyone
    if (course.is_published) {
      return true;
    }

    // Admins can view any course
    if (userRole === "ADMIN") {
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error checking course view permission:", error);
    return false;
  }
}

/**
 * Check if a user is enrolled in a course
 */
export async function isEnrolled(userId: string, courseId: string): Promise<boolean> {
  try {
    const { enrollments } = await import("@/db/schema/enrollments");
    const enrollmentResults = await db
      .select()
      .from(enrollments)
      .where(and(
        eq(enrollments.course_id, courseId),
        eq(enrollments.learner_id, userId)
      ))
      .limit(1);

    return enrollmentResults.length > 0;
  } catch (error) {
    console.error("Error checking enrollment:", error);
    return false;
  }
}

