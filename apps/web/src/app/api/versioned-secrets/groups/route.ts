import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/versioned-secrets/groups — Create a new group + first version
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { name, ciphertext, iv } = body as {
      name?: string;
      ciphertext?: string;
      iv?: string;
    };

    if (
      !name ||
      typeof name !== "string" ||
      !ciphertext ||
      typeof ciphertext !== "string" ||
      !iv ||
      typeof iv !== "string"
    ) {
      return NextResponse.json(
        { success: false, message: "Missing required fields: name, ciphertext, iv" },
        { status: 400 },
      );
    }

    const group = await prisma.secretGroup.create({
      data: {
        userId: session.user.id,
        name: name.trim(),
        versions: {
          create: {
            versionNumber: 1,
            ciphertext,
            iv,
          },
        },
      },
    });

    return NextResponse.json({ groupId: group.id }, { status: 201 });
  } catch (error) {
    console.error("POST /api/versioned-secrets/groups error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

// GET /api/versioned-secrets/groups — List all groups for authenticated user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const groups = await prisma.secretGroup.findMany({
      where: { userId: session.user.id },
      include: {
        versions: {
          select: { versionNumber: true },
          orderBy: { versionNumber: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const result = groups.map((group) => ({
      id: group.id,
      name: group.name,
      latestVersion: group.versions[0]?.versionNumber ?? 0,
      createdAt: group.createdAt.toISOString(),
    }));

    return NextResponse.json({ groups: result }, { status: 200 });
  } catch (error) {
    console.error("GET /api/versioned-secrets/groups error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
