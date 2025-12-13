"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Plus,
  Edit,
  Trash2,
  GripVertical,
  BookOpen,
  Video,
  X,
  CheckCircle2,
} from "lucide-react";
import { useCourseDetails, useLessons } from "@/hooks/courses";
import { VideoUpload } from "@/components/upload/video-upload";
import { MaterialsManager } from "@/components/courses/materials-manager";
import { getPublicUrl } from "@/lib/r2/utils";

interface CourseBuilderProps {
  courseId: string;
  userId: string;
}

export function CourseBuilder({ courseId, userId }: CourseBuilderProps) {
  const router = useRouter();
  const { courseDetails, isLoading, error, refetch } =
    useCourseDetails(courseId);
  const { createLesson, updateLesson, deleteLesson, isCreating, isDeleting } =
    useLessons();

  // Memoize the materials change callback to prevent unnecessary rerenders
  const handleMaterialsChange = useCallback(() => {
    refetch();
  }, [refetch]);

  // Fetch video URLs for all lessons with videos when course data loads
  useEffect(() => {
    if (courseDetails?.lessons) {
      courseDetails.lessons.forEach((lesson: any) => {
        if (
          lesson.video_key &&
          !videoUrls[lesson.id] &&
          loadingVideoUrl !== lesson.id
        ) {
          fetchVideoUrl(lesson.id);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseDetails?.lessons]);
  const [isCreatingModule, setIsCreatingModule] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [creatingLessonForModule, setCreatingLessonForModule] = useState<
    string | null
  >(null);
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [editingLesson, setEditingLesson] = useState<string | null>(null);
  const [editingLessonTitle, setEditingLessonTitle] = useState("");
  const [editingLessonContent, setEditingLessonContent] = useState("");
  const [editingLessonVideoKey, setEditingLessonVideoKey] = useState<
    string | null
  >(null);
  const [editingLessonVideoUrl, setEditingLessonVideoUrl] = useState<
    string | null
  >(null);
  const [videoUrls, setVideoUrls] = useState<Record<string, string>>({});
  const [loadingVideoUrl, setLoadingVideoUrl] = useState<string | null>(null);
  const [editingLessonVideoSize, setEditingLessonVideoSize] = useState<
    number | null
  >(null);
  const [editingLessonVideoDuration, setEditingLessonVideoDuration] = useState<
    number | null
  >(null);
  const [editingLessonVideoMimeType, setEditingLessonVideoMimeType] = useState<
    string | null
  >(null);
  const [editingModule, setEditingModule] = useState<string | null>(null);
  const [editingModuleTitle, setEditingModuleTitle] = useState("");
  const [isUpdatingModule, setIsUpdatingModule] = useState(false);
  const [isDeletingModule, setIsDeletingModule] = useState(false);

  const handleCreateModule = async () => {
    if (!newModuleTitle.trim()) {
      toast.error("Module title is required");
      return;
    }

    setIsCreatingModule(true);
    try {
      const response = await fetch(
        `/api/instructor/courses/${courseId}/modules`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: newModuleTitle,
            ord: courseDetails?.modules.length || 0,
          }),
        }
      );

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

  const handleCreateLesson = async (moduleId: string) => {
    if (!newLessonTitle.trim()) {
      toast.error("Lesson title is required");
      return;
    }

    const lesson = await createLesson(moduleId, courseId, {
      module_id: moduleId,
      title: newLessonTitle,
      ord:
        courseDetails?.lessons.filter((l: any) => l.module_id === moduleId)
          .length || 0,
    });

    if (lesson) {
      setNewLessonTitle("");
      setCreatingLessonForModule(null);
      refetch();
    }
  };

  const handleUpdateLesson = async (moduleId: string, lessonId: string) => {
    if (!editingLessonTitle.trim()) {
      toast.error("Lesson title is required");
      return;
    }

    const updateData: any = {
      title: editingLessonTitle,
    };

    if (editingLessonContent !== undefined) {
      updateData.content = editingLessonContent || null;
    }

    if (editingLessonVideoKey !== undefined) {
      updateData.video_key = editingLessonVideoKey || null;
      updateData.video_size = editingLessonVideoSize || null;
      updateData.video_duration = editingLessonVideoDuration || null;
      updateData.video_mime_type = editingLessonVideoMimeType || null;
    }

    const lesson = await updateLesson(courseId, moduleId, lessonId, updateData);

    if (lesson) {
      setEditingLesson(null);
      setEditingLessonTitle("");
      setEditingLessonContent("");
      setEditingLessonVideoKey(null);
      setEditingLessonVideoUrl(null);
      setEditingLessonVideoSize(null);
      setEditingLessonVideoDuration(null);
      setEditingLessonVideoMimeType(null);
      refetch();
    }
  };

  const fetchVideoUrl = useCallback(
    async (lessonId: string) => {
      // Don't fetch if already cached or currently loading
      if (videoUrls[lessonId] || loadingVideoUrl === lessonId) {
        return;
      }

      setLoadingVideoUrl(lessonId);
      try {
        const response = await fetch(
          `/api/instructor/courses/${courseId}/lessons/${lessonId}/video-url`
        );
        if (response.ok) {
          const { videoUrl } = await response.json();
          setVideoUrls((prev) => ({ ...prev, [lessonId]: videoUrl }));
          // If this is the currently editing lesson, update the editing URL
          if (editingLesson === lessonId) {
            setEditingLessonVideoUrl(videoUrl);
          }
        }
      } catch (error) {
        console.error("Error fetching video URL:", error);
      } finally {
        setLoadingVideoUrl(null);
      }
    },
    [courseId, editingLesson, videoUrls, loadingVideoUrl]
  );

  const handleVideoUpload = (
    videoKey: string,
    videoUrl: string,
    metadata: { size: number; type: string; duration?: number }
  ) => {
    setEditingLessonVideoKey(videoKey);
    setEditingLessonVideoUrl(videoUrl);
    setEditingLessonVideoSize(metadata.size);
    setEditingLessonVideoDuration(metadata.duration || null);
    setEditingLessonVideoMimeType(metadata.type);
    // Cache the URL for this lesson
    if (editingLesson) {
      setVideoUrls((prev) => ({ ...prev, [editingLesson!]: videoUrl }));
    }
  };

  const handleDeleteVideo = async (moduleId: string, lessonId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this video? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `/api/instructor/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/video`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete video");
      }

      toast.success("Video deleted successfully!");

      // Clear video state if currently editing this lesson
      if (editingLesson === lessonId) {
        setEditingLessonVideoKey(null);
        setEditingLessonVideoUrl(null);
        setEditingLessonVideoSize(null);
        setEditingLessonVideoDuration(null);
        setEditingLessonVideoMimeType(null);
      }

      // Refresh course data
      refetch();
    } catch (error) {
      console.error("Error deleting video:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete video"
      );
    }
  };

  const handleCancelEdit = () => {
    setEditingLesson(null);
    setEditingLessonTitle("");
    setEditingLessonContent("");
    setEditingLessonVideoKey(null);
    setEditingLessonVideoUrl(null);
    setEditingLessonVideoSize(null);
    setEditingLessonVideoDuration(null);
    setEditingLessonVideoMimeType(null);
  };

  const handleUpdateModule = async (moduleId: string) => {
    if (!editingModuleTitle.trim()) {
      toast.error("Module title is required");
      return;
    }

    setIsUpdatingModule(true);
    try {
      const response = await fetch(
        `/api/instructor/courses/${courseId}/modules/${moduleId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: editingModuleTitle,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "Failed to update module");
        return;
      }

      toast.success("Module updated successfully!");
      setEditingModule(null);
      setEditingModuleTitle("");
      refetch();
    } catch (error) {
      console.error("Error updating module:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsUpdatingModule(false);
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this module? All lessons in this module will also be deleted."
      )
    ) {
      return;
    }

    setIsDeletingModule(true);
    try {
      const response = await fetch(
        `/api/instructor/courses/${courseId}/modules/${moduleId}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "Failed to delete module");
        return;
      }

      toast.success("Module deleted successfully!");
      refetch();
    } catch (error) {
      console.error("Error deleting module:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsDeletingModule(false);
    }
  };

  const handleDeleteLesson = async (moduleId: string, lessonId: string) => {
    if (!confirm("Are you sure you want to delete this lesson?")) {
      return;
    }

    const success = await deleteLesson(courseId, moduleId, lessonId);
    if (success) {
      refetch();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-zinc-600 dark:text-zinc-400">
          Loading course builder...
        </div>
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
        <div className="mt-4">
          <MaterialsManager
            courseId={courseId}
            onMaterialsChange={handleMaterialsChange}
          />
        </div>
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
                  {editingModule === module.id ? (
                    <div className="flex flex-1 items-center gap-2">
                      <input
                        type="text"
                        value={editingModuleTitle}
                        onChange={(e) => setEditingModuleTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !isUpdatingModule) {
                            handleUpdateModule(module.id);
                          }
                          if (e.key === "Escape") {
                            setEditingModule(null);
                            setEditingModuleTitle("");
                          }
                        }}
                        className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                        autoFocus
                      />
                      <button
                        onClick={() => handleUpdateModule(module.id)}
                        disabled={
                          isUpdatingModule || !editingModuleTitle.trim()
                        }
                        className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                      >
                        {isUpdatingModule ? "Saving..." : "Save"}
                      </button>
                      <button
                        onClick={() => {
                          setEditingModule(null);
                          setEditingModuleTitle("");
                        }}
                        className="rounded-md bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <GripVertical className="h-5 w-5 text-zinc-400" />
                        <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {module.title}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingModule(module.id);
                            setEditingModuleTitle(module.title);
                          }}
                          className="rounded-md bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-600"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteModule(module.id)}
                          disabled={isDeletingModule}
                          className="rounded-md bg-red-100 px-3 py-1.5 text-sm font-medium text-red-900 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
                <div className="mt-4 pl-8">
                  {creatingLessonForModule === module.id ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={newLessonTitle}
                          onChange={(e) => setNewLessonTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !isCreating) {
                              handleCreateLesson(module.id);
                            }
                            if (e.key === "Escape") {
                              setCreatingLessonForModule(null);
                              setNewLessonTitle("");
                            }
                          }}
                          placeholder="Enter lesson title..."
                          className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                          autoFocus
                        />
                        <button
                          onClick={() => handleCreateLesson(module.id)}
                          disabled={isCreating || !newLessonTitle.trim()}
                          className="rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                        >
                          {isCreating ? "Creating..." : "Add"}
                        </button>
                        <button
                          onClick={() => {
                            setCreatingLessonForModule(null);
                            setNewLessonTitle("");
                          }}
                          className="rounded-md bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setCreatingLessonForModule(module.id)}
                      className="inline-flex items-center gap-2 rounded-md bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-600"
                    >
                      <Plus className="h-4 w-4" />
                      Add Lesson
                    </button>
                  )}
                  {courseDetails.lessons.filter(
                    (l: any) => l.module_id === module.id
                  ).length === 0 &&
                    !creatingLessonForModule && (
                      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                        No lessons in this module yet
                      </p>
                    )}
                  {courseDetails.lessons.filter(
                    (l: any) => l.module_id === module.id
                  ).length > 0 && (
                    <div className="mt-2 space-y-2">
                      {courseDetails.lessons
                        .filter((l: any) => l.module_id === module.id)
                        .map((lesson: any) => (
                          <div
                            key={lesson.id}
                            className="flex items-center justify-between rounded-md border border-zinc-200 bg-zinc-50 p-2 dark:border-zinc-700 dark:bg-zinc-900"
                          >
                            {editingLesson === lesson.id ? (
                              <div className="w-full space-y-4 p-3 rounded-md border border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-800">
                                {/* Title */}
                                <div>
                                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                    Lesson Title
                                  </label>
                                  <input
                                    type="text"
                                    value={editingLessonTitle}
                                    onChange={(e) =>
                                      setEditingLessonTitle(e.target.value)
                                    }
                                    className="w-full rounded-md border border-zinc-300 px-2 py-1 text-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                                    placeholder="Enter lesson title..."
                                  />
                                </div>

                                {/* Content */}
                                <div>
                                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                    Content (Markdown/Text)
                                  </label>
                                  <textarea
                                    value={editingLessonContent}
                                    onChange={(e) =>
                                      setEditingLessonContent(e.target.value)
                                    }
                                    rows={4}
                                    className="w-full rounded-md border border-zinc-300 px-2 py-1 text-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                                    placeholder="Enter lesson content (markdown supported)..."
                                  />
                                </div>

                                {/* Video Upload */}
                                <div>
                                  <div className="flex items-center justify-between mb-2">
                                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                      Video
                                    </label>
                                    {(editingLessonVideoKey ||
                                      lesson.video_key) && (
                                      <button
                                        onClick={() =>
                                          handleDeleteVideo(
                                            module.id,
                                            lesson.id
                                          )
                                        }
                                        className="inline-flex items-center gap-1 rounded-md bg-red-100 px-2 py-1 text-xs font-medium text-red-900 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                                        title="Delete video"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                        Delete Video
                                      </button>
                                    )}
                                  </div>
                                  <VideoUpload
                                    lessonId={lesson.id}
                                    onUploadComplete={handleVideoUpload}
                                    currentVideoKey={
                                      editingLessonVideoKey ||
                                      lesson.video_key ||
                                      undefined
                                    }
                                    currentVideoUrl={
                                      editingLessonVideoUrl ||
                                      (lesson.video_key
                                        ? videoUrls[lesson.id] || undefined
                                        : undefined)
                                    }
                                  />
                                  {(() => {
                                    const displayUrl =
                                      editingLessonVideoUrl ||
                                      (lesson.video_key &&
                                      editingLesson === lesson.id
                                        ? videoUrls[lesson.id]
                                        : null);

                                    if (loadingVideoUrl === lesson.id) {
                                      return (
                                        <div className="mt-2 flex items-center justify-center rounded-md border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
                                          <div className="text-sm text-zinc-600 dark:text-zinc-400">
                                            Loading video...
                                          </div>
                                        </div>
                                      );
                                    }

                                    if (
                                      displayUrl &&
                                      displayUrl.startsWith("http")
                                    ) {
                                      return (
                                        <div className="mt-2 rounded-md border border-zinc-200 dark:border-zinc-700">
                                          <video
                                            src={displayUrl}
                                            controls
                                            className="w-full max-h-48 rounded-md"
                                          />
                                        </div>
                                      );
                                    }

                                    if (lesson.video_key && !displayUrl) {
                                      // Video exists but URL not loaded yet
                                      return (
                                        <div className="mt-2 flex items-center justify-center rounded-md border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
                                          <div className="text-sm text-zinc-600 dark:text-zinc-400">
                                            Video available (loading URL...)
                                          </div>
                                        </div>
                                      );
                                    }

                                    return null;
                                  })()}
                                </div>

                                {/* Materials */}
                                <div>
                                  <MaterialsManager
                                    courseId={courseId}
                                    lessonId={lesson.id}
                                    moduleId={module.id}
                                    onMaterialsChange={handleMaterialsChange}
                                  />
                                </div>

                                {/* Actions */}
                                <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-700">
                                  <button
                                    onClick={handleCancelEdit}
                                    className="rounded-md bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-600"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleUpdateLesson(module.id, lesson.id)
                                    }
                                    disabled={!editingLessonTitle.trim()}
                                    className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
                                  >
                                    Save Lesson
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-center gap-2 flex-1">
                                  <Video
                                    className={`h-4 w-4 ${
                                      lesson.video_key
                                        ? "text-green-600 dark:text-green-400"
                                        : "text-zinc-400"
                                    }`}
                                  />
                                  <span className="text-sm text-zinc-900 dark:text-zinc-100">
                                    {lesson.title}
                                  </span>
                                  {lesson.video_key && (
                                    <span title="Video uploaded">
                                      <CheckCircle2 className="h-3 w-3 text-green-600 dark:text-green-400" />
                                    </span>
                                  )}
                                  {lesson.content && (
                                    <span
                                      className="text-xs text-zinc-500 dark:text-zinc-400"
                                      title="Has content"
                                    >
                                      📝
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => {
                                      setEditingLesson(lesson.id);
                                      setEditingLessonTitle(lesson.title);
                                      setEditingLessonContent(
                                        lesson.content || ""
                                      );
                                      setEditingLessonVideoKey(
                                        lesson.video_key || null
                                      );
                                      // Fetch signed URL for the video
                                      if (lesson.video_key) {
                                        // Use cached URL if available, otherwise fetch
                                        if (videoUrls[lesson.id]) {
                                          setEditingLessonVideoUrl(
                                            videoUrls[lesson.id]
                                          );
                                        } else {
                                          // Fetch the signed URL
                                          fetchVideoUrl(lesson.id);
                                          // Set a temporary URL for immediate display
                                          setEditingLessonVideoUrl(null);
                                        }
                                      } else {
                                        setEditingLessonVideoUrl(null);
                                      }
                                      setEditingLessonVideoSize(
                                        lesson.video_size || null
                                      );
                                      setEditingLessonVideoDuration(
                                        lesson.video_duration || null
                                      );
                                      setEditingLessonVideoMimeType(
                                        lesson.video_mime_type || null
                                      );
                                    }}
                                    className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-600"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeleteLesson(module.id, lesson.id)
                                    }
                                    disabled={isDeleting}
                                    className="rounded-md bg-red-100 px-2 py-1 text-xs font-medium text-red-900 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 disabled:opacity-50"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              </>
                            )}
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
