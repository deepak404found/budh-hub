"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Play,
  CheckCircle2,
  BookOpen,
  Video,
  FileText,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { StudyMaterialsDisplay } from "@/components/courses/study-materials-display";

interface CourseLearningPageClientProps {
  courseId: string;
  userId: string;
}

interface Lesson {
  id: string;
  module_id: string;
  title: string;
  content: string | null;
  video_key: string | null;
  video_url: string | null;
  video_size: number | null;
  video_duration: number | null;
  ord: number;
  completed?: boolean;
}

interface Module {
  id: string;
  course_id: string;
  title: string;
  ord: number;
  lessons: Lesson[];
}

interface Material {
  id: string;
  file_name: string;
  file_key: string;
  file_type: string | null;
  file_size: number | null;
  material_type: string | null;
}

interface CourseData {
  course: {
    id: string;
    title: string;
    description: string | null;
    thumbnail_url: string | null;
  };
  modules: Module[];
  enrollment: {
    progress: number | null;
  };
  courseMaterials?: Material[];
}

interface Lesson {
  id: string;
  module_id: string;
  title: string;
  content: string | null;
  video_key: string | null;
  video_url: string | null;
  video_size: number | null;
  video_duration: number | null;
  ord: number;
  completed?: boolean;
  materials?: Material[];
}

export function CourseLearningPageClient({
  courseId,
  userId,
}: CourseLearningPageClientProps) {
  const router = useRouter();
  const [data, setData] = useState<CourseData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [videoUrls, setVideoUrls] = useState<Record<string, string>>({});
  const [loadingVideoUrl, setLoadingVideoUrl] = useState<string | null>(null);

  const fetchVideoUrl = useCallback(
    async (lessonId: string) => {
      setLoadingVideoUrl(lessonId);
      try {
        const response = await fetch(
          `/api/my-courses/${courseId}/lessons/${lessonId}/video-url`
        );
        if (response.ok) {
          const { videoUrl } = await response.json();
          setVideoUrls((prev) => ({ ...prev, [lessonId]: videoUrl }));
        }
      } catch (error) {
        console.error("Error fetching video URL:", error);
      } finally {
        setLoadingVideoUrl(null);
      }
    },
    [courseId]
  );

  // Fetch course data
  useEffect(() => {
    const fetchCourse = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/my-courses/${courseId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch course");
        }
        const courseData: CourseData = await response.json();
        setData(courseData);

        // Select first lesson if available
        const firstLesson = courseData.modules
          .flatMap((m) => m.lessons)
          .sort((a, b) => a.ord - b.ord)[0];
        if (firstLesson) {
          setSelectedLesson(firstLesson.id);
          // Fetch video URL for first lesson
          if (firstLesson.video_key) {
            setTimeout(() => fetchVideoUrl(firstLesson.id), 100);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  const handleLessonClick = (lessonId: string) => {
    setSelectedLesson(lessonId);

    // Fetch video URL if not already loaded
    const lesson = data?.modules
      .flatMap((m) => m.lessons)
      .find((l) => l.id === lessonId);

    if (lesson?.video_key && !videoUrls[lessonId] && !loadingVideoUrl) {
      fetchVideoUrl(lessonId);
    }
  };

  const handleMarkComplete = async (lessonId: string) => {
    try {
      const response = await fetch(
        `/api/my-courses/${courseId}/lessons/${lessonId}/complete`,
        { method: "POST" }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to mark lesson as complete");
      }

      const result = await response.json();
      toast.success("Lesson marked as complete!");

      // Refresh course data to update progress
      const courseResponse = await fetch(`/api/my-courses/${courseId}`);
      if (courseResponse.ok) {
        const courseData: CourseData = await courseResponse.json();
        setData(courseData);

        // Update the current lesson's completed status
        if (currentLesson) {
          const updatedLesson = courseData.modules
            .flatMap((m) => m.lessons)
            .find((l) => l.id === lessonId);
          if (updatedLesson) {
            updatedLesson.completed = true;
          }
        }
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to mark lesson as complete"
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-zinc-600 dark:text-zinc-400">
          Loading course...
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
        {error || "Course not found"}
      </div>
    );
  }

  const currentLesson = data.modules
    .flatMap((m) => m.lessons)
    .find((l) => l.id === selectedLesson);

  const allLessons = data.modules
    .flatMap((m) => m.lessons)
    .sort((a, b) => a.ord - b.ord);
  const currentLessonIndex = allLessons.findIndex(
    (l) => l.id === selectedLesson
  );
  const nextLesson =
    currentLessonIndex >= 0 && currentLessonIndex < allLessons.length - 1
      ? allLessons[currentLessonIndex + 1]
      : null;
  const prevLesson =
    currentLessonIndex > 0 ? allLessons[currentLessonIndex - 1] : null;

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {/* Sidebar - Course Content */}
      <div className="w-80 shrink-0 overflow-y-auto border-r border-zinc-200 dark:border-zinc-800">
        <div className="p-4">
          <Link
            href="/my-courses"
            className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to My Courses
          </Link>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {data.course.title}
          </h2>
          <div className="mt-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">Progress</span>
              <span className="font-medium text-zinc-900 dark:text-zinc-100">
                {data.enrollment.progress || 0}%
              </span>
            </div>
            <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
              <div
                className="h-full bg-zinc-900 transition-all dark:bg-zinc-100"
                style={{ width: `${data.enrollment.progress || 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Modules and Lessons */}
        <div className="space-y-1 p-2">
          {data.modules.map((module) => (
            <div key={module.id} className="space-y-1">
              <div className="px-3 py-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                {module.title}
              </div>
              {module.lessons.map((lesson) => {
                const isSelected = selectedLesson === lesson.id;
                const isCompleted = lesson.completed || false;

                return (
                  <button
                    key={lesson.id}
                    onClick={() => handleLessonClick(lesson.id)}
                    className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                      isSelected
                        ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                        : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isCompleted ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                      <span className="flex-1">{lesson.title}</span>
                      {lesson.video_duration && (
                        <span className="text-xs opacity-70">
                          {Math.floor(lesson.video_duration / 60)}:
                          {String(lesson.video_duration % 60).padStart(2, "0")}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content - Lesson Viewer */}
      <div className="flex-1 overflow-y-auto">
        {currentLesson ? (
          <div className="p-6">
            {/* Lesson Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {currentLesson.title}
              </h1>
            </div>

            {/* Video Player */}
            {(() => {
              const videoUrl = currentLesson.video_key
                ? videoUrls[currentLesson.id] || null
                : null;
              const isLoadingVideo = loadingVideoUrl === currentLesson.id;

              if (isLoadingVideo) {
                return (
                  <div className="mb-6 flex aspect-video items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800">
                    <div className="text-center">
                      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-100" />
                      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                        Loading video...
                      </p>
                    </div>
                  </div>
                );
              }

              if (videoUrl && videoUrl.startsWith("http")) {
                return (
                  <div className="mb-6">
                    <div className="aspect-video w-full overflow-hidden rounded-lg bg-zinc-900">
                      <video
                        controls
                        controlsList="nodownload"
                        className="h-full w-full"
                        src={videoUrl}
                        preload="metadata"
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  </div>
                );
              }

              return (
                <div className="mb-6 flex aspect-video items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800">
                  <div className="text-center">
                    <Video className="mx-auto h-12 w-12 text-zinc-400" />
                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                      {currentLesson.video_key
                        ? "Video is not available"
                        : "No video available for this lesson"}
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* Lesson Content */}
            {currentLesson.content && (
              <div className="mb-6 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-800">
                <div className="prose prose-zinc max-w-none dark:prose-invert">
                  <div
                    dangerouslySetInnerHTML={{ __html: currentLesson.content }}
                  />
                </div>
              </div>
            )}

            {/* Lesson Materials */}
            {currentLesson.materials && currentLesson.materials.length > 0 && (
              <StudyMaterialsDisplay
                materials={currentLesson.materials}
                courseId={courseId}
                lessonId={currentLesson.id}
              />
            )}

            {/* Course-Level Materials */}
            {data.courseMaterials && data.courseMaterials.length > 0 && (
              <StudyMaterialsDisplay
                materials={data.courseMaterials}
                courseId={courseId}
              />
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between border-t border-zinc-200 pt-6 dark:border-zinc-800">
              <button
                onClick={() => prevLesson && handleLessonClick(prevLesson.id)}
                disabled={!prevLesson}
                className="inline-flex items-center gap-2 rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </button>

              <button
                onClick={() => handleMarkComplete(currentLesson.id)}
                disabled={currentLesson.completed}
                className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle2 className="h-4 w-4" />
                {currentLesson.completed ? "Completed" : "Mark Complete"}
              </button>

              <button
                onClick={() => nextLesson && handleLessonClick(nextLesson.id)}
                disabled={!nextLesson}
                className="inline-flex items-center gap-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Next
                <ArrowLeft className="h-4 w-4 rotate-180" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center p-12">
            <div className="text-center">
              <BookOpen className="mx-auto h-12 w-12 text-zinc-400" />
              <h3 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Select a lesson to begin
              </h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Choose a lesson from the sidebar to start learning
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
