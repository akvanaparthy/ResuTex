import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper to sync ContentUsage table from structure JSON
async function syncContentUsages(documentId: string, structure: string) {
  const parsed = JSON.parse(structure) as {
    sectionOrder: string[];
    sections: Record<string, string[]>;
  };

  // Delete existing usages for this document
  await prisma.contentUsage.deleteMany({
    where: { documentId },
  });

  // Create new usages based on structure
  const usages: { documentId: string; blockId: string; sectionType: string; order: number }[] = [];

  for (const sectionType of parsed.sectionOrder) {
    const blockIds = parsed.sections[sectionType] || [];
    blockIds.forEach((blockId, index) => {
      usages.push({
        documentId,
        blockId,
        sectionType,
        order: index,
      });
    });
  }

  if (usages.length > 0) {
    await prisma.contentUsage.createMany({
      data: usages,
    });
  }
}

// GET single document
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const document = await prisma.resumeDocument.findUnique({
      where: { id },
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    return NextResponse.json(document);
  } catch (error) {
    console.error("Error fetching document:", error);
    return NextResponse.json({ error: "Failed to fetch document" }, { status: 500 });
  }
}

// PUT update document
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, structure, preamble, headerData, spacing } = body;

    const document = await prisma.resumeDocument.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(structure && { structure }),
        ...(preamble !== undefined && { preamble }),
        ...(headerData && { headerData }),
        ...(spacing && { spacing }),
      },
    });

    // Sync ContentUsage table if structure was updated
    if (structure) {
      await syncContentUsages(id, structure);
    }

    return NextResponse.json(document);
  } catch (error) {
    console.error("Error updating document:", error);
    return NextResponse.json({ error: "Failed to update document" }, { status: 500 });
  }
}

// PATCH update specific document fields (headerData, spacing)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { headerData, spacing, preamble } = body;

    // Validate at least one field is provided
    if (headerData === undefined && spacing === undefined && preamble === undefined) {
      return NextResponse.json(
        { error: "At least one field (headerData, spacing, or preamble) is required" },
        { status: 400 }
      );
    }

    const updateData: Record<string, string> = {};

    if (headerData !== undefined) {
      updateData.headerData = typeof headerData === "string" ? headerData : JSON.stringify(headerData);
    }

    if (spacing !== undefined) {
      updateData.spacing = typeof spacing === "string" ? spacing : JSON.stringify(spacing);
    }

    if (preamble !== undefined) {
      updateData.preamble = preamble;
    }

    const document = await prisma.resumeDocument.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(document);
  } catch (error) {
    console.error("Error patching document:", error);
    return NextResponse.json({ error: "Failed to update document settings" }, { status: 500 });
  }
}

// DELETE document
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.resumeDocument.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting document:", error);
    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 });
  }
}
