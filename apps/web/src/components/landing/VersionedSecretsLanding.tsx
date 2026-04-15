"use client";

import { cn } from "@/lib/utils";
import { useInView } from "@/hooks/useInView";

export function VersionedSecretsLanding() {
  const { ref, isInView } = useInView();

  return (
    <section className="py-24 md:py-32 bg-surface-container-lowest border-t border-white/[0.04]">
      <div className="max-w-7xl mx-auto px-6">
        <div
          ref={ref}
          className={cn(
            "grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center transition-all duration-700",
            isInView
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-6"
          )}
        >
          {/* Left — Text */}
          <div>
            <p className="font-mono text-primary text-sm tracking-widest uppercase mb-4">
              {"// Versioned Secrets"}
            </p>
            <h2 className="font-headline text-3xl md:text-4xl font-bold text-on-surface tracking-tight mb-4">
              Track changes. Securely.
            </h2>
            <p className="text-on-surface-variant text-lg leading-relaxed mb-6">
              Manage configuration drift across your team.
            </p>
            <p className="text-outline text-base leading-relaxed">
              Group secrets into named vaults. Every time you push a new
              version, a diff is computed and stored. Roll back instantly.
            </p>
          </div>

          {/* Right — Diff Viewer Mock */}
          <div className="bg-surface-container border border-white/[0.08] rounded-lg overflow-hidden terminal-shadow">
            {/* Diff header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-primary/30" />
                <div className="w-3 h-3 rounded-full bg-primary/20" />
                <div className="w-3 h-3 rounded-full bg-primary/10" />
              </div>
              <span className="font-mono text-[11px] text-outline uppercase tracking-widest">
                diff editor
              </span>
              <div className="w-12" />
            </div>

            {/* Diff content */}
            <div className="font-mono text-[13px] leading-relaxed">
              {/* Unchanged line */}
              <div className="flex px-4 py-1.5">
                <span className="w-8 text-outline/40 select-none text-right pr-4 shrink-0">
                  12
                </span>
                <span className="text-outline/60">
                  DATABASE_URL=&quot;postgresql://...&quot;
                </span>
              </div>

              {/* Removed line */}
              <div className="flex px-4 py-1.5 bg-error/[0.08] border-l-2 border-error">
                <span className="w-8 text-error/50 select-none text-right pr-4 shrink-0">
                  13
                </span>
                <span className="text-error">
                  - API_KEY=&quot;sk_old_8f29d2k...&quot;
                </span>
              </div>

              {/* Added line */}
              <div className="flex px-4 py-1.5 bg-primary/[0.08] border-l-2 border-primary">
                <span className="w-8 text-primary/50 select-none text-right pr-4 shrink-0">
                  14
                </span>
                <span className="text-primary">
                  + API_KEY=&quot;sk_new_931ms0q...&quot;
                </span>
              </div>

              {/* Unchanged line */}
              <div className="flex px-4 py-1.5">
                <span className="w-8 text-outline/40 select-none text-right pr-4 shrink-0">
                  15
                </span>
                <span className="text-outline/60">
                  NEXT_PUBLIC_URL=&quot;https://...&quot;
                </span>
              </div>
            </div>

            {/* Version selector */}
            <div className="px-4 py-3 border-t border-white/[0.06] flex items-center gap-2">
              <span className="font-mono text-xs text-outline">Version:</span>
              <div className="flex gap-1">
                {["v1", "v2", "v3 (current)"].map((v, i) => (
                  <span
                    key={v}
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-mono transition-colors",
                      i === 2
                        ? "bg-primary/15 text-primary border border-primary/20"
                        : "text-outline hover:text-on-surface-variant"
                    )}
                  >
                    {v}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
