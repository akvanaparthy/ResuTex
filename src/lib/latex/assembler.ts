import { DEFAULT_PREAMBLE } from "./preamble";

interface ContentBlock {
  id: string;
  name: string;
  sectionType: string;
  latexContent: string;
}

interface ResumeStructure {
  sectionOrder: string[];
  sections: Record<string, string[]>;
}

interface HeaderData {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  website?: string;
}

interface SpacingSettings {
  section: number;
  block: number;
  line: number;
}

interface ResumeDocument {
  preamble: string;
  headerData: string;
  structure: string;
  spacing: string;
}

const SECTION_TITLES: Record<string, string> = {
  SUMMARY: "Summary",
  EDUCATION: "Education",
  EXPERIENCE: "Experience",
  PROJECTS: "Projects",
  SKILLS: "Technical Skills",
  ACHIEVEMENTS: "Achievements",
  CERTIFICATIONS: "Certifications",
};

const SECTION_WRAPPERS: Record<string, { start: string; end: string }> = {
  SUMMARY: { start: "", end: "" },
  EDUCATION: { start: "\\resumeSubHeadingListStart", end: "\\resumeSubHeadingListEnd" },
  EXPERIENCE: { start: "\\resumeSubHeadingListStart", end: "\\resumeSubHeadingListEnd" },
  PROJECTS: { start: "\\resumeSubHeadingListStart", end: "\\resumeSubHeadingListEnd" },
  SKILLS: { start: "", end: "" },
  ACHIEVEMENTS: { start: "\\begin{itemize}[leftmargin=0.15in]", end: "\\end{itemize}" },
  CERTIFICATIONS: { start: "\\begin{itemize}[leftmargin=0.15in]", end: "\\end{itemize}" },
};

function generateHeader(headerData: HeaderData): string {
  if (!headerData.name) return "";

  const lines: string[] = [];

  // Name
  lines.push(`\\begin{center}`);
  lines.push(`\\textbf{\\Huge ${headerData.name}} \\\\ \\vspace{1pt}`);

  // Contact line
  const contactParts: string[] = [];
  if (headerData.location) contactParts.push(headerData.location);
  if (headerData.phone) contactParts.push(headerData.phone);
  if (headerData.email) {
    contactParts.push(`\\href{mailto:${headerData.email}}{\\color{linkblue}${headerData.email}}`);
  }

  if (contactParts.length > 0) {
    lines.push(`\\small ${contactParts.join(" $|$ ")} \\\\`);
  }

  // Links line
  const linkParts: string[] = [];
  if (headerData.linkedin) {
    linkParts.push(`\\href{${headerData.linkedin}}{\\color{linkblue}LinkedIn}`);
  }
  if (headerData.github) {
    linkParts.push(`\\href{${headerData.github}}{\\color{linkblue}GitHub}`);
  }
  if (headerData.website) {
    linkParts.push(`\\href{${headerData.website}}{\\color{linkblue}Portfolio}`);
  }

  if (linkParts.length > 0) {
    lines.push(`\\small ${linkParts.join(" $|$ ")}`);
  }

  lines.push(`\\end{center}`);

  return lines.join("\n");
}

export function assembleLatex(
  document: ResumeDocument,
  blocks: ContentBlock[]
): string {
  const preamble = document.preamble || DEFAULT_PREAMBLE;
  const structure: ResumeStructure = JSON.parse(document.structure);
  const headerData: HeaderData = JSON.parse(document.headerData);
  const spacing: SpacingSettings = JSON.parse(document.spacing);

  const lines: string[] = [];

  // Preamble
  lines.push(preamble);
  lines.push("");
  lines.push("\\begin{document}");
  lines.push("");

  // Header
  const header = generateHeader(headerData);
  if (header) {
    lines.push(header);
    lines.push("");
  }

  // Sections
  for (const sectionType of structure.sectionOrder) {
    const blockIds = structure.sections[sectionType] || [];
    if (blockIds.length === 0) continue;

    const sectionTitle = SECTION_TITLES[sectionType] || sectionType;
    const wrapper = SECTION_WRAPPERS[sectionType] || { start: "", end: "" };

    lines.push(`\\section{${sectionTitle}}`);

    if (wrapper.start) {
      lines.push(wrapper.start);
    }

    for (let i = 0; i < blockIds.length; i++) {
      const block = blocks.find((b) => b.id === blockIds[i]);
      if (block) {
        lines.push(block.latexContent);
        // Add spacing between blocks (except last)
        if (i < blockIds.length - 1 && spacing.block > 0) {
          lines.push(`\\vspace{${spacing.block}pt}`);
        }
      }
    }

    if (wrapper.end) {
      lines.push(wrapper.end);
    }

    // Add spacing after section
    lines.push(`\\vspace{${spacing.section}pt}`);
    lines.push("");
  }

  lines.push("\\end{document}");

  return lines.join("\n");
}
