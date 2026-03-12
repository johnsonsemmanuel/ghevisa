"use client";

import React, { useCallback, useState } from "react";
import { Upload, X, FileText, AlertCircle } from "lucide-react";

interface FileUploadProps {
  label?: string;
  accept?: string;
  maxSizeMB?: number;
  onFileSelect: (file: File) => void;
  error?: string;
  currentFile?: string | null;
}

export function FileUpload({
  label,
  accept = ".jpeg,.jpg,.png,.pdf",
  maxSizeMB = 5,
  onFileSelect,
  error,
  currentFile,
}: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(currentFile || null);
  const [fileError, setFileError] = useState<string | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      setFileError(null);
      if (file.size > maxSizeMB * 1024 * 1024) {
        setFileError(`File must be under ${maxSizeMB}MB`);
        return;
      }
      const allowed = accept.split(",").map((s) => s.trim().replace(".", ""));
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (ext && !allowed.includes(ext)) {
        setFileError(`Allowed formats: ${allowed.join(", ")}`);
        return;
      }
      setFileName(file.name);
      onFileSelect(file);
    },
    [accept, maxSizeMB, onFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const displayError = error || fileError;

  return (
    <div>
      {label && <label className="label">{label}</label>}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
          ${dragOver ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"}
          ${displayError ? "border-danger" : ""}`}
      >
        <input
          type="file"
          accept={accept}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        {fileName ? (
          <div className="flex items-center justify-center gap-2 text-text-primary">
            <FileText size={20} className="text-accent" />
            <span className="text-sm font-medium">{fileName}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setFileName(null);
              }}
              className="p-1 hover:bg-surface rounded cursor-pointer"
            >
              <X size={14} className="text-text-muted" />
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload size={24} className="mx-auto text-text-muted" />
            <p className="text-sm text-text-secondary">
              Drag & drop or{" "}
              <span className="text-accent font-medium">browse</span>
            </p>
            <p className="text-xs text-text-muted">
              Max {maxSizeMB}MB · {accept.replace(/\./g, "").toUpperCase()}
            </p>
          </div>
        )}
      </div>
      {displayError && (
        <p className="flex items-center gap-1 text-danger text-xs mt-1">
          <AlertCircle size={12} /> {displayError}
        </p>
      )}
    </div>
  );
}
