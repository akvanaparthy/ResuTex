import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET single variant group with blocks
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const variantGroup = await prisma.variantGroup.findUnique({
      where: { id },
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
    });

    if (!variantGroup) {
      return NextResponse.json(
        { error: "Variant group not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(variantGroup);
  } catch (error) {
    console.error("Error fetching variant group:", error);
    return NextResponse.json(
      { error: "Failed to fetch variant group" },
      { status: 500 }
    );
  }
}

// PUT update variant group (name, color)
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, color } = body;

    // Check if new name conflicts with existing
    if (name) {
      const existing = await prisma.variantGroup.findFirst({
        where: {
          name,
          NOT: { id },
        },
      });

      if (existing) {
        return NextResponse.json(
          { error: "A variant group with this name already exists" },
          { status: 409 }
        );
      }
    }

    const variantGroup = await prisma.variantGroup.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(color && { color }),
      },
      include: {
        blocks: {
          select: {
            id: true,
            name: true,
            sectionType: true,
            blockType: true,
          },
        },
      },
    });

    return NextResponse.json(variantGroup);
  } catch (error) {
    console.error("Error updating variant group:", error);
    return NextResponse.json(
      { error: "Failed to update variant group" },
      { status: 500 }
    );
  }
}

// DELETE variant group (blocks will have variantGroupId set to null)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // First remove all blocks from this group
    await prisma.contentBlock.updateMany({
      where: { variantGroupId: id },
      data: { variantGroupId: null },
    });

    // Then delete the group
    await prisma.variantGroup.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting variant group:", error);
    return NextResponse.json(
      { error: "Failed to delete variant group" },
      { status: 500 }
    );
  }
}

// PATCH - Add or remove blocks from the variant group
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { addBlockIds, removeBlockIds } = body;

    // Verify variant group exists
    const variantGroup = await prisma.variantGroup.findUnique({
      where: { id },
    });

    if (!variantGroup) {
      return NextResponse.json(
        { error: "Variant group not found" },
        { status: 404 }
      );
    }

    // Add blocks to group
    if (addBlockIds && Array.isArray(addBlockIds) && addBlockIds.length > 0) {
      await prisma.contentBlock.updateMany({
        where: { id: { in: addBlockIds } },
        data: { variantGroupId: id },
      });
    }

    // Remove blocks from group
    if (removeBlockIds && Array.isArray(removeBlockIds) && removeBlockIds.length > 0) {
      await prisma.contentBlock.updateMany({
        where: {
          id: { in: removeBlockIds },
          variantGroupId: id,
        },
        data: { variantGroupId: null },
      });
    }

    // Return updated group
    const result = await prisma.variantGroup.findUnique({
      where: { id },
      include: {
        blocks: {
          select: {
            id: true,
            name: true,
            sectionType: true,
            blockType: true,
          },
        },
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating variant group blocks:", error);
    return NextResponse.json(
      { error: "Failed to update variant group blocks" },
      { status: 500 }
    );
  }
}
