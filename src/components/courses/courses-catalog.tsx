"use client";

import Link from "next/link";
import { BookOpen } from "lucide-react";
import { useCourses } from "@/hooks/courses";

export function CoursesCatalog() {
  const { courses, isLoading, error } = useCourses();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-zinc-600 dark:text-zinc-400">Loading courses...</div>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Available Courses
        </h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {courses.length} course{courses.length !== 1 ? "s" : ""} available
        </p>
      </div>

      {/* Courses Grid */}
      {courses.length === 0 ? (
        <div className="rounded-lg border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-800">
          <BookOpen className="mx-auto h-12 w-12 text-zinc-400" />
          <h3 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            No courses available yet
          </h3>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Check back later for new courses
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Link
              key={course.id}
              href={`/courses/${course.id}`}
              className="group rounded-lg border border-zinc-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-800"
            >
              {course.thumbnail_url && (
                <div className="mb-4 aspect-video w-full overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-700">
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                {course.title}
              </h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                {course.description || "No description available"}
              </p>
              <div className="mt-4 flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
                {course.category && (
                  <span className="rounded-full bg-zinc-100 px-2 py-1 dark:bg-zinc-700">
                    {course.category}
                  </span>
                )}
                {course.difficulty && (
                  <span className="rounded-full bg-zinc-100 px-2 py-1 dark:bg-zinc-700">
                    {course.difficulty}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

