// Template data interfaces for structured block creation

export interface SummaryTemplateData {
  content: string;
}

export interface EducationTemplateData {
  institution: string;
  location: string;
  degree: string;
  dateRange: string;
  gpa?: string;
  coursework?: string;
}

export interface ExperienceTemplateData {
  jobTitle: string;
  company: string;
  location: string;
  dateRange: string;
  bulletPoints: string[];
}

export interface ProjectTemplateData {
  name: string;
  subtitle?: string;
  techStack: string;
  bulletPoints: string[];
}

export interface SkillsTemplateData {
  categories: {
    name: string;
    skills: string;
  }[];
}

export interface AchievementTemplateData {
  description: string;
}

export interface CertificationTemplateData {
  title: string;
  details?: string;
}

export type TemplateData =
  | SummaryTemplateData
  | EducationTemplateData
  | ExperienceTemplateData
  | ProjectTemplateData
  | SkillsTemplateData
  | AchievementTemplateData
  | CertificationTemplateData;

// Template type definitions
export const TEMPLATE_TYPES = {
  SUMMARY: {
    label: "Summary",
    sectionType: "SUMMARY",
    fields: ["content"],
  },
  EDUCATION: {
    label: "Education",
    sectionType: "EDUCATION",
    fields: ["institution", "location", "degree", "dateRange", "gpa", "coursework"],
  },
  EXPERIENCE: {
    label: "Experience",
    sectionType: "EXPERIENCE",
    fields: ["jobTitle", "company", "location", "dateRange", "bulletPoints"],
  },
  PROJECT: {
    label: "Project",
    sectionType: "PROJECTS",
    fields: ["name", "subtitle", "techStack", "bulletPoints"],
  },
  SKILLS: {
    label: "Skills",
    sectionType: "SKILLS",
    fields: ["categories"],
  },
  ACHIEVEMENT: {
    label: "Achievement",
    sectionType: "ACHIEVEMENTS",
    fields: ["description"],
  },
  CERTIFICATION: {
    label: "Certification",
    sectionType: "CERTIFICATIONS",
    fields: ["title", "details"],
  },
} as const;

export type TemplateType = keyof typeof TEMPLATE_TYPES;

// LaTeX generators for each template type

export function generateSummaryLatex(data: SummaryTemplateData): string {
  return `\\small{${escapeLatex(data.content)}}`;
}

export function generateEducationLatex(data: EducationTemplateData): string {
  const lines = [
    `\\resumeEducationHeading`,
    `  {${escapeLatex(data.institution)}}{${escapeLatex(data.dateRange)}}`,
    `  {${escapeLatex(data.location)}}`,
    `  {${escapeLatex(data.degree)}}`,
  ];

  if (data.gpa) {
    lines.push(`  % GPA: ${escapeLatex(data.gpa)}`);
  }

  if (data.coursework) {
    lines.push(`  % Coursework: ${escapeLatex(data.coursework)}`);
  }

  return lines.join("\n");
}

export function generateExperienceLatex(data: ExperienceTemplateData): string {
  const header = `\\resumeExperienceHeading
  {${escapeLatex(data.jobTitle)} | ${escapeLatex(data.company)}, ${escapeLatex(data.location)}}{${escapeLatex(data.dateRange)}}{}`;

  const bullets = data.bulletPoints
    .filter((bp) => bp.trim())
    .map((bp) => `    \\resumeItem{${escapeLatex(bp)}}`)
    .join("\n");

  return `${header}
  \\resumeItemListStart
${bullets}
  \\resumeItemListEnd`;
}

export function generateProjectLatex(data: ProjectTemplateData): string {
  const titlePart = data.subtitle
    ? `\\textbf{${escapeLatex(data.name)}} -- ${escapeLatex(data.subtitle)}`
    : `\\textbf{${escapeLatex(data.name)}}`;

  const header = `\\resumeProjectHeading
  {${titlePart} | \\emph{${escapeLatex(data.techStack)}}}{}`;

  const bullets = data.bulletPoints
    .filter((bp) => bp.trim())
    .map((bp) => `    \\resumeItem{${escapeLatex(bp)}}`)
    .join("\n");

  return `${header}
  \\resumeItemListStart
${bullets}
  \\resumeItemListEnd`;
}

export function generateSkillsLatex(data: SkillsTemplateData): string {
  const items = data.categories
    .filter((cat) => cat.name.trim() && cat.skills.trim())
    .map((cat) => `    \\textbf{${escapeLatex(cat.name)}}: ${escapeLatex(cat.skills)} \\\\`)
    .join("\n");

  return `\\small{\\item{
${items}
  }}`;
}

export function generateAchievementLatex(data: AchievementTemplateData): string {
  return `\\item ${escapeLatex(data.description)}`;
}

export function generateCertificationLatex(data: CertificationTemplateData): string {
  if (data.details) {
    return `\\item ${escapeLatex(data.title)}: ${escapeLatex(data.details)}`;
  }
  return `\\item ${escapeLatex(data.title)}`;
}

// Main generator function
export function generateLatexFromTemplate(
  templateType: TemplateType,
  data: TemplateData
): string {
  switch (templateType) {
    case "SUMMARY":
      return generateSummaryLatex(data as SummaryTemplateData);
    case "EDUCATION":
      return generateEducationLatex(data as EducationTemplateData);
    case "EXPERIENCE":
      return generateExperienceLatex(data as ExperienceTemplateData);
    case "PROJECT":
      return generateProjectLatex(data as ProjectTemplateData);
    case "SKILLS":
      return generateSkillsLatex(data as SkillsTemplateData);
    case "ACHIEVEMENT":
      return generateAchievementLatex(data as AchievementTemplateData);
    case "CERTIFICATION":
      return generateCertificationLatex(data as CertificationTemplateData);
    default:
      throw new Error(`Unknown template type: ${templateType}`);
  }
}

// Escape special LaTeX characters
function escapeLatex(text: string): string {
  // Don't escape if it looks like it already contains LaTeX commands
  if (text.includes("\\") && (text.includes("{") || text.includes("}"))) {
    return text;
  }
  
  return text
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/&/g, "\\&")
    .replace(/%/g, "\\%")
    .replace(/\$/g, "\\$")
    .replace(/#/g, "\\#")
    .replace(/_/g, "\\_")
    .replace(/\{/g, "\\{")
    .replace(/\}/g, "\\}")
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/\^/g, "\\textasciicircum{}");
}
