"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  createCourseSchema,
  type CreateCourseInput,
} from "@/lib/validations/course";
import { FormField } from "@/components/forms/form-field";
import { ThumbnailUpload } from "@/components/upload/thumbnail-upload";

export function CreateCourseForm() {
  const router = useRouter();
  const [thumbnailUrl, setThumbnailUrl] = useState<string>("");
  const [thumbnailKey, setThumbnailKey] = useState<string>("");
  const form = useForm<CreateCourseInput>({
    resolver: zodResolver(createCourseSchema),
  });

  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = form;

  const handleThumbnailUpload = (
    key: string,
    url: string,
    metadata: { filename: string; size: number; type: string }
  ) => {
    if (key && url) {
      setThumbnailKey(key);
      setThumbnailUrl(url);
      setValue("thumbnail_url", url);
    } else {
      setThumbnailKey("");
      setThumbnailUrl("");
      setValue("thumbnail_url", "");
    }
  };

  const onSubmit = async (data: CreateCourseInput) => {
    try {
      // Use uploaded thumbnail URL if available
      const courseData = {
        ...data,
        thumbnail_url: thumbnailUrl || data.thumbnail_url || undefined,
      };

      const response = await fetch("/api/instructor/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(courseData),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "Failed to create course");
        return;
      }

      toast.success("Course created successfully!");
      router.push(`/instructor/courses/${result.course.id}/builder` as any);
    } catch (error) {
      console.error("Error creating course:", error);
      toast.error("An unexpected error occurred");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-800">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Course Details
        </h2>

        <div className="mt-6 space-y-4">
          <FormField form={form} name="title" label="Course Title">
            {(field) => (
              <input
                {...field}
                value={field.value as string}
                onChange={(e) => field.onChange(e.target.value)}
                type="text"
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                placeholder="e.g., Introduction to Web Development"
              />
            )}
          </FormField>

          <FormField form={form} name="description" label="Description">
            {(field) => (
              <textarea
                {...field}
                value={field.value as string}
                onChange={(e) => field.onChange(e.target.value)}
                rows={4}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                placeholder="Describe what students will learn in this course..."
              />
            )}
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField form={form} name="category" label="Category">
              {(field) => (
                <input
                  {...field}
                  value={field.value as string}
                  onChange={(e) => field.onChange(e.target.value)}
                  type="text"
                  className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                  placeholder="e.g., Programming"
                />
              )}
            </FormField>

            <FormField form={form} name="difficulty" label="Difficulty">
              {(field) => (
                <select
                  {...field}
                  value={field.value as string}
                  onChange={(e) => field.onChange(e.target.value)}
                  className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                >
                  <option value="">Select difficulty</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              )}
            </FormField>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Course Thumbnail (optional)
            </label>
            <ThumbnailUpload
              courseId="new"
              onUploadComplete={handleThumbnailUpload}
              currentThumbnailKey={thumbnailKey}
              currentThumbnailUrl={thumbnailUrl}
            />
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Or enter a thumbnail URL manually:
            </p>
            <FormField form={form} name="thumbnail_url" label="">
              {(field) => (
                <input
                  {...field}
                  value={field.value as string}
                  onChange={(e) => field.onChange(e.target.value)}
                  type="url"
                  className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                  placeholder="https://example.com/image.jpg"
                />
              )}
            </FormField>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {isSubmitting ? "Creating..." : "Create Course"}
        </button>
      </div>
    </form>
  );
}
