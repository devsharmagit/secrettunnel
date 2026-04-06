#!/usr/bin/env node

import { generateKey, generateSalt, applyPasswordLayer, decrypt, encrypt, exportKey, importKey } from "@repo/encryption";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { createInterface, type Interface } from "readline/promises";
import { stdin as input, stdout as output } from "process";
import axios from "axios";
import ora from "ora";

const DEFAULT_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://api.woirohs.com"
    : "http://localhost:3000";
const API_URL = (process.env.SECRETTUNNEL_API_URL || process.env.API_URL || `${DEFAULT_BASE_URL}/api/secrets`).replace(/\/+$/, "");
const SHARE_BASE_URL = (() => {
  try {
    return new URL(API_URL).origin;
  } catch {
    return DEFAULT_BASE_URL;
  }
})();
const DEFAULT_TTL_SECONDS = 24 * 60 * 60;
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
  outputPath: string | null;
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
  console.log("  secrettunnel push 'your secret message' [--ttl 24h] [--file path] [--password value]");
  console.log("    --ttl supports seconds or 1m|1h|7d style values (default: 24h)");
  console.log("  secrettunnel pull '<share-url-with-key>' [--password value] [--output <path|->]");
  console.log("  secrettunnel pull <token> --key <base64Key> [--password value] [--output <path|->]");
}

function exitWithError(message: string): never {
  console.error(`\n❌ ${message}`);
  process.exit(1);
}

function isSecretPayload(value: unknown): value is SecretPayload {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as Record<string, unknown>;
  const hasCiphertext = typeof payload.ciphertext === "string";
  const hasIv = typeof payload.iv === "string";
  const hasValidPasswordHash = payload.passwordHash === undefined || typeof payload.passwordHash === "string";

  return hasCiphertext && hasIv && hasValidPasswordHash;
}

function parseTtlToSeconds(value: string): number {
  const inputValue = value.trim().toLowerCase();
  const matched = inputValue.match(/^(\d+)([smhd])?$/);

  if (!matched) {
    exitWithError("Invalid --ttl value. Use seconds (e.g. 3600) or duration format like 30m, 1h, 7d");
  }

  const amount = Number.parseInt(matched[1] ?? "", 10);
  const unit = matched[2] ?? "s";

  if (!Number.isFinite(amount) || amount <= 0) {
    exitWithError("--ttl must be a positive value");
  }

  const multipliers: Record<string, number> = {
    s: 1,
    m: 60,
    h: 60 * 60,
    d: 24 * 60 * 60,
  };

  const multiplier = multipliers[unit];
  if (!multiplier) {
    exitWithError("Invalid --ttl unit. Use s, m, h, or d");
  }

  return amount * multiplier;
}

function parsePushArgs(args: string[]): PushArgs {
  let content: string | null = null;
  let filePath: string | null = null;
  let ttl = DEFAULT_TTL_SECONDS;
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

      ttl = parseTtlToSeconds(ttlStr);
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
  let outputPath: string | null = null;

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

    if (arg === "--output") {
      const next = args[i + 1];
      if (!next || next.startsWith("--")) {
        exitWithError("Missing value for --output");
      }

      outputPath = next;
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

  return { reference, key, password, outputPath };
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

function sanitizeServerMessage(message: string): string {
  return message
    .replace(/[\r\n\t]+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim()
    .slice(0, 240);
}

function getAxiosErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error.message : String(error);
  }

  const status = error.response?.status;

  if (status === 404) {
    return "Secret not found. It may have expired or already been viewed.";
  }

  if (error.code === "ECONNABORTED") {
    return "Request timed out while contacting server";
  }

  if (status && status >= 500) {
    return "Server error. Please try again later.";
  }

  const responseMessage = typeof error.response?.data?.message === "string" ? error.response.data.message : null;
  if (responseMessage) {
    return sanitizeServerMessage(responseMessage);
  }

  if (status && status >= 400) {
    return `Request failed with status ${status}`;
  }

  return "Request failed. Please try again.";
}

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

async function promptForOptionalPassword(rl: Interface): Promise<string | null> {
  const answer = await rl.question("Enter a password (or press Enter to skip): ");
  return answer.length > 0 ? answer : null;
}

async function promptForRequiredPassword(rl: Interface): Promise<string> {
  while (true) {
    const answer = await rl.question("Enter secret password: ");
    if (answer.length > 0) {
      return answer;
    }
    console.error("Password cannot be empty for this secret.");
  }
}

async function confirmOverwrite(rl: Interface, filePath: string): Promise<boolean> {
  const answer = await rl.question(
    `⚠️ ${filePath} already exists. Everything will be deleted and replaced. Continue? (y/N): `,
  );

  const normalized = answer.trim().toLowerCase();
  return normalized === "y" || normalized === "yes";
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

async function decryptSecret(data: SecretPayload, keyBase64: string, password?: string): Promise<string> {
  const baseKey = await importKey(keyBase64);
  let keyToUse = baseKey;

  if (data.passwordHash) {
    if (!password) {
      throw new Error("Password required for this secret");
    }

    keyToUse = await applyPasswordLayer(baseKey, password, data.passwordHash);
  }

  return decrypt(data.ciphertext, data.iv, keyToUse);
}

async function handlePush(content: string, password: string | null, ttl: number) {
  const spinner = ora("Encrypting secret...").start();

  try {
    const baseKey = await generateKey();
    let keyToUse = baseKey;
    let saltForServer: string | undefined = undefined;

    if (password) {
      spinner.text = "Applying password protection...";
      const salt = generateSalt();
      keyToUse = await applyPasswordLayer(baseKey, password, salt);
      saltForServer = salt;
    }

    spinner.text = "Encrypting secret...";
    const { ciphertext, iv } = await encrypt(content, keyToUse);
    const exportedKeyBase64 = await exportKey(baseKey);

    spinner.text = "Sending to server...";

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

    const url = `${SHARE_BASE_URL}/s/${token}#key=${encodeURIComponent(exportedKeyBase64)}`;

    spinner.succeed("Secret created successfully!");
    console.log("🔗 Share this link:\n");
    console.log(url);
    console.log("\n");
  } catch (error) {
    spinner.fail("Failed to create secret");
    console.error("\n❌ Error:", getAxiosErrorMessage(error));
    process.exit(1);
  }
}

async function handlePull(
  reference: string,
  keyOverride: string | null,
  initialPassword: string | null,
  outputPath: string | null,
  rl: Interface,
) {
  try {
    const { token, key } = parseSecretReference(reference, keyOverride);

    const fetchSpinner = ora("Fetching secret...").start();
    let encryptedData: SecretPayload;
    try {
      encryptedData = await fetchSecret(token);
      fetchSpinner.succeed("Secret fetched");
    } catch (error) {
      fetchSpinner.fail("Failed to fetch secret");
      throw error;
    }

    let plaintext: string | null = null;

    if (encryptedData.passwordHash) {
      let currentPassword = initialPassword;
      const maxAttempts = initialPassword ? 1 : 3;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        if (!currentPassword) {
          currentPassword = await promptForRequiredPassword(rl);
        }

        const decryptSpinner = ora("Decrypting secret...").start();
        try {
          plaintext = await decryptSecret(encryptedData, key, currentPassword);
          decryptSpinner.succeed("Secret decrypted");
          break;
        } catch {
          decryptSpinner.fail("Failed to decrypt secret");
          if (attempt < maxAttempts && !initialPassword) {
            console.error("Incorrect password. Please try again.");
            currentPassword = null;
            continue;
          }

          throw new Error("Failed to decrypt secret. Incorrect password or corrupted key.");
        }
      }
    } else {
      const decryptSpinner = ora("Decrypting secret...").start();
      try {
        plaintext = await decryptSecret(encryptedData, key);
        decryptSpinner.succeed("Secret decrypted");
      } catch (error) {
        decryptSpinner.fail("Failed to decrypt secret");
        throw error;
      }
    }

    if (plaintext === null) {
      throw new Error("Failed to decrypt secret");
    }

    if (outputPath && outputPath !== "-") {
      if (existsSync(outputPath)) {
        const shouldOverwrite = await confirmOverwrite(rl, outputPath);
        if (!shouldOverwrite) {
          console.log("\nℹ️ Aborted. Existing file was not modified.\n");
          return;
        }
      }

      writeFileSync(outputPath, plaintext, "utf-8");
      console.log(`\n✅ Secret written to ${outputPath}\n`);
      return;
    }

    console.log("\n✅ Secret decrypted successfully!\n");
    console.log(plaintext);
    console.log("\n");
  } catch (error) {
    console.error("\n❌ Error:", getAxiosErrorMessage(error));
    process.exit(1);
  }
}

async function main() {
  const argv = process.argv.slice(2);

  if (argv.length === 0) {
    printUsage();
    process.exit(1);
  }

  const command = argv[0];
  const rl = createInterface({ input, output });

  try {
    if (command === "push") {
      const args = parsePushArgs(argv.slice(1));
      const content = await getContent(args);

      let password = args.password;
      if (!password) {
        password = await promptForOptionalPassword(rl);
      }

      await handlePush(content, password, args.ttl);
      return;
    }

    if (command === "pull") {
      const args = parsePullArgs(argv.slice(1));

      if (!args.reference) {
        exitWithError("Missing token or URL for pull command");
      }

      await handlePull(args.reference, args.key, args.password, args.outputPath, rl);
      return;
    }

    printUsage();
    exitWithError(`Unknown command: ${command}. Use push or pull.`);
  } finally {
    rl.close();
  }
}

main();
