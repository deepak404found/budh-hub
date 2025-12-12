"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Edit, Trash2, GripVertical, BookOpen, Video } from "lucide-react";
import { useCourseDetails } from "@/hooks/courses";

interface CourseBuilderProps {
  courseId: string;
  userId: string;
}

export function CourseBuilder({ courseId, userId }: CourseBuilderProps) {
  const router = useRouter();
  const { courseDetails, isLoading, error, refetch } = useCourseDetails(courseId);
  const [isCreatingModule, setIsCreatingModule] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState("");

  const handleCreateModule = async () => {
    if (!newModuleTitle.trim()) {
      toast.error("Module title is required");
      return;
    }

    setIsCreatingModule(true);
    try {
      const response = await fetch(`/api/instructor/courses/${courseId}/modules`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newModuleTitle,
          ord: courseDetails?.modules.length || 0,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "Failed to create module");
        return;
      }

      toast.success("Module created successfully!");
      setNewModuleTitle("");
      setIsCreatingModule(false);
      refetch();
    } catch (error) {
      console.error("Error creating module:", error);
      toast.error("An unexpected error occurred");
      setIsCreatingModule(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-zinc-600 dark:text-zinc-400">Loading course builder...</div>
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
    <div className="space-y-6">
      {/* Course Info */}
      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-800">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          {courseDetails.course.title}
        </h2>
        {courseDetails.course.description && (
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            {courseDetails.course.description}
          </p>
        )}
      </div>

      {/* Modules Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Modules & Lessons
          </h3>
        </div>

        {/* Create New Module */}
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-800">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newModuleTitle}
              onChange={(e) => setNewModuleTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isCreatingModule) {
                  handleCreateModule();
                }
              }}
              placeholder="Enter module title..."
              className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
            <button
              onClick={handleCreateModule}
              disabled={isCreatingModule || !newModuleTitle.trim()}
              className="inline-flex items-center gap-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              <Plus className="h-4 w-4" />
              {isCreatingModule ? "Creating..." : "Add Module"}
            </button>
          </div>
        </div>

        {/* Modules List */}
        {courseDetails.modules.length === 0 ? (
          <div className="rounded-lg border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-800">
            <BookOpen className="mx-auto h-12 w-12 text-zinc-400" />
            <h3 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              No modules yet
            </h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Create your first module to start building your course
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {courseDetails.modules.map((module) => (
              <div
                key={module.id}
                className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-800"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <GripVertical className="h-5 w-5 text-zinc-400" />
                    <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {module.title}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="rounded-md bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-600"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      className="rounded-md bg-red-100 px-3 py-1.5 text-sm font-medium text-red-900 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-4 pl-8">
                  <button className="inline-flex items-center gap-2 rounded-md bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-600">
                    <Plus className="h-4 w-4" />
                    Add Lesson
                  </button>
                  {courseDetails.lessons.filter((l: any) => l.module_id === module.id).length === 0 && (
                    <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                      No lessons in this module yet
                    </p>
                  )}
                  {courseDetails.lessons.filter((l: any) => l.module_id === module.id).length > 0 && (
                    <div className="mt-2 space-y-2">
                      {courseDetails.lessons
                        .filter((l: any) => l.module_id === module.id)
                        .map((lesson: any) => (
                          <div
                            key={lesson.id}
                            className="flex items-center justify-between rounded-md border border-zinc-200 bg-zinc-50 p-2 dark:border-zinc-700 dark:bg-zinc-900"
                          >
                            <div className="flex items-center gap-2">
                              <Video className="h-4 w-4 text-zinc-400" />
                              <span className="text-sm text-zinc-900 dark:text-zinc-100">
                                {lesson.title}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-600">
                                <Edit className="h-3 w-3" />
                              </button>
                              <button className="rounded-md bg-red-100 px-2 py-1 text-xs font-medium text-red-900 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30">
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-4">
        <button
          onClick={() => router.back()}
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Back
        </button>
        <button
          onClick={() => router.push(`/instructor/courses` as any)}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Save & Exit
        </button>
      </div>
    </div>
  );
}

