#!/usr/bin/env node

import { generateKey, generateSalt, applyPasswordLayer, encrypt, exportKey } from "@repo/encryption";
import { readFileSync } from "fs";
import { createInterface } from "readline/promises";
import { stdin as input, stdout as output } from "process";
import axios from "axios";

const API_URL = "http://localhost:3000/api/secrets";
const DEFAULT_TTL = 10000000;
const STEP_TIMEOUT_MS = 20000;

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

// Parse CLI arguments
interface CliArgs {
  content: string | null;
  filePath: string | null;
  ttl: number;
  password: string | null;
}

function parseArgs(): CliArgs {
  const args = process.argv.slice(2);
  let content: string | null = null;
  let filePath: string | null = null;
  let ttl = DEFAULT_TTL;
  let password: string | null = null;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (!arg) continue;

    if (arg === "--file" && i + 1 < args.length) {
      filePath = args[i + 1] || null;
      i++;
    } else if (arg === "--ttl" && i + 1 < args.length) {
      const ttlStr = args[i + 1];
      if (ttlStr) {
        ttl = parseInt(ttlStr, 10);
        if (isNaN(ttl) || ttl <= 0) {
          console.error("Error: --ttl must be a positive number");
          process.exit(1);
        }
        i++;
      }
    } else if (arg === "--password" && i + 1 < args.length) {
      password = args[i + 1] || null;
      i++;
    } else if (!arg.startsWith("--")) {
      // Direct argument (positional)
      content = arg;
    }
  }

  return { content, filePath, ttl, password };
}

// Read content from file or direct argument
async function getContent(args: CliArgs): Promise<string> {
  if (args.filePath) {
    try {
      return readFileSync(args.filePath, "utf-8");
    } catch (error) {
      console.error(`Error reading file "${args.filePath}":`, (error as Error).message);
      process.exit(1);
    }
  }

  if (args.content) {
    return args.content;
  }

  console.error("Error: No content provided. Usage:");
  console.error("  Direct:  secrettunnel 'your secret message'");
  console.error("  File:    secrettunnel --file secret.txt");
  console.error("  TTL:     secrettunnel 'message' --ttl 3600");
  process.exit(1);
}

// Interactive password prompt (hidden input)
async function promptForPassword(): Promise<string | null> {
  const rl = createInterface({ input, output });

  try {
    const answer = await rl.question("Enter a password (or press Enter to skip): ");
    return answer.trim() ? answer : null;
  } finally {
    rl.close();
  }
}

// Main encryption and submission flow
async function handleSubmit(content: string, password: string | null, ttl: number) {
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
      { timeout: 20000 }
    );

    const token = res.data.token;
    const url = `http://localhost:3000/s/${token}#key=${encodeURIComponent(exportedKeyBase64)}`;

    console.log("\n✅ Secret created successfully!\n");
    console.log("🔗 Share this link:\n");
    console.log(url);
    console.log("\n");
  } catch (error) {
    console.error("\n❌ Error:", error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Main entry point
async function main() {
  const args = parseArgs();
  const content = await getContent(args);

  // Ask for password if not provided via CLI flag
  let password = args.password;
  if (!password) {
    password = await promptForPassword();
  }

  await handleSubmit(content, password, args.ttl);
}

main();