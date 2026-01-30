import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST - Swap one variant block with another in a document
 * 
 * This replaces a block in the document with another block from the same variant group.
 * 
 * Body: {
 *   documentId: string,
 *   currentBlockId: string,  // Block currently in the document
 *   newBlockId: string       // Block to replace it with (must be in same variant group)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { documentId, newBlockId } = body;
    // Accept both currentBlockId and oldBlockId for compatibility
    const currentBlockId = body.currentBlockId || body.oldBlockId;

    if (!documentId || !currentBlockId || !newBlockId) {
      return NextResponse.json(
        { error: "documentId, oldBlockId/currentBlockId, and newBlockId are required" },
        { status: 400 }
      );
    }

    // Get both blocks
    const [currentBlock, newBlock] = await Promise.all([
      prisma.contentBlock.findUnique({
        where: { id: currentBlockId },
        include: { variantGroup: true },
      }),
      prisma.contentBlock.findUnique({
        where: { id: newBlockId },
        include: { variantGroup: true },
      }),
    ]);

    if (!currentBlock) {
      return NextResponse.json(
        { error: "Current block not found" },
        { status: 404 }
      );
    }

    if (!newBlock) {
      return NextResponse.json(
        { error: "New block not found" },
        { status: 404 }
      );
    }

    // Verify both blocks are in the same variant group
    if (!currentBlock.variantGroupId || !newBlock.variantGroupId) {
      return NextResponse.json(
        { error: "Both blocks must belong to a variant group to swap" },
        { status: 400 }
      );
    }

    if (currentBlock.variantGroupId !== newBlock.variantGroupId) {
      return NextResponse.json(
        { error: "Blocks must be in the same variant group to swap" },
        { status: 400 }
      );
    }

    // Get the document
    const document = await prisma.resumeDocument.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Parse structure and replace the block
    const structure = JSON.parse(document.structure) as {
      sectionOrder: string[];
      sections: Record<string, string[]>;
    };

    let found = false;
    for (const sectionType of structure.sectionOrder) {
      const blockIds = structure.sections[sectionType] || [];
      const index = blockIds.indexOf(currentBlockId);
      if (index !== -1) {
        blockIds[index] = newBlockId;
        structure.sections[sectionType] = blockIds;
        found = true;
        break;
      }
    }

    if (!found) {
      return NextResponse.json(
        { error: "Current block not found in document structure" },
        { status: 404 }
      );
    }

    // Update the document
    const newStructure = JSON.stringify(structure);
    const updatedDocument = await prisma.resumeDocument.update({
      where: { id: documentId },
      data: { structure: newStructure },
    });

    // Sync ContentUsage table
    await prisma.contentUsage.deleteMany({
      where: { documentId },
    });

    const usages: { documentId: string; blockId: string; sectionType: string; order: number }[] = [];
    for (const sectionType of structure.sectionOrder) {
      const blockIds = structure.sections[sectionType] || [];
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

    return NextResponse.json({
      success: true,
      document: updatedDocument,
      swapped: {
        from: currentBlockId,
        to: newBlockId,
        variantGroup: {
          id: currentBlock.variantGroupId,
          name: currentBlock.variantGroup?.name,
          color: currentBlock.variantGroup?.color,
        },
      },
    });
  } catch (error) {
    console.error("Variant swap error:", error);
    return NextResponse.json(
      { error: "Failed to swap variant" },
      { status: 500 }
    );
  }
}

/**
 * GET - Get all variants for a block in a document
 * 
 * Query params: documentId, blockId
 * 
 * Returns the variant group info and all blocks in that group
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const blockId = searchParams.get("blockId");

    if (!blockId) {
      return NextResponse.json(
        { error: "blockId is required" },
        { status: 400 }
      );
    }

    // Get the block with its variant group and sibling blocks
    const block = await prisma.contentBlock.findUnique({
      where: { id: blockId },
      include: {
        variantGroup: {
          include: {
            blocks: {
              select: {
                id: true,
                name: true,
                sectionType: true,
                blockType: true,
                latexContent: true,
              },
            },
          },
        },
      },
    });

    if (!block) {
      return NextResponse.json(
        { error: "Block not found" },
        { status: 404 }
      );
    }

    if (!block.variantGroup) {
      return NextResponse.json({
        hasVariants: false,
        block: {
          id: block.id,
          name: block.name,
        },
      });
    }

    return NextResponse.json({
      hasVariants: true,
      currentBlockId: block.id,
      variantGroup: {
        id: block.variantGroup.id,
        name: block.variantGroup.name,
        color: block.variantGroup.color,
      },
      variants: block.variantGroup.blocks,
    });
  } catch (error) {
    console.error("Get variants error:", error);
    return NextResponse.json(
      { error: "Failed to get variants" },
      { status: 500 }
    );
  }
}
