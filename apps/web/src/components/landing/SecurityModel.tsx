"use client";

import { cn } from "@/lib/utils";
import { useInView } from "@/hooks/useInView";

const threats = [
  {
    threat: "Server compromise",
    mitigation: "Only ciphertext stored. Key never transmitted.",
  },
  {
    threat: "Link interception",
    mitigation: "Key in #fragment — never in HTTP requests or logs.",
  },
  {
    threat: "Replay attacks",
    mitigation: "Burn-after-read — deleted on first GET.",
  },
  {
    threat: "Brute force",
    mitigation: "Sliding window rate limiting: 10 secrets/hr per IP.",
  },
  {
    threat: "Weak passwords",
    mitigation: "Optional PBKDF2 key stretching.",
  },
  {
    threat: "Stale secrets",
    mitigation: "Mandatory TTL — Redis auto-expires.",
  },
];

export function SecurityModel() {
  const { ref, isInView } = useInView();

  return (
    <section className="py-24 md:py-32 bg-surface border-t border-white/[0.04]">
      <div className="max-w-[700px] mx-auto px-6">
        <div
          ref={ref}
          className={cn(
            "transition-all duration-700",
            isInView
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-6"
          )}
        >
          <p className="font-mono text-primary text-sm tracking-widest uppercase mb-4">
            // Security Model
          </p>
          <h2 className="font-headline text-3xl md:text-4xl font-bold text-on-surface tracking-tight mb-12">
            Threat mitigations.
          </h2>

          {/* Table */}
          <div className="w-full">
            {/* Header */}
            <div className="grid grid-cols-[1fr_2fr] gap-4 pb-3 border-b border-white/[0.1] mb-1">
              <span className="font-mono text-xs text-outline uppercase tracking-widest">
                Threat
              </span>
              <span className="font-mono text-xs text-outline uppercase tracking-widest">
                Mitigation
              </span>
            </div>

            {/* Rows */}
            {threats.map((row, i) => (
              <div
                key={i}
                className={cn(
                  "grid grid-cols-[1fr_2fr] gap-4 py-3.5 border-b border-white/[0.04]",
                  i % 2 === 0 ? "bg-surface-container-low/50" : "bg-transparent"
                )}
              >
                <span className="font-mono text-sm text-on-surface">
                  {row.threat}
                </span>
                <span className="text-sm text-on-surface-variant leading-relaxed">
                  {row.mitigation}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
