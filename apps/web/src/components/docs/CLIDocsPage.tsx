"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────
   Reusable primitives
───────────────────────────────────────────── */

function CodeBlock({
  children,
  lang = "bash",
}: {
  children: React.ReactNode;
  lang?: string;
}) {
  const [copied, setCopied] = useState(false);

  const text = typeof children === "string" ? children : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-md overflow-hidden border border-white/[0.08] bg-[#0e0e0f] my-4">
      {/* Top bar: language label + copy */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06]">
        <span className="font-mono text-[11px] text-outline/70 tracking-wide">
          {lang}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 font-mono text-[11px] text-outline/50 hover:text-primary transition-colors"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <span className="material-symbols-outlined text-[14px] text-[#34d399]">
                check
              </span>
              <span className="text-[#34d399]">Copied</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[14px]">
                content_copy
              </span>
              Copy
            </>
          )}
        </button>
      </div>

      {/* Code body — wraps instead of scrolling */}
      <pre className="px-5 py-4 font-mono text-sm leading-relaxed text-on-surface whitespace-pre-wrap break-words">
        <code>{children}</code>
      </pre>
    </div>
  );
}

function InlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code className="font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded text-[0.85em]">
      {children}
    </code>
  );
}

function FlagRow({
  flag,
  type,
  required = false,
  defaultVal,
  description,
}: {
  flag: string;
  type: string;
  required?: boolean;
  defaultVal?: string;
  description: React.ReactNode;
}) {
  return (
    <tr className="border-b border-white/[0.05] hover:bg-white/[0.02] transition-colors">
      <td className="py-3 px-4 align-top">
        <InlineCode>{flag}</InlineCode>
      </td>
      <td className="py-3 px-4 align-top">
        <span className="font-mono text-xs text-outline">{type}</span>
      </td>
      <td className="py-3 px-4 align-top">
        {required ? (
          <Badge
            variant="outline"
            className="text-[10px] h-4 px-1.5 border-[#34d399]/40 text-[#34d399] bg-[#34d399]/10"
          >
            required
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="text-[10px] h-4 px-1.5 border-white/20 text-outline"
          >
            optional
          </Badge>
        )}
      </td>
      <td className="py-3 px-4 align-top text-xs text-outline font-mono">
        {defaultVal ?? "—"}
      </td>
      <td className="py-3 px-4 align-top text-sm text-on-surface-variant leading-relaxed">
        {description}
      </td>
    </tr>
  );
}

function SectionAnchor({ id, label }: { id: string; label: string }) {
  return (
    <a
      href={`#${id}`}
      className="group flex items-center gap-2 no-underline"
      id={id}
    >
      <span className="text-primary font-mono text-sm opacity-0 group-hover:opacity-100 transition-opacity">
        #
      </span>
      {label}
    </a>
  );
}

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 className="font-headline text-2xl font-bold text-on-surface mt-14 mb-6 scroll-mt-20 flex items-center gap-3">
      <SectionAnchor id={id} label={children as string} />
    </h2>
  );
}

function H3({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h3
      id={id}
      className="font-headline text-lg font-semibold text-on-surface mt-8 mb-4 scroll-mt-20"
    >
      {children}
    </h3>
  );
}

function P({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("text-on-surface-variant leading-relaxed mb-4", className)}>
      {children}
    </p>
  );
}

function Callout({
  type = "info",
  children,
}: {
  type?: "info" | "warning" | "danger" | "tip";
  children: React.ReactNode;
}) {
  const styles = {
    info: "border-primary/30 bg-primary/5 text-on-surface-variant",
    warning: "border-yellow-500/30 bg-yellow-500/5 text-on-surface-variant",
    danger: "border-red-500/30 bg-red-500/5 text-on-surface-variant",
    tip: "border-[#34d399]/30 bg-[#34d399]/5 text-on-surface-variant",
  };
  const icons = { info: "ℹ️", warning: "⚠️", danger: "🚨", tip: "💡" };

  return (
    <div
      className={cn(
        "border rounded-md px-4 py-3.5 flex gap-3 items-start my-4 text-sm",
        styles[type]
      )}
    >
      <span className="flex-shrink-0 mt-0.5">{icons[type]}</span>
      <div className="leading-relaxed">{children}</div>
    </div>
  );
}

function ExampleLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs text-outline/70 font-mono mb-1.5 mt-6">{children}</p>
  );
}

/* ─────────────────────────────────────────────
   Main component
───────────────────────────────────────────── */

export function CLIDocsPage() {
  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <Badge
            variant="outline"
            className="font-mono text-[11px] border-primary/30 text-primary bg-primary/10"
          >
            CLI
          </Badge>
          <Badge
            variant="outline"
            className="font-mono text-[11px] border-white/20 text-outline"
          >
            v1.0.0
          </Badge>
        </div>
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-on-surface tracking-tight mb-4">
          CLI Reference
        </h1>
        <P className="text-lg">
          <InlineCode>secrettnl</InlineCode> is a zero-dependency terminal tool
          for pushing and pulling end-to-end encrypted secrets. Every byte is
          encrypted on your machine before any network call is made.
        </P>

        <div className="flex flex-wrap gap-2 mt-6">
          {[
            "AES-256-GCM",
            "Burn after read",
            "Zero server knowledge",
            "TTL support",
            "Webhook callbacks",
          ].map((label) => (
            <Badge
              key={label}
              variant="outline"
              className="text-[11px] border-white/[0.1] text-on-surface-variant bg-white/[0.03]"
            >
              {label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Installation */}
      <H2 id="installation">Installation</H2>
      <P>
        No global install required. Use <InlineCode>npx</InlineCode> to run
        directly from the npm registry:
      </P>
      <CodeBlock lang="bash">npx secrettnl [command] [options]</CodeBlock>

      <P>Or install globally for repeated use:</P>
      <CodeBlock lang="bash">npm install -g secrettnl</CodeBlock>

      <Callout type="info">
        Requires Node.js ≥ 18. The CLI uses the built-in{" "}
        <InlineCode>crypto</InlineCode> module — no external encryption
        dependencies.
      </Callout>

      {/* ─── PUSH ─── */}
      <H2 id="push">secrettnl push</H2>
      <P>
        Encrypts content locally using AES-256-GCM and uploads the ciphertext
        to the SecretTunnel server. Returns a one-time share URL with the
        decryption key embedded in the URL fragment.
      </P>

      <H3 id="push-signature">Signature</H3>
      <CodeBlock lang="bash">
        {`secrettnl push <content> [--file <path>] [--ttl <duration>] [--password <value>] [--webhook <url>]`}
      </CodeBlock>

      <Callout type="info">
        Either provide <InlineCode>{"<content>"}</InlineCode> as a positional
        argument <em>or</em> use <InlineCode>--file</InlineCode>. If both are
        given, <InlineCode>--file</InlineCode> takes priority.
      </Callout>

      <H3 id="push-flags">Flags</H3>
      <div className="overflow-x-auto rounded-md border border-white/[0.08]">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="border-b border-white/[0.08] bg-surface-container">
              {["Flag", "Type", "Status", "Default", "Description"].map((h) => (
                <th
                  key={h}
                  className="py-2.5 px-4 text-left font-mono text-[10px] uppercase tracking-widest text-outline font-medium"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            <FlagRow
              flag="--file, -f"
              type="string"
              description={
                <>
                  Path to a file to push. Reads the entire file contents and
                  encrypts them. Supports <InlineCode>.env</InlineCode>,{" "}
                  <InlineCode>.json</InlineCode>, or any plaintext file.
                </>
              }
            />
            <FlagRow
              flag="--ttl"
              type="string"
              defaultVal="24h"
              description={
                <>
                  Time-to-live. Supported formats:{" "}
                  <InlineCode>30s</InlineCode>, <InlineCode>15m</InlineCode>,{" "}
                  <InlineCode>1h</InlineCode>, <InlineCode>7d</InlineCode>, or
                  raw seconds like <InlineCode>3600</InlineCode>.
                </>
              }
            />
            <FlagRow
              flag="--password"
              type="string"
              description={
                <>
                  Optional password for an extra encryption layer. The recipient
                  must provide the same password when pulling.
                </>
              }
            />
            <FlagRow
              flag="--webhook"
              type="string (URL)"
              description={
                <>
                  HTTPS URL called when the secret is viewed. POSTs{" "}
                  <InlineCode>{"{ token, viewedAt, viewerIp }"}</InlineCode>{" "}
                  with a 5-second timeout via Upstash QStash.
                </>
              }
            />
          </tbody>
        </table>
      </div>

      <H3 id="push-examples">Examples</H3>

      <ExampleLabel>Push inline text</ExampleLabel>
      <CodeBlock lang="bash">
        {`secrettnl push "DATABASE_URL=postgres://user:pass@localhost/db"`}
      </CodeBlock>

      <ExampleLabel>Push a .env file</ExampleLabel>
      <CodeBlock lang="bash">secrettnl push --file .env.production</CodeBlock>

      <ExampleLabel>Custom TTL — expires in 30 minutes</ExampleLabel>
      <CodeBlock lang="bash">
        {`secrettnl push "my secret" --ttl 30m`}
      </CodeBlock>

      <ExampleLabel>Password-protected push</ExampleLabel>
      <CodeBlock lang="bash">
        {`secrettnl push "my secret" --password mypass123`}
      </CodeBlock>

      <ExampleLabel>Full example with all flags</ExampleLabel>
      <CodeBlock lang="bash">
        {`secrettnl push \\
  --file .env.production \\
  --ttl 1h \\
  --password mypass123 \\
  --webhook https://hooks.example.com/secret-viewed`}
      </CodeBlock>

      <H3 id="push-output">Output</H3>
      <P>
        On success the CLI prints a share URL with the decryption key embedded
        in the URL hash fragment:
      </P>
      <CodeBlock lang="output">
        {`✓ Secret created

Share URL:
  https://secrettunnel.vercel.app/s/abc12345#key=aB3dK9YzXq...

⚑ Burn-after-read · Expires in 1h`}
      </CodeBlock>

      <Callout type="warning">
        The key after <InlineCode>#</InlineCode> is{" "}
        <strong>never sent to the server</strong>. Do not truncate the URL when
        sharing — the full fragment must be preserved.
      </Callout>

      {/* ─── PULL ─── */}
      <H2 id="pull">secrettnl pull</H2>
      <P>
        Fetches and decrypts a one-time secret by its share URL or token.{" "}
        <strong className="text-on-surface">This action is irreversible</strong>{" "}
        — the secret is permanently destroyed on the server the moment it is
        retrieved.
      </P>

      <H3 id="pull-signature">Signature</H3>
      <CodeBlock lang="bash">
        {`secrettnl pull <share-url | token> [--key <base64>] [--password <value>] [--output <path | ->]`}
      </CodeBlock>

      <H3 id="pull-flags">Flags</H3>
      <div className="overflow-x-auto rounded-md border border-white/[0.08]">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="border-b border-white/[0.08] bg-surface-container">
              {["Flag", "Type", "Status", "Default", "Description"].map((h) => (
                <th
                  key={h}
                  className="py-2.5 px-4 text-left font-mono text-[10px] uppercase tracking-widest text-outline font-medium"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            <FlagRow
              flag="--key"
              type="string (base64)"
              description={
                <>
                  The base64-encoded AES key. Only needed when passing a bare
                  token. When passing the full URL the key is parsed
                  automatically from the <InlineCode>#key=</InlineCode>{" "}
                  fragment.
                </>
              }
            />
            <FlagRow
              flag="--password"
              type="string"
              description={
                <>
                  Required only if the secret was pushed with{" "}
                  <InlineCode>--password</InlineCode>. If omitted for a
                  password-protected secret, decryption will fail.
                </>
              }
            />
            <FlagRow
              flag="--output, -o"
              type="string | -"
              description={
                <>
                  Path to write the decrypted plaintext. Use{" "}
                  <InlineCode>-</InlineCode> to stream to stdout. If the file
                  already exists, the CLI prompts before overwriting.
                </>
              }
            />
          </tbody>
        </table>
      </div>

      <H3 id="pull-examples">Examples</H3>

      <ExampleLabel>Pull using the full URL (recommended)</ExampleLabel>
      <CodeBlock lang="bash">
        {`secrettnl pull "https://secrettunnel.vercel.app/s/abc12345#key=aB3dK9Yz..."`}
      </CodeBlock>

      <ExampleLabel>Pull using a bare token and explicit key</ExampleLabel>
      <CodeBlock lang="bash">
        {`secrettnl pull abc12345 --key "aB3dK9Yz..."`}
      </CodeBlock>

      <ExampleLabel>Pull and write directly to .env</ExampleLabel>
      <CodeBlock lang="bash">
        {`secrettnl pull "https://secrettunnel.vercel.app/s/abc12345#key=..." --output .env`}
      </CodeBlock>

      <ExampleLabel>Pull a password-protected secret</ExampleLabel>
      <CodeBlock lang="bash">
        {`secrettnl pull "https://secrettunnel.vercel.app/s/abc12345#key=..." --password mypass123`}
      </CodeBlock>

      <ExampleLabel>Stream to stdout for piping</ExampleLabel>
      <CodeBlock lang="bash">
        {`secrettnl pull "https://secrettunnel.vercel.app/s/abc12345#key=..." --output - > .env`}
      </CodeBlock>

      <H3 id="pull-output">Output</H3>
      <CodeBlock lang="output">
        {`Fetching...
Decrypting locally...

✓ Written to .env

⚑ Token consumed. Secret permanently deleted.`}
      </CodeBlock>

      {/* ─── CONFIGURATION ─── */}
      <H2 id="configuration">Configuration</H2>
      <P>
        The CLI talks to the SecretTunnel web API. You can point it at a
        self-hosted instance via environment variables.
      </P>

      <H3 id="env-vars">Environment variables</H3>

      <div className="overflow-x-auto rounded-md border border-white/[0.08]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.08] bg-surface-container">
              {["Variable", "Description"].map((h) => (
                <th
                  key={h}
                  className="py-2.5 px-4 text-left font-mono text-[10px] uppercase tracking-widest text-outline font-medium"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            <tr className="hover:bg-white/[0.02]">
              <td className="py-3 px-4 align-top">
                <InlineCode>SECRETTUNNEL_API_URL</InlineCode>
              </td>
              <td className="py-3 px-4 text-sm text-on-surface-variant">
                Highest priority. Overrides the API base URL completely.
              </td>
            </tr>
            <tr className="hover:bg-white/[0.02]">
              <td className="py-3 px-4 align-top">
                <InlineCode>API_URL</InlineCode>
              </td>
              <td className="py-3 px-4 text-sm text-on-surface-variant">
                Fallback if <InlineCode>SECRETTUNNEL_API_URL</InlineCode> is
                not set.
              </td>
            </tr>
            <tr className="hover:bg-white/[0.02]">
              <td className="py-3 px-4 align-top">
                <InlineCode>NODE_ENV</InlineCode>
              </td>
              <td className="py-3 px-4 text-sm text-on-surface-variant">
                If <InlineCode>production</InlineCode> and no URL env vars are
                set, defaults to{" "}
                <InlineCode>
                  https://secrettunnel.vercel.app/api/secrets
                </InlineCode>
                .
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <P className="mt-6">
        <strong className="text-on-surface">Resolution priority:</strong>
      </P>
      <ol className="list-decimal list-inside space-y-1.5 text-sm text-on-surface-variant mb-6 pl-2">
        <li>
          <InlineCode>SECRETTUNNEL_API_URL</InlineCode> (highest priority)
        </li>
        <li>
          <InlineCode>API_URL</InlineCode>
        </li>
        <li>
          <InlineCode>NODE_ENV=production</InlineCode> →{" "}
          <InlineCode>https://secrettunnel.vercel.app/api/secrets</InlineCode>
        </li>
        <li>
          Default: <InlineCode>http://localhost:3000/api/secrets</InlineCode>
        </li>
      </ol>

      <CodeBlock lang="shell">
        {`export SECRETTUNNEL_API_URL="https://your-self-hosted-instance.com"`}
      </CodeBlock>

      {/* ─── ERROR HANDLING ─── */}
      <H2 id="errors">Error handling</H2>
      <P>
        The CLI exits with a non-zero code on failure. Common errors and how to
        resolve them:
      </P>

      <div className="space-y-3">
        {[
          {
            error: "Missing key.",
            cause:
              "You passed a URL without the #key=… fragment, or forgot --key.",
            fix: "Use the full share URL including the hash, or pass --key explicitly.",
          },
          {
            error: "Secret not found.",
            cause:
              "The secret was already consumed by a previous pull, or its TTL expired.",
            fix: "Ask the sender to create a new secret.",
          },
          {
            error:
              "Failed to decrypt secret / Incorrect password or corrupted key.",
            cause:
              "Wrong password, or the key hash was truncated during copy-paste.",
            fix: "Double-check the password and ensure the full URL was copied.",
          },
          {
            error: "Unknown option ...",
            cause: "A flag was passed to the wrong command (e.g., --ttl on pull).",
            fix: "Flags are validated per-command. Check the signature above.",
          },
        ].map((item) => (
          <div
            key={item.error}
            className="bg-[#0e0e0f] border border-white/[0.08] rounded-md p-4"
          >
            <p className="font-mono text-sm text-red-400 mb-2">{item.error}</p>
            <p className="text-xs text-on-surface-variant mb-1.5">
              <span className="text-outline">Cause —</span> {item.cause}
            </p>
            <p className="text-xs text-on-surface-variant">
              <span className="text-[#34d399]">Fix —</span> {item.fix}
            </p>
          </div>
        ))}
      </div>

      {/* ─── CORE BEHAVIORS ─── */}
      <H2 id="behaviors">Core behaviors</H2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          {
            icon: "🔥",
            title: "Burn after read",
            body: "Secrets are permanently destroyed once successfully retrieved. Running pull a second time will fail.",
          },
          {
            icon: "🔒",
            title: "Client-side encryption",
            body: "The server stores only ciphertext and IV. It never receives your key. The key travels strictly via the URL hash.",
          },
          {
            icon: "🔑",
            title: "Strict decryption",
            body: "pull requires both the token and the decryption key. Without the exact key, recovery is mathematically impossible.",
          },
          {
            icon: "📁",
            title: "File overwrite protection",
            body: "When --output points to an existing file, the CLI prompts for confirmation before overwriting.",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="bg-[#0e0e0f] border border-white/[0.08] rounded-md p-4"
          >
            <span className="text-xl">{item.icon}</span>
            <h3 className="font-semibold text-on-surface text-sm mt-2 mb-1">
              {item.title}
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              {item.body}
            </p>
          </div>
        ))}
      </div>

      {/* Footer nav */}
      <div className="border-t border-white/[0.06] mt-16 pt-8 flex justify-between items-center">
        <Link
          href="/docs"
          className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary font-mono transition-colors"
        >
          ← Introduction
        </Link>
        <Link
          href="/share"
          className="cta-glow text-surface font-semibold px-5 py-2 rounded-md text-sm transition-all duration-200"
        >
          Try it now →
        </Link>
      </div>
    </div>
  );
}
