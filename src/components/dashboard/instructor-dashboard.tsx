import Link from "next/link";
import { db } from "@/db";
import { courses } from "@/db/schema/courses";
import { enrollments } from "@/db/schema/enrollments";
import { users } from "@/db/schema/users";
import { eq, count, sql } from "drizzle-orm";

interface InstructorDashboardProps {
  userId: string;
}

export async function InstructorDashboard({ userId }: InstructorDashboardProps) {
  // Fetch instructor's courses
  const instructorCourses = await db
    .select()
    .from(courses)
    .where(eq(courses.instructor_id, userId));

  // Count total students enrolled in instructor's courses
  // Note: Cast course_id to UUID for proper join (enrollments.course_id is text, courses.id is UUID)
  const totalStudentsResult = await db
    .select({ count: count() })
    .from(enrollments)
    .innerJoin(
      courses,
      sql`${enrollments.course_id}::uuid = ${courses.id}`
    )
    .where(eq(courses.instructor_id, userId));

  const totalStudents = totalStudentsResult[0]?.count || 0;

  // Count published courses
  const publishedCourses = instructorCourses.filter((c) => c.is_published).length;

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          Instructor Dashboard
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Manage your courses and track learner progress
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                My Courses
              </p>
              <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                {instructorCourses.length}
              </p>
            </div>
            <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/20">
              <svg
                className="h-6 w-6 text-blue-600 dark:text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Published Courses
              </p>
              <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                {publishedCourses}
              </p>
            </div>
            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/20">
              <svg
                className="h-6 w-6 text-green-600 dark:text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Total Students
              </p>
              <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                {totalStudents}
              </p>
            </div>
            <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/20">
              <svg
                className="h-6 w-6 text-purple-600 dark:text-purple-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Management Sections */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-800">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Create Course
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Start building your first course or add a new one
          </p>
          <Link
            href={"/courses/new" as any}
            className="mt-4 inline-block rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Create Course
          </Link>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-800">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            My Courses
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            View and manage all your courses
          </p>
          <Link
            href={"/courses" as any}
            className="mt-4 inline-block rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            View Courses
          </Link>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-800">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            My Students
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            View all students enrolled in your courses
          </p>
          <Link
            href={"/instructor/students" as any}
            className="mt-4 inline-block rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            View Students
          </Link>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-800">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Analytics
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Track course performance and student progress
          </p>
          <Link
            href={"/instructor/analytics" as any}
            className="mt-4 inline-block rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            View Analytics
          </Link>
        </div>
      </div>
    </div>
  );
}

