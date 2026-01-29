import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all documents
export async function GET() {
  try {
    const documents = await prisma.resumeDocument.findMany({
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 });
  }
}

// POST create document
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name } = body;

    const document = await prisma.resumeDocument.create({
      data: {
        name: name || "My Resume",
      },
    });

    return NextResponse.json(document);
  } catch (error) {
    console.error("Error creating document:", error);
    return NextResponse.json({ error: "Failed to create document" }, { status: 500 });
  }
}
