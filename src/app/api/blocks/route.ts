import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all blocks with variant group info
export async function GET() {
  try {
    const blocks = await prisma.contentBlock.findMany({
      include: {
        variantGroup: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Parse tags JSON for each block
    const blocksWithParsedTags = blocks.map((block) => ({
      ...block,
      tags: JSON.parse(block.tags),
    }));

    return NextResponse.json(blocksWithParsedTags);
  } catch (error) {
    console.error("Error fetching blocks:", error);
    return NextResponse.json({ error: "Failed to fetch blocks" }, { status: 500 });
  }
}

// POST create block
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, sectionType, blockType, latexContent, templateData, tags, variantGroupId } = body;

    const block = await prisma.contentBlock.create({
      data: {
        name,
        sectionType,
        blockType: blockType || "PLAIN",
        latexContent,
        templateData: templateData ? JSON.stringify(templateData) : null,
        tags: JSON.stringify(tags || []),
        variantGroupId: variantGroupId || null,
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

    return NextResponse.json({
      ...block,
      tags: JSON.parse(block.tags),
    });
  } catch (error) {
    console.error("Error creating block:", error);
    return NextResponse.json({ error: "Failed to create block" }, { status: 500 });
  }
}
