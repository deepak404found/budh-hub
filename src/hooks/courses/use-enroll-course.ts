"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface UseEnrollCourseReturn {
  enroll: (courseId: string) => Promise<void>;
  isEnrolling: boolean;
}

/**
 * Hook to enroll in a course
 */
export function useEnrollCourse(): UseEnrollCourseReturn {
  const router = useRouter();
  const [isEnrolling, setIsEnrolling] = useState(false);

  const enroll = async (courseId: string) => {
    setIsEnrolling(true);
    try {
      const response = await fetch(`/api/courses/${courseId}/enroll`, {
        method: "POST",
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "Failed to enroll in course");
        return;
      }

      toast.success("Successfully enrolled in course!");
      router.push(`/my-courses/${courseId}` as any);
      router.refresh();
    } catch (error) {
      console.error("Error enrolling:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsEnrolling(false);
    }
  };

  return {
    enroll,
    isEnrolling,
  };
}

