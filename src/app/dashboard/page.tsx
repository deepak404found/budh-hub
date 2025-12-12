import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/server";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/auth/sign-in" as any);
  }

  // Get user role from session (will be enhanced when we link NextAuth with DB)
  const userRole = (session.user as any)?.role || "LEARNER";

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-12 dark:bg-zinc-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            Welcome to your Dashboard
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            {userRole === "INSTRUCTOR"
              ? "Manage your courses and track learner progress"
              : "Continue your learning journey"}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {userRole === "INSTRUCTOR" ? (
            <>
              <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-800">
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                  Create Course
                </h2>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  Start building your first course
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
                  View and manage your courses
                </p>
                <Link
                  href={"/courses" as any}
                  className="mt-4 inline-block rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  View Courses
                </Link>
              </div>
            </>
          ) : (
            <>
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
                  Continue your enrolled courses
                </p>
                <Link
                  href={"/my-courses" as any}
                  className="mt-4 inline-block rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  My Courses
                </Link>
              </div>
            </>
          )}
        </div>

        <div className="mt-8">
          <Link
            href={"/auth/sign-in" as any}
            className="text-sm text-zinc-600 hover:text-zinc-500 dark:text-zinc-400 dark:hover:text-zinc-300"
          >
            Sign out
          </Link>
        </div>
      </div>
    </div>
  );
}

