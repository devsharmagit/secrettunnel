import { createHash, randomBytes } from "crypto";

import { prisma } from "@/lib/prisma";

const TOKEN_BYTES = 32;
const TOKEN_TTL_HOURS = 24;

export function hashVerificationToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createEmailVerificationToken(userId: number) {
  const token = randomBytes(TOKEN_BYTES).toString("base64url");
  const tokenHash = hashVerificationToken(token);
  const expiresAt = new Date(Date.now() + TOKEN_TTL_HOURS * 60 * 60 * 1000);

  await prisma.emailVerificationToken.deleteMany({
    where: { userId },
  });

  await prisma.emailVerificationToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
    },
  });

  return {
    token,
    expiresAt,
  };
}

export async function verifyEmailToken(token: string) {
  const tokenHash = hashVerificationToken(token);

  const record = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!record || record.expiresAt.getTime() < Date.now()) {
    if (record) {
      await prisma.emailVerificationToken.delete({
        where: { id: record.id },
      });
    }

    return null;
  }

  const user = await prisma.user.update({
    where: { id: record.userId },
    data: { emailVerified: true },
  });

  await prisma.emailVerificationToken.deleteMany({
    where: { userId: record.userId },
  });

  return user;
}
