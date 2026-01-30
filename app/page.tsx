"use client";

import { useState } from "react";
import { ResumeUploader } from "@/components/resume-uploader";
import { ExtractedData, type ResumeData } from "@/components/extracted-data";
import { FileText, Sparkles, Shield, Zap } from "lucide-react";

export default function HomePage() {
  const [extractedData, setExtractedData] = useState<ResumeData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/parse-resume", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to parse resume");
      }

      const data = await response.json();
      setExtractedData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process resume");
      console.error("Error processing resume:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDataUpdate = (data: ResumeData) => {
    setExtractedData(data);
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">Resume Parser</h1>
                <p className="text-xs text-muted-foreground">AI-Powered Information Extraction</p>
              </div>
            </div>
            <nav className="hidden sm:flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#features" className="hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#upload" className="hover:text-foreground transition-colors">
                Upload
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm mb-6">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Resume Analysis</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 text-balance">
            Extract resume data in seconds
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12 text-pretty">
            Upload your resume and let our AI extract projects, links, contact information, and more. Edit and validate
            your data with ease.
          </p>

          {/* Features */}
          <div id="features" className="grid sm:grid-cols-3 gap-6 mb-16">
            <div className="p-6 rounded-xl bg-card border border-border">
              <div className="p-3 rounded-lg bg-primary/10 w-fit mx-auto mb-4">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Instant Extraction</h3>
              <p className="text-sm text-muted-foreground">
                Advanced NLP algorithms parse your resume in seconds
              </p>
            </div>
            <div className="p-6 rounded-xl bg-card border border-border">
              <div className="p-3 rounded-lg bg-primary/10 w-fit mx-auto mb-4">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Smart Validation</h3>
              <p className="text-sm text-muted-foreground">
                Automatic checks for email format, missing fields, and more
              </p>
            </div>
            <div className="p-6 rounded-xl bg-card border border-border">
              <div className="p-3 rounded-lg bg-primary/10 w-fit mx-auto mb-4">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Editable Results</h3>
              <p className="text-sm text-muted-foreground">
                Review and edit extracted data before saving
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Upload Section */}
      <section id="upload" className="pb-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h3 className="text-2xl font-semibold text-foreground mb-2">Upload Your Resume</h3>
            <p className="text-muted-foreground">
              Drag and drop your resume file or click to browse. Supported formats: PDF, DOC, DOCX, TXT
            </p>
          </div>

          <ResumeUploader onFileUpload={handleFileUpload} isProcessing={isProcessing} />

          {/* Error Display */}
          {error && (
            <div className="mt-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
              <p className="font-medium">Error processing resume</p>
              <p className="text-sm mt-1 opacity-80">{error}</p>
            </div>
          )}

          {/* Extracted Data Display */}
          {extractedData && !isProcessing && (
            <div className="mt-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px flex-1 bg-border" />
                <span className="text-sm text-muted-foreground px-3">Extracted Information</span>
                <div className="h-px flex-1 bg-border" />
              </div>
              <ExtractedData data={extractedData} onDataUpdate={handleDataUpdate} />
            </div>
          )}

          {/* Processing State */}
          {isProcessing && (
            <div className="mt-12 flex flex-col items-center justify-center py-16 text-center">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-primary/20" />
                <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              </div>
              <p className="mt-6 text-lg font-medium text-foreground">Analyzing your resume...</p>
              <p className="text-sm text-muted-foreground mt-2">Extracting projects, skills, and contact information</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span>Resume Parser</span>
          </div>
          <p>Built with Next.js and AI</p>
        </div>
      </footer>
    </main>
  );
}
