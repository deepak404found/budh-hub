"use client";

import { useState } from "react";
import { toast } from "sonner";

interface UsePublishCourseReturn {
  publish: (courseId: string, isPublished: boolean) => Promise<void>;
  isPublishing: boolean;
}

/**
 * Hook to publish/unpublish a course
 */
export function usePublishCourse(): UsePublishCourseReturn {
  const [isPublishing, setIsPublishing] = useState(false);

  const publish = async (courseId: string, isPublished: boolean) => {
    setIsPublishing(true);
    try {
      const response = await fetch(`/api/instructor/courses/${courseId}/publish`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_published: isPublished }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "Failed to update course status");
        return;
      }

      toast.success(
        isPublished ? "Course published successfully!" : "Course unpublished successfully!"
      );
    } catch (error) {
      console.error("Error publishing course:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsPublishing(false);
    }
  };

  return {
    publish,
    isPublishing,
  };
}


