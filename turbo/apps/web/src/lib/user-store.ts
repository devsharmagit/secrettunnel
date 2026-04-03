import { PROVIDER, type User } from "@prisma/client";

import { prisma } from "@/lib/prisma";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function findUserByEmail(email: string) {
  const normalizedEmail = normalizeEmail(email);

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    include: {
      accounts: {
        where: { provider: PROVIDER.CREDENTIALS },
        take: 1,
      },
    },
  });

  const credentialsAccount = user?.accounts[0];

  if (!user || !credentialsAccount?.password_hash) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    passwordHash: credentialsAccount.password_hash,
  };
}

export async function createUser(input: {
  name: string;
  email: string;
  passwordHash: string;
}) {
  const normalizedEmail = normalizeEmail(input.email);

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existing) {
    throw new Error("A user with this email already exists.");
  }

  const user = await prisma.user.create({
    data: {
      name: input.name.trim(),
      email: normalizedEmail,
      accounts: {
        create: {
          provider: PROVIDER.CREDENTIALS,
          providerAccountId: normalizedEmail,
          password_hash: input.passwordHash,
        },
      },
    },
  });

  return user;
}

export async function upsertGitHubUserAccount(input: {
  providerAccountId: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
  accessToken?: string | null;
  refreshToken?: string | null;
  expiresAt?: number | null;
  refreshTokenExpiresIn?: number | null;
}) {
  const normalizedEmail = input.email ? normalizeEmail(input.email) : null;

  const linkedAccount = await prisma.account.findUnique({
    where: {
      provider_providerAccountId: {
        provider: PROVIDER.GITHUB,
        providerAccountId: input.providerAccountId,
      },
    },
    include: { user: true },
  });

  let user: User | null = linkedAccount?.user ?? null;

  if (!user && normalizedEmail) {
    user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
  }

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: input.name?.trim() || normalizedEmail || "GitHub user",
        profilePhoto: input.image ?? null,
        emailVerified: Boolean(normalizedEmail),
      },
    });
  } else {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: input.name?.trim() || user.name,
        profilePhoto: input.image ?? user.profilePhoto,
        emailVerified: user.emailVerified || Boolean(normalizedEmail),
      },
    });
  }

  await prisma.account.upsert({
    where: {
      provider_providerAccountId: {
        provider: PROVIDER.GITHUB,
        providerAccountId: input.providerAccountId,
      },
    },
    create: {
      userId: user.id,
      provider: PROVIDER.GITHUB,
      providerAccountId: input.providerAccountId,
      access_token: input.accessToken ?? null,
      refresh_token: input.refreshToken ?? null,
      expires_at: input.expiresAt ?? null,
      refresh_token_expires_in: input.refreshTokenExpiresIn ?? null,
    },
    update: {
      userId: user.id,
      access_token: input.accessToken ?? null,
      refresh_token: input.refreshToken ?? null,
      expires_at: input.expiresAt ?? null,
      refresh_token_expires_in: input.refreshTokenExpiresIn ?? null,
    },
  });

  return user;
}