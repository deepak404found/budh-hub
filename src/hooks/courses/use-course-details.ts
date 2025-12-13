"use client";

import { useState, useEffect } from "react";
import type { courses } from "@/db/schema/courses";
import type { modules } from "@/db/schema/modules";
import type { lessons } from "@/db/schema/lessons";

interface CourseDetails {
  course: typeof courses.$inferSelect;
  modules: (typeof modules.$inferSelect)[];
  lessons: (typeof lessons.$inferSelect)[];
}

interface UseCourseDetailsReturn {
  courseDetails: CourseDetails | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch course details with modules and lessons
 */
export function useCourseDetails(courseId: string): UseCourseDetailsReturn {
  const [courseDetails, setCourseDetails] = useState<CourseDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourseDetails = async () => {
    if (!courseId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/courses/${courseId}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Course not found");
        }
        throw new Error("Failed to fetch course details");
      }
      const data = await response.json();
      setCourseDetails({
        course: data.course,
        modules: data.modules || [],
        lessons: data.lessons || [],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setCourseDetails(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseDetails();
  }, [courseId]);

  return {
    courseDetails,
    isLoading,
    error,
    refetch: fetchCourseDetails,
  };
}


