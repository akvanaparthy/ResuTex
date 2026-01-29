# ResuTex - Implementation Plan

## ✅ Status: Core Implementation Complete

The basic application is now functional. You can:
1. Run `npm run dev` to start the app
2. Navigate to http://localhost:3000/builder
3. Add sections to your resume
4. Add blocks from the library to sections
5. Click "Compile" to generate PDF (requires pdflatex installed)

---

## Target: Modular LaTeX Resume Builder with Block System (Local App)

---

## Tech Stack (Final)

| Layer | Technology | Why |
|-------|------------|-----|
| **Framework** | Next.js 14+ (App Router) | Full-stack, great DX |
| **Language** | TypeScript | Type safety for complex block structures |
| **Database** | SQLite (via Prisma) | Local, no setup, file-based |
| **ORM** | Prisma | Type-safe, works great with SQLite |
| **UI Components** | shadcn/ui + Tailwind CSS | Customizable, accessible |
| **Drag & Drop** | @dnd-kit/core | Modern, accessible, tree support |
| **State** | Zustand | Simple, no boilerplate |
| **PDF Preview** | react-pdf | Render PDF in browser |
| **LaTeX Compilation** | Local TeX Live + Node child_process | Direct local compilation |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js)                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ Block Editor│  │ PDF Preview │  │ Block Library           │  │
│  │ (dnd-kit)   │  │ (react-pdf) │  │ (CRUD + Search)         │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────────┘
                            │ API Routes
┌───────────────────────────┴─────────────────────────────────────┐
│                        BACKEND (Next.js API)                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ Blocks API  │  │ Documents   │  │ Compile API             │  │
│  │             │  │ API         │  │ (local pdflatex)        │  │
│  └──────┬──────┘  └──────┬──────┘  └───────────┬─────────────┘  │
└─────────┼────────────────┼─────────────────────┼────────────────┘
          │                │                     │
┌─────────┴────────────────┴─────────┐   ┌──────┴────────────────┐
│         SQLite (Prisma)            │   │  Local TeX Live       │
│  - ContentBlocks                   │   │  (pdflatex command)   │
│  - ResumeDocuments                 │   │  - Receives .tex      │
│  - ContentUsages                   │   │  - Returns .pdf       │
└────────────────────────────────────┘   └────────────────────────┘
```

---

## Phase 0: Project Setup (Day 1)

### 0.1 Prerequisites
- Node.js 18+
- TeX Live installed locally (`pdflatex` command available)

### 0.2 Initialize Next.js Project
```bash
npx create-next-app@latest resutex --typescript --tailwind --eslint --app --src-dir
cd resutex
```

### 0.3 Install Core Dependencies
```bash
# UI
npx shadcn@latest init
npx shadcn@latest add button card input label dialog dropdown-menu tabs scroll-area separator toast

# Database
npm install prisma @prisma/client
npm install -D prisma

# Drag & Drop
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

# State Management
npm install zustand

# PDF
npm install react-pdf pdfjs-dist

# Utils
npm install zod nanoid
```

### 0.4 Initialize Prisma (SQLite)
```bash
npx prisma init --datasource-provider sqlite
```

### 0.5 Project Structure
```
src/
├── app/
│   ├── builder/
│   │   └── page.tsx              # Main builder page
│   ├── api/
│   │   ├── blocks/route.ts
│   │   ├── blocks/[id]/route.ts
│   │   ├── documents/route.ts
│   │   ├── documents/[id]/route.ts
│   │   └── compile/route.ts
│   ├── layout.tsx
│   └── page.tsx                  # Redirects to /builder
├── components/
│   ├── builder/
│   │   ├── ResumeStructure.tsx
│   │   ├── BlockLibrary.tsx
│   │   ├── PdfPreview.tsx
│   │   ├── BlockCard.tsx
│   │   ├── SectionItem.tsx
│   │   └── ContentItem.tsx
│   ├── modals/
│   │   ├── CreateBlockModal.tsx
│   │   └── SpacingModal.tsx
│   └── ui/                       # shadcn components
├── lib/
│   ├── prisma.ts
│   ├── latex/
│   │   ├── assembler.ts          # Assembles blocks into .tex
│   │   ├── compiler.ts           # Calls pdflatex locally
│   │   ├── preamble.ts           # Default preamble
│   │   └── templates.ts          # Block type → LaTeX
│   └── store/
│       └── builder-store.ts      # Zustand store
├── types/
│   └── index.ts
└── prisma/
    ├── schema.prisma
    └── dev.db                    # SQLite database file
```

**Deliverable:** Empty Next.js app with all dependencies, folder structure ready.

---

## Phase 1: Database Setup (Day 2)

### 1.1 Prisma Schema (Simple, No Auth)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

// ══════════════════════════════════════════════════
// CONTENT BLOCK - The core reusable unit
// ══════════════════════════════════════════════════
model ContentBlock {
  id            String          @id @default(cuid())
  name          String          // "Mavenwit Experience v1"
  sectionType   String          // EXPERIENCE, PROJECTS, etc.
  blockType     String          // PLAIN or TEMPLATE
  latexContent  String          // The actual LaTeX code
  templateData  String?         // JSON string for structured data
  tags          String          @default("[]") // JSON array for grouping
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
  
  usages        ContentUsage[]
  
  @@map("content_blocks")
}

// ══════════════════════════════════════════════════
// RESUME DOCUMENT - A specific resume configuration
// ══════════════════════════════════════════════════
model ResumeDocument {
  id            String          @id @default(cuid())
  name          String          @unique // "SWE Resume - Google"
  
  // Structure stored as JSON string
  // Format: { sections: [{ type: "EXPERIENCE", blockIds: ["id1", "id2"] }] }
  structure     String          @default("{\"sectionOrder\":[],\"sections\":{}}")
  
  // Settings
  preamble      String          @default("")
  headerData    String          @default("{}") // JSON: { name, email, phone, links }
  spacing       String          @default("{\"section\":8,\"block\":6,\"line\":1.0}")
  
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
  
  usages        ContentUsage[]
  
  @@map("resume_documents")
}

// ══════════════════════════════════════════════════
// CONTENT USAGE - Track which blocks are used where
// ══════════════════════════════════════════════════
model ContentUsage {
  id            String          @id @default(cuid())
  documentId    String
  blockId       String
  sectionType   String
  order         Int
  
  document      ResumeDocument  @relation(fields: [documentId], references: [id], onDelete: Cascade)
  block         ContentBlock    @relation(fields: [blockId], references: [id], onDelete: Cascade)
  
  @@unique([documentId, blockId])
  @@index([documentId, sectionType, order])
  @@map("content_usages")
}
```

### 1.2 Database Migration
```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 1.3 Prisma Client Setup

```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

**Deliverable:** SQLite database ready, can store blocks and documents.

---

## Phase 2: Block CRUD & Library (Days 3-5)

### 2.1 API Routes

**`/api/blocks/route.ts`** - GET all, POST create
**`/api/blocks/[id]/route.ts`** - GET one, PUT update, DELETE

### 2.2 Block Library UI

```
┌─────────────────────────────────────────┐
│ My Blocks                    [+ New]    │
├─────────────────────────────────────────┤
│ [All] [Exp] [Projects] [Skills] [...]   │  ← Filter tabs
├─────────────────────────────────────────┤
│ 🔍 Search blocks...                     │
├─────────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌─────────┐    │
│ │ Exp:    │ │ Exp:    │ │ Project │    │
│ │ Maven   │ │ Maven   │ │ Agent   │    │
│ │ v1      │ │ v2      │ │ Jobbs   │    │
│ │ [Edit]  │ │ [Edit]  │ │ [Edit]  │    │
│ └─────────┘ └─────────┘ └─────────┘    │
│ ...                                     │
└─────────────────────────────────────────┘
```

### 2.3 Create Block Modal

Two modes:
1. **Plain Block** - Textarea for raw LaTeX
2. **Template Block** - Form based on section type

### 2.4 Template Forms

Create form components for each type:
- `ExperienceForm.tsx` - company, title, dates, bullets
- `ProjectForm.tsx` - name, tech stack, bullets
- `EducationForm.tsx` - institution, degree, dates
- etc.

Each form generates `latexContent` from `templateData`.

**Deliverable:** Can create, view, edit, delete blocks. Library shows all blocks with filtering.

---

## Phase 3: Resume Builder Core (Days 6-9)

### 3.1 Builder Page Layout

```tsx
// src/app/(dashboard)/builder/page.tsx
<div className="flex h-screen">
  {/* Left Panel - 40% */}
  <div className="w-2/5 flex flex-col border-r">
    <ResumeStructure />      {/* Top - Current structure */}
    <BlockLibrary />         {/* Bottom - Available blocks */}
  </div>
  
  {/* Right Panel - 60% */}
  <div className="w-3/5">
    <PdfPreview />
  </div>
</div>
```

### 3.2 Zustand Store

```typescript
// src/lib/store/builder-store.ts
interface BuilderState {
  // Current document
  document: ResumeDocument | null;
  
  // Structure: section order + block order per section
  structure: {
    sectionOrder: SectionType[];
    sections: Record<SectionType, string[]>; // blockIds per section
  };
  
  // Actions
  setDocument: (doc: ResumeDocument) => void;
  addBlockToSection: (blockId: string, section: SectionType) => void;
  removeBlock: (blockId: string, section: SectionType) => void;
  reorderBlocks: (section: SectionType, blockIds: string[]) => void;
  reorderSections: (sectionOrder: SectionType[]) => void;
  
  // Compilation
  isCompiling: boolean;
  pdfUrl: string | null;
  compile: () => Promise<void>;
}
```

### 3.3 Drag & Drop Implementation

Using @dnd-kit:
- Sections are sortable (reorder whole sections)
- Blocks within sections are sortable
- Blocks from library can be dropped into sections

### 3.4 Resume Structure Component

```
CURRENT RESUME
──────────────
▼ SUMMARY
  └─ [Summary Block] ☰ ✕

▼ EXPERIENCE  
  └─ [Mavenwit v1] ☰ ✕
  └─ [Fourth Partner] ☰ ✕

▼ PROJECTS
  └─ [Agent Jobbs] ☰ ✕
  └─ [SiteMind] ☰ ✕

▼ SKILLS
  └─ [Technical Skills] ☰ ✕

[+ Add Section]
```

**Deliverable:** Can drag blocks from library into resume structure, reorder sections and blocks.

---

## Phase 4: LaTeX Compilation (Days 10-12)

### 4.1 LaTeX Assembler

```typescript
// src/lib/latex/assembler.ts
export function assembleLatex(
  document: ResumeDocument,
  blocks: ContentBlock[]
): string {
  const structure = JSON.parse(document.structure);
  const spacing = JSON.parse(document.spacing);
  const headerData = JSON.parse(document.headerData);
  
  let latex = document.preamble || DEFAULT_PREAMBLE;
  latex += '\n\\begin{document}\n';
  
  // Add header
  latex += generateHeader(headerData);
  
  // Add each section in order
  for (const sectionType of structure.sectionOrder) {
    const blockIds = structure.sections[sectionType] || [];
    if (blockIds.length === 0) continue;
    
    latex += `\n\\section{${sectionTitles[sectionType]}}\n`;
    latex += getSectionWrapper(sectionType, 'start');
    
    for (const blockId of blockIds) {
      const block = blocks.find(b => b.id === blockId);
      if (block) {
        latex += block.latexContent + '\n';
        latex += `\\vspace{${spacing.block}pt}\n`;
      }
    }
    
    latex += getSectionWrapper(sectionType, 'end');
    latex += `\\vspace{${spacing.section}pt}\n`;
  }
  
  latex += '\\end{document}';
  return latex;
}
```

### 4.2 Local LaTeX Compilation

```typescript
// src/lib/latex/compiler.ts
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const execAsync = promisify(exec);

export async function compileLatex(latexSource: string): Promise<Buffer> {
  // Create temp directory
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'resutex-'));
  const texFile = path.join(tmpDir, 'resume.tex');
  const pdfFile = path.join(tmpDir, 'resume.pdf');
  
  try {
    // Write .tex file
    await fs.writeFile(texFile, latexSource, 'utf-8');
    
    // Run pdflatex (twice for proper references)
    await execAsync(`pdflatex -interaction=nonstopmode -output-directory="${tmpDir}" "${texFile}"`, {
      timeout: 30000
    });
    
    // Read PDF
    const pdf = await fs.readFile(pdfFile);
    return pdf;
  } finally {
    // Cleanup temp directory
    await fs.rm(tmpDir, { recursive: true, force: true });
  }
}
```

### 4.3 Compile API Route

```typescript
// src/app/api/compile/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { assembleLatex } from '@/lib/latex/assembler';
import { compileLatex } from '@/lib/latex/compiler';

export async function POST(req: Request) {
  try {
    const { documentId } = await req.json();
    
    // Fetch document
    const document = await prisma.resumeDocument.findUnique({
      where: { id: documentId }
    });
    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }
    
    // Fetch all blocks used in this document
    const structure = JSON.parse(document.structure);
    const allBlockIds = Object.values(structure.sections).flat() as string[];
    
    const blocks = await prisma.contentBlock.findMany({
      where: { id: { in: allBlockIds } }
    });
    
    // Assemble LaTeX
    const latex = assembleLatex(document, blocks);
    
    // Compile to PDF
    const pdf = await compileLatex(latex);
    
    // Return PDF
    return new Response(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="resume.pdf"'
      }
    });
  } catch (error) {
    console.error('Compilation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Compilation failed' },
      { status: 500 }
    );
  }
}
```

**Deliverable:** Click "Compile" → Get PDF. Local pdflatex generates the PDF.

---

## Phase 5: PDF Preview & Export (Days 13-15)

### 5.1 PDF Preview Component

```tsx
// src/components/builder/PdfPreview.tsx
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

export function PdfPreview() {
  const { pdfUrl, isCompiling, compile } = useBuilderStore();
  
  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 border-b">
        <Button onClick={compile} disabled={isCompiling}>
          {isCompiling ? 'Compiling...' : '⟳ Compile'}
        </Button>
        <Toggle>Live Compile</Toggle>
      </div>
      
      {/* Preview */}
      <div className="flex-1 overflow-auto bg-gray-100 p-4">
        {pdfUrl ? (
          <Document file={pdfUrl}>
            <Page pageNumber={1} />
          </Document>
        ) : (
          <div className="text-center text-gray-500">
            Click Compile to preview
          </div>
        )}
      </div>
    </div>
  );
}
```

### 5.2 Live Compilation (Optional)

Debounced auto-compile on structure change:

```typescript
// In builder store
useEffect(() => {
  if (!liveCompile) return;
  
  const timeout = setTimeout(() => {
    compile();
  }, 1000); // 1 second debounce
  
  return () => clearTimeout(timeout);
}, [structure, liveCompile]);
```

### 5.3 Export Functions

- **Export PDF**: Download the compiled PDF
- **Export LaTeX**: Download the assembled .tex file

**Deliverable:** Full working preview with compile, export options.

---

## Phase 6: Template Forms & Polish (Days 16-18)

### 6.1 Template Block Forms

Create structured forms that generate LaTeX:

```tsx
// src/components/templates/ExperienceForm.tsx
export function ExperienceForm({ onSave }) {
  const [data, setData] = useState({
    company: '',
    title: '',
    location: '',
    dateRange: '',
    bullets: ['']
  });
  
  const generateLatex = () => {
    return `\\resumeExperienceHeading
  {${data.title} | ${data.company}, ${data.location}}{${data.dateRange}}{}
  \\resumeItemListStart
    ${data.bullets.map(b => `\\resumeItem{${b}}`).join('\n    ')}
  \\resumeItemListEnd`;
  };
  
  return (
    <form>
      <Input label="Company" ... />
      <Input label="Title" ... />
      {/* ... */}
      <BulletPointEditor bullets={data.bullets} onChange={...} />
      <Button onClick={() => onSave(data, generateLatex())}>Save</Button>
    </form>
  );
}
```

### 6.2 Spacing Controls Modal

Sliders for:
- Section spacing (pt)
- Block spacing (pt)  
- Line spacing (multiplier)

### 6.3 Header Editor

Form for personal info that goes at top of resume:
- Name, email, phone
- Links (LinkedIn, GitHub, Portfolio)

### 6.4 Polish

- Loading states
- Error handling (compilation errors shown in UI)
- Toast notifications
- Keyboard shortcuts (Ctrl+S to save, Ctrl+P to compile)

**Deliverable:** Full-featured editor with template forms, spacing controls, polished UX.

---

## Timeline Summary

| Phase | Days | Milestone |
|-------|------|-----------|
| 0. Setup | 1 | Project initialized |
| 1. Database | 2 | SQLite + Prisma ready |
| 2. Block CRUD | 3-5 | Block library working |
| 3. Builder Core | 6-9 | Drag-drop structure working |
| 4. Compilation | 10-12 | Local pdflatex generates PDF |
| 5. Preview | 13-15 | Full preview + export |
| 6. Polish | 16-18 | Templates, spacing, UX |

**Total: ~18 days to MVP**

---

## Running the App

```bash
# Start development server
npm run dev

# Open browser
# http://localhost:3000
```

### Prerequisites
Make sure TeX Live is installed:
```bash
# Windows (MiKTeX or TeX Live)
# Download from: https://miktex.org/ or https://tug.org/texlive/

# Verify installation
pdflatex --version
```

---

## Post-MVP Roadmap

### v1.1 - Variant Groups
- Color-coded variant grouping
- Quick-swap variants in structure view
- "Show all variants" toggle

### v1.2 - Multiple Documents
- Create multiple resume documents
- Duplicate document
- Compare documents side-by-side

### v1.3 - Import/Export
- Import existing .tex files
- Parse into blocks (AI-assisted)
- Import from JSON Resume format

### v1.4 - Themes
- Multiple preamble templates
- Custom fonts
- Color schemes

### v1.5 - AI Integration
- Generate bullet points from job description
- Suggest which blocks to include
- Rewrite blocks for specific roles

---

## Quick Start Commands

```bash
# 1. Create project
npx create-next-app@latest resutex --typescript --tailwind --eslint --app --src-dir
cd resutex

# 2. Install dependencies
npm install prisma @prisma/client zustand @dnd-kit/core @dnd-kit/sortable react-pdf zod nanoid

# 3. Setup shadcn
npx shadcn@latest init
npx shadcn@latest add button card input label dialog dropdown-menu tabs toast textarea

# 4. Initialize Prisma with SQLite
npx prisma init --datasource-provider sqlite

# 5. After adding schema
npx prisma migrate dev --name init
npx prisma generate

# 6. Run dev server
npm run dev
```

---

## Testing Checklist

- [ ] Create plain LaTeX block
- [ ] Create template block (Experience)
- [ ] Create new resume document
- [ ] Add blocks to resume
- [ ] Reorder blocks via drag & drop
- [ ] Reorder sections
- [ ] Compile resume
- [ ] View PDF preview
- [ ] Export PDF
- [ ] Export .tex file
- [ ] Edit existing block (changes reflect in resume)
- [ ] Delete block (removed from all usages)

---

## Decision Log

| Decision | Choice | Reasoning |
|----------|--------|-----------|
| Database | SQLite | Local app, no server needed, zero config |
| LaTeX compilation | Local pdflatex | Direct, no Docker/API dependency |
| State management | Zustand | Simpler than Redux, perfect for this scale |
| Drag & drop | @dnd-kit | Better than react-beautiful-dnd, supports trees |
| No auth | Single user local | Simpler, data stays on machine |
| JSON strings in SQLite | Store complex data | SQLite doesn't have native JSON type |
