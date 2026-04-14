"use client";

import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useInView } from "@/hooks/useInView";

export function FinalCTA() {
  const { ref, isInView } = useInView();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText('npx secrettnl push "hello team" --ttl 1h');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="py-28 md:py-36 bg-surface-container-lowest border-t border-white/[0.04]">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <div
          ref={ref}
          className={cn(
            "transition-all duration-700",
            isInView
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-6"
          )}
        >
          <h2 className="font-headline text-4xl sm:text-5xl md:text-6xl font-bold text-on-surface tracking-tight leading-[1.1] mb-4">
            One command.
            <br />
            <span className="text-outline">
              Your secrets, gone forever.
            </span>
          </h2>

          <p className="text-on-surface-variant text-lg mb-12">
            Start in 10 seconds.
          </p>

          {/* Static terminal line */}
          <div className="bg-surface-container-lowest border border-white/[0.08] rounded-lg p-4 font-mono text-sm text-left w-full max-w-xl mx-auto mb-10 terminal-shadow flex items-center justify-between group">
            <div className="overflow-x-auto pr-4 scrollbar-hide flex-1 whitespace-nowrap">
              <span className="text-outline">$</span>
              <span className="text-primary ml-2">npx secrettnl push</span>
              <span className="text-on-surface ml-1">&quot;hello team&quot;</span>
              <span className="text-on-surface-variant ml-1">--ttl 1h</span>
            </div>
            
            <button
              onClick={handleCopy}
              className="text-outline/60 hover:text-primary transition-colors flex-shrink-0 p-1 rounded hover:bg-white/5"
              aria-label="Copy command"
            >
              {copied ? (
                <span className="material-symbols-outlined text-lg text-[#34d399]">check</span>
              ) : (
                <span className="material-symbols-outlined text-lg">content_copy</span>
              )}
            </button>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="cta-glow text-surface font-semibold px-8 py-3.5 rounded-md text-[15px] transition-all duration-200 sm:w-auto w-full max-w-[240px] text-center"
            >
              Share a Secret
            </Link>
            <Link
              href="/docs"
              className="bg-transparent border border-white/[0.12] text-on-surface font-semibold px-8 py-3.5 rounded-md hover:bg-white/5 transition-all duration-200 text-[15px] sm:w-auto w-full max-w-[240px] text-center"
            >
              Read the Docs
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
