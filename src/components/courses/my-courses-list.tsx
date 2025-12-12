"use client";

import Link from "next/link";
import { BookOpen, Play, CheckCircle } from "lucide-react";
import { useMyCourses } from "@/hooks/courses";

export function MyCoursesList() {
  const { courses, isLoading, error } = useMyCourses();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-zinc-600 dark:text-zinc-400">Loading your courses...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
        Error: {error}
      </div>
    );
  }

  // Calculate progress categories
  const inProgressCourses = courses.filter(
    (item) => (item.enrollment.progress || 0) > 0 && (item.enrollment.progress || 0) < 100
  );
  const completedCourses = courses.filter(
    (item) => (item.enrollment.progress || 0) === 100
  );

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-800">
          <div className="text-sm text-zinc-600 dark:text-zinc-400">Total Courses</div>
          <div className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {courses.length}
          </div>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-800">
          <div className="text-sm text-zinc-600 dark:text-zinc-400">In Progress</div>
          <div className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {inProgressCourses.length}
          </div>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-800">
          <div className="text-sm text-zinc-600 dark:text-zinc-400">Completed</div>
          <div className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {completedCourses.length}
          </div>
        </div>
      </div>

      {/* Courses List */}
      {courses.length === 0 ? (
        <div className="rounded-lg border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-800">
          <BookOpen className="mx-auto h-12 w-12 text-zinc-400" />
          <h3 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            No enrolled courses yet
          </h3>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Browse available courses to get started
          </p>
          <Link
            href="/courses"
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map(({ course, enrollment }) => {
            const progress = enrollment.progress || 0;
            const isCompleted = progress === 100;

            return (
              <div
                key={course.id}
                className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-800"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                      {course.title}
                    </h3>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                      {course.description || "No description"}
                    </p>
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-600 dark:text-zinc-400">Progress</span>
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">
                          {progress}%
                        </span>
                      </div>
                      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                        <div
                          className="h-full bg-zinc-900 transition-all dark:bg-zinc-100"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="ml-4">
                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800 dark:bg-green-900/20 dark:text-green-400">
                        <CheckCircle className="h-4 w-4" />
                        Completed
                      </span>
                    ) : (
                      <Link
                        href={`/my-courses/${course.id}` as any}
                        className="inline-flex items-center gap-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                      >
                        <Play className="h-4 w-4" />
                        {progress > 0 ? "Continue" : "Start"}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

