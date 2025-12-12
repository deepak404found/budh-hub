import Link from "next/link";
import { db } from "@/db";
import { courses } from "@/db/schema/courses";
import { enrollments } from "@/db/schema/enrollments";
import { eq, sql } from "drizzle-orm";

interface LearnerDashboardProps {
  userId: string;
}

export async function LearnerDashboard({ userId }: LearnerDashboardProps) {
  // Fetch enrolled courses
  // Note: Cast course_id to UUID for proper join (enrollments.course_id is text, courses.id is UUID)
  const enrolledCourses = await db
    .select({
      course: courses,
      enrollment: enrollments,
    })
    .from(enrollments)
    .innerJoin(
      courses,
      sql`${enrollments.course_id}::uuid = ${courses.id}`
    )
    .where(eq(enrollments.learner_id, userId));

  // Calculate average progress
  const totalProgress =
    enrolledCourses.reduce((sum, item) => sum + (item.enrollment.progress || 0), 0) /
    (enrolledCourses.length || 1);

  // Get in-progress courses (progress > 0 and < 100)
  const inProgressCourses = enrolledCourses.filter(
    (item) => (item.enrollment.progress || 0) > 0 && (item.enrollment.progress || 0) < 100
  );

  // Get completed courses (progress === 100)
  const completedCourses = enrolledCourses.filter(
    (item) => (item.enrollment.progress || 0) === 100
  );

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          Learner Dashboard
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Continue your learning journey and track your progress
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Enrolled Courses
              </p>
              <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                {enrolledCourses.length}
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
                In Progress
              </p>
              <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                {inProgressCourses.length}
              </p>
            </div>
            <div className="rounded-full bg-yellow-100 p-3 dark:bg-yellow-900/20">
              <svg
                className="h-6 w-6 text-yellow-600 dark:text-yellow-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Completed
              </p>
              <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                {completedCourses.length}
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
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-800">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Browse Courses
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Discover new courses to enroll in
          </p>
          <Link
            href={"/courses" as any}
            className="mt-4 inline-block rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Browse Courses
          </Link>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-800">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            My Learning
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Continue your enrolled courses and track progress
          </p>
          <Link
            href={"/my-courses" as any}
            className="mt-4 inline-block rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            My Courses
          </Link>
        </div>

        {inProgressCourses.length > 0 && (
          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-800">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              Continue Learning
            </h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              {inProgressCourses.length} course{inProgressCourses.length !== 1 ? "s" : ""} in progress
            </p>
            <Link
              href={"/my-courses?filter=in-progress" as any}
              className="mt-4 inline-block rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Continue
            </Link>
          </div>
        )}

        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-800">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Learning Statistics
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            View your learning progress and achievements
          </p>
          <Link
            href={"/my-courses/stats" as any}
            className="mt-4 inline-block rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            View Stats
          </Link>
        </div>
      </div>
    </div>
  );
}

