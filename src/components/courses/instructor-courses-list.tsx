"use client";

import Link from "next/link";
import { Plus, BookOpen, Eye, EyeOff, Edit } from "lucide-react";
import { useInstructorCourses } from "@/hooks/courses";

export function InstructorCoursesList() {
  const { courses, isLoading, error } = useInstructorCourses();

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
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            My Courses
          </h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {courses.length} course{courses.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <Link
          href="/instructor/courses/new"
          className="inline-flex items-center gap-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          <Plus className="h-4 w-4" />
          Create Course
        </Link>
      </div>

      {/* Courses Grid */}
      {courses.length === 0 ? (
        <div className="rounded-lg border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-800">
          <BookOpen className="mx-auto h-12 w-12 text-zinc-400" />
          <h3 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            No courses yet
          </h3>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Get started by creating your first course
          </p>
          <Link
            href="/instructor/courses/new"
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            <Plus className="h-4 w-4" />
            Create Your First Course
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <div
              key={course.id}
              className="group rounded-lg border border-zinc-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-800"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    {course.title}
                  </h3>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                    {course.description || "No description"}
                  </p>
                  <div className="mt-3 flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
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
                </div>
                <div className="ml-4 flex items-center gap-1">
                  {course.is_published ? (
                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900/20 dark:text-green-400">
                      <Eye className="mr-1 inline h-3 w-3" />
                      Published
                    </span>
                  ) : (
                    <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                      <EyeOff className="mr-1 inline h-3 w-3" />
                      Draft
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <Link
                  href={`/instructor/courses/${course.id}/builder` as any}
                  className="flex-1 rounded-md bg-zinc-100 px-3 py-2 text-center text-sm font-medium text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-600"
                >
                  <Edit className="mr-1 inline h-4 w-4" />
                  Edit
                </Link>
                <Link
                  href={`/courses/${course.id}`}
                  className="flex-1 rounded-md bg-zinc-100 px-3 py-2 text-center text-sm font-medium text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-600"
                >
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

