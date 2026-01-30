import type { NextRequest } from "next/server";
import { extractText } from "unpdf";

// Regex patterns for extracting resume information
const patterns = {
  email: /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/gi,
  phone: /(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{2,4}\)?[-.\s]?)?(?:\d{2,4}[-.\s]?){1,3}\d{2,4}/g,
  linkedin: /(?:https?:\/\/)?(?:[\w]+\.)?linkedin\.com\/(?:in|profile)\/[\w-]+\/?/gi,
  github: /(?:https?:\/\/)?(?:www\.)?github\.com\/[\w-]+\/?/gi,
  year: /\b(19|20)\d{2}\b/g,
  dateRange: /(?:\d{4}\s*[-–—to]+\s*(?:\d{4}|Present|Current|Now|Ongoing))|(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4}\s*[-–—to]+\s*(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4}|Present|Current|Now))/gi,
};

const commonSkills = [
  "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Ruby", "Go", "Rust", "Swift", "Kotlin", "PHP",
  "React", "Vue", "Angular", "Next.js", "Node.js", "Express", "Django", "Flask", "Spring", "Laravel", "FastAPI",
  "HTML", "CSS", "Tailwind", "SASS", "Bootstrap", "Material UI", "Chakra UI", "Styled Components",
  "SQL", "PostgreSQL", "MySQL", "MongoDB", "Redis", "Firebase", "Supabase", "DynamoDB", "Oracle", "SQLite",
  "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Terraform", "CI/CD", "Jenkins", "GitHub Actions", "GitLab",
  "Git", "Linux", "Agile", "Scrum", "REST", "GraphQL", "WebSocket", "API", "Microservices",
  "Machine Learning", "AI", "TensorFlow", "PyTorch", "OpenAI", "NLP", "Computer Vision", "Deep Learning",
  "Figma", "Adobe XD", "Photoshop", "Illustrator", "Sketch", "UI/UX",
  "Jest", "Cypress", "Selenium", "Testing", "TDD", "Unit Testing",
];

const sectionHeaders = {
  experience: /(?:^|\n)\s*(?:work\s*)?experience|employment|professional\s*experience|career/i,
  education: /(?:^|\n)\s*education|academic|qualifications|degree/i,
  skills: /(?:^|\n)\s*(?:technical\s*)?skills|technologies|competencies|expertise|proficiency/i,
  projects: /(?:^|\n)\s*projects|portfolio|personal\s*projects|side\s*projects/i,
};

async function extractTextFromFile(file: File): Promise<string> {
  const fileName = file.name.toLowerCase();
  
  if (fileName.endsWith(".pdf")) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await extractText(new Uint8Array(arrayBuffer));
      // Handle different return types from unpdf
      if (typeof result === "string") {
        return result;
      }
      if (result && typeof result === "object") {
        if (typeof result.text === "string") {
          return result.text;
        }
        if (Array.isArray(result.text)) {
          return result.text.join("\n");
        }
      }
      // Fallback: stringify the result
      return String(result);
    } catch (err) {
      console.error("PDF extraction error:", err);
      // Fallback: try reading as text
      return await file.text();
    }
  }
  
  return await file.text();
}

function extractName(text: string): string {
  const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 0);
  
  for (const line of lines.slice(0, 15)) {
    // Skip common non-name patterns
    if (
      /@/.test(line) ||
      /https?:\/\/|www\./i.test(line) ||
      /linkedin|github|portfolio|website/i.test(line) ||
      /^(resume|cv|curriculum|vitae|profile|summary|objective|contact|phone|email|address)/i.test(line) ||
      /^(experience|education|skills|projects|work|employment|about)/i.test(line) ||
      /\d{5,}/.test(line) || // ZIP codes, phone numbers
      line.length > 50
    ) continue;
    
    // Check for name-like pattern: 2-4 capitalized words
    const words = line.split(/\s+/);
    const isNameLike = words.length >= 2 && 
                       words.length <= 4 && 
                       words.every(w => /^[A-ZÀ-Ÿ][a-zà-ÿ]*\.?$/.test(w) || w.length <= 2);
    
    if (isNameLike) {
      return line;
    }
  }
  
  // Fallback: look for capitalized words pattern anywhere in first 10 lines
  for (const line of lines.slice(0, 10)) {
    const match = line.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})(?:\s|$|,)/);
    if (match && match[1].length < 40) {
      return match[1];
    }
  }
  
  return "Name not found";
}

function extractLocation(text: string): string {
  // Look for labeled location first
  const labeled = text.match(/(?:Location|Address|City|Based\s+in|Lives\s+in)[:\s]+([A-Za-z\s,]+?)(?:\n|$|\|)/i);
  if (labeled) return labeled[1].trim();
  
  // US City, State patterns
  const usPattern = /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?),\s*([A-Z]{2})\b/g;
  const usMatch = text.match(usPattern);
  if (usMatch) return usMatch[0];
  
  // Common cities
  const cities = /\b(New York|Los Angeles|San Francisco|Chicago|Boston|Seattle|Austin|Denver|Atlanta|Miami|Dallas|Houston|Phoenix|Portland|Toronto|Vancouver|London|Berlin|Paris|Sydney|Melbourne|Singapore|Tokyo|Mumbai|Bangalore|Hyderabad|Pune|Chennai|Delhi|Noida|Gurgaon|Kolkata|Remote)\b/gi;
  const cityMatch = text.match(cities);
  if (cityMatch) return cityMatch[0];
  
  return "Location not specified";
}

function extractExperience(text: string): Array<{ title: string; company: string; duration: string; description: string }> {
  const experiences: Array<{ title: string; company: string; duration: string; description: string }> = [];
  const lines = text.split("\n").map(l => l.trim());
  
  let inSection = false;
  let buffer: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (sectionHeaders.experience.test(line)) {
      inSection = true;
      continue;
    }
    
    if (inSection && (sectionHeaders.education.test(line) || sectionHeaders.skills.test(line) || sectionHeaders.projects.test(line))) {
      break;
    }
    
    if (inSection && line) {
      buffer.push(line);
      
      const dateMatch = line.match(patterns.dateRange);
      if (dateMatch || (buffer.length >= 3 && experiences.length < 5)) {
        if (buffer.length >= 2) {
          experiences.push({
            title: buffer[0] || "Position",
            company: buffer[1] || "Company",
            duration: dateMatch ? dateMatch[0] : "Duration not specified",
            description: buffer.slice(2).join(" ").substring(0, 200),
          });
          buffer = [];
        }
      }
    }
  }
  
  return experiences.length > 0 ? experiences : [{
    title: "Experience not extracted",
    company: "Please review manually",
    duration: "N/A",
    description: "Could not automatically extract experience.",
  }];
}

function extractEducation(text: string): Array<{ degree: string; institution: string; year: string }> {
  const education: Array<{ degree: string; institution: string; year: string }> = [];
  const degreePattern = /(?:Bachelor|Master|PhD|Ph\.?D|B\.?S\.?|B\.?A\.?|M\.?S\.?|M\.?A\.?|MBA|Associate|Diploma|B\.?Tech|M\.?Tech|B\.?E\.?|M\.?E\.?|BCA|MCA|B\.?Com|M\.?Com|BSc|MSc|BA|MA|BE|ME)/i;
  
  const lines = text.split("\n").map(l => l.trim());
  let inSection = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (sectionHeaders.education.test(line)) {
      inSection = true;
      continue;
    }
    
    if (inSection && (sectionHeaders.experience.test(line) || sectionHeaders.skills.test(line) || sectionHeaders.projects.test(line))) {
      break;
    }
    
    if (inSection && degreePattern.test(line)) {
      const years = line.match(patterns.year);
      education.push({
        degree: line.replace(patterns.year, "").trim().substring(0, 100),
        institution: lines[i + 1]?.trim().substring(0, 100) || "Institution not specified",
        year: years ? years[years.length - 1] : "N/A",
      });
    }
  }
  
  // Fallback search
  if (education.length === 0) {
    const match = text.match(new RegExp(`(${degreePattern.source})[^\\n]{0,100}`, "i"));
    if (match) {
      const years = text.match(patterns.year);
      education.push({
        degree: match[0].trim().substring(0, 100),
        institution: "Please verify",
        year: years ? years[0] : "N/A",
      });
    }
  }
  
  return education.length > 0 ? education : [{
    degree: "Education not extracted",
    institution: "Please review manually",
    year: "N/A",
  }];
}

function extractSkills(text: string): string[] {
  const found: string[] = [];
  const textLower = text.toLowerCase();
  
  for (const skill of commonSkills) {
    const skillLower = skill.toLowerCase();
    // Match whole word or with common separators
    const regex = new RegExp(`(?:^|[\\s,;|•\\-])${skillLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:[\\s,;|•\\-]|$)`, "i");
    if (regex.test(textLower) || textLower.includes(skillLower)) {
      found.push(skill);
    }
  }
  
  return found.length > 0 ? [...new Set(found)] : ["Skills not extracted"];
}

function extractProjects(text: string): Array<{ title: string; description: string; technologies: string[] }> {
  const projects: Array<{ title: string; description: string; technologies: string[] }> = [];
  const lines = text.split("\n").map(l => l.trim());
  
  let inSection = false;
  let currentProject: { title: string; description: string; technologies: string[] } | null = null;
  
  for (const line of lines) {
    if (sectionHeaders.projects.test(line)) {
      inSection = true;
      continue;
    }
    
    if (inSection && (sectionHeaders.experience.test(line) || sectionHeaders.education.test(line) || sectionHeaders.skills.test(line))) {
      if (currentProject) projects.push(currentProject);
      break;
    }
    
    if (inSection && line) {
      // New project title (short line, no period at end)
      if (line.length < 60 && !line.endsWith(".") && line.length > 3) {
        if (currentProject) projects.push(currentProject);
        currentProject = { title: line, description: "", technologies: [] };
      } else if (currentProject) {
        currentProject.description += " " + line;
        // Extract technologies mentioned
        for (const skill of commonSkills) {
          if (line.toLowerCase().includes(skill.toLowerCase()) && !currentProject.technologies.includes(skill)) {
            currentProject.technologies.push(skill);
          }
        }
      }
    }
  }
  
  if (currentProject) projects.push(currentProject);
  return projects.slice(0, 5);
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    const fileContent = await extractTextFromFile(file);
    
    if (!fileContent || fileContent.trim().length < 10) {
      return Response.json({ 
        error: "Could not extract text from file. Please try a different file format (.txt recommended)." 
      }, { status: 400 });
    }

    const emails = fileContent.match(patterns.email) || [];
    const phones = fileContent.match(patterns.phone) || [];
    const linkedins = fileContent.match(patterns.linkedin) || [];
    const githubs = fileContent.match(patterns.github) || [];
    
    const warnings: string[] = [];
    const errors: string[] = [];
    
    const name = extractName(fileContent);
    if (name === "Name not found") warnings.push("Could not extract name from resume");
    
    const email = emails[0] || null;
    if (!email) errors.push("No email address found in resume");
    
    const phone = phones[0] || null;
    if (!phone) warnings.push("No phone number found");
    
    const location = extractLocation(fileContent);
    if (location === "Location not specified") warnings.push("Location not found in resume");
    
    const skills = extractSkills(fileContent);
    const projects = extractProjects(fileContent);
    const experience = extractExperience(fileContent);
    const education = extractEducation(fileContent);

    const parsedData = {
      contact: {
        name,
        email: email || "Email not found",
        phone: phone || "Phone not found",
        location,
      },
      links: {
        linkedin: linkedins[0] || null,
        github: githubs[0] || null,
        portfolio: null,
      },
      projects,
      experience,
      education,
      skills,
      validation: {
        isValid: errors.length === 0,
        warnings,
        errors,
      },
    };

    return Response.json(parsedData);
  } catch (error) {
    console.error("Error parsing resume:", error);
    return Response.json(
      { error: "Failed to parse resume. Please try uploading a .txt file instead." },
      { status: 500 }
    );
  }
}
