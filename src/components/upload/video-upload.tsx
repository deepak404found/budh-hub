"use client";

import { useState, useRef } from "react";
import { Upload, X, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { uploadConfig } from "@/lib/config/env";

interface VideoUploadProps {
  lessonId: string;
  onUploadComplete: (
    videoKey: string,
    videoUrl: string,
    metadata: {
      size: number;
      type: string;
      duration?: number;
    }
  ) => void;
  currentVideoKey?: string;
  currentVideoUrl?: string;
}

export function VideoUpload({
  lessonId,
  onUploadComplete,
  currentVideoKey,
  currentVideoUrl,
}: VideoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedVideo, setUploadedVideo] = useState<{
    key: string;
    url: string;
    filename: string;
  } | null>(
    currentVideoKey && currentVideoUrl
      ? {
          key: currentVideoKey,
          url: currentVideoUrl,
          filename: currentVideoKey.split("/").pop() || "video",
        }
      : null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("video/")) {
      toast.error("Please select a video file");
      return;
    }

    // Validate file size
    // Note: Vercel has a hard 4.5MB limit for serverless function request bodies
    // We'll validate against both the app limit and Vercel's limit
    const maxSize = uploadConfig.maxVideoSizeBytes;
    const vercelLimit = 4.5 * 1024 * 1024; // 4.5MB in bytes

    if (file.size > maxSize) {
      toast.error(
        `Video size must be less than ${uploadConfig.maxVideoSizeMB}MB`
      );
      return;
    }

    // Warn if file exceeds Vercel's serverless function limit
    if (file.size > vercelLimit) {
      toast.error(
        `Video file is too large for direct upload (${(
          file.size /
          1024 /
          1024
        ).toFixed(2)}MB). ` +
          `Maximum size for direct upload is 4.5MB due to server limitations. ` +
          `Please use a smaller file or contact support for alternative upload methods.`
      );
      return;
    }

    await uploadVideo(file);
  };

  const uploadVideo = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Get video duration (optional, can be done client-side)
      let duration: number | undefined;
      try {
        const video = document.createElement("video");
        video.preload = "metadata";
        video.src = URL.createObjectURL(file);
        await new Promise((resolve, reject) => {
          video.onloadedmetadata = () => {
            duration = Math.round(video.duration);
            URL.revokeObjectURL(video.src);
            resolve(null);
          };
          video.onerror = reject;
        });
      } catch (err) {
        console.warn("Could not get video duration:", err);
      }

      // Upload file directly to API (which will proxy to R2)
      const formData = new FormData();
      formData.append("file", file);
      formData.append("lessonId", lessonId);

      const uploadResponse = await fetch("/api/upload/video", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        // Handle different error response types
        let errorMessage = "Failed to upload video";

        // Check if response is JSON
        const contentType = uploadResponse.headers.get("content-type");
        if (contentType?.includes("application/json")) {
          try {
            const error = await uploadResponse.json();
            errorMessage = error.error || errorMessage;
          } catch {
            // Fall through to default error message if JSON parsing fails
          }
        } else {
          // Handle non-JSON responses (e.g., HTML error pages, plain text)
          if (uploadResponse.status === 413) {
            errorMessage = `File too large. Maximum size is ${uploadConfig.maxVideoSizeMB}MB. The server may have additional size limits.`;
          } else {
            const text = await uploadResponse.text();
            // Try to extract meaningful error from text response
            if (
              text.includes("Payload Too Large") ||
              text.includes("Request Entity Too Large")
            ) {
              errorMessage = `File too large. Maximum size is ${uploadConfig.maxVideoSizeMB}MB.`;
            } else if (text.length < 200) {
              // Only use text if it's short (likely an error message, not HTML)
              errorMessage = text || errorMessage;
            }
          }
        }

        throw new Error(errorMessage);
      }

      const { key, url } = await uploadResponse.json();

      setUploadedVideo({
        key,
        url,
        filename: file.name,
      });

      // Notify parent component
      onUploadComplete(key, url, {
        size: file.size,
        type: file.type,
        duration,
      });

      toast.success("Video uploaded successfully!");
    } catch (error) {
      console.error("Error uploading video:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to upload video"
      );
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = () => {
    setUploadedVideo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Video Upload (Max {uploadConfig.maxVideoSizeMB}MB)
      </label>

      {uploadedVideo ? (
        <div className="flex items-center justify-between rounded-md border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            <div>
              <p className="text-sm font-medium text-green-900 dark:text-green-100">
                {uploadedVideo.filename}
              </p>
              <p className="text-xs text-green-700 dark:text-green-300">
                Video uploaded successfully
              </p>
            </div>
          </div>
          <button
            onClick={handleRemove}
            className="rounded-md p-1 text-green-700 hover:bg-green-100 dark:text-green-300 dark:hover:bg-green-900/30"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <label className="flex cursor-pointer items-center gap-2 rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700">
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Select Video
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              disabled={isUploading}
              className="hidden"
            />
          </label>
          {isUploading && (
            <div className="flex-1">
              <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                <div
                  className="h-full bg-zinc-900 transition-all duration-300 dark:bg-zinc-100"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
