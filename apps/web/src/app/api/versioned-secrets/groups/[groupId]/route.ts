import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// DELETE /api/versioned-secrets/groups/[groupId] — Delete a group (cascade deletes versions)
export async function DELETE(
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

    await prisma.secretGroup.delete({
      where: { id: groupId },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/versioned-secrets/groups/[groupId] error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
