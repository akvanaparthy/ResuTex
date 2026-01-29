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

    // Check if pdflatex is available
    try {
      await execAsync("pdflatex --version", { timeout: 5000 });
    } catch (versionError) {
      console.error("pdflatex not found in PATH:", versionError);
      return NextResponse.json(
        {
          error:
            "pdflatex is not installed or not in PATH. Please install MiKTeX or TeX Live and restart the server.\n\nSee LATEX_SETUP.md for installation instructions.",
        },
        { status: 500 }
      );
    }

    // Run pdflatex (run twice for proper references)
    // Use different path handling for Windows
    const isWindows = process.platform === "win32";
    const pdflatexCmd = isWindows
      ? `pdflatex -interaction=nonstopmode -output-directory="${tempDir}" "${texFile}"`
      : `pdflatex -interaction=nonstopmode -output-directory="${tempDir}" "${texFile}"`;

    try {
      // First pass - longer timeout to allow for package installation
      const result1 = await execAsync(pdflatexCmd, {
        timeout: 90000, // 90 seconds for first pass (may install packages)
        windowsHide: true,
      });

      // Second pass for cross-references
      const result2 = await execAsync(pdflatexCmd, {
        timeout: 60000, // 60 seconds for second pass
        windowsHide: true,
      });

      console.log("pdflatex first pass completed");
      console.log("pdflatex second pass completed");
    } catch (latexError: unknown) {
      console.error("pdflatex execution error:", latexError);

      // Try to read the log file for detailed error
      const logFile = path.join(tempDir, "resume.log");
      let errorMessage = "LaTeX compilation failed";
      let errorContext = "";

      try {
        const logContent = await readFile(logFile, "utf-8");

        // Extract error lines from log
        const lines = logContent.split("\n");
        const errorIndex = lines.findIndex((line) => line.startsWith("!"));

        if (errorIndex >= 0) {
          // Get the error and surrounding context
          const contextLines = lines.slice(Math.max(0, errorIndex - 2), errorIndex + 8);
          errorContext = contextLines.join("\n");

          // Extract just the error message for display
          const errorLines = lines
            .filter((line) => line.startsWith("!") || line.includes("Error:"))
            .slice(0, 3)
            .join("\n");

          if (errorLines) {
            errorMessage = errorLines;
          }
        }
      } catch (logError) {
        console.error("Could not read log file:", logError);
        // Log file not available
        const execError = latexError as { stderr?: string; stdout?: string; message?: string };
        if (execError.stderr) {
          errorMessage = execError.stderr;
        } else if (execError.stdout) {
          // Try to extract error from stdout
          const stdout = execError.stdout || "";
          const errorMatch = stdout.match(/! LaTeX Error:.*\n/);
          if (errorMatch) {
            errorMessage = errorMatch[0];
          } else {
            errorMessage = execError.stdout;
          }
        } else if (execError.message) {
          errorMessage = execError.message;
        }
      }

      console.error("Final error message:", errorMessage);
      console.error("Error context from log:", errorContext);

      // Add helpful suggestions based on error type
      let helpText = "";
      if (errorMessage.includes("missing \\item")) {
        helpText = "\n\nCommon fix: Check your blocks for empty itemize/enumerate environments.\nMake sure every \\resumeItemListStart has at least one \\resumeItem before \\resumeItemListEnd.";
      } else if (errorMessage.includes("Undefined control sequence")) {
        helpText = "\n\nCommon fix: You're using a LaTeX command that isn't defined.\nMake sure your template preamble defines all custom commands like \\resumeItem, \\resumeHeading, etc.";
      } else if (errorMessage.includes("Missing $ inserted")) {
        helpText = "\n\nCommon fix: Special characters like &, %, $, _, # need to be escaped.\nUse \\& \\% \\$ \\_ \\# instead.";
      }

      return NextResponse.json(
        {
          error: errorMessage + helpText,
          latex: latexContent,
          fullLog: errorContext
        },
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
