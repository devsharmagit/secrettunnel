export type WebhookUrlValidationReason =
  | "invalid_url"
  | "invalid_protocol"
  | "host_not_allowlisted"
  | "local_host"
  | "blocked_ip_literal";

type ValidateWebhookUrlOptions = {
  allowlistPatterns?: readonly string[];
};

export type WebhookUrlValidationResult =
  | { ok: true; normalizedUrl: string; hostname: string }
  | { ok: false; reason: WebhookUrlValidationReason; message: string };

// Default allows any hostname; server-side DNS/IP safety checks still apply.
export const DEFAULT_WEBHOOK_HOST_ALLOWLIST = ["*"] as const;

export function isSafeWebhookUrl(url: string): boolean {
  return validateWebhookUrl(url).ok;
}

export function validateWebhookUrl(
  url: string,
  options?: ValidateWebhookUrlOptions
): WebhookUrlValidationResult {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return {
      ok: false,
      reason: "invalid_url",
      message: "Webhook URL must be a valid URL.",
    };
  }

  if (parsed.protocol !== "https:") {
    return {
      ok: false,
      reason: "invalid_protocol",
      message: "Webhook URL must use HTTPS.",
    };
  }

  const hostname = normalizeHostname(parsed.hostname);
  if (!hostname || isLocalHostname(hostname)) {
    return {
      ok: false,
      reason: "local_host",
      message: "Webhook URL cannot target localhost or local domains.",
    };
  }

  const allowlist =
    options?.allowlistPatterns && options.allowlistPatterns.length > 0
      ? options.allowlistPatterns
      : DEFAULT_WEBHOOK_HOST_ALLOWLIST;

  if (!isAllowlistedHostname(hostname, allowlist)) {
    return {
      ok: false,
      reason: "host_not_allowlisted",
      message: "Webhook hostname is not in the allowlist.",
    };
  }

  if (isBlockedIpAddress(hostname)) {
    return {
      ok: false,
      reason: "blocked_ip_literal",
      message: "Webhook URL cannot target private or reserved network ranges.",
    };
  }

  return { ok: true, normalizedUrl: parsed.toString(), hostname };
}

export function normalizeHostname(hostname: string): string {
  return hostname.trim().toLowerCase().replace(/\.$/, "");
}

export function isAllowlistedHostname(
  hostname: string,
  allowlistPatterns: readonly string[] = DEFAULT_WEBHOOK_HOST_ALLOWLIST
): boolean {
  return allowlistPatterns.some((pattern) => {
    const normalizedPattern = normalizeHostname(pattern);
    if (normalizedPattern === "*") {
      return true;
    }
    if (normalizedPattern.startsWith("*.")) {
      const suffix = normalizedPattern.slice(2);
      return hostname === suffix || hostname.endsWith(`.${suffix}`);
    }
    return hostname === normalizedPattern;
  });
}

function isLocalHostname(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname === "local" ||
    hostname.endsWith(".local")
  );
}

export function isBlockedIpAddress(input: string): boolean {
  if (isIPv4Literal(input)) {
    const value = ipv4ToInt(input);
    return value === null ? true : isBlockedIPv4Int(value);
  }

  if (isIPv6Literal(input)) {
    const value = ipv6ToBigInt(input);
    return value === null ? true : isBlockedIPv6BigInt(value);
  }

  return false;
}

function isIPv4Literal(input: string): boolean {
  const parts = input.split(".");
  if (parts.length !== 4) return false;
  return parts.every((part) => /^\d{1,3}$/.test(part) && Number(part) <= 255);
}

function ipv4ToInt(ip: string): number | null {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  let value = 0;
  for (const part of parts) {
    const n = Number(part);
    if (!Number.isInteger(n) || n < 0 || n > 255) {
      return null;
    }
    value = (value << 8) + n;
  }
  return value >>> 0;
}

function isBlockedIPv4Int(ip: number): boolean {
  return BLOCKED_IPV4_CIDRS.some(({ network, maskBits }) =>
    ipv4InCidr(ip, network, maskBits)
  );
}

function ipv4InCidr(ip: number, network: number, maskBits: number): boolean {
  if (maskBits === 0) return true;
  const mask = maskBits === 32 ? 0xffffffff : (~((1 << (32 - maskBits)) - 1)) >>> 0;
  return (ip & mask) === (network & mask);
}

type IPv4Cidr = { network: number; maskBits: number };

const BLOCKED_IPV4_CIDRS: IPv4Cidr[] = [
  { network: ipv4ToIntUnsafe("0.0.0.0"), maskBits: 8 },
  { network: ipv4ToIntUnsafe("10.0.0.0"), maskBits: 8 },
  { network: ipv4ToIntUnsafe("100.64.0.0"), maskBits: 10 },
  { network: ipv4ToIntUnsafe("127.0.0.0"), maskBits: 8 },
  { network: ipv4ToIntUnsafe("169.254.0.0"), maskBits: 16 },
  { network: ipv4ToIntUnsafe("172.16.0.0"), maskBits: 12 },
  { network: ipv4ToIntUnsafe("192.0.0.0"), maskBits: 24 },
  { network: ipv4ToIntUnsafe("192.0.2.0"), maskBits: 24 },
  { network: ipv4ToIntUnsafe("192.168.0.0"), maskBits: 16 },
  { network: ipv4ToIntUnsafe("198.18.0.0"), maskBits: 15 },
  { network: ipv4ToIntUnsafe("198.51.100.0"), maskBits: 24 },
  { network: ipv4ToIntUnsafe("203.0.113.0"), maskBits: 24 },
  { network: ipv4ToIntUnsafe("224.0.0.0"), maskBits: 4 },
  { network: ipv4ToIntUnsafe("240.0.0.0"), maskBits: 4 },
];

function ipv4ToIntUnsafe(ip: string): number {
  const parsed = ipv4ToInt(ip);
  if (parsed === null) {
    throw new Error(`Invalid IPv4 CIDR seed: ${ip}`);
  }
  return parsed;
}

function isIPv6Literal(input: string): boolean {
  return input.includes(":");
}

function ipv6ToBigInt(input: string): bigint | null {
  const normalized = input.toLowerCase();

  if (normalized === "::") {
    return 0n;
  }

  const hasDoubleColon = normalized.includes("::");
  if (hasDoubleColon && normalized.indexOf("::") !== normalized.lastIndexOf("::")) {
    return null;
  }

  let [leftRaw, rightRaw] = normalized.split("::");
  if (!hasDoubleColon) {
    leftRaw = normalized;
    rightRaw = "";
  }

  const left = leftRaw ? leftRaw.split(":").filter(Boolean) : [];
  const right = rightRaw ? rightRaw.split(":").filter(Boolean) : [];

  const expandedLeft = expandIpv6Parts(left);
  const expandedRight = expandIpv6Parts(right);
  if (!expandedLeft || !expandedRight) return null;

  const missing = 8 - (expandedLeft.length + expandedRight.length);
  if (missing < 0) return null;
  if (!hasDoubleColon && missing !== 0) return null;

  const full = [
    ...expandedLeft,
    ...Array.from({ length: missing }, () => 0),
    ...expandedRight,
  ];
  if (full.length !== 8) return null;

  let value = 0n;
  for (const part of full) {
    value = (value << 16n) | BigInt(part);
  }
  return value;
}

function expandIpv6Parts(parts: string[]): number[] | null {
  const out: number[] = [];
  for (const part of parts) {
    if (part.includes(".")) {
      const v4 = ipv4ToInt(part);
      if (v4 === null) return null;
      out.push((v4 >>> 16) & 0xffff, v4 & 0xffff);
      continue;
    }
    if (!/^[0-9a-f]{1,4}$/.test(part)) return null;
    out.push(Number.parseInt(part, 16));
  }
  return out;
}

function isBlockedIPv6BigInt(ip: bigint): boolean {
  return BLOCKED_IPV6_CIDRS.some(({ network, maskBits }) =>
    ipv6InCidr(ip, network, maskBits)
  );
}

function ipv6InCidr(ip: bigint, network: bigint, maskBits: number): boolean {
  if (maskBits === 0) return true;
  const hostBits = 128n - BigInt(maskBits);
  const mask = ((1n << 128n) - 1n) ^ ((1n << hostBits) - 1n);
  return (ip & mask) === (network & mask);
}

type IPv6Cidr = { network: bigint; maskBits: number };

const BLOCKED_IPV6_CIDRS: IPv6Cidr[] = [
  { network: ipv6ToBigIntUnsafe("::"), maskBits: 128 },
  { network: ipv6ToBigIntUnsafe("::1"), maskBits: 128 },
  { network: ipv6ToBigIntUnsafe("::ffff:0:0"), maskBits: 96 },
  { network: ipv6ToBigIntUnsafe("64:ff9b::"), maskBits: 96 },
  { network: ipv6ToBigIntUnsafe("100::"), maskBits: 64 },
  { network: ipv6ToBigIntUnsafe("2001:db8::"), maskBits: 32 },
  { network: ipv6ToBigIntUnsafe("fc00::"), maskBits: 7 },
  { network: ipv6ToBigIntUnsafe("fe80::"), maskBits: 10 },
  { network: ipv6ToBigIntUnsafe("ff00::"), maskBits: 8 },
];

function ipv6ToBigIntUnsafe(ip: string): bigint {
  const parsed = ipv6ToBigInt(ip);
  if (parsed === null) {
    throw new Error(`Invalid IPv6 CIDR seed: ${ip}`);
  }
  return parsed;
}