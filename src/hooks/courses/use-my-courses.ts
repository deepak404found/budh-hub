"use client";

import { useState, useEffect } from "react";
import type { courses } from "@/db/schema/courses";
import type { enrollments } from "@/db/schema/enrollments";

interface EnrolledCourse {
  course: typeof courses.$inferSelect;
  enrollment: typeof enrollments.$inferSelect;
}

interface UseMyCoursesReturn {
  courses: EnrolledCourse[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch enrolled courses
 */
export function useMyCourses(): UseMyCoursesReturn {
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/my-courses");
      if (!response.ok) {
        throw new Error("Failed to fetch enrolled courses");
      }
      const data = await response.json();
      setCourses(data.courses || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setCourses([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return {
    courses,
    isLoading,
    error,
    refetch: fetchCourses,
  };
}

