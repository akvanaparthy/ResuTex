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

// Debug endpoint to view the generated LaTeX without compiling
export async function POST(request: NextRequest) {
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

    // Return the LaTeX with line numbers for debugging
    const lines = latexContent.split("\n");
    const numberedLatex = lines
      .map((line, index) => `${String(index + 1).padStart(4, " ")}: ${line}`)
      .join("\n");

    return NextResponse.json({
      latex: latexContent,
      numberedLatex,
      blocks: blocks.map((b) => ({
        id: b.id,
        name: b.name,
        sectionType: b.sectionType,
        contentPreview: b.latexContent.substring(0, 100),
      })),
      structure: JSON.parse(document.structure),
    });
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json(
      { error: "Failed to generate debug output" },
      { status: 500 }
    );
  }
}
