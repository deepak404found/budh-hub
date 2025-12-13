"use client";

import { useState, useRef } from "react";
import { Upload, X, CheckCircle2, Loader2, Image } from "lucide-react";
import { toast } from "sonner";
import { uploadConfig } from "@/lib/config/env";

interface ThumbnailUploadProps {
  courseId: string;
  onUploadComplete: (
    thumbnailKey: string,
    thumbnailUrl: string,
    metadata: {
      filename: string;
      size: number;
      type: string;
    }
  ) => void;
  currentThumbnailKey?: string;
  currentThumbnailUrl?: string;
}

export function ThumbnailUpload({
  courseId,
  onUploadComplete,
  currentThumbnailKey,
  currentThumbnailUrl,
}: ThumbnailUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedThumbnail, setUploadedThumbnail] = useState<{
    key: string;
    url: string;
    filename: string;
  } | null>(
    currentThumbnailKey && currentThumbnailUrl
      ? {
          key: currentThumbnailKey,
          url: currentThumbnailUrl,
          filename: currentThumbnailKey.split("/").pop() || "thumbnail",
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
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (use material size limit for thumbnails)
    const maxSize = uploadConfig.maxMaterialSizeBytes;
    if (file.size > maxSize) {
      toast.error(
        `Image size must be less than ${uploadConfig.maxMaterialSizeMB}MB`
      );
      return;
    }

    await uploadThumbnail(file);
  };

  const uploadThumbnail = async (file: File) => {
    setIsUploading(true);

    try {
      // Upload file directly to API (which will proxy to R2)
      const formData = new FormData();
      formData.append("file", file);
      formData.append("courseId", courseId);

      const uploadResponse = await fetch("/api/upload/thumbnail", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        const error = await uploadResponse.json();
        throw new Error(error.error || "Failed to upload thumbnail");
      }

      const { key, url } = await uploadResponse.json();

      setUploadedThumbnail({
        key,
        url,
        filename: file.name,
      });

      // Notify parent component
      onUploadComplete(key, url, {
        filename: file.name,
        size: file.size,
        type: file.type,
      });

      toast.success("Thumbnail uploaded successfully!");
    } catch (error) {
      console.error("Error uploading thumbnail:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to upload thumbnail"
      );
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = () => {
    setUploadedThumbnail(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    // Notify parent that thumbnail was removed
    onUploadComplete("", "", {
      filename: "",
      size: 0,
      type: "",
    });
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Course Thumbnail (Max {uploadConfig.maxMaterialSizeMB}MB)
      </label>

      {uploadedThumbnail ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between rounded-md border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20">
            <div className="flex items-center gap-3">
              <Image className="h-5 w-5 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                  {uploadedThumbnail.filename}
                </p>
                <p className="text-xs text-green-700 dark:text-green-300">
                  Thumbnail uploaded successfully
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
          <div className="relative h-32 w-full overflow-hidden rounded-md border border-zinc-200 dark:border-zinc-700">
            <img
              src={uploadedThumbnail.url}
              alt="Course thumbnail"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      ) : (
        <label className="flex cursor-pointer items-center gap-2 rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700">
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Select Thumbnail
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={isUploading}
            className="hidden"
          />
        </label>
      )}
    </div>
  );
}
