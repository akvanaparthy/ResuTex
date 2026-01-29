import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET single block
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const block = await prisma.contentBlock.findUnique({
      where: { id },
    });

    if (!block) {
      return NextResponse.json({ error: "Block not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...block,
      tags: JSON.parse(block.tags),
    });
  } catch (error) {
    console.error("Error fetching block:", error);
    return NextResponse.json({ error: "Failed to fetch block" }, { status: 500 });
  }
}

// PUT update block
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, sectionType, latexContent, templateData, tags } = body;

    const block = await prisma.contentBlock.update({
      where: { id },
      data: {
        name,
        sectionType,
        latexContent,
        templateData: templateData ? JSON.stringify(templateData) : null,
        tags: tags ? JSON.stringify(tags) : undefined,
      },
    });

    return NextResponse.json({
      ...block,
      tags: JSON.parse(block.tags),
    });
  } catch (error) {
    console.error("Error updating block:", error);
    return NextResponse.json({ error: "Failed to update block" }, { status: 500 });
  }
}

// DELETE block
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.contentBlock.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting block:", error);
    return NextResponse.json({ error: "Failed to delete block" }, { status: 500 });
  }
}
