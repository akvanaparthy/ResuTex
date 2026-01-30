import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface VariantConflict {
  variantGroupId: string;
  variantGroupName: string;
  variantGroupColor: string;
  conflictingBlockIds: string[];
  conflictingBlockNames: string[];
}

// Helper to check for variant conflicts in a structure
async function checkVariantConflicts(structure: string): Promise<VariantConflict[]> {
  const parsed = JSON.parse(structure) as {
    sectionOrder: string[];
    sections: Record<string, string[]>;
  };

  // Collect all block IDs from the structure
  const allBlockIds: string[] = [];
  for (const sectionType of parsed.sectionOrder) {
    const blockIds = parsed.sections[sectionType] || [];
    allBlockIds.push(...blockIds);
  }

  if (allBlockIds.length === 0) {
    return [];
  }

  // Get all blocks with their variant groups
  const blocks = await prisma.contentBlock.findMany({
    where: { id: { in: allBlockIds } },
    include: {
      variantGroup: true,
    },
  });

  // Group blocks by variant group
  const variantGroupMap = new Map<string, typeof blocks>();
  for (const block of blocks) {
    if (block.variantGroupId) {
      const existing = variantGroupMap.get(block.variantGroupId) || [];
      existing.push(block);
      variantGroupMap.set(block.variantGroupId, existing);
    }
  }

  // Find groups with more than one block (conflicts)
  const conflicts: VariantConflict[] = [];
  for (const [groupId, groupBlocks] of variantGroupMap) {
    if (groupBlocks.length > 1) {
      conflicts.push({
        variantGroupId: groupId,
        variantGroupName: groupBlocks[0].variantGroup?.name || "Unknown",
        variantGroupColor: groupBlocks[0].variantGroup?.color || "#3B82F6",
        conflictingBlockIds: groupBlocks.map(b => b.id),
        conflictingBlockNames: groupBlocks.map(b => b.name),
      });
    }
  }

  return conflicts;
}

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
    const { name, structure, preamble, headerData, spacing, skipVariantCheck } = body;

    // If structure is being updated, check for variant conflicts
    if (structure && !skipVariantCheck) {
      const conflicts = await checkVariantConflicts(structure);
      if (conflicts.length > 0) {
        return NextResponse.json(
          {
            error: "Variant conflict detected",
            message: "Only one block from each variant group can be added to a resume",
            conflicts,
          },
          { status: 409 }
        );
      }
    }

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
