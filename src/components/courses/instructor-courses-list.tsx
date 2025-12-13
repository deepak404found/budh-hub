"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, BookOpen, Eye, EyeOff, Edit, Upload } from "lucide-react";
import { useInstructorCourses, usePublishCourse } from "@/hooks/courses";

export function InstructorCoursesList() {
  const { courses, isLoading, error, refetch } = useInstructorCourses();
  const { publish, isPublishing } = usePublishCourse();
  const [publishingCourseId, setPublishingCourseId] = useState<string | null>(null);

  const handleTogglePublish = async (courseId: string, currentStatus: boolean) => {
    setPublishingCourseId(courseId);
    try {
      await publish(courseId, !currentStatus);
      refetch(); // Refresh the list after publishing
    } finally {
      setPublishingCourseId(null);
    }
  };

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
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      course.is_published
                        ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                    }`}
                  >
                    {course.is_published ? (
                      <>
                        <Eye className="mr-1 inline h-3 w-3" />
                        Published
                      </>
                    ) : (
                      <>
                        <EyeOff className="mr-1 inline h-3 w-3" />
                        Draft
                      </>
                    )}
                  </span>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {/* Publish/Unpublish Button - Always visible and prominent */}
                <button
                  onClick={() => handleTogglePublish(course.id, course.is_published || false)}
                  disabled={publishingCourseId === course.id || isPublishing}
                  className={`w-full rounded-md px-4 py-3 text-center text-sm font-semibold text-white shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors ${
                    course.is_published
                      ? "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500 dark:bg-yellow-700 dark:hover:bg-yellow-600"
                      : "bg-green-600 hover:bg-green-700 focus:ring-green-500 dark:bg-green-700 dark:hover:bg-green-600"
                  }`}
                  title={course.is_published ? "Unpublish this course to hide it from learners" : "Publish this course to make it visible to learners"}
                >
                  {course.is_published ? (
                    <>
                      <EyeOff className="mr-2 inline h-4 w-4" />
                      {publishingCourseId === course.id ? "Unpublishing..." : "Unpublish Course"}
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 inline h-4 w-4" />
                      {publishingCourseId === course.id ? "Publishing..." : "Publish Course"}
                    </>
                  )}
                </button>
                
                {/* Action Buttons Row */}
                <div className="flex items-center gap-2">
                  <Link
                    href={`/instructor/courses/${course.id}/builder` as any}
                    className="flex-1 rounded-md bg-zinc-100 px-3 py-2 text-center text-sm font-medium text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-600"
                  >
                    <Edit className="mr-1 inline h-4 w-4" />
                    Edit
                  </Link>
                  {course.is_published && (
                    <Link
                      href={`/courses/${course.id}`}
                      className="flex-1 rounded-md bg-zinc-100 px-3 py-2 text-center text-sm font-medium text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-600"
                    >
                      View
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

