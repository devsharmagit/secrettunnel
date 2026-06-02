"use client";
import { useState } from "react";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";

const quickstartSteps = [
  {
    step: "01",
    title: "Install (zero setup)",
    description: "Use npx — no global install needed. Works with npm, bun, or yarn.",
    code: "npx secrettnl push .env --ttl 24h",
  },
  {
    step: "02",
    title: "Share the link",
    description: "You get a one-time URL with the decryption key in the hash fragment. The server is provably blind.",
    code: "https://secrettunnel.vercel.app/s/abc123#key=aB3dK9...",
  },
  {
    step: "03",
    title: "Recipient pulls the secret",
    description: "The recipient runs pull — the secret is fetched, decrypted locally, and permanently destroyed.",
    code: 'npx secrettnl pull "https://secrettunnel.vercel.app/s/abc123#key=..." --output .env',
  },
];

const docPages = [
  {
    href: "/docs/cli",
    label: "CLI Reference",
    badge: "Full reference",
    badgeVariant: "default" as const,
    description:
      "Complete documentation for secrettnl push, secrettnl pull, all flags, examples, error messages, and configuration.",
    icon: ">_",
  },
];

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="rounded-md overflow-hidden border border-white/[0.08] bg-[#0e0e0f] my-3">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06]">
        <span className="font-mono text-[11px] text-outline/70">bash</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 font-mono text-[11px] text-outline/50 hover:text-primary transition-colors"
        >
          {copied ? (
            <><span className="material-symbols-outlined text-[14px] text-[#34d399]">check</span><span className="text-[#34d399]">Copied</span></>
          ) : (
            <><span className="material-symbols-outlined text-[14px]">content_copy</span>Copy</>
          )}
        </button>
      </div>
      <pre className="px-5 py-4 font-mono text-sm leading-relaxed text-on-surface whitespace-pre-wrap break-words">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export function DocsHomePage() {
  return (
    <div className="max-w-3xl">
      {/* Page Header */}
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 mb-6 font-mono text-[12px] text-primary">
          🔐 Zero-knowledge · AES-256-GCM · Burn after read
        </div>
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-on-surface tracking-tight mb-4">
          Documentation
        </h1>
        <p className="text-on-surface-variant text-lg leading-relaxed">
          SecretTunnel lets you share{" "}
          <code className="font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded text-sm">
            .env
          </code>{" "}
          files and secrets as one-time, end-to-end encrypted links. The server
          never sees your plaintext — ever.
        </p>
      </div>

      {/* Quickstart */}
      <section className="mb-14">
        <h2 className="font-headline text-2xl font-bold text-on-surface mb-6 flex items-center gap-3">
          <span className="font-mono text-primary text-base">{"// 01"}</span>
          Quickstart
        </h2>

        <div className="space-y-6">
          {quickstartSteps.map((s) => (
            <div
              key={s.step}
              className="relative pl-10 border-l border-white/[0.08]"
            >
              <div className="absolute left-0 top-0 -translate-x-1/2 w-5 h-5 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              </div>
              <span className="font-mono text-[10px] text-outline uppercase tracking-widest mb-1 block">
                Step {s.step}
              </span>
              <h3 className="font-headline text-base font-semibold text-on-surface mb-1">
                {s.title}
              </h3>
              <p className="text-sm text-on-surface-variant mb-3 leading-relaxed">
                {s.description}
              </p>
              <CodeBlock code={s.code} />
            </div>
          ))}
        </div>
      </section>

      {/* Security Model */}
      <section className="mb-14">
        <h2 className="font-headline text-2xl font-bold text-on-surface mb-6 flex items-center gap-3">
          <span className="font-mono text-primary text-base">{"// 02"}</span>
          Security model
        </h2>

        <div className="bg-surface-container-lowest border border-white/[0.08] rounded-lg p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                icon: "🔒",
                title: "Client-side encryption",
                body: "AES-256-GCM via the Web Crypto API. Your plaintext is encrypted before any network request is made.",
              },
              {
                icon: "🔑",
                title: "Key in URL fragment",
                body: "The decryption key lives only in the URL hash (#key=…). Fragments are never sent to the server.",
              },
              {
                icon: "🔥",
                title: "Burn after read",
                body: "The Redis entry is deleted the moment the secret is retrieved. Running pull a second time will fail.",
              },
            ].map((item) => (
              <div key={item.title} className="flex flex-col gap-2">
                <span className="text-2xl">{item.icon}</span>
                <h3 className="font-semibold text-on-surface text-sm">
                  {item.title}
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reference pages */}
      <section className="mb-14">
        <h2 className="font-headline text-2xl font-bold text-on-surface mb-6 flex items-center gap-3">
          <span className="font-mono text-primary text-base">{"// 03"}</span>
          Reference
        </h2>

        <div className="grid grid-cols-1 gap-4">
          {docPages.map((page) => (
            <Link
              key={page.href}
              href={page.href}
              className="group block bg-surface-container-lowest border border-white/[0.08] rounded-lg p-5 hover:border-primary/30 hover:bg-primary/[0.03] transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="font-mono text-xl text-primary">{page.icon}</div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-on-surface text-sm">
                        {page.label}
                      </span>
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0 border-primary/30 text-primary bg-primary/10 h-4"
                      >
                        {page.badge}
                      </Badge>
                    </div>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      {page.description}
                    </p>
                  </div>
                </div>
                <span className="text-outline group-hover:text-primary transition-colors text-sm font-mono flex-shrink-0 mt-0.5">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer nav */}
      <div className="border-t border-white/[0.06] pt-8 flex justify-end">
        <Link
          href="/docs/cli"
          className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-mono transition-colors"
        >
          CLI Reference →
        </Link>
      </div>
    </div>
  );
}
