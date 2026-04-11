import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createSecretVersionSchema } from "@/lib/schema";

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

    const parseResult = createSecretVersionSchema.safeParse(await request.json());
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request body",
          errors: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { ciphertext, iv } = parseResult.data;

    const MAX_RETRIES = 3;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      
      const latestVersion = await prisma.secretVersion.findFirst({
        where: { groupId },
        orderBy: { versionNumber: "desc" },
        select: { versionNumber: true },
      });

      const nextVersionNumber = (latestVersion?.versionNumber ?? 0) + 1;

      try {
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
      } catch (err: any) {
        // Prisma unique constraint error
        if (err.code === "P2002") {
          // conflict → retry
          if (attempt === MAX_RETRIES - 1) {
            return NextResponse.json(
              { success: false, message: "Conflict, please retry" },
              { status: 409 },
            );
          }
          continue;
        }

        throw err;
      }
    }

    // fallback (should never hit)
    return NextResponse.json(
      { success: false, message: "Failed to create version" },
      { status: 500 },
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
