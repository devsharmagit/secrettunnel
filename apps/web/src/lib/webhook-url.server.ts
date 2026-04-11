import { lookup } from "node:dns/promises";
import {
  isBlockedIpAddress,
  validateWebhookUrl,
  type WebhookUrlValidationResult,
} from "@/lib/webhook-url";

export async function validateWebhookUrlServer(
  url: string
): Promise<WebhookUrlValidationResult> {
  const baseValidation = validateWebhookUrl(url, {
    allowlistPatterns: getWebhookHostAllowlist(),
  });
  if (!baseValidation.ok) {
    return baseValidation;
  }

  const hostname = baseValidation.hostname;

  // Re-resolve to reduce DNS rebinding windows and validate both snapshots.
  const [first, second] = await Promise.all([
    resolveAddresses(hostname),
    resolveAddresses(hostname),
  ]);

  if (!first.length || !second.length) {
    return {
      ok: false,
      reason: "invalid_url",
      message: "Webhook hostname could not be resolved.",
    };
  }

  const combined = new Set<string>([
    ...first.map((entry) => entry.address),
    ...second.map((entry) => entry.address),
  ]);

  for (const address of combined) {
    if (isBlockedIpAddress(address)) {
      return {
        ok: false,
        reason: "blocked_ip_literal",
        message:
          "Webhook hostname resolves to private, local, or reserved network ranges.",
      };
    }
  }

  return baseValidation;
}

async function resolveAddresses(hostname: string) {
  try {
    return await lookup(hostname, { all: true, verbatim: true });
  } catch {
    return [];
  }
}

function getWebhookHostAllowlist(): string[] {
  const raw = process.env.WEBHOOK_HOST_ALLOWLIST;
  if (!raw) {
    return ["*"];
  }

  return raw
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}