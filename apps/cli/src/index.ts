#!/usr/bin/env node

import { generateKey, generateSalt, applyPasswordLayer, decrypt, encrypt, exportKey, importKey } from "@repo/encryption";
import { readFileSync } from "fs";
import { createInterface } from "readline/promises";
import { stdin as input, stdout as output } from "process";
import axios from "axios";

const API_URL = "http://localhost:3000/api/secrets";
const DEFAULT_TTL = 10000000;
const STEP_TIMEOUT_MS = 20000;

interface PushArgs {
  content: string | null;
  filePath: string | null;
  ttl: number;
  password: string | null;
}

interface PullArgs {
  reference: string | null;
  key: string | null;
  password: string | null;
}

interface SecretReference {
  token: string;
  key: string;
}

interface SecretPayload {
  ciphertext: string;
  iv: string;
  passwordHash?: string;
}

function printUsage() {
  console.log("Usage:");
  console.log("  secrettunnel push 'your secret message' [--ttl 3600] [--file path] [--password value]");
  console.log("  secrettunnel pull '<share-url-with-key>'");
  console.log("  secrettunnel pull <token> --key <base64Key> [--password value]");
}

function exitWithError(message: string): never {
  console.error(`\n❌ ${message}`);
  process.exit(1);
}

async function withTimeout<T>(promise: Promise<T>, label: string, timeoutMs = STEP_TIMEOUT_MS): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`${label} timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

function isSecretPayload(value: unknown): value is SecretPayload {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as Record<string, unknown>;
  const hasCiphertext = typeof payload.ciphertext === "string";
  const hasIv = typeof payload.iv === "string";
  const hasValidPasswordHash =
    payload.passwordHash === undefined || typeof payload.passwordHash === "string";

  return hasCiphertext && hasIv && hasValidPasswordHash;
}

function parsePushArgs(args: string[]): PushArgs {
  let content: string | null = null;
  let filePath: string | null = null;
  let ttl = DEFAULT_TTL;
  let password: string | null = null;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (!arg) continue;

    if (arg === "--file") {
      const next = args[i + 1];
      if (!next || next.startsWith("--")) {
        exitWithError("Missing value for --file");
      }

      filePath = next;
      i++;
      continue;
    }

    if (arg === "--ttl") {
      const ttlStr = args[i + 1];
      if (!ttlStr || ttlStr.startsWith("--")) {
        exitWithError("Missing value for --ttl");
      }

      ttl = parseInt(ttlStr, 10);
      if (isNaN(ttl) || ttl <= 0) {
        exitWithError("--ttl must be a positive number");
      }

      i++;
      continue;
    }

    if (arg === "--password") {
      const next = args[i + 1];
      if (next === undefined || next.startsWith("--")) {
        exitWithError("Missing value for --password");
      }

      password = next;
      i++;
      continue;
    }

    if (arg.startsWith("--")) {
      exitWithError(`Unknown option for push command: ${arg}`);
    }

    content = content ? `${content} ${arg}` : arg;
  }

  return { content, filePath, ttl, password };
}

function parsePullArgs(args: string[]): PullArgs {
  let reference: string | null = null;
  let key: string | null = null;
  let password: string | null = null;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (!arg) continue;

    if (arg === "--key") {
      const next = args[i + 1];
      if (!next || next.startsWith("--")) {
        exitWithError("Missing value for --key");
      }

      key = next;
      i++;
      continue;
    }

    if (arg === "--password") {
      const next = args[i + 1];
      if (!next || next.startsWith("--")) {
        exitWithError("Missing value for --password");
      }

      password = next;
      i++;
      continue;
    }

    if (arg.startsWith("--")) {
      exitWithError(`Unknown option for pull command: ${arg}`);
    }

    if (reference) {
      exitWithError("pull command accepts only one token or URL reference");
    }

    reference = arg;
  }

  return { reference, key, password };
}

function parseSecretReference(reference: string, keyOverride: string | null): SecretReference {
  let token: string | null = null;
  let keyFromReference: string | null = null;

  if (/^https?:\/\//i.test(reference)) {
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(reference);
    } catch {
      exitWithError("Invalid URL provided for pull command");
    }

    const pathParts = parsedUrl.pathname.split("/").filter(Boolean);
    token = pathParts[pathParts.length - 1] || null;
    keyFromReference = new URLSearchParams(parsedUrl.hash.slice(1)).get("key");
  } else {
    const [beforeHashRaw, hashPart] = reference.split("#", 2);
    const beforeHash = beforeHashRaw ?? "";
    const pathParts = beforeHash.split("/").filter(Boolean);
    token = pathParts[pathParts.length - 1] || null;

    if (hashPart) {
      keyFromReference = new URLSearchParams(hashPart).get("key");
    }
  }

  if (!token) {
    exitWithError("Missing token in pull reference");
  }

  const finalKey = keyOverride || keyFromReference;
  if (!finalKey) {
    exitWithError("Missing key. Provide a full URL containing #key=... or pass --key <base64Key>");
  }

  return { token, key: finalKey };
}

// Read content from file or direct argument
async function getContent(args: PushArgs): Promise<string> {
  if (args.filePath) {
    try {
      return readFileSync(args.filePath, "utf-8");
    } catch (error) {
      exitWithError(`Error reading file "${args.filePath}": ${(error as Error).message}`);
    }
  }

  if (args.content) {
    return args.content;
  }

  exitWithError("No content provided for push command");
}

async function promptForOptionalPassword(): Promise<string | null> {
  const rl = createInterface({ input, output });

  try {
    const answer = await rl.question("Enter a password (or press Enter to skip): ");
    return answer.length > 0 ? answer : null;
  } finally {
    rl.close();
  }
}

async function promptForRequiredPassword(): Promise<string> {
  while (true) {
    const rl = createInterface({ input, output });

    try {
      const answer = await rl.question("Enter secret password: ");
      if (answer.length > 0) {
        return answer;
      }
    } finally {
      rl.close();
    }

    console.error("Password cannot be empty for this secret.");
  }
}

function getAxiosErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error.message : String(error);
  }

  const responseMessage =
    typeof error.response?.data?.message === "string"
      ? error.response.data.message
      : null;

  if (responseMessage) {
    return responseMessage;
  }

  if (error.response?.status === 404) {
    return "Secret not found. It may have expired or already been viewed.";
  }

  if (error.code === "ECONNABORTED") {
    return "Request timed out while contacting server";
  }

  return error.message;
}

async function fetchSecret(token: string): Promise<SecretPayload> {
  try {
    const res = await axios.get(`${API_URL}/${encodeURIComponent(token)}`, {
      timeout: STEP_TIMEOUT_MS,
    });

    const data = (res.data as { data?: unknown })?.data;
    if (!isSecretPayload(data)) {
      throw new Error("Invalid secret payload returned by server");
    }

    return data;
  } catch (error) {
    throw new Error(getAxiosErrorMessage(error));
  }
}

async function decryptSecret(
  data: SecretPayload,
  keyBase64: string,
  password?: string,
): Promise<string> {
  const baseKey = await withTimeout(importKey(keyBase64), "Key import");
  let keyToUse = baseKey;

  if (data.passwordHash) {
    if (!password) {
      throw new Error("Password required for this secret");
    }

    keyToUse = await withTimeout(
      applyPasswordLayer(baseKey, password, data.passwordHash),
      "Password protection",
    );
  }

  return withTimeout(decrypt(data.ciphertext, data.iv, keyToUse), "Decryption");
}

// Main encryption and submission flow
async function handlePush(content: string, password: string | null, ttl: number) {
  try {
    console.log("\n🔐 Encrypting secret...");

    const baseKey = await withTimeout(generateKey(), "Key generation");
    let keyToUse = baseKey;
    let saltForServer: string | undefined = undefined;

    if (password) {
      console.log("🔑 Applying password protection...");
      const salt = generateSalt();
      keyToUse = await withTimeout(applyPasswordLayer(baseKey, password, salt), "Password protection");
      saltForServer = salt;
    }

    const { ciphertext, iv } = await withTimeout(encrypt(content, keyToUse), "Encryption");
    const exportedKeyBase64 = await withTimeout(exportKey(baseKey), "Key export");

    console.log("📤 Sending to server...");

    const res = await axios.post(
      API_URL,
      {
        ciphertext,
        iv,
        ttl,
        passwordHash: saltForServer,
      },
      { timeout: STEP_TIMEOUT_MS },
    );

    const token = (res.data as { token?: string })?.token;
    if (!token) {
      throw new Error("Server response missing token");
    }

    const url = `http://localhost:3000/s/${token}#key=${encodeURIComponent(exportedKeyBase64)}`;

    console.log("\n✅ Secret created successfully!\n");
    console.log("🔗 Share this link:\n");
    console.log(url);
    console.log("\n");
  } catch (error) {
    console.error("\n❌ Error:", getAxiosErrorMessage(error));
    process.exit(1);
  }
}

async function handlePull(reference: string, keyOverride: string | null, initialPassword: string | null) {
  try {
    const { token, key } = parseSecretReference(reference, keyOverride);

    console.log("\n📥 Fetching secret...");
    const encryptedData = await fetchSecret(token);

    console.log("🔓 Decrypting secret...");

    let plaintext: string | null = null;

    if (encryptedData.passwordHash) {
      let currentPassword = initialPassword;
      const maxAttempts = initialPassword ? 1 : 3;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        if (!currentPassword) {
          currentPassword = await promptForRequiredPassword();
        }

        try {
          plaintext = await decryptSecret(encryptedData, key, currentPassword);
          break;
        } catch {
          if (attempt < maxAttempts && !initialPassword) {
            console.error("Incorrect password. Please try again.");
            currentPassword = null;
            continue;
          }

          throw new Error("Failed to decrypt secret. Incorrect password or corrupted key.");
        }
      }
    } else {
      plaintext = await decryptSecret(encryptedData, key);
    }

    if (plaintext === null) {
      throw new Error("Failed to decrypt secret");
    }

    console.log("\n✅ Secret decrypted successfully!\n");
    console.log(plaintext);
    console.log("\n");
  } catch (error) {
    console.error("\n❌ Error:", getAxiosErrorMessage(error));
    process.exit(1);
  }
}

// Main entry point
async function main() {
  const argv = process.argv.slice(2);

  if (argv.length === 0) {
    printUsage();
    process.exit(1);
  }

  const command = argv[0];

  if (command === "push") {
    const args = parsePushArgs(argv.slice(1));
    const content = await getContent(args);

    let password = args.password;
    if (!password) {
      password = await promptForOptionalPassword();
    }

    await handlePush(content, password, args.ttl);
    return;
  }

  if (command === "pull") {
    const args = parsePullArgs(argv.slice(1));

    if (!args.reference) {
      exitWithError("Missing token or URL for pull command");
    }

    await handlePull(args.reference, args.key, args.password);
    return;
  }

  printUsage();
  exitWithError(`Unknown command: ${command}. Use push or pull.`);
}

main();