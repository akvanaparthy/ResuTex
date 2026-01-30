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
  PLAIN: "", // No title for plain sections
  SUMMARY: "SUMMARY",
  EDUCATION: "EDUCATION",
  EXPERIENCE: "RELEVANT EXPERIENCE",
  PROJECTS: "KEY PROJECTS \\& PUBLICATIONS",
  SKILLS: "SKILLS",
  ACHIEVEMENTS: "ACHIEVEMENTS",
  CERTIFICATIONS: "CERTIFICATIONS",
};

const SECTION_WRAPPERS: Record<string, { start: string; end: string }> = {
  PLAIN: { start: "", end: "" }, // No wrapper for plain sections
  SUMMARY: { start: "", end: "" },
  EDUCATION: { start: "\\resumeSubHeadingListStart", end: "\\resumeSubHeadingListEnd" },
  EXPERIENCE: { start: "\\resumeSubHeadingListStart", end: "\\resumeSubHeadingListEnd" },
  PROJECTS: { start: "\\resumeSubHeadingListStart", end: "\\resumeSubHeadingListEnd" },
  SKILLS: { start: "\\begin{itemize}[leftmargin=0.08in, label={}, itemsep=-3pt]", end: "\\end{itemize}" },
  ACHIEVEMENTS: { start: "\\begin{itemize}[leftmargin=0.15in, itemsep=-3pt]", end: "\\end{itemize}" },
  CERTIFICATIONS: { start: "\\begin{itemize}[leftmargin=0.15in, itemsep=-3pt]", end: "\\end{itemize}" },
};

function generateHeader(headerData: HeaderData): string {
  if (!headerData.name) return "";

  const lines: string[] = [];

  // Name - 16pt bold centered (matching sample resume)
  lines.push(`\\begin{center}`);
  lines.push(`{\\fontsize{16pt}{19pt}\\selectfont\\bfseries ${headerData.name}} \\\\ \\vspace{2pt}`);

  // Contact line: phone | email | location
  const contactParts: string[] = [];
  if (headerData.phone) contactParts.push(headerData.phone);
  if (headerData.email) {
    contactParts.push(`\\href{mailto:${headerData.email}}{${headerData.email}}`);
  }
  if (headerData.location) contactParts.push(headerData.location);

  // Links line: LinkedIn | GitHub | Portfolio
  const linkParts: string[] = [];
  if (headerData.linkedin) {
    linkParts.push(`\\href{${headerData.linkedin}}{\\color{linkblue}\\underline{LinkedIn}}`);
  }
  if (headerData.github) {
    linkParts.push(`\\href{${headerData.github}}{\\color{linkblue}\\underline{GitHub}}`);
  }
  if (headerData.website) {
    linkParts.push(`\\href{${headerData.website}}{\\color{linkblue}\\underline{Portfolio}}`);
  }

  // Combine contact and links on separate lines
  if (contactParts.length > 0 || linkParts.length > 0) {
    let contactLine = `{\\small `;
    if (contactParts.length > 0) {
      contactLine += contactParts.join(" | ");
    }
    if (linkParts.length > 0) {
      if (contactParts.length > 0) contactLine += `\\\\  `;
      contactLine += linkParts.join(" | ");
    }
    contactLine += `}`;
    lines.push(contactLine);
  }

  lines.push(`\\end{center}`);
  lines.push(`\\vspace{-8pt}`);

  return lines.join("\n");
}

export function assembleLatex(
  document: ResumeDocument,
  blocks: ContentBlock[]
): string {
  const preamble = document.preamble || DEFAULT_PREAMBLE;
  const structure: ResumeStructure = JSON.parse(document.structure);
  const headerData: HeaderData = JSON.parse(document.headerData);
  const spacing: SpacingSettings = document.spacing ? JSON.parse(document.spacing) : { section: -8, block: -6, line: 1.0 };

  const lines: string[] = [];

  // Preamble
  lines.push(preamble);
  lines.push("");
  
  // Apply line spacing if not default (1.0)
  if (spacing.line && spacing.line !== 1.0) {
    lines.push(`\\linespread{${spacing.line}}`);
    lines.push("");
  }
  
  lines.push("\\begin{document}");
  lines.push("");

  // Header
  const header = generateHeader(headerData);
  if (header) {
    lines.push(header);
    lines.push("");
  }

  // Sections
  const sectionCount = structure.sectionOrder.length;
  for (let sectionIndex = 0; sectionIndex < sectionCount; sectionIndex++) {
    const sectionType = structure.sectionOrder[sectionIndex];
    const blockIds = structure.sections[sectionType] || [];
    if (blockIds.length === 0) continue;

    const sectionTitle = SECTION_TITLES[sectionType] ?? sectionType;
    const wrapper = SECTION_WRAPPERS[sectionType] || { start: "", end: "" };

    // Only add section header if not a PLAIN section
    if (sectionType !== "PLAIN" && sectionTitle) {
      lines.push(`\\section{${sectionTitle}}`);
    }

    if (wrapper.start) {
      lines.push(wrapper.start);
    }

    for (let i = 0; i < blockIds.length; i++) {
      const block = blocks.find((b) => b.id === blockIds[i]);
      if (block) {
        lines.push(block.latexContent);
        // Add spacing between blocks (except last)
        if (i < blockIds.length - 1 && spacing.block !== 0) {
          lines.push(`\\vspace{${spacing.block}pt}`);
        }
      }
    }

    if (wrapper.end) {
      lines.push(wrapper.end);
    }

    // Add section spacing (except after last section)
    const isLastSection = sectionIndex === sectionCount - 1;
    if (!isLastSection && spacing.section !== 0) {
      lines.push(`\\vspace{${spacing.section}pt}`);
    }
    lines.push("");
  }

  lines.push("\\end{document}");

  return lines.join("\n");
}
