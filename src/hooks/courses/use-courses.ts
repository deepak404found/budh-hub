"use client";

import { useState, useEffect, useCallback } from "react";
import type { courses as coursesSchema } from "@/db/schema/courses";

type Course = typeof coursesSchema.$inferSelect & { isEnrolled?: boolean };

export interface CourseFilters {
  page?: number;
  limit?: number;
  category?: string;
  difficulty?: string;
  search?: string;
  sort?: "newest" | "oldest" | "title";
}

export interface CoursesResponse {
  courses: Course[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: {
    categories: string[];
    difficulties: string[];
  };
}

interface UseCoursesReturn {
  courses: Course[];
  pagination: CoursesResponse["pagination"] | null;
  filters: CoursesResponse["filters"] | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  setFilters: (filters: CourseFilters) => void;
}

/**
 * Hook to fetch all published courses (for browsing) with filters, pagination, and sorting
 */
export function useCourses(initialFilters?: CourseFilters): UseCoursesReturn {
  const [courses, setCourses] = useState<Course[]>([]);
  const [pagination, setPagination] = useState<
    CoursesResponse["pagination"] | null
  >(null);
  const [filters, setFiltersState] = useState<
    CoursesResponse["filters"] | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentFilters, setCurrentFilters] = useState<CourseFilters>(
    initialFilters || {
      page: 1,
      limit: 12,
      sort: "newest",
    }
  );

  const fetchCourses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (currentFilters.page)
        params.set("page", currentFilters.page.toString());
      if (currentFilters.limit)
        params.set("limit", currentFilters.limit.toString());
      if (currentFilters.category)
        params.set("category", currentFilters.category);
      if (currentFilters.difficulty)
        params.set("difficulty", currentFilters.difficulty);
      if (currentFilters.search) params.set("search", currentFilters.search);
      if (currentFilters.sort) params.set("sort", currentFilters.sort);

      const response = await fetch(`/api/courses?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch courses");
      }
      const data: CoursesResponse = await response.json();
      setCourses(data.courses || []);
      setPagination(data.pagination);
      setFiltersState(data.filters);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setCourses([]);
      setPagination(null);
      setFiltersState(null);
    } finally {
      setIsLoading(false);
    }
  }, [
    currentFilters.page,
    currentFilters.limit,
    currentFilters.category,
    currentFilters.difficulty,
    currentFilters.search,
    currentFilters.sort,
  ]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const setFilters = useCallback((newFilters: CourseFilters) => {
    setCurrentFilters((prev) => {
      // Only reset page to 1 if filters other than page are changing
      const hasNonPageFilters =
        ("category" in newFilters && newFilters.category !== prev.category) ||
        ("difficulty" in newFilters &&
          newFilters.difficulty !== prev.difficulty) ||
        ("search" in newFilters && newFilters.search !== prev.search) ||
        ("sort" in newFilters && newFilters.sort !== prev.sort) ||
        ("limit" in newFilters && newFilters.limit !== prev.limit);

      return {
        ...prev,
        ...newFilters,
        page: hasNonPageFilters ? 1 : newFilters.page ?? prev.page,
      };
    });
  }, []);

  return {
    courses,
    pagination,
    filters,
    isLoading,
    error,
    refetch: fetchCourses,
    setFilters,
  };
}
