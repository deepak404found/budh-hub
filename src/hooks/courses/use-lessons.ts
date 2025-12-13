"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { lessons as lessonsSchema } from "@/db/schema/lessons";
import type { CreateLessonInput, UpdateLessonInput } from "@/lib/validations/lesson";

type Lesson = typeof lessonsSchema.$inferSelect;

interface UseLessonsReturn {
  createLesson: (moduleId: string, courseId: string, data: CreateLessonInput) => Promise<Lesson | null>;
  updateLesson: (courseId: string, moduleId: string, lessonId: string, data: UpdateLessonInput) => Promise<Lesson | null>;
  deleteLesson: (courseId: string, moduleId: string, lessonId: string) => Promise<boolean>;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

/**
 * Hook to manage lesson CRUD operations
 */
export function useLessons(): UseLessonsReturn {
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const createLesson = async (
    moduleId: string,
    courseId: string,
    data: CreateLessonInput
  ): Promise<Lesson | null> => {
    setIsCreating(true);
    try {
      const response = await fetch(
        `/api/instructor/courses/${courseId}/modules/${moduleId}/lessons`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "Failed to create lesson");
        return null;
      }

      toast.success("Lesson created successfully!");
      return result.lesson;
    } catch (error) {
      console.error("Error creating lesson:", error);
      toast.error("An unexpected error occurred");
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  const updateLesson = async (
    courseId: string,
    moduleId: string,
    lessonId: string,
    data: UpdateLessonInput
  ): Promise<Lesson | null> => {
    setIsUpdating(true);
    try {
      const response = await fetch(
        `/api/instructor/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "Failed to update lesson");
        return null;
      }

      toast.success("Lesson updated successfully!");
      return result.lesson;
    } catch (error) {
      console.error("Error updating lesson:", error);
      toast.error("An unexpected error occurred");
      return null;
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteLesson = async (
    courseId: string,
    moduleId: string,
    lessonId: string
  ): Promise<boolean> => {
    setIsDeleting(true);
    try {
      const response = await fetch(
        `/api/instructor/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "Failed to delete lesson");
        return false;
      }

      toast.success("Lesson deleted successfully!");
      return true;
    } catch (error) {
      console.error("Error deleting lesson:", error);
      toast.error("An unexpected error occurred");
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    createLesson,
    updateLesson,
    deleteLesson,
    isCreating,
    isUpdating,
    isDeleting,
  };
}

