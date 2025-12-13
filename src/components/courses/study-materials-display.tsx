"use client";

import { useState } from "react";
import { File, Image, FileText, Download, Loader2 } from "lucide-react";

interface Material {
  id: string;
  file_name: string;
  file_key: string;
  file_type: string | null;
  file_size: number | null;
  material_type: string | null;
}

interface StudyMaterialsDisplayProps {
  materials: Material[];
  courseId: string;
  lessonId?: string;
}

export function StudyMaterialsDisplay({
  materials,
  courseId,
  lessonId,
}: StudyMaterialsDisplayProps) {
  const [materialUrls, setMaterialUrls] = useState<Record<string, string>>({});
  const [loadingMaterialUrl, setLoadingMaterialUrl] = useState<string | null>(
    null
  );

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

  const handleDownload = async (material: Material) => {
    let materialUrl = materialUrls[material.id];

    if (!materialUrl) {
      // Fetch URL first
      setLoadingMaterialUrl(material.id);
      try {
        const url = lessonId
          ? `/api/my-courses/${courseId}/lessons/${lessonId}/materials/${material.id}/url`
          : `/api/my-courses/${courseId}/materials/${material.id}/url`;

        const response = await fetch(url);
        if (response.ok) {
          const { materialUrl: url } = await response.json();
          setMaterialUrls((prev) => ({ ...prev, [material.id]: url }));
          materialUrl = url;
        }
      } catch (error) {
        console.error("Error fetching material URL:", error);
        return;
      } finally {
        setLoadingMaterialUrl(null);
      }
    }

    if (materialUrl) {
      window.open(materialUrl, "_blank");
    }
  };

  if (materials.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-800">
      <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        Study Materials ({materials.length})
      </h3>
      <div className="space-y-2">
        {materials.map((material) => {
          const isLoading = loadingMaterialUrl === material.id;
          const hasUrl = !!materialUrls[material.id];

          return (
            <div
              key={material.id}
              className="flex items-center justify-between rounded-md border border-zinc-200 bg-zinc-50 p-2 dark:border-zinc-700 dark:bg-zinc-900"
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
              <button
                onClick={() => handleDownload(material)}
                disabled={isLoading}
                className="inline-flex items-center gap-1 rounded-md bg-zinc-900 px-2 py-1 text-xs font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                {isLoading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Download className="h-3 w-3" />
                )}
                Download
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
