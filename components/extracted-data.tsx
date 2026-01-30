"use client";

import React from "react"

import { useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Link2,
  Github,
  Linkedin,
  Globe,
  CheckCircle2,
  AlertTriangle,
  Edit3,
  Save,
  X,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface ResumeData {
  contact: {
    name: string;
    email: string;
    phone: string;
    location: string;
  };
  links: {
    linkedin?: string;
    github?: string;
    portfolio?: string;
    other?: string[];
  };
  projects: {
    title: string;
    description: string;
    technologies: string[];
  }[];
  experience: {
    title: string;
    company: string;
    duration: string;
    description: string;
  }[];
  education: {
    degree: string;
    institution: string;
    year: string;
  }[];
  skills: string[];
  validation: {
    isValid: boolean;
    warnings: string[];
    errors: string[];
  };
}

interface ExtractedDataProps {
  data: ResumeData;
  onDataUpdate?: (data: ResumeData) => void;
}

interface EditableFieldProps {
  value: string;
  onSave: (value: string) => void;
  multiline?: boolean;
  className?: string;
}

function EditableField({ value, onSave, multiline = false, className }: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleSave = () => {
    onSave(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <div className="group flex items-start gap-2">
        <span className={cn("flex-1", className)}>{value || "Not provided"}</span>
        <button
          onClick={() => setIsEditing(true)}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-secondary rounded"
        >
          <Edit3 className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2">
      {multiline ? (
        <Textarea
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="flex-1 min-h-[80px] text-sm"
          autoFocus
        />
      ) : (
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="flex-1 h-8 text-sm"
          autoFocus
        />
      )}
      <div className="flex gap-1">
        <button onClick={handleSave} className="p-1.5 bg-primary/10 hover:bg-primary/20 rounded transition-colors">
          <Save className="w-3.5 h-3.5 text-primary" />
        </button>
        <button onClick={handleCancel} className="p-1.5 bg-secondary hover:bg-secondary/80 rounded transition-colors">
          <X className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}

function SectionCard({
  title,
  icon: Icon,
  children,
  className,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border border-border bg-card p-5", className)}>
      <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-border">
        <div className="p-2 rounded-lg bg-primary/10">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <h3 className="font-semibold text-foreground">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export function ExtractedData({ data, onDataUpdate }: ExtractedDataProps) {
  const [resumeData, setResumeData] = useState(data);

  const updateField = (path: string, value: string) => {
    const newData = { ...resumeData };
    const keys = path.split(".");
    let current: Record<string, unknown> = newData;
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]] as Record<string, unknown>;
    }
    current[keys[keys.length - 1]] = value;
    setResumeData(newData as ResumeData);
    onDataUpdate?.(newData as ResumeData);
  };

  const getLinkIcon = (type: string) => {
    switch (type) {
      case "linkedin":
        return Linkedin;
      case "github":
        return Github;
      case "portfolio":
        return Globe;
      default:
        return Link2;
    }
  };

  return (
    <div className="space-y-6">
      {/* Validation Status */}
      <div
        className={cn(
          "rounded-xl p-4 border",
          resumeData.validation.isValid
            ? "bg-success/10 border-success/20"
            : resumeData.validation.errors.length > 0
            ? "bg-destructive/10 border-destructive/20"
            : "bg-warning/10 border-warning/20"
        )}
      >
        <div className="flex items-center gap-3">
          {resumeData.validation.isValid ? (
            <CheckCircle2 className="w-5 h-5 text-success" />
          ) : (
            <AlertTriangle
              className={cn("w-5 h-5", resumeData.validation.errors.length > 0 ? "text-destructive" : "text-warning")}
            />
          )}
          <div>
            <p
              className={cn(
                "font-medium",
                resumeData.validation.isValid
                  ? "text-success"
                  : resumeData.validation.errors.length > 0
                  ? "text-destructive"
                  : "text-warning"
              )}
            >
              {resumeData.validation.isValid
                ? "Resume validated successfully"
                : resumeData.validation.errors.length > 0
                ? "Validation errors found"
                : "Validation warnings"}
            </p>
            {(resumeData.validation.errors.length > 0 || resumeData.validation.warnings.length > 0) && (
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                {resumeData.validation.errors.map((error, i) => (
                  <li key={`error-${i}`} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
                    {error}
                  </li>
                ))}
                {resumeData.validation.warnings.map((warning, i) => (
                  <li key={`warning-${i}`} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-warning" />
                    {warning}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <SectionCard title="Contact Information" icon={User}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground uppercase tracking-wider">Full Name</label>
            <EditableField
              value={resumeData.contact.name}
              onSave={(v) => updateField("contact.name", v)}
              className="font-medium text-foreground"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Mail className="w-3 h-3" /> Email
            </label>
            <EditableField value={resumeData.contact.email} onSave={(v) => updateField("contact.email", v)} />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Phone className="w-3 h-3" /> Phone
            </label>
            <EditableField value={resumeData.contact.phone} onSave={(v) => updateField("contact.phone", v)} />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3 h-3" /> Location
            </label>
            <EditableField value={resumeData.contact.location} onSave={(v) => updateField("contact.location", v)} />
          </div>
        </div>
      </SectionCard>

      {/* Links */}
      <SectionCard title="Profile Links" icon={Link2}>
        <div className="space-y-3">
          {Object.entries(resumeData.links)
            .filter(([, value]) => value && (typeof value === "string" ? value : value.length > 0))
            .map(([key, value]) => {
              if (Array.isArray(value)) {
                return value.map((link, i) => {
                  const Icon = getLinkIcon("other");
                  return (
                    <div key={`${key}-${i}`} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 text-sm text-primary hover:underline truncate"
                      >
                        {link}
                      </a>
                      <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                  );
                });
              }
              const Icon = getLinkIcon(key);
              return (
                <div key={key} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground uppercase w-20">{key}</span>
                  <a
                    href={value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-sm text-primary hover:underline truncate"
                  >
                    {value}
                  </a>
                  <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
              );
            })}
        </div>
      </SectionCard>

      {/* Projects */}
      {resumeData.projects.length > 0 && (
        <SectionCard title="Projects" icon={Briefcase}>
          <div className="space-y-4">
            {resumeData.projects.map((project, i) => (
              <div key={i} className="p-4 rounded-lg bg-secondary/30 border border-border/50">
                <h4 className="font-medium text-foreground mb-2">{project.title}</h4>
                <p className="text-sm text-muted-foreground mb-3">{project.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {project.technologies.map((tech, j) => (
                    <Badge key={j} variant="secondary" className="text-xs bg-primary/10 text-primary border-0">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Experience */}
      {resumeData.experience.length > 0 && (
        <SectionCard title="Experience" icon={Briefcase}>
          <div className="space-y-4">
            {resumeData.experience.map((exp, i) => (
              <div key={i} className="relative pl-4 border-l-2 border-primary/30">
                <div className="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-primary" />
                <div className="mb-1">
                  <h4 className="font-medium text-foreground">{exp.title}</h4>
                  <p className="text-sm text-primary">{exp.company}</p>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{exp.duration}</p>
                <p className="text-sm text-muted-foreground">{exp.description}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Education */}
      {resumeData.education.length > 0 && (
        <SectionCard title="Education" icon={GraduationCap}>
          <div className="space-y-3">
            {resumeData.education.map((edu, i) => (
              <div key={i} className="flex items-start justify-between p-3 rounded-lg bg-secondary/30">
                <div>
                  <h4 className="font-medium text-foreground">{edu.degree}</h4>
                  <p className="text-sm text-muted-foreground">{edu.institution}</p>
                </div>
                <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">{edu.year}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Skills */}
      {resumeData.skills.length > 0 && (
        <SectionCard title="Skills" icon={CheckCircle2}>
          <div className="flex flex-wrap gap-2">
            {resumeData.skills.map((skill, i) => (
              <Badge key={i} variant="outline" className="px-3 py-1.5 text-sm bg-secondary/50 border-border">
                {skill}
              </Badge>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
        <Button variant="outline" className="flex-1 bg-transparent">
          Download as JSON
        </Button>
      </div>
    </div>
  );
}
