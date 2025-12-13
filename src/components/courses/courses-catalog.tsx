"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, Search, Filter, X, CheckCircle2 } from "lucide-react";
import { useCourses, type CourseFilters } from "@/hooks/courses";
import type { courses as coursesSchema } from "@/db/schema/courses";

type Course = typeof coursesSchema.$inferSelect & { isEnrolled?: boolean };

export function CoursesCatalog() {
  const { courses, pagination, filters, isLoading, error, setFilters } = useCourses();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");
  const [selectedSort, setSelectedSort] = useState<"newest" | "oldest" | "title">("newest");
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setFilters({ search: query || undefined });
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setFilters({ category: category || undefined });
  };

  const handleDifficultyChange = (difficulty: string) => {
    setSelectedDifficulty(difficulty);
    setFilters({ difficulty: difficulty || undefined });
  };

  const handleSortChange = (sort: "newest" | "oldest" | "title") => {
    setSelectedSort(sort);
    setFilters({ sort });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedDifficulty("");
    setSelectedSort("newest");
    setFilters({});
  };

  const hasActiveFilters = selectedCategory || selectedDifficulty || searchQuery || selectedSort !== "newest";

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Available Courses
          </h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {pagination?.totalCount || 0} course{(pagination?.totalCount || 0) !== 1 ? "s" : ""} available
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="inline-flex items-center gap-2 rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
        >
          <Filter className="h-4 w-4" />
          Filters
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-800">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search courses..."
                className="w-full rounded-md border border-zinc-300 bg-white pl-10 pr-4 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            {/* Category and Difficulty */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                >
                  <option value="">All Categories</option>
                  {filters?.categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Difficulty
                </label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => handleDifficultyChange(e.target.value)}
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                >
                  <option value="">All Difficulties</option>
                  {filters?.difficulties.map((diff) => (
                    <option key={diff} value={diff}>
                      {diff}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Sort By
              </label>
              <select
                value={selectedSort}
                onChange={(e) => handleSortChange(e.target.value as "newest" | "oldest" | "title")}
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="title">Title (A-Z)</option>
              </select>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                <X className="h-4 w-4" />
                Clear Filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Courses Grid */}
      {courses.length === 0 ? (
        <div className="rounded-lg border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-800">
          <BookOpen className="mx-auto h-12 w-12 text-zinc-400" />
          <h3 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            No courses found
          </h3>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            {hasActiveFilters
              ? "Try adjusting your filters to see more courses"
              : "Check back later for new courses"}
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <Link
                key={course.id}
                href={`/courses/${course.id}`}
                className="group relative rounded-lg border border-zinc-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-800"
              >
                {/* Enrollment Badge */}
                {course.isEnrolled && (
                  <div className="absolute right-4 top-4">
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      <CheckCircle2 className="h-3 w-3" />
                      Enrolled
                    </span>
                  </div>
                )}

                {course.thumbnail_url && (
                  <div className="mb-4 aspect-video w-full overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-700">
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  {course.title}
                </h3>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                  {course.description || "No description available"}
                </p>
                <div className="mt-4 flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
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
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setFilters({ page: (pagination.page || 1) - 1 })}
                disabled={!pagination.hasPrev}
                className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setFilters({ page: (pagination.page || 1) + 1 })}
                disabled={!pagination.hasNext}
                className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
