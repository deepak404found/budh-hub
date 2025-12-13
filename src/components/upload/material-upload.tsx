"use client";

import { useState, useRef } from "react";
import { Upload, X, CheckCircle2, Loader2, File } from "lucide-react";
import { toast } from "sonner";
import { uploadConfig } from "@/lib/config/env";
import { getMaterialType } from "@/lib/validations/material";

interface MaterialUploadProps {
  courseId: string;
  lessonId?: string;
  materialId?: string;
  onUploadComplete: (
    materialKey: string,
    materialUrl: string,
    metadata: {
      filename: string;
      size: number;
      type: string;
      materialType: "image" | "document" | "pdf" | "other";
    }
  ) => void;
  currentMaterialKey?: string;
  currentMaterialUrl?: string;
  accept?: string;
}

export function MaterialUpload({
  courseId,
  lessonId,
  materialId,
  onUploadComplete,
  currentMaterialKey,
  currentMaterialUrl,
  accept = "image/*,application/pdf,.doc,.docx,.txt",
}: MaterialUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedMaterial, setUploadedMaterial] = useState<{
    key: string;
    url: string;
    filename: string;
  } | null>(
    currentMaterialKey && currentMaterialUrl
      ? {
          key: currentMaterialKey,
          url: currentMaterialUrl,
          filename: currentMaterialKey.split("/").pop() || "material",
        }
      : null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size
    const maxSize = uploadConfig.maxMaterialSizeBytes;
    if (file.size > maxSize) {
      toast.error(
        `File size must be less than ${uploadConfig.maxMaterialSizeMB}MB`
      );
      return;
    }

    await uploadMaterial(file);
  };

  const uploadMaterial = async (file: File) => {
    setIsUploading(true);

    try {
      // Determine material type
      const materialType = getMaterialType(file.type);

      // Upload file directly to API (which will proxy to R2)
      const formData = new FormData();
      formData.append("file", file);
      formData.append("courseId", courseId);
      if (lessonId) {
        formData.append("lessonId", lessonId);
      }
      if (materialId) {
        formData.append("materialId", materialId);
      }

      const uploadResponse = await fetch("/api/upload/material", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        const error = await uploadResponse.json();
        throw new Error(error.error || "Failed to upload material");
      }

      const { key, url } = await uploadResponse.json();

      setUploadedMaterial({
        key,
        url,
        filename: file.name,
      });

      // Notify parent component
      onUploadComplete(key, url, {
        filename: file.name,
        size: file.size,
        type: file.type,
        materialType,
      });

      toast.success("Material uploaded successfully!");
    } catch (error) {
      console.error("Error uploading material:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to upload material"
      );
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = () => {
    setUploadedMaterial(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Study Material Upload (Max {uploadConfig.maxMaterialSizeMB}MB)
      </label>

      {uploadedMaterial ? (
        <div className="flex items-center justify-between rounded-md border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20">
          <div className="flex items-center gap-3">
            <File className="h-5 w-5 text-green-600 dark:text-green-400" />
            <div>
              <p className="text-sm font-medium text-green-900 dark:text-green-100">
                {uploadedMaterial.filename}
              </p>
              <p className="text-xs text-green-700 dark:text-green-300">
                Material uploaded successfully
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
        <label className="flex cursor-pointer items-center gap-2 rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700">
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Select Material
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            disabled={isUploading}
            className="hidden"
          />
        </label>
      )}
    </div>
  );
}
