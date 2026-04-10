import { applyPasswordLayer, decrypt, importKey } from "@repo/encryption";
import { PullArgs, PushArgs, SecretPayload, SecretReference } from "./type";
import { API_URL, DEFAULT_TTL_SECONDS, STEP_TIMEOUT_MS } from "./config";
import axios from "axios";
import { Interface } from "readline/promises";
import { readFileSync } from "fs";

export function printUsage() {
  console.log("Usage:");
  console.log("  secrettunnel push 'your secret message' [--ttl 24h] [--file path] [--password value] [--webhook url]");
  console.log("    --ttl supports seconds or 1m|1h|7d style values (default: 24h)");
  console.log("  secrettunnel pull '<share-url-with-key>' [--password value] [--output <path|->]");
  console.log("  secrettunnel pull <token> --key <base64Key> [--password value] [--output <path|->]");
}

export function exitWithError(message: string): never {
  console.error(`\n❌ ${message}`);
  process.exit(1);
}

export function isSecretPayload(value: unknown): value is SecretPayload {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as Record<string, unknown>;
  const hasCiphertext = typeof payload.ciphertext === "string";
  const hasIv = typeof payload.iv === "string";
  const hasValidPasswordHash = payload.passwordHash === undefined || typeof payload.passwordHash === "string";

  return hasCiphertext && hasIv && hasValidPasswordHash;
}

export function parseTtlToSeconds(value: string): number {
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

export function parsePushArgs(args: string[]): PushArgs {
  let content: string | null = null;
  let filePath: string | null = null;
  let ttl = DEFAULT_TTL_SECONDS;
  let password: string | null = null;
  let webhookUrl: string | null = null;

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

    if (arg === "--webhook") {
      const next = args[i + 1];
      if (!next || next.startsWith("--")) {
        exitWithError("Missing value for --webhook");
      }

      webhookUrl = next;
      i++;
      continue;
    }

    if (arg.startsWith("--")) {
      exitWithError(`Unknown option for push command: ${arg}`);
    }

    content = content ? `${content} ${arg}` : arg;
  }

  return { content, filePath, ttl, password, webhookUrl };
}

export function parsePullArgs(args: string[]): PullArgs {
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

export function parseSecretReference(reference: string, keyOverride: string | null): SecretReference {
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

export function sanitizeServerMessage(message: string): string {
  return message
    .replace(/[\r\n\t]+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim()
    .slice(0, 240);
}

export function getAxiosErrorMessage(error: unknown): string {
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

export async function getContent(args: PushArgs): Promise<string> {
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

export async function promptForOptionalPassword(rl: Interface): Promise<string | null> {
  const answer = await rl.question("Enter a password (or press Enter to skip): ");
  return answer.length > 0 ? answer : null;
}

export async function promptForRequiredPassword(rl: Interface): Promise<string> {
  while (true) {
    const answer = await rl.question("Enter secret password: ");
    if (answer.length > 0) {
      return answer;
    }
    console.error("Password cannot be empty for this secret.");
  }
}

export  async function confirmOverwrite(rl: Interface, filePath: string): Promise<boolean> {
  const answer = await rl.question(
    `⚠️ ${filePath} already exists. Everything will be deleted and replaced. Continue? (y/N): `,
  );

  const normalized = answer.trim().toLowerCase();
  return normalized === "y" || normalized === "yes";
}

export  async function fetchSecret(token: string): Promise<SecretPayload> {
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

export  async function decryptSecret(data: SecretPayload, keyBase64: string, password?: string): Promise<string> {
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
