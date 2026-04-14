"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { useInView } from "@/hooks/useInView";

function TerminalCard({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface-container-lowest border border-white/[0.08] rounded-lg overflow-hidden terminal-shadow">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-primary/30" />
          <div className="w-3 h-3 rounded-full bg-primary/20" />
          <div className="w-3 h-3 rounded-full bg-primary/10" />
        </div>
        {title && (
          <span className="font-mono text-[11px] text-outline uppercase tracking-widest mx-auto pr-8">
            {title}
          </span>
        )}
      </div>
      <div className="p-6 font-mono text-sm leading-7 text-left overflow-x-auto">
        {children}
      </div>
    </div>
  );
}

export function CLISection() {
  const { ref, isInView } = useInView();

  return (
    <section className="py-24 md:py-32 bg-surface-container-lowest border-t border-white/[0.04]">
      <div className="max-w-7xl mx-auto px-6">
        <div
          ref={ref}
          className={cn(
            "grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-12 lg:gap-16 items-start transition-all duration-700",
            isInView
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-6"
          )}
        >
          {/* Left — Text */}
          <div className="w-full">
            <p className="font-mono text-primary text-sm tracking-widest uppercase mb-4">
              // CLI
            </p>
            <h2 className="font-headline text-3xl md:text-4xl font-bold text-on-surface tracking-tight mb-6">
              Push and pull from anywhere.
            </h2>
            <p className="text-on-surface-variant text-base leading-relaxed mb-8">
              No browser required. One command to share, one to receive. Built
              for CI pipelines, onboarding scripts, and developers who live in
              the terminal.
            </p>

            <div className="flex flex-col gap-3">
              {[
                <>Push your <code className="font-mono text-on-surface">.env</code> with <code className="font-mono text-primary">npx secrettnl push</code></>,
                "Pull directly to a file — never touches clipboard",
                "Password-protect for extra layer",
                "Set TTL from seconds to days",
                "Add webhook callbacks for access events",
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 text-on-surface-variant text-sm"
                >
                  <span className="text-primary mt-0.5">→</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Terminal Cards */}
          <div className="w-full flex flex-col gap-6">
            {/* Push Card */}
            <TerminalCard title="terminal">
              <div>
                <span className="text-outline">$</span>
                <span className="text-primary ml-2">npx secrettnl push</span>
                <span className="text-on-surface ml-1">--file .env</span>
                <span className="text-on-surface-variant ml-1">
                  --ttl 24h --webhook https://hooks.you.com/notify
                </span>
              </div>
              <div className="h-3" />
              <div className="text-[#34d399] pl-2">✓ Secret created</div>
              <div className="pl-2">
                <span className="text-primary">
                  https://secrettunnel.app/s/x9k2m
                </span>
                <span className="text-outline/50">#key=aB3dK9...</span>
              </div>
              <div className="text-outline text-xs pl-2 mt-1">
                ⚑ Burn-after-read · Expires in 24h
              </div>
            </TerminalCard>

            {/* Pull Card */}
            <TerminalCard title="terminal">
              <div>
                <span className="text-outline">$</span>
                <span className="text-primary ml-2">npx secrettnl pull</span>
                <span className="text-on-surface-variant ml-1">
                  &quot;https://secrettunnel.app/s/x9k2m#key=aB3dK9...&quot;
                </span>
                <span className="text-on-surface ml-1">--output .env</span>
              </div>
              <div className="h-3" />
              <div className="text-outline pl-2">Fetching...</div>
              <div className="text-outline pl-2">Decrypting locally...</div>
              <div className="text-[#34d399] pl-2 mt-1">
                ✓ Written to .env
              </div>
              <div className="text-outline text-xs pl-2 mt-1">
                ⚑ Token consumed. Secret permanently deleted.
              </div>
            </TerminalCard>

            <Link
              href="/docs/cli"
              className="text-primary text-sm font-mono hover:underline underline-offset-4 transition-all w-fit"
            >
              Full CLI reference →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
