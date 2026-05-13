"use client";

import { useRef, useState } from "react";
import { Upload, FileIcon, Trash2, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useFiles, useUploadFile, useDeleteFile } from "@/hooks/useFiles";
import type { ResearchFile } from "@/services/files.service";

const CATEGORIES = [
  { value: "manuscript", label: "Manuscript" },
  { value: "dataset", label: "Dataset" },
  { value: "source_code", label: "Source Code" },
  { value: "figures", label: "Figures" },
  { value: "ethics", label: "Ethics Documents" },
  { value: "reviewer_response", label: "Reviewer Response" },
  { value: "supplementary", label: "Supplementary" },
  { value: "other", label: "Other" },
];

function formatBytes(bytes: number) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const EXT_ICON: Record<string, string> = {
  pdf: "📄", docx: "📝", xlsx: "📊", pptx: "📋",
  zip: "🗜️", csv: "📊", json: "📋", png: "🖼️",
  jpg: "🖼️", jpeg: "🖼️", gif: "🖼️", py: "🐍", ipynb: "📓",
};

export function FileUploadZone({ paperId }: { paperId: number | string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [category, setCategory] = useState("manuscript");
  const [dragging, setDragging] = useState(false);

  const { data: files, isLoading } = useFiles(paperId);
  const upload = useUploadFile(paperId);
  const remove = useDeleteFile(paperId);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList?.length) return;
    const file = fileList[0];
    upload.mutate(
      { file, category },
      {
        onSuccess: () => toast.success(`${file.name} uploaded.`),
        onError: () => toast.error("Upload failed."),
      }
    );
  };

  return (
    <div className="space-y-5">
      {/* Upload area */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Select value={category} onValueChange={(v) => setCategory(v as string)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => inputRef.current?.click()}
            disabled={upload.isPending}
          >
            {upload.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {upload.isPending ? "Uploading…" : "Choose file"}
          </Button>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>

        <div
          className={cn(
            "rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors",
            dragging ? "border-zinc-400 bg-zinc-50" : "border-zinc-200"
          )}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
        >
          <Upload className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
          <p className="text-sm text-muted-foreground">
            Drag & drop a file here, or{" "}
            <button
              type="button"
              className="underline underline-offset-4 hover:text-foreground"
              onClick={() => inputRef.current?.click()}
            >
              browse
            </button>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            PDF, DOCX, XLSX, CSV, ZIP, images, source code
          </p>
        </div>
      </div>

      {/* File list */}
      {isLoading ? (
        <p className="text-sm text-muted-foreground text-center py-4">Loading…</p>
      ) : !files?.length ? (
        <p className="text-sm text-muted-foreground text-center py-4">No files uploaded yet.</p>
      ) : (
        <div className="rounded-xl border bg-white divide-y">
          {files.map((f: ResearchFile) => (
            <div key={f.id} className="flex items-center gap-3 px-4 py-3">
              <span className="text-xl leading-none">
                {EXT_ICON[f.file_type] ?? "📁"}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{f.original_filename}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {f.category.replace("_", " ")} · v{f.version} · {formatBytes(f.size_bytes)}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <a
                  href={f.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={f.original_filename}
                >
                  <Button variant="ghost" size="icon" className="h-7 w-7" title="Download">
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                </a>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                  title="Delete"
                  disabled={remove.isPending}
                  onClick={() =>
                    remove.mutate(f.id, {
                      onSuccess: () => toast.success("File deleted."),
                      onError: () => toast.error("Delete failed."),
                    })
                  }
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
