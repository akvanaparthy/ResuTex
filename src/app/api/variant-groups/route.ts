import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Predefined colors for variant groups
export const VARIANT_COLORS = [
  "#EF4444", // Red
  "#F97316", // Orange
  "#EAB308", // Yellow
  "#22C55E", // Green
  "#3B82F6", // Blue
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#14B8A6", // Teal
  "#6366F1", // Indigo
  "#F59E0B", // Amber
];

// GET all variant groups with their blocks
export async function GET() {
  try {
    const variantGroups = await prisma.variantGroup.findMany({
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
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(variantGroups);
  } catch (error) {
    console.error("Error fetching variant groups:", error);
    return NextResponse.json(
      { error: "Failed to fetch variant groups" },
      { status: 500 }
    );
  }
}

// POST create a new variant group
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, color, blockIds } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    // Check if name already exists
    const existing = await prisma.variantGroup.findUnique({
      where: { name },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A variant group with this name already exists" },
        { status: 409 }
      );
    }

    // Create variant group
    const variantGroup = await prisma.variantGroup.create({
      data: {
        name,
        color: color || VARIANT_COLORS[0],
      },
    });

    // If blockIds provided, assign blocks to this group
    if (blockIds && Array.isArray(blockIds) && blockIds.length > 0) {
      await prisma.contentBlock.updateMany({
        where: { id: { in: blockIds } },
        data: { variantGroupId: variantGroup.id },
      });
    }

    // Return with blocks included
    const result = await prisma.variantGroup.findUnique({
      where: { id: variantGroup.id },
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

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating variant group:", error);
    return NextResponse.json(
      { error: "Failed to create variant group" },
      { status: 500 }
    );
  }
}
