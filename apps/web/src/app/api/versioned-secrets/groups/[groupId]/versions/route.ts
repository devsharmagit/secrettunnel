import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/versioned-secrets/groups/[groupId]/versions — Add a new version
export async function POST(
  request: Request,
  { params }: { params: Promise<{ groupId: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { groupId } = await params;

    const group = await prisma.secretGroup.findUnique({
      where: { id: groupId },
      select: { userId: true },
    });

    if (!group) {
      return NextResponse.json(
        { success: false, message: "Group not found" },
        { status: 404 },
      );
    }

    if (group.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { ciphertext, iv } = body as {
      ciphertext?: string;
      iv?: string;
    };

    if (
      !ciphertext ||
      typeof ciphertext !== "string" ||
      !iv ||
      typeof iv !== "string"
    ) {
      return NextResponse.json(
        { success: false, message: "Missing required fields: ciphertext, iv" },
        { status: 400 },
      );
    }

    // Get the current max version number
    const latestVersion = await prisma.secretVersion.findFirst({
      where: { groupId },
      orderBy: { versionNumber: "desc" },
      select: { versionNumber: true },
    });

    const nextVersionNumber = (latestVersion?.versionNumber ?? 0) + 1;

    await prisma.secretVersion.create({
      data: {
        groupId,
        versionNumber: nextVersionNumber,
        ciphertext,
        iv,
      },
    });

    return NextResponse.json(
      { versionNumber: nextVersionNumber },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/versioned-secrets/groups/[groupId]/versions error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

// GET /api/versioned-secrets/groups/[groupId]/versions — List all versions
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ groupId: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { groupId } = await params;

    const group = await prisma.secretGroup.findUnique({
      where: { id: groupId },
      select: { userId: true },
    });

    if (!group) {
      return NextResponse.json(
        { success: false, message: "Group not found" },
        { status: 404 },
      );
    }

    if (group.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 },
      );
    }

    const versions = await prisma.secretVersion.findMany({
      where: { groupId },
      select: {
        id: true,
        versionNumber: true,
        ciphertext: true,
        iv: true,
        createdAt: true,
      },
      orderBy: { versionNumber: "asc" },
    });

    const result = versions.map((v) => ({
      id: v.id,
      versionNumber: v.versionNumber,
      ciphertext: v.ciphertext,
      iv: v.iv,
      createdAt: v.createdAt.toISOString(),
    }));

    return NextResponse.json({ versions: result }, { status: 200 });
  } catch (error) {
    console.error("GET /api/versioned-secrets/groups/[groupId]/versions error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
