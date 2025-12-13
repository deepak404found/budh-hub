"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Upload,
  Trash2,
  File,
  Image,
  FileText,
  Download,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { MaterialUpload } from "@/components/upload/material-upload";
import { getPublicUrl } from "@/lib/r2/utils";

interface Material {
  id: string;
  file_name: string;
  file_key: string;
  file_type: string | null;
  file_size: number | null;
  material_type: string | null;
  created_at: Date | string;
}

interface MaterialsManagerProps {
  courseId: string;
  lessonId?: string;
  moduleId?: string;
  onMaterialsChange?: () => void;
}

export function MaterialsManager({
  courseId,
  lessonId,
  moduleId,
  onMaterialsChange,
}: MaterialsManagerProps) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);

  const fetchMaterials = useCallback(async () => {
    setIsLoading(true);
    try {
      let url: string;
      if (lessonId && moduleId) {
        url = `/api/instructor/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/materials`;
      } else {
        url = `/api/instructor/courses/${courseId}/materials`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch materials");
      }

      const data = await response.json();
      setMaterials(data.materials || []);
    } catch (error) {
      console.error("Error fetching materials:", error);
      toast.error("Failed to load materials");
    } finally {
      setIsLoading(false);
    }
  }, [courseId, lessonId, moduleId]);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  const handleMaterialUpload = async (
    materialKey: string,
    materialUrl: string,
    metadata: {
      filename: string;
      size: number;
      type: string;
      materialType: "image" | "document" | "pdf" | "other";
    }
  ) => {
    if (!materialKey || !materialUrl) {
      return;
    }

    try {
      let url: string;
      let body: any = {
        file_name: metadata.filename,
        file_key: materialKey,
        file_type: metadata.type,
        file_size: metadata.size,
        material_type: metadata.materialType,
      };

      if (lessonId && moduleId) {
        url = `/api/instructor/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/materials`;
      } else {
        url = `/api/instructor/courses/${courseId}/materials`;
      }

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save material");
      }

      toast.success("Material saved successfully!");
      setShowUpload(false);
      fetchMaterials();
      onMaterialsChange?.();
    } catch (error) {
      console.error("Error saving material:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save material"
      );
    }
  };

  const handleDeleteMaterial = async (materialId: string) => {
    if (!confirm("Are you sure you want to delete this material?")) {
      return;
    }

    setIsDeleting(materialId);
    try {
      let url: string;
      if (lessonId && moduleId) {
        url = `/api/instructor/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/materials/${materialId}`;
      } else {
        url = `/api/instructor/courses/${courseId}/materials/${materialId}`;
      }

      const response = await fetch(url, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete material");
      }

      toast.success("Material deleted successfully!");
      fetchMaterials();
      onMaterialsChange?.();
    } catch (error) {
      console.error("Error deleting material:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete material"
      );
    } finally {
      setIsDeleting(null);
    }
  };

  const getMaterialIcon = (
    materialType: string | null,
    fileType: string | null
  ) => {
    if (materialType === "image" || fileType?.startsWith("image/")) {
      return <Image className="h-4 w-4" />;
    }
    if (materialType === "pdf" || fileType === "application/pdf") {
      return <FileText className="h-4 w-4" />;
    }
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "Unknown size";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getMaterialUrl = (material: Material) => {
    try {
      return getPublicUrl(material.file_key);
    } catch (error) {
      console.error("Error getting material URL:", error);
      return "#";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Study Materials ({materials.length})
        </label>
        {!showUpload && (
          <button
            onClick={() => setShowUpload(true)}
            className="inline-flex items-center gap-1 rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            <Upload className="h-3 w-3" />
            Add Material
          </button>
        )}
      </div>

      {showUpload && (
        <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-900">
          <MaterialUpload
            courseId={courseId}
            lessonId={lessonId}
            onUploadComplete={handleMaterialUpload}
          />
          <button
            onClick={() => setShowUpload(false)}
            className="mt-2 text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
          >
            Cancel
          </button>
        </div>
      )}

      {materials.length === 0 && !showUpload ? (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          No materials uploaded yet
        </p>
      ) : (
        <div className="space-y-2">
          {materials.map((material) => (
            <div
              key={material.id}
              className="flex items-center justify-between rounded-md border border-zinc-200 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-800"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="text-zinc-400 shrink-0">
                  {getMaterialIcon(material.material_type, material.file_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100 truncate">
                    {material.file_name}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {formatFileSize(material.file_size)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <a
                  href={getMaterialUrl(material)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-300"
                  title="Download"
                >
                  <Download className="h-3 w-3" />
                </a>
                <button
                  onClick={() => handleDeleteMaterial(material.id)}
                  disabled={isDeleting === material.id}
                  className="rounded-md p-1 text-red-500 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 disabled:opacity-50"
                  title="Delete"
                >
                  {isDeleting === material.id ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Trash2 className="h-3 w-3" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
