import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface VariantConflict {
  variantGroupId: string;
  variantGroupName: string;
  variantGroupColor: string;
  conflictingBlockIds: string[];
  conflictingBlockNames: string[];
}

/**
 * POST - Validate if adding a block to a document would cause variant conflicts
 * 
 * Body: { documentId: string, blockIdToAdd: string }
 * 
 * Returns:
 * - { valid: true } if no conflicts
 * - { valid: false, conflict: VariantConflict } if there's a conflict
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { documentId } = body;
    // Accept both blockIdToAdd and blockId for compatibility
    const blockIdToAdd = body.blockIdToAdd || body.blockId;

    if (!documentId || !blockIdToAdd) {
      return NextResponse.json(
        { error: "documentId and blockId/blockIdToAdd are required" },
        { status: 400 }
      );
    }

    // Get the block being added with its variant group
    const blockToAdd = await prisma.contentBlock.findUnique({
      where: { id: blockIdToAdd },
      include: {
        variantGroup: true,
      },
    });

    if (!blockToAdd) {
      return NextResponse.json(
        { error: "Block not found" },
        { status: 404 }
      );
    }

    // If block doesn't belong to a variant group, no conflict possible
    if (!blockToAdd.variantGroupId) {
      return NextResponse.json({ valid: true });
    }

    // Get the document's current structure
    const document = await prisma.resumeDocument.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Parse the structure to get all block IDs currently in the document
    const structure = JSON.parse(document.structure) as {
      sectionOrder: string[];
      sections: Record<string, string[]>;
    };

    const allBlockIds: string[] = [];
    for (const sectionType of structure.sectionOrder) {
      const blockIds = structure.sections[sectionType] || [];
      allBlockIds.push(...blockIds);
    }

    // Check if any of these blocks belong to the same variant group
    const blocksInSameGroup = await prisma.contentBlock.findMany({
      where: {
        id: { in: allBlockIds },
        variantGroupId: blockToAdd.variantGroupId,
      },
    });

    if (blocksInSameGroup.length > 0) {
      return NextResponse.json({
        valid: false,
        conflict: {
          variantGroupId: blockToAdd.variantGroupId,
          variantGroupName: blockToAdd.variantGroup?.name || "Unknown",
          variantGroupColor: blockToAdd.variantGroup?.color || "#3B82F6",
          conflictingBlockIds: blocksInSameGroup.map(b => b.id),
          conflictingBlockNames: blocksInSameGroup.map(b => b.name),
        } as VariantConflict,
      });
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error("Variant conflict validation error:", error);
    return NextResponse.json(
      { error: "Failed to validate variant conflict" },
      { status: 500 }
    );
  }
}

/**
 * PUT - Check all variant conflicts in a document
 * 
 * Body: { documentId: string }
 * 
 * Returns: { conflicts: VariantConflict[] }
 */
export async function PUT(request: NextRequest) {
  try {
    const { documentId } = await request.json();

    if (!documentId) {
      return NextResponse.json(
        { error: "documentId is required" },
        { status: 400 }
      );
    }

    // Get the document's current structure
    const document = await prisma.resumeDocument.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Parse the structure to get all block IDs currently in the document
    const structure = JSON.parse(document.structure) as {
      sectionOrder: string[];
      sections: Record<string, string[]>;
    };

    const allBlockIds: string[] = [];
    for (const sectionType of structure.sectionOrder) {
      const blockIds = structure.sections[sectionType] || [];
      allBlockIds.push(...blockIds);
    }

    if (allBlockIds.length === 0) {
      return NextResponse.json({ conflicts: [] });
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

    return NextResponse.json({ conflicts });
  } catch (error) {
    console.error("Variant conflict check error:", error);
    return NextResponse.json(
      { error: "Failed to check variant conflicts" },
      { status: 500 }
    );
  }
}
