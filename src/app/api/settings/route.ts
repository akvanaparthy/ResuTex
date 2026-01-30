import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET settings
export async function GET() {
  try {
    let settings = await prisma.appSettings.findUnique({
      where: { id: "default" },
    });

    // Create default settings if not exists
    if (!settings) {
      settings = await prisma.appSettings.create({
        data: {
          id: "default",
          sharedBlocks: true,
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

// PUT update settings
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { sharedBlocks } = body;

    const settings = await prisma.appSettings.upsert({
      where: { id: "default" },
      update: { sharedBlocks },
      create: {
        id: "default",
        sharedBlocks,
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
