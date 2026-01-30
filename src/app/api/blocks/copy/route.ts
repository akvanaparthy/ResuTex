import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST - Copy blocks to a different document
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { blockIds, targetDocumentId } = body;

    if (!blockIds || !Array.isArray(blockIds) || blockIds.length === 0) {
      return NextResponse.json({ error: "No block IDs provided" }, { status: 400 });
    }

    // Get the source blocks
    const sourceBlocks = await prisma.contentBlock.findMany({
      where: { id: { in: blockIds } },
    });

    // Create copies for the target document
    const copiedBlocks = await Promise.all(
      sourceBlocks.map(async (block) => {
        return prisma.contentBlock.create({
          data: {
            name: block.name,
            sectionType: block.sectionType,
            blockType: block.blockType,
            latexContent: block.latexContent,
            templateData: block.templateData,
            tags: block.tags,
            variantGroupId: block.variantGroupId,
            documentId: targetDocumentId || null,
          },
          include: {
            variantGroup: {
              select: {
                id: true,
                name: true,
                color: true,
              },
            },
          },
        });
      })
    );

    // Parse tags for response
    const blocksWithParsedTags = copiedBlocks.map((block) => ({
      ...block,
      tags: JSON.parse(block.tags),
    }));

    return NextResponse.json({
      copied: blocksWithParsedTags.length,
      blocks: blocksWithParsedTags,
    });
  } catch (error) {
    console.error("Error copying blocks:", error);
    return NextResponse.json({ error: "Failed to copy blocks" }, { status: 500 });
  }
}
