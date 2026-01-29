# Resume Block Editor - Feature Description

## Overview

A modular LaTeX resume builder that enables users to create ATS-friendly resumes by assembling pre-built content blocks. Users can maintain a library of interchangeable blocks for different job applications, allowing quick customization without rewriting content.

Its like a resume latex editor, but unlike overleaf or any latex editors which use just input as latex code and compile to preview and to pdf, we have the latex codes as the blocks. each block represents a set of latex code, so that we can visually arrange these blocks (re arrange, re order) so that it is easy for us just use whichever saved block of latex code whenever we need, not needing us to manually go through code and change it, and again delete and use new latex code.

---

## Core Concept

### Block Types

```
┌─────────────────────────────────────────────────────────────┐
│                    SECTION BLOCKS                            │
│  (Containers that hold content blocks of a specific type)   │
├─────────────────────────────────────────────────────────────┤
│  • Summary Section                                          │
│  • Education Section                                        │
│  • Experience Section                                       │
│  • Projects Section                                         │
│  • Skills Section                                           │
│  • Achievements Section                                     │
│  • Certifications Section                                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    CONTENT BLOCKS                           │
│  (Individual pieces of content that go inside sections)     │
├─────────────────────────────────────────────────────────────┤
│  • Plain Block: Raw LaTeX input                            │
│  • Template Blocks:                                         │
│    - Summary Content Block                                  │
│    - Education Content Block                                │
│    - Experience Content Block                               │
│    - Project Content Block                                  │
│    - Skills Content Block                                   │
│    - Achievement Content Block                              │
│    - Certification Content Block                            │
└─────────────────────────────────────────────────────────────┘
```

---

## Page Layout

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Resume Builder                                                    [Export ▼]│
├───────────────────────────────────┬──────────────────────────────────────────┤
│                                   │                                          │
│  CURRENT RESUME STRUCTURE         │         RESUME PREVIEW                   │
│  ─────────────────────────        │         ──────────────                   │
│  ┌─ Summary Section ────────┐     │    ┌────────────────────────┐            │
│  │  └─ [Summary block] ☰    │     │    │                        │            │
│  └──────────────────────────┘     │    │     [Page 1 of N]      │            │
│  ┌─ Experience Section ─────┐     │    │                        │            │
│  │  └─ [Mavenwit] ☰ ⋮       │     │    │   Rendered PDF/Preview │            │
│  │  └─ [Fourth Partner] ☰ ⋮ │     │    │                        │            │
│  └──────────────────────────┘     │    │                        │            │
│  ┌─ Projects Section ───────┐     │    └────────────────────────┘            │
│  │  └─ [Agent Jobbs] ☰ ⋮    │     │                                          │
│  │  └─ [SiteMind] ☰ ⋮       │     │    [◀ Prev]  Page 1/2  [Next ▶]          │
│  └──────────────────────────┘     │                                          │
│                                   │    🔴 Live Compile: [ON] / [OFF]          │
│  [+ Add Section Block]            │    [⟳ Compile Now]                        │
│                                   │                                          │
├───────────────────────────────────┼──────────────────────────────────────────┤
│                                   │                                          │
│  BLOCK LIBRARY                    │                                          │
│  ─────────────                    │                                          │
│  [Search blocks...]               │                                          │
│                                   │                                          │
│  ┌──────────┐ ┌──────────┐        │                                          │
│  │ Summary  │ │Exp: Role1│        │                                          │
│  │ Desc v1  │ │ Variant A│        │                                          │
│  │ ───────  │ │ ───────  │        │                                          │
│  │ [+ Add]  │ │ [+ Add]  │        │                                          │
│  └──────────┘ └──────────┘        │                                          │
│                                   │                                          │
│  ┌──────────┐ ┌──────────┐        │                                          │
│  │Exp: Role1│ │ Project  │        │                                          │
│  │ Variant B│ │ SiteMind │        │                                          │
│  │ ───────  │ │ ───────  │        │                                          │
│  │ [+ Add]  │ │ [+ Add]  │        │                                          │
│  └──────────┘ └──────────┘        │                                          │
│                                   │                                          │
│  [+ Add Content Block]            │                                          │
│                                   │                                          │
└───────────────────────────────────┴──────────────────────────────────────────┘
```

---

## Data Architecture

### Database Schema (Prisma/PostgreSQL)

```prisma
// ═══════════════════════════════════════════════════════════
// SECTION BLOCK - Container for content blocks
// ═══════════════════════════════════════════════════════════
model ResumeSectionBlock {
  id            String                  @id @default(uuid())
  userId        String
  name          String                  // e.g., "SUMMARY", "EXPERIENCE"
  sectionType   ResumeSectionType       // Enum: SUMMARY, EDUCATION, etc.
  latexHeader   String?                 // Custom section header LaTeX
  createdAt     DateTime                @default(now())
  updatedAt     DateTime                @updatedAt
  
  user          User                    @relation(fields: [userId], references: [id], onDelete: Cascade)
  usages        ResumeSectionUsage[]    // Where this section is used
  
  @@unique([userId, name])
  @@map("resume_section_blocks")
}

// ═══════════════════════════════════════════════════════════
// CONTENT BLOCK - Individual resume item
// ═══════════════════════════════════════════════════════════
model ResumeContentBlock {
  id              String                @id @default(uuid())
  userId          String
  name            String                // User-given name for identification
  blockType       ResumeBlockType       // Enum: PLAIN, EXPERIENCE, PROJECT, etc.
  sectionType     ResumeSectionType     // Which section type this belongs to
  
  // Template fields (NULL if PLAIN block)
  templateData    Json?                 // Structured data based on blockType
  
  // Raw LaTeX (always populated - either from template or direct input)
  latexContent    String                // The actual LaTeX code
  
  // Variant grouping
  variantGroupId  String?
  variantGroup    VariantGroup?         @relation(fields: [variantGroupId], references: [id])
  
  createdAt       DateTime              @default(now())
  updatedAt       DateTime              @updatedAt
  
  user            User                  @relation(fields: [userId], references: [id], onDelete: Cascade)
  usages          ResumeContentUsage[]  // Where this block is used
  
  @@index([userId, sectionType])
  @@index([variantGroupId])
  @@map("resume_content_blocks")
}

// ═══════════════════════════════════════════════════════════
// VARIANT GROUP - Groups related content blocks
// ═══════════════════════════════════════════════════════════
model VariantGroup {
  id          String               @id @default(uuid())
  userId      String
  name        String               // e.g., "Mavenwit Experience Variants"
  color       String               // Hex color for UI highlighting
  
  user        User                 @relation(fields: [userId], references: [id], onDelete: Cascade)
  blocks      ResumeContentBlock[]
  
  @@unique([userId, name])
  @@map("variant_groups")
}

// ═══════════════════════════════════════════════════════════
// RESUME DOCUMENT - A compiled resume configuration
// ═══════════════════════════════════════════════════════════
model ResumeDocument {
  id            String                @id @default(uuid())
  userId        String
  name          String                // e.g., "Software Engineer Resume"
  description   String?
  
  // Header/Preamble settings
  headerData    Json                  // Name, email, phone, links, etc.
  preamble      String                // LaTeX preamble/document setup
  
  // Spacing settings
  sectionSpacing    Float             @default(8)   // vspace between sections
  blockSpacing      Float             @default(6)   // vspace between blocks
  lineSpacing       Float             @default(1.0) // Line spacing multiplier
  
  isDefault     Boolean               @default(false)
  createdAt     DateTime              @default(now())
  updatedAt     DateTime              @updatedAt
  
  user          User                  @relation(fields: [userId], references: [id], onDelete: Cascade)
  sections      ResumeSectionUsage[]  // Sections in this resume
  
  @@unique([userId, name])
  @@map("resume_documents")
}

// ═══════════════════════════════════════════════════════════
// SECTION USAGE - Maps sections to a resume with ordering
// ═══════════════════════════════════════════════════════════
model ResumeSectionUsage {
  id              String              @id @default(uuid())
  resumeDocId     String
  sectionBlockId  String
  order           Int                 // Position in the resume
  
  resumeDoc       ResumeDocument      @relation(fields: [resumeDocId], references: [id], onDelete: Cascade)
  sectionBlock    ResumeSectionBlock  @relation(fields: [sectionBlockId], references: [id], onDelete: Cascade)
  contentUsages   ResumeContentUsage[]
  
  @@unique([resumeDocId, sectionBlockId])
  @@index([resumeDocId, order])
  @@map("resume_section_usages")
}

// ═══════════════════════════════════════════════════════════
// CONTENT USAGE - Maps content blocks to section usages
// ═══════════════════════════════════════════════════════════
model ResumeContentUsage {
  id              String              @id @default(uuid())
  sectionUsageId  String
  contentBlockId  String
  order           Int                 // Position within the section
  
  sectionUsage    ResumeSectionUsage  @relation(fields: [sectionUsageId], references: [id], onDelete: Cascade)
  contentBlock    ResumeContentBlock  @relation(fields: [contentBlockId], references: [id], onDelete: Cascade)
  
  @@unique([sectionUsageId, contentBlockId])
  @@index([sectionUsageId, order])
  @@map("resume_content_usages")
}

// ═══════════════════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════════════════
enum ResumeSectionType {
  HEADER
  SUMMARY
  EDUCATION
  EXPERIENCE
  PROJECTS
  SKILLS
  ACHIEVEMENTS
  CERTIFICATIONS
  CUSTOM
}

enum ResumeBlockType {
  PLAIN               // Raw LaTeX
  SUMMARY             // Summary paragraph
  EDUCATION           // Education entry
  EXPERIENCE          // Work experience entry
  PROJECT             // Project entry
  SKILL_CATEGORY      // Skills category
  ACHIEVEMENT         // Achievement item
  CERTIFICATION       // Certification item
}
```

---

## Template Block Structures

Based on the sample resume, here are the template data structures:

### 1. Summary Content Block
```typescript
interface SummaryTemplateData {
  content: string;  // The summary paragraph text
}
```
**LaTeX Output:**
```latex
\small{<content>}
```

### 2. Education Content Block
```typescript
interface EducationTemplateData {
  institution: string;      // "Stevens Institute of Technology"
  location: string;         // "Hoboken, New Jersey"
  degree: string;           // "Master of Science in Computer Science"
  dateRange: string;        // "2024 - 2025"
  gpa?: string;             // Optional GPA
  coursework?: string[];    // Optional relevant coursework
}
```
**LaTeX Output:**
```latex
\resumeEducationHeading
  {<institution>}{<dateRange>}
  {<location>}
  {<degree>}
```

### 3. Experience Content Block
```typescript
interface ExperienceTemplateData {
  jobTitle: string;           // "WordPress Web Developer Intern"
  company: string;            // "Mavenwit"
  location: string;           // "Hyderabad, India"
  dateRange: string;          // "February 2024 - July 2024"
  bulletPoints: string[];     // Array of achievement bullet points
  skills?: string[];          // Skills used (for highlighting)
}
```
**LaTeX Output:**
```latex
\resumeExperienceHeading
  {<jobTitle> | <company>, <location>}{<dateRange>}{}
  \resumeItemListStart
    \resumeItem{<bulletPoint1>}
    \resumeItem{<bulletPoint2>}
    ...
  \resumeItemListEnd
```

### 4. Project Content Block
```typescript
interface ProjectTemplateData {
  name: string;               // "Agent Jobbs"
  subtitle?: string;          // "Vision based browser agent (Ongoing)"
  techStack: string;          // "Node.js, TypeScript, Playwright, ChromaDB..."
  bulletPoints: string[];     // Array of description points
  links?: {
    label: string;
    url: string;
  }[];
}
```
**LaTeX Output:**
```latex
\resumeProjectHeading
  {\textbf{<name><subtitle?>} | \emph{<techStack>}}{}
  \resumeItemListStart
    \resumeItem{<bulletPoint1>}
    ...
  \resumeItemListEnd
```

### 5. Skills Content Block
```typescript
interface SkillsTemplateData {
  categories: {
    name: string;             // "Programming Languages / Backend Technologies"
    skills: string;           // "Node.js, TypeScript, JavaScript, Python..."
  }[];
}
```
**LaTeX Output:**
```latex
\begin{itemize}[leftmargin=0.08in, label={}, itemsep=-3pt]
  \small{\item{
    \textbf{<category1.name>}: <category1.skills> \\
    \textbf{<category2.name>}: <category2.skills> \\
    ...
  }}
\end{itemize}
```

### 6. Achievement Content Block
```typescript
interface AchievementTemplateData {
  description: string;        // "Grew Telegram community to 82,000+ subscribers."
}
```
**LaTeX Output:**
```latex
\item <description>
```

### 7. Certification Content Block
```typescript
interface CertificationTemplateData {
  title: string;              // "AWS Academy Graduate"
  details?: string;           // "AWS Academy Machine Learning Foundations..."
  issuer?: string;            // "Amazon Web Services"
  date?: string;              // "2023"
}
```
**LaTeX Output:**
```latex
\item <title><details?>.
```

---

## UI Components

### 1. Left Panel - Resume Structure (Top)

**Current Resume Structure View**
- Tree-like hierarchy showing sections and their content blocks
- Each section block is collapsible
- Each content block shows:
  - Block name
  - Drag handle (☰) for reordering
  - Three-dot menu (⋮) with options:
    - Edit block
    - Remove from resume
    - Add to variant group
    - View variants (if in a group)
- Variant blocks have a colored left border matching their group color
- "Add Section Block" button at bottom

### 2. Left Panel - Block Library (Bottom)

**Block Library Grid**
- Search/filter bar
- Filter by section type tabs
- Grid of block cards showing:
  - Block name
  - Block type icon
  - Preview snippet (first line of content)
  - Variant group color indicator (if applicable)
  - [+ Add] button
- When clicking [+ Add]:
  - Modal appears asking which section to add it to
  - Shows compatible sections based on block's sectionType
- [+ Add Content Block] button opens block creation modal

### 3. Right Panel - Resume Preview

**Preview Area**
- Rendered PDF preview (or error message if compilation fails)
- Page navigation (if multi-page)
- Zoom controls
- Live Compile toggle switch
- [Compile Now] button (always visible)
- Loading spinner during compilation

### 4. Header/Toolbar

**Top Bar**
- Resume document name (editable)
- Resume document selector dropdown
- Spacing Settings button (opens settings modal)
- Export button with dropdown:
  - Export as PDF
  - Export as LaTeX (.tex)

---

## User Flows

### Flow 1: Creating a New Content Block

```
1. User clicks [+ Add Content Block]
2. Modal opens with options:
   ┌─────────────────────────────────────────┐
   │  Create New Content Block               │
   ├─────────────────────────────────────────┤
   │  Block Name: [________________]         │
   │                                         │
   │  Block Type:                            │
   │  ○ Plain Block (Raw LaTeX)              │
   │  ○ Template Block                       │
   │                                         │
   │  [If Template selected]                 │
   │  Template Type:                         │
   │  ○ Summary     ○ Education              │
   │  ○ Experience  ○ Project                │
   │  ○ Skills      ○ Achievement            │
   │  ○ Certification                        │
   │                                         │
   │  [Cancel]              [Next →]         │
   └─────────────────────────────────────────┘

3a. If Plain Block:
   - Shows large textarea for LaTeX input
   - User pastes/types LaTeX
   
3b. If Template Block:
   - Shows form fields based on template type
   - User fills in structured fields
   - Preview shows generated LaTeX

4. User clicks [Create]
5. Block appears in library grid
```

### Flow 2: Adding a Block to Resume

```
1. User clicks [+ Add] on a block card in library
2. Modal shows available sections:
   ┌─────────────────────────────────────────┐
   │  Add to Section                         │
   ├─────────────────────────────────────────┤
   │  Select destination section:            │
   │                                         │
   │  ● Experience Section                   │
   │  ○ Projects Section                     │
   │  ○ [Create New Section...]              │
   │                                         │
   │  [Cancel]              [Add]            │
   └─────────────────────────────────────────┘
3. Block appears in selected section in structure view
4. If Live Compile is ON, PDF re-renders
```

### Flow 3: Reordering Blocks/Sections

```
1. User drags block/section via drag handle (☰)
2. Visual indicator shows drop position
3. User drops in new position
4. Order updates in database
5. If Live Compile is ON, PDF re-renders
```

### Flow 4: Managing Variant Groups

```
1. User clicks ⋮ on a block → "Add to Variant Group"
2. Modal shows:
   ┌─────────────────────────────────────────┐
   │  Add to Variant Group                   │
   ├─────────────────────────────────────────┤
   │  ○ Existing Group:                      │
   │    [Mavenwit Variants        ▼]         │
   │                                         │
   │  ○ Create New Group:                    │
   │    Name: [________________]             │
   │    Color: [🔴🟠🟡🟢🔵🟣]                │
   │                                         │
   │  [Cancel]              [Add]            │
   └─────────────────────────────────────────┘
3. Block card now shows variant group color border
4. User can swap variants by:
   - Clicking on variant group indicator
   - Selecting different variant from dropdown
```

### Flow 5: Exporting Resume

```
1. User clicks [Export ▼]
2. Dropdown shows:
   - Export as PDF
   - Export as LaTeX (.tex)
3. User selects option
4. File downloads
```

---

## LaTeX Compilation

### Approach: Client-Side Compilation

Using a JavaScript LaTeX compiler library for immediate, client-side compilation without server dependencies.

**Recommended Library:** `latex.js`

```javascript
// Example compilation flow
import { parse, HtmlGenerator } from 'latex.js';

function compileLatex(latexSource: string): string {
  const generator = new HtmlGenerator({ 
    hyphenate: false 
  });
  const doc = parse(latexSource, { generator });
  return doc.htmlDocument().outerHTML;
}
```

**Alternative:** If `latex.js` doesn't support all custom commands, we can:
1. Use server-side compilation via Docker container with TeX Live
2. Use an API service like Overleaf API or LaTeX.Online

### Compilation Modes

1. **Live Compile ON:**
   - Debounced compilation (500ms after last change)
   - Shows "Compiling..." indicator
   - Blocks UI actions during compilation
   - Updates preview when complete

2. **Live Compile OFF:**
   - No automatic compilation
   - User clicks [Compile Now] manually
   - Same compilation process

---

## Spacing Controls

**Settings Modal**
```
┌─────────────────────────────────────────┐
│  Spacing Settings                       │
├─────────────────────────────────────────┤
│                                         │
│  Section Spacing:                       │
│  [━━━━━●━━━━━] 8pt                      │
│                                         │
│  Block Spacing:                         │
│  [━━━━●━━━━━━] 6pt                      │
│                                         │
│  Line Spacing:                          │
│  [━━●━━━━━━━━] 1.0                      │
│                                         │
│  [Reset to Defaults]     [Apply]        │
└─────────────────────────────────────────┘
```

These values map to LaTeX `\vspace{}` commands inserted between sections/blocks.

---

## Navigation Integration

Add "Resume Builder" to the existing sidebar navigation in `app/dashboard/layout.tsx`:

```typescript
const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Cover Letter', href: '/dashboard/cover-letter', icon: FileText },
  { name: 'LinkedIn', href: '/dashboard/linkedin', icon: MessageSquare },
  { name: 'Email', href: '/dashboard/email', icon: Mail },
  { name: 'Resume Builder', href: '/dashboard/resume-builder', icon: FileEdit }, // NEW
  { name: 'Manage', href: '/dashboard/manage', icon: FolderKanban },
  { name: 'Activity History', href: '/dashboard/activity-history', icon: Clock },
];
```

---

## File Structure

```
app/
└── dashboard/
    └── resume-builder/
        ├── page.tsx                    # Main resume builder page
        └── components/
            ├── ResumeStructurePanel.tsx     # Left top - current structure
            ├── BlockLibraryPanel.tsx        # Left bottom - block library
            ├── ResumePreviewPanel.tsx       # Right - PDF preview
            ├── BlockCard.tsx                # Individual block card component
            ├── SectionBlockItem.tsx         # Section in structure tree
            ├── ContentBlockItem.tsx         # Content block in section
            ├── CreateBlockModal.tsx         # Modal for creating blocks
            ├── AddToSectionModal.tsx        # Modal for selecting section
            ├── VariantGroupModal.tsx        # Modal for variant management
            ├── SpacingSettingsModal.tsx     # Modal for spacing controls
            └── templates/
                ├── SummaryTemplate.tsx
                ├── EducationTemplate.tsx
                ├── ExperienceTemplate.tsx
                ├── ProjectTemplate.tsx
                ├── SkillsTemplate.tsx
                ├── AchievementTemplate.tsx
                └── CertificationTemplate.tsx

lib/
├── latex/
│   ├── compiler.ts                  # LaTeX compilation logic
│   ├── templates.ts                 # Template to LaTeX conversion
│   └── preamble.ts                  # Default LaTeX preamble
└── resume-builder/
    ├── types.ts                     # TypeScript types/interfaces
    └── utils.ts                     # Helper functions

app/api/
└── resume-builder/
    ├── documents/
    │   ├── route.ts                 # GET all, POST create
    │   └── [id]/
    │       ├── route.ts             # GET, PUT, DELETE document
    │       └── compile/
    │           └── route.ts         # POST compile document
    ├── section-blocks/
    │   ├── route.ts                 # GET all, POST create
    │   └── [id]/
    │       └── route.ts             # GET, PUT, DELETE
    ├── content-blocks/
    │   ├── route.ts                 # GET all, POST create
    │   └── [id]/
    │       └── route.ts             # GET, PUT, DELETE
    ├── variant-groups/
    │   ├── route.ts                 # GET all, POST create
    │   └── [id]/
    │       └── route.ts             # GET, PUT, DELETE
    └── export/
        └── route.ts                 # POST export as PDF/LaTeX
```

---

## Default LaTeX Preamble

Store the preamble from the sample resume as the default:

```latex
\documentclass[legalpaper,10.5pt]{article}

\usepackage[empty]{fullpage}
\usepackage{titlesec}
\usepackage[usenames,dvipsnames]{color}
\usepackage{enumitem}
\usepackage[hidelinks]{hyperref}
\usepackage{fancyhdr}
\usepackage[english]{babel}
\usepackage{tabularx}
\usepackage{geometry}
\usepackage{xcolor}
\usepackage[T1]{fontenc}
\input{glyphtounicode}

%----------PAGE SETUP----------
\geometry{
    legalpaper,
    left=0.5in,
    right=0.5in,
    top=0.5in,
    bottom=0.5in
}

\pagestyle{fancy}
\fancyhf{}
\fancyfoot{}
\renewcommand{\headrulewidth}{0pt}
\renewcommand{\footrulewidth}{0pt}

\urlstyle{same}
\raggedbottom
\raggedright
\setlength{\tabcolsep}{0in}

% Section formatting - 12pt bold with underline
\titleformat{\section}{
  \vspace{-8pt}\raggedright\bfseries\fontsize{12pt}{14pt}\selectfont
}{}{0em}{}[\color{black}\titlerule \vspace{-5pt}]

% Ensure PDF is machine readable/ATS parsable
\pdfgentounicode=1

%-------------------------
% Custom commands
\newcommand{\resumeItem}[1]{
  \item\small{#1}
}

\newcommand{\resumeSubheading}[4]{
  \vspace{-3pt}\item
    \begin{tabular*}{\textwidth}[t]{l@{\extracolsep{\fill}}r}
      \textbf{#1} & \textbf{\small #2} \\
      {\small#3} & {\small #4} \\
    \end{tabular*}\vspace{-7pt}
}

\newcommand{\resumeEducationHeading}[4]{
  \vspace{-2pt}\item
    \begin{tabular*}{\textwidth}[t]{l@{\extracolsep{\fill}}r}
      \textbf{#1}, \textit{#3} & #2 \\
      #4 & \\
    \end{tabular*}\vspace{-7pt}
}

\newcommand{\resumeExperienceHeading}[3]{
  \vspace{-2pt}\item
    \begin{tabular*}{\textwidth}[t]{l@{\extracolsep{\fill}}r}
      \textbf{#1} & #2 \\
    \end{tabular*}\vspace{-7pt}
}

\newcommand{\resumeProjectHeading}[2]{
    \item
    \begin{tabular*}{\textwidth}{l@{\extracolsep{\fill}}r}
      \small#1 & {\small #2}\\
    \end{tabular*}\vspace{-7pt}
}

\newcommand{\resumeSubItem}[1]{\resumeItem{#1}\vspace{-4pt}}

\renewcommand\labelitemi{$\vcenter{\hbox{\tiny$\bullet$}}$}
\renewcommand\labelitemii{$\vcenter{\hbox{\tiny$\bullet$}}$}

\newcommand{\resumeSubHeadingListStart}{\begin{itemize}[leftmargin=0.08in, label={}, itemsep=-2pt]}
\newcommand{\resumeSubHeadingListEnd}{\end{itemize}}
\newcommand{\resumeItemListStart}{\begin{itemize}[leftmargin=0.15in, itemsep=-2pt]}
\newcommand{\resumeItemListEnd}{\end{itemize}\vspace{-5pt}}

% Define link color to match original
\definecolor{linkblue}{HTML}{1154CC}
```

---

## Future Considerations (Not in Initial Scope)

1. **LaTeX/PDF Import Parsing** - Parse existing LaTeX or PDF files to extract blocks
2. **Custom Template Creation** - Allow users to define their own block templates
3. **Resume Themes** - Different visual styles/preambles
4. **AI-Powered Content** - Integrate with existing AI to suggest block content based on job descriptions
5. **Block Sharing** - Share blocks between users or make public templates
6. **Resume Analytics** - Track which variants/blocks perform better

---

## Summary

This Resume Block Editor provides:

1. **Modular Architecture**: Section blocks as containers, content blocks as building units
2. **Flexibility**: Mix plain LaTeX with structured templates
3. **Variant System**: Multiple versions of the same content for different applications
4. **Live Preview**: Toggle between live compilation and on-demand
5. **Full Control**: Adjust spacing, ordering, and structure freely
6. **ATS-Friendly Output**: Pure LaTeX compilation for maximum compatibility
7. **Export Options**: PDF and raw LaTeX (.tex) exports
