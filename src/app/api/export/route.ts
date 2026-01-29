import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assembleLatex } from "@/lib/latex/assembler";

interface BlockData {
  id: string;
  name: string;
  sectionType: string;
  latexContent: string;
}

interface UsageWithBlock {
  block: BlockData;
}

// GET - Export LaTeX source file
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get("documentId");

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

    // Create a safe filename
    const safeFilename = document.name
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase();

    // Return LaTeX file as download
    return new NextResponse(latexContent, {
      status: 200,
      headers: {
        "Content-Type": "application/x-tex",
        "Content-Disposition": `attachment; filename="${safeFilename}.tex"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: `Failed to export document: ${errorMessage}` },
      { status: 500 }
    );
  }
}

// POST - Export LaTeX with custom options
export async function POST(request: NextRequest) {
  try {
    const { documentId, includeComments = false } = await request.json();

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

    // Assemble LaTeX
    let latexContent = assembleLatex(
      {
        preamble: document.preamble,
        headerData: document.headerData,
        structure: document.structure,
        spacing: document.spacing,
      },
      blocks
    );

    // Optionally add block name comments for debugging
    if (includeComments) {
      const structure = JSON.parse(document.structure);
      for (const block of blocks) {
        const comment = `% Block: ${block.name} (${block.id})\n`;
        latexContent = latexContent.replace(
          block.latexContent,
          comment + block.latexContent
        );
      }
    }

    // Return as JSON with the LaTeX content
    return NextResponse.json({
      latex: latexContent,
      documentName: document.name,
    });
  } catch (error) {
    console.error("Export error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: `Failed to export document: ${errorMessage}` },
      { status: 500 }
    );
  }
}
