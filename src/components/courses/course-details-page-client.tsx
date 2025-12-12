"use client";

import { useCourseDetails, useEnrollCourse } from "@/hooks/courses";
import { CourseDetails } from "./course-details";
import type { UserRole } from "@/lib/types/roles";

interface CourseDetailsPageClientProps {
  courseId: string;
  userId: string;
  userRole: UserRole;
}

export function CourseDetailsPageClient({
  courseId,
  userId,
  userRole,
}: CourseDetailsPageClientProps) {
  const { courseDetails, isLoading, error } = useCourseDetails(courseId);
  const { enroll, isEnrolling } = useEnrollCourse();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-zinc-600 dark:text-zinc-400">Loading course details...</div>
      </div>
    );
  }

  if (error || !courseDetails) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
        {error || "Course not found"}
      </div>
    );
  }

  return (
    <CourseDetails
      course={{
        id: courseDetails.course.id,
        title: courseDetails.course.title,
        description: courseDetails.course.description,
        category: courseDetails.course.category,
        difficulty: courseDetails.course.difficulty,
        thumbnail_url: courseDetails.course.thumbnail_url,
        is_published: courseDetails.course.is_published || false,
        instructor_id: courseDetails.course.instructor_id,
      }}
      modules={courseDetails.modules.map((m) => ({
        id: m.id,
        title: m.title,
        ord: m.ord || 0,
      }))}
      lessons={courseDetails.lessons.map((l) => ({
        id: l.id,
        title: l.title,
        ord: l.ord || 0,
      }))}
      userId={userId}
      userRole={userRole}
      onEnroll={() => enroll(courseId)}
      isEnrolling={isEnrolling}
    />
  );
}

