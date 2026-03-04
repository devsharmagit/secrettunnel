import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

type StoredUser = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
};

const usersFilePath = path.join(process.cwd(), "data", "users.json");

async function ensureUsersFile() {
  await mkdir(path.dirname(usersFilePath), { recursive: true });

  try {
    await readFile(usersFilePath, "utf8");
  } catch {
    await writeFile(usersFilePath, "[]", "utf8");
  }
}

async function readUsers() {
  await ensureUsersFile();

  const contents = await readFile(usersFilePath, "utf8");
  return JSON.parse(contents) as StoredUser[];
}

async function writeUsers(users: StoredUser[]) {
  await ensureUsersFile();
  await writeFile(usersFilePath, JSON.stringify(users, null, 2), "utf8");
}

export async function findUserByEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const users = await readUsers();

  return users.find((user) => user.email === normalizedEmail) ?? null;
}

export async function createUser(input: {
  name: string;
  email: string;
  passwordHash: string;
}) {
  const normalizedEmail = input.email.trim().toLowerCase();
  const users = await readUsers();

  if (users.some((user) => user.email === normalizedEmail)) {
    throw new Error("A user with this email already exists.");
  }

  const newUser: StoredUser = {
    id: randomUUID(),
    name: input.name.trim(),
    email: normalizedEmail,
    passwordHash: input.passwordHash,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  await writeUsers(users);

  return newUser;
}