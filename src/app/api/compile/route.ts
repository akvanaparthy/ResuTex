import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assembleLatex } from "@/lib/latex/assembler";
import { writeFile, readFile, mkdir, rm } from "fs/promises";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import os from "os";
import { randomUUID } from "crypto";

const execAsync = promisify(exec);

interface BlockData {
  id: string;
  name: string;
  sectionType: string;
  latexContent: string;
}

interface UsageWithBlock {
  block: BlockData;
}

export async function POST(request: NextRequest) {
  let tempDir: string | null = null;

  try {
    const { documentId } = await request.json();

    if (!documentId) {
      return NextResponse.json(
        { error: "Document ID is required" },
        { status: 400 }
      );
    }

    // Fetch document with its blocks
    const document = await prisma.resumeDocument.findUnique({
      where: { id: documentId },
      include: {
        usages: {
          include: {
            block: true,
          },
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Get all blocks for this document
    const blocks = document.usages.map((usage: UsageWithBlock) => ({
      id: usage.block.id,
      name: usage.block.name,
      sectionType: usage.block.sectionType,
      latexContent: usage.block.latexContent,
    }));

    console.log("Document structure:", document.structure);
    console.log("Document blocks count:", blocks.length);

    // Assemble LaTeX
    const latexContent = assembleLatex(
      {
        preamble: document.preamble,
        headerData: document.headerData,
        structure: document.structure,
        spacing: document.spacing,
      },
      blocks
    );

    console.log("LaTeX content length:", latexContent.length);

    // Create temp directory
    tempDir = path.join(os.tmpdir(), `resutex-${randomUUID()}`);
    await mkdir(tempDir, { recursive: true });

    const texFile = path.join(tempDir, "resume.tex");
    const pdfFile = path.join(tempDir, "resume.pdf");

    // Write LaTeX file
    await writeFile(texFile, latexContent, "utf-8");

    // Run pdflatex (run twice for proper references)
    try {
      await execAsync(
        `pdflatex -interaction=nonstopmode -output-directory="${tempDir}" "${texFile}"`,
        { timeout: 30000 }
      );
      // Second pass for cross-references
      await execAsync(
        `pdflatex -interaction=nonstopmode -output-directory="${tempDir}" "${texFile}"`,
        { timeout: 30000 }
      );
    } catch (latexError: unknown) {
      // Try to read the log file for detailed error
      const logFile = path.join(tempDir, "resume.log");
      let errorMessage = "LaTeX compilation failed";
      
      try {
        const logContent = await readFile(logFile, "utf-8");
        // Extract error lines from log
        const errorLines = logContent
          .split("\n")
          .filter((line) => line.startsWith("!") || line.includes("Error:"))
          .slice(0, 10)
          .join("\n");
        
        if (errorLines) {
          errorMessage = errorLines;
        }
      } catch {
        // Log file not available
        const execError = latexError as { stderr?: string; message?: string };
        if (execError.stderr) {
          errorMessage = execError.stderr;
        }
      }

      return NextResponse.json(
        { error: errorMessage, latex: latexContent },
        { status: 500 }
      );
    }

    // Read PDF file
    const pdfBuffer = await readFile(pdfFile);

    // Cleanup temp directory
    await rm(tempDir, { recursive: true, force: true });
    tempDir = null;

    // Return PDF
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${document.name}.pdf"`,
      },
    });
  } catch (error) {
    // Cleanup on error
    if (tempDir) {
      try {
        await rm(tempDir, { recursive: true, force: true });
      } catch {
        // Ignore cleanup errors
      }
    }

    console.error("Compile error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: `Failed to compile document: ${errorMessage}` },
      { status: 500 }
    );
  }
}

// Generate LaTeX preview without compiling
export async function PUT(request: NextRequest) {
  try {
    const { documentId } = await request.json();

    if (!documentId) {
      return NextResponse.json(
        { error: "Document ID is required" },
        { status: 400 }
      );
    }

    const document = await prisma.resumeDocument.findUnique({
      where: { id: documentId },
      include: {
        usages: {
          include: {
            block: true,
          },
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    const blocks = document.usages.map((usage: UsageWithBlock) => ({
      id: usage.block.id,
      name: usage.block.name,
      sectionType: usage.block.sectionType,
      latexContent: usage.block.latexContent,
    }));

    const latexContent = assembleLatex(
      {
        preamble: document.preamble,
        headerData: document.headerData,
        structure: document.structure,
        spacing: document.spacing,
      },
      blocks
    );

    return NextResponse.json({ latex: latexContent });
  } catch (error) {
    console.error("Preview error:", error);
    return NextResponse.json(
      { error: "Failed to generate preview" },
      { status: 500 }
    );
  }
}
