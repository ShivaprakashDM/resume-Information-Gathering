"use client";

import React from "react"

import { useState, useCallback, useRef } from "react";
import { Upload, FileText, X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ResumeUploaderProps {
  onFileUpload: (file: File) => void;
  isProcessing?: boolean;
}

export function ResumeUploader({ onFileUpload, isProcessing = false }: ResumeUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      setError("Please upload a PDF, DOC, DOCX, or TXT file");
      return false;
    }

    if (file.size > maxSize) {
      setError("File size must be less than 10MB");
      return false;
    }

    setError(null);
    return true;
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile && validateFile(droppedFile)) {
        setFile(droppedFile);
        onFileUpload(droppedFile);
      }
    },
    [onFileUpload]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && validateFile(selectedFile)) {
      setFile(selectedFile);
      onFileUpload(selectedFile);
    }
  };

  const removeFile = () => {
    setFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt"
        onChange={handleFileSelect}
        className="hidden"
        id="resume-upload"
      />

      {!file ? (
        <label
          htmlFor="resume-upload"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "flex flex-col items-center justify-center w-full min-h-[240px] rounded-xl border-2 border-dashed cursor-pointer transition-all duration-300",
            isDragging
              ? "border-primary bg-primary/5 scale-[1.02]"
              : "border-border hover:border-primary/50 hover:bg-secondary/50",
            error && "border-destructive"
          )}
        >
          <div className="flex flex-col items-center gap-4 p-8 text-center">
            <div
              className={cn(
                "p-4 rounded-full transition-colors duration-300",
                isDragging ? "bg-primary/20" : "bg-secondary"
              )}
            >
              <Upload
                className={cn(
                  "w-8 h-8 transition-colors duration-300",
                  isDragging ? "text-primary" : "text-muted-foreground"
                )}
              />
            </div>
            <div>
              <p className="text-lg font-medium text-foreground">
                {isDragging ? "Drop your resume here" : "Drag & drop your resume"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                or click to browse from your device
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
              <span className="px-2 py-1 rounded-md bg-secondary">PDF</span>
              <span className="px-2 py-1 rounded-md bg-secondary">DOC</span>
              <span className="px-2 py-1 rounded-md bg-secondary">DOCX</span>
              <span className="px-2 py-1 rounded-md bg-secondary">TXT</span>
              <span className="text-muted-foreground/60">• Max 10MB</span>
            </div>
          </div>
        </label>
      ) : (
        <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50 border border-border">
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
            <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
          </div>
          <div className="flex items-center gap-2">
            {isProcessing ? (
              <div className="flex items-center gap-2 text-primary">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">Processing...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-success">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm">Ready</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={removeFile}
              disabled={isProcessing}
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
            >
              <X className="w-4 h-4" />
              <span className="sr-only">Remove file</span>
            </Button>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 mt-3 text-sm text-destructive">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
