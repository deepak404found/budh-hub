"use client";

import Link from "next/link";
import { BookOpen, Play } from "lucide-react";
import type { UserRole } from "@/lib/types/roles";

interface CourseDetailsProps {
  course: {
    id: string;
    title: string;
    description: string | null;
    category: string | null;
    difficulty: string | null;
    thumbnail_url: string | null;
    is_published: boolean;
    instructor_id: string;
  };
  modules: Array<{
    id: string;
    title: string;
    ord: number;
  }>;
  lessons: Array<{
    id: string;
    title: string;
    ord: number;
  }>;
  userId: string;
  userRole: UserRole;
  onEnroll: () => void;
  isEnrolling: boolean;
}

export function CourseDetails({
  course,
  modules,
  lessons,
  userId,
  userRole,
  onEnroll,
  isEnrolling,
}: CourseDetailsProps) {
  const isInstructor = course.instructor_id === userId || userRole === "ADMIN";

  return (
    <div className="space-y-6">
      {/* Course Header */}
      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-800">
        {course.thumbnail_url && (
          <div className="mb-6 aspect-video w-full overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-700">
            <img
              src={course.thumbnail_url}
              alt={course.title}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          {course.title}
        </h1>

        {course.description && (
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">{course.description}</p>
        )}

        <div className="mt-4 flex items-center gap-4">
          {course.category && (
            <span className="rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300">
              {course.category}
            </span>
          )}
          {course.difficulty && (
            <span className="rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300">
              {course.difficulty}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6">
          {isInstructor ? (
            <Link
              href={`/instructor/courses/${course.id}/builder` as any}
              className="inline-flex items-center gap-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              <BookOpen className="h-4 w-4" />
              Manage Course
            </Link>
          ) : (
            <button
              onClick={onEnroll}
              disabled={isEnrolling}
              className="inline-flex items-center gap-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              <Play className="h-4 w-4" />
              {isEnrolling ? "Enrolling..." : "Enroll Now"}
            </button>
          )}
        </div>
      </div>

      {/* Course Curriculum */}
      {modules.length > 0 && (
        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-800">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Course Curriculum
          </h2>
          <div className="mt-4 space-y-4">
            {modules.map((module) => (
              <div key={module.id} className="border-l-2 border-zinc-200 pl-4 dark:border-zinc-700">
                <h3 className="font-medium text-zinc-900 dark:text-zinc-100">
                  {module.title}
                </h3>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {lessons.length} lesson{lessons.length !== 1 ? "s" : ""}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

